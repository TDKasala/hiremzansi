import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 12;

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      isAdmin: decoded.isAdmin || false,
      role: decoded.role || "user",
    };
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    // Check if this is the admin login
    if (email === "deniskasala17@gmail.com") {
      const adminPassword = "@Deniskasala2025";
      if (password === adminPassword) {
        return {
          id: 999999, // Special admin ID
          email: "deniskasala17@gmail.com",
          username: "admin",
          firstName: "Denis",
          lastName: "Kasala",
          isAdmin: true,
          role: "admin",
        };
      }
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.password) {
      return null;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.name || undefined,
      lastName: "",
      isAdmin: user.role === "admin",
      role: user.role || "user",
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (!req.user.isAdmin && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}