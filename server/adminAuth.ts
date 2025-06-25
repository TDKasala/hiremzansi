import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "hire-mzansi-admin-secret-2024";
const SALT_ROUNDS = 12;

// Admin user credentials (in production, this would be in a database)
const ADMIN_CREDENTIALS = {
  email: "deniskasala17@gmail.com",
  password: "@Deniskasala2025", // This will be hashed
  name: "Denis Kasala",
  role: "admin"
};

let hashedAdminPassword: string | null = null;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export async function initializeAdmin() {
  if (!hashedAdminPassword) {
    hashedAdminPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, SALT_ROUNDS);
  }
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  await initializeAdmin();
  
  if (email !== ADMIN_CREDENTIALS.email) {
    return null;
  }

  if (!hashedAdminPassword) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, hashedAdminPassword);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: 1,
    email: ADMIN_CREDENTIALS.email,
    name: ADMIN_CREDENTIALS.name,
    role: ADMIN_CREDENTIALS.role,
    isAdmin: true
  };
}

export function generateAdminToken(user: AdminUser): string {
  return jwt.sign(
    {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Admin token verification - decoded:', decoded);
    
    // Handle multiple token structures
    const userId = decoded.userId || decoded.id;
    const userRole = decoded.role;
    const isAdminFlag = decoded.isAdmin;
    
    // Must be admin role AND have isAdmin flag
    if (userRole !== 'admin' || !isAdminFlag) {
      console.log('Token verification failed - role:', userRole, 'isAdmin:', isAdminFlag);
      return null;
    }
    
    const adminUser = {
      id: userId,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: userRole,
      isAdmin: true
    };
    
    console.log('Admin token verified successfully for user:', adminUser.email);
    return adminUser;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('Admin middleware - checking authorization header');
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const user = verifyAdminToken(token);
    if (!user) {
      console.log('Token verification failed');
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!user.isAdmin) {
      console.log('User is not admin:', user);
      return res.status(403).json({ message: "Admin access required" });
    }

    console.log('Admin access granted to:', user.email);
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}