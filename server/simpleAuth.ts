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
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  name: 'Admin User',
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
    // For development, just log the verification link
    const verificationLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
    console.log(`Email verification link for ${email}: ${verificationLink}`);
    
    // In production, you would send an actual email here
    return true;
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