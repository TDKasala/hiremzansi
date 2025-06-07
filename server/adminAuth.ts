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
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
    };
  } catch (error) {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const user = verifyAdminToken(token);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.adminUser = user;
  next();
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser;
    }
  }
}