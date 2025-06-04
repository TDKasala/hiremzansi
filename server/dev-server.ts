import express from "express";
import { Request, Response, NextFunction } from "express";
import { log } from "./vite";

const app = express();

// Simple middleware for development
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS for development
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock API routes for UI development
app.get('/api/auth/me', (req, res) => {
  res.json(null); // Not authenticated
});

app.post('/api/auth/signin', (req, res) => {
  res.json({ user: { id: 1, email: 'demo@example.com', name: 'Demo User' } });
});

app.post('/api/auth/signup', (req, res) => {
  res.json({ user: { id: 1, email: 'demo@example.com', name: 'Demo User' } });
});

app.get('/api/cvs', (req, res) => {
  res.json([]);
});

app.post('/api/upload', (req, res) => {
  res.json({ success: true, message: 'Upload successful (demo mode)' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = parseInt(process.env.PORT ?? "5000", 10);
const server = app.listen(port, "0.0.0.0", () => {
  log(`🚀 Server running at http://localhost:${port}`, 'server');
  log('📱 UI-only mode - Database operations disabled', 'server');
});

export default server;