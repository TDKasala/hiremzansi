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

  async sendVerificationEmail(email: string, token: string) {
    try {
      const emailService = await import('./services/emailService');
      const user = await this.getUserByEmail(email);
      const name = user?.name || user?.username || 'there';
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;
      
      // Send email verification email using the template
      const emailSent = await emailService.sendEmail({
        to: email,
        subject: 'Hire Mzansi - Verify Your Email Address',
        text: `Hello ${name}, Please verify your email address by clicking the link: ${verificationLink}`,
        html: `
        <h1>Verify Your Email Address</h1>
        <p>Hello ${name},</p>
        <p>Thank you for creating an account with Hire Mzansi. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify My Email</a>
        <p>If the button doesn't work, copy and paste this link: ${verificationLink}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>Best regards,<br>The Hire Mzansi Team</p>
        `
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