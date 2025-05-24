// This file is specifically for Vercel serverless functions
import express from 'express';
import path from 'path';
import fs from 'fs';

// Create Express app
const app = express();

// Handler for Vercel serverless functions
export default function handler(req, res) {
  // For API requests, proxy to the main server
  if (req.url?.startsWith('/api/')) {
    // Send appropriate headers and response
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      message: 'API endpoint reached via Vercel serverless function',
      path: req.url,
      info: 'API requests will be handled by your main server'
    });
  }
  
  // For other requests, direct to static files
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ATSBoost Redirect</title>
        <meta http-equiv="refresh" content="0;url=/" />
      </head>
      <body>
        <p>Redirecting to main application...</p>
        <script>window.location.href = "/";</script>
      </body>
    </html>
  `);
}