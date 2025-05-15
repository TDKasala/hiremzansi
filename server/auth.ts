import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { 
  sendPasswordResetEmail, 
  sendVerificationEmail,
  sendWelcomeEmail,
  isEmailServiceEnabled 
} from "./services/emailService";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password using scrypt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Securely compare password with stored hash
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Set up session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ATSBoost-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up local strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Try to find by username first
        let user = await storage.getUserByUsername(username);
        
        // If not found, try email (allowing login with either username or email)
        if (!user) {
          user = await storage.getUserByEmail(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          // Update last login time - this field is in the DB schema but not in insert schema
          if (user.id) {
            try {
              await storage.updateUser(user.id, { 
                // Using any to bypass type checking for fields not in insert schema
                ...(({ lastLogin: new Date() } as any))
              });
            } catch (error) {
              console.error("Error updating last login:", error);
            }
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check for existing user with same username
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check for existing user with same email
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // Generate email verification token if email service is enabled
      const verificationToken = isEmailServiceEnabled() ? randomBytes(32).toString("hex") : null;
      const verificationTokenExpiry = verificationToken ? new Date(Date.now() + 86400000) : null; // 24 hours
      
      // Create the user record with verification details if available
      let userData = {
        ...req.body,
        password: await hashPassword(req.body.password),
      };

      // Create user with hashed password
      const user = await storage.createUser(userData);
      
      // If we have a verification token, update the user record
      // We do this as a separate step to work around schema validation
      if (verificationToken) {
        try {
          // This uses fields that aren't in the insert schema, so use type assertion
          await storage.updateUser(user.id, 
            { ...(({
                emailVerified: false,
                verificationToken,
                verificationTokenExpiry
              } as any))
            });
          
          // Send verification email
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          const userName = req.body.name || req.body.username;
          
          // Attempt to send the email
          const emailSent = await sendVerificationEmail(
            req.body.email,
            userName,
            verificationToken,
            baseUrl
          );
          
          if (emailSent) {
            console.log(`Verification email sent to ${req.body.email}`);
          } else {
            console.warn(`Failed to send verification email to ${req.body.email}. Email service may be disabled.`);
            console.log(`Verification token for ${req.body.email}: ${verificationToken}`);
            console.log(`Verification link would be: ${baseUrl}/verify-email?token=${verificationToken}`);
          }
        } catch (updateError) {
          console.error("Failed to update user with verification token:", updateError);
        }
      }

      // Create default South African profile
      await storage.createSaProfile({
        userId: user.id,
        province: req.body.province,
        city: req.body.city,
        preferredLanguages: req.body.languages || [],
        industries: req.body.industries || [],
        jobTypes: req.body.jobTypes || [],
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
          ...userWithoutPassword,
          emailVerificationSent: !!verificationToken
        });
      });
    } catch (err) {
      next(err);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info.message || "Authentication failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Email verification endpoint
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Verification token is required" });
      }
      
      // Find user with this verification token
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }
      
      // Check if token is expired
      if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
        return res.status(400).json({ error: "Verification token has expired" });
      }
      
      // Mark email as verified and clear token
      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      // Send welcome email now that the user is verified
      if (isEmailServiceEnabled()) {
        const userName = user.name || user.username;
        await sendWelcomeEmail(user.email, userName);
      }
      
      res.status(200).json({ 
        message: "Email verified successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: true
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // Get user profile (with South African specific details)
  app.get("/api/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const saProfile = await storage.getSaProfile(req.user.id);
      if (!saProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json({
        user: req.user,
        profile: saProfile
      });
    } catch (err) {
      next(err);
    }
  });

  // Update user profile
  app.put("/api/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { name, email, profilePicture, province, city, bbbeeStatus, bbbeeLevel, 
             nqfLevel, preferredLanguages, industries, jobTypes } = req.body;
      
      // Update user info
      const userUpdates: any = {};
      if (name) userUpdates.name = name;
      if (email && email !== req.user.email) {
        // Check if email is already in use
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ error: "Email already in use" });
        }
        userUpdates.email = email;
      }
      if (profilePicture) userUpdates.profilePicture = profilePicture;
      
      // Only update user if there are changes
      let updatedUser = req.user;
      if (Object.keys(userUpdates).length > 0) {
        updatedUser = await storage.updateUser(req.user.id, userUpdates);
      }
      
      // Update SA profile
      const profileUpdates: any = {};
      if (province) profileUpdates.province = province;
      if (city) profileUpdates.city = city;
      if (bbbeeStatus) profileUpdates.bbbeeStatus = bbbeeStatus;
      if (bbbeeLevel) profileUpdates.bbbeeLevel = bbbeeLevel;
      if (nqfLevel) profileUpdates.nqfLevel = nqfLevel;
      if (preferredLanguages) profileUpdates.preferredLanguages = preferredLanguages;
      if (industries) profileUpdates.industries = industries;
      if (jobTypes) profileUpdates.jobTypes = jobTypes;
      
      // Only update profile if there are changes
      let updatedProfile;
      if (Object.keys(profileUpdates).length > 0) {
        const existingProfile = await storage.getSaProfile(req.user.id);
        if (existingProfile) {
          updatedProfile = await storage.updateSaProfile(req.user.id, profileUpdates);
        } else {
          profileUpdates.userId = req.user.id;
          updatedProfile = await storage.createSaProfile(profileUpdates);
        }
      } else {
        updatedProfile = await storage.getSaProfile(req.user.id);
      }
      
      res.json({
        user: updatedUser,
        profile: updatedProfile
      });
    } catch (err) {
      next(err);
    }
  });

  // Change password endpoint
  app.post("/api/change-password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validate current password
      if (!await comparePasswords(currentPassword, req.user.password)) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Update password
      await storage.updateUser(req.user.id, {
        password: await hashPassword(newPassword)
      });
      
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  // Forgot password endpoint
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }
      
      // Check if user exists with this email
      const user = await storage.getUserByEmail(email);
      
      // For security reasons, always return success even if email doesn't exist
      // This prevents email enumeration attacks
      if (!user) {
        // In a real application, you'd log this or have some indication for debugging
        console.log(`Password reset attempted for non-existent email: ${email}`);
        return res.status(200).json({ 
          message: "If a user with that email exists, password reset instructions have been sent" 
        });
      }
      
      // Generate a unique reset token
      const resetToken = randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store the token in the user record
      // In a production app, you'd have a dedicated password_resets table
      await storage.updateUser(user.id, {
        // Using any to handle fields not in the insert schema
        ...(({ resetToken, resetTokenExpiry: tokenExpiry } as any))
      });
      
      // Send the actual password reset email
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const userName = user.name || user.username;
      
      // Attempt to send the email
      const emailSent = await sendPasswordResetEmail(
        email,
        userName,
        resetToken,
        baseUrl
      );
      
      if (emailSent) {
        console.log(`Password reset email sent to ${email}`);
      } else {
        console.warn(`Failed to send password reset email to ${email}. Email service may be disabled.`);
        
        // Log the token for testing purposes when email service is disabled
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link would be: ${baseUrl}/reset-password?token=${resetToken}`);
      }
      
      res.status(200).json({ 
        message: "Password reset instructions have been sent to your email" 
      });
    } catch (err) {
      next(err);
    }
  });
  
  // Reset password endpoint (to be called when user clicks the reset link)
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ 
          error: "Reset token and new password are required" 
        });
      }
      
      // Find user with this reset token and within expiry time
      // In a real application, you'd query the database for a user with this token
      // This is a simplified version
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ 
          error: "Invalid or expired reset token" 
        });
      }
      
      // Check if token is expired
      // In a real app, you'd check against the tokenExpiry field
      // TypeScript doesn't know about this field since it's not in the schema
      // @ts-ignore
      if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
        return res.status(400).json({ 
          error: "Reset token has expired" 
        });
      }
      
      // Update the user's password
      await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
        // Clear the reset token and expiry
        ...(({ resetToken: null, resetTokenExpiry: null } as any))
      });
      
      res.status(200).json({ 
        message: "Password has been reset successfully" 
      });
    } catch (err) {
      next(err);
    }
  });

  // Simple admin check middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "admin") return res.sendStatus(403);
    next();
  };

  // Admin route example
  app.get("/api/admin/users", isAdmin, async (req, res, next) => {
    // This would be implemented with proper pagination in a real app
    // Just a placeholder for now
    res.json({ message: "Admin only endpoint" });
  });
}