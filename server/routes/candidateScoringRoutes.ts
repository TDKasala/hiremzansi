import { Router } from "express";
import { candidateScoringService } from "../services/candidateScoringService";

const router = Router();

/**
 * Score a specific candidate for a job
 * POST /api/candidate-scoring/score
 */
router.post("/score", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { candidateId, jobRequirements } = req.body;
    
    if (!candidateId || !jobRequirements) {
      return res.status(400).json({ error: "Candidate ID and job requirements are required" });
    }

    const score = await candidateScoringService.scoreCandidateForJob(candidateId, jobRequirements);

    res.json({
      success: true,
      candidateScore: score,
      message: "Candidate scored successfully"
    });
  } catch (error) {
    console.error("Candidate scoring error:", error);
    res.status(500).json({ error: "Failed to score candidate" });
  }
});

/**
 * Get top candidates for a job
 * POST /api/candidate-scoring/top-candidates
 */
router.post("/top-candidates", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { jobRequirements, limit = 20 } = req.body;
    
    if (!jobRequirements) {
      return res.status(400).json({ error: "Job requirements are required" });
    }

    const topCandidates = await candidateScoringService.getTopCandidates(jobRequirements, limit);

    res.json({
      success: true,
      candidates: topCandidates,
      totalFound: topCandidates.length,
      message: `Found ${topCandidates.length} top candidates`
    });
  } catch (error) {
    console.error("Top candidates error:", error);
    res.status(500).json({ error: "Failed to get top candidates" });
  }
});

export default router;