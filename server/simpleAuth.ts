import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';

// Simple in-memory user storage for development
const users = new Map<string, any>();
const emailVerificationTokens = new Map<string, { email: string, token: string, expires: Date }>();

// Add default admin user
users.set('deniskasala17@gmail.com', {
  id: 1,
  username: 'admin',
  email: 'deniskasala17@gmail.com',
  password: '$2b$10$9iSPl9/VpqAUhRSAoSteueFNwN56xPHuHm1GHbb.aupDsbvDu1FsK', // @Deniskasala2025
  name: 'Denis Kasala',
  role: 'admin',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

export const simpleAuth = {
  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = {
      id: Date.now() + Math.random(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      name: userData.name || null,
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.set(user.email, user);
    
    // Generate email verification token
    const verificationToken = this.generateEmailVerificationToken(user.email);
    
    return { user, verificationToken };
  },

  async getUserByEmail(email: string) {
    return users.get(email);
  },

  async getUserById(id: number) {
    return Array.from(users.values()).find(u => u.id === id);
  },

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async authenticate(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  generateToken(userId: number) {
    const user = Array.from(users.values()).find(u => u.id === userId);
    return jwt.sign({ 
      id: userId,
      email: user?.email,
      username: user?.username,
      isAdmin: user?.role === 'admin',
      role: user?.role || 'user'
    }, JWT_SECRET, { expiresIn: '7d' });
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  generateEmailVerificationToken(email: string) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    emailVerificationTokens.set(token, { email, token, expires });
    return token;
  },

  async verifyEmailToken(token: string) {
    const tokenData = emailVerificationTokens.get(token);
    if (!tokenData || tokenData.expires < new Date()) {
      return false;
    }

    const user = users.get(tokenData.email);
    if (user) {
      user.emailVerified = true;
      user.updatedAt = new Date();
      users.set(user.email, user);
    }

    emailVerificationTokens.delete(token);
    return true;
  },

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Find user by ID and update password
    for (const [email, user] of users.entries()) {
      if (user.id === userId) {
        user.password = hashedPassword;
        user.updatedAt = new Date();
        users.set(email, user);
        return true;
      }
    }
    
    return false;
  },

  async sendVerificationEmail(email: string, token: string) {
    try {
      const emailService = await import('./services/emailService');
      const user = await this.getUserByEmail(email);
      const name = user?.name || user?.username || 'there';
      const baseUrl = process.env.BASE_URL || 'https://hiremzansi.co.za';
      const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;
      
      // Send email verification email using the template
      const emailSent = await emailService.sendEmail({
        to: email,
        subject: 'Complete Your Hire Mzansi Registration',
        text: `Hello ${name},

Welcome to Hire Mzansi! To complete your account setup and start optimizing your CV for the South African job market, please verify your email address.

Click here to verify: ${verificationLink}

This verification link will expire in 24 hours for security reasons.

If you didn't create this account, you can safely ignore this email.

Best regards,
The Hire Mzansi Team
South Africa's #1 AI-Powered CV Optimization Platform`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Hire Mzansi</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">HIRE<span style="color: #059669;">MZANSI</span></h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">South Africa's #1 AI-Powered CV Optimization Platform</p>
        </div>
        
        <!-- Main Content -->
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Welcome to Hire Mzansi, ${name}!</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining South Africa's leading AI-powered CV optimization platform. To complete your account setup and start transforming your career prospects, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                          color: white; 
                          padding: 16px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px;
                          box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.25);">
                    ✅ Verify My Email Address
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #6366f1; word-break: break-all;">${verificationLink}</a>
            </p>
        </div>
        
        <!-- Features Preview -->
        <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What's waiting for you:</h3>
            <ul style="color: #374151; padding-left: 20px; margin: 0;">
                <li style="margin-bottom: 8px;">🎯 ATS-friendly CV optimization</li>
                <li style="margin-bottom: 8px;">🇿🇦 B-BBEE compliance analysis</li>
                <li style="margin-bottom: 8px;">📊 South African job market insights</li>
                <li style="margin-bottom: 8px;">💼 Professional CV templates</li>
            </ul>
        </div>
        
        <!-- Security Notice -->
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                🔒 Security Notice: This verification link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Best regards,<br>
                <strong>The Hire Mzansi Team</strong>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This email was sent to ${email}. If you have questions, contact our support team.
            </p>
        </div>
    </div>
</body>
</html>`
      });
      
      if (!emailSent) {
        // Fallback for development - log the verification link
        console.log(`Email verification link for ${email}: ${verificationLink}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Fallback - log the verification link
      const verificationLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
      console.log(`Email verification link for ${email}: ${verificationLink}`);
      return true;
    }
  },

  getAllUsers() {
    return Array.from(users.values());
  }
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = simpleAuth.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  (req as any).user = decoded;
  next();
};