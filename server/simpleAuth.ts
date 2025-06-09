import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Simple in-memory user storage for development
const users = new Map<string, any>();

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
    return user;
  },

  async getUserByEmail(email: string) {
    console.log("Looking for user with email:", email);
    console.log("Available users:", Array.from(users.keys()));
    const user = users.get(email);
    console.log("Found user:", user ? "Yes" : "No");
    return user;
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
      isAdmin: false,
      role: user?.role || 'user'
    }, JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
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