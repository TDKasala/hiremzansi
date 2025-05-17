import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());

// Basic health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

// Add a basic ATS score endpoint for testing
app.post("/api/ats-score", (req, res) => {
  const { cvText, jobDescription } = req.body;
  
  // Basic logic to return a mock score
  const score = Math.floor(Math.random() * 40) + 60; // 60-100
  const skillsScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const formatScore = Math.floor(Math.random() * 20) + 80; // 80-100
  const saContextScore = Math.floor(Math.random() * 50) + 50; // 50-100
  
  // Return a basic analysis
  res.json({
    overall: score,
    skills: skillsScore,
    format: formatScore,
    saContext: saContextScore,
    strengths: [
      "Good use of relevant keywords",
      "Clear section headings",
      "Proper formatting with bullet points"
    ],
    improvements: [
      "Consider adding your B-BBEE status if applicable",
      "Include NQF levels for your qualifications",
      "Add more quantifiable achievements"
    ],
    bbbeeDetected: Math.random() > 0.5,
    nqfDetected: Math.random() > 0.3,
    analyzed: true,
    timestamp: new Date().toISOString()
  });
});

// Start the server
async function startServer() {
  const server = createServer(app);
  
  // Set up Vite for development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Server running on port ${port}`);
  });
  
  return server;
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;