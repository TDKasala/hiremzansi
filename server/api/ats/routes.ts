/**
 * ATS Analyzer Router
 * 
 * Registers routes for the CV/resume analysis API
 */

import { Router } from 'express';
import { analyzeCV, analyzeResumeText } from './analyzer';

const atsRouter = Router();

// Analyze CV text directly
atsRouter.post('/analyze-cv-text', analyzeCV);

// Legacy endpoint for backward compatibility
atsRouter.post('/analyze-resume-text', analyzeResumeText);

export default atsRouter;