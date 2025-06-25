if (!process.env.XAI_API_KEY) {
  throw new Error("XAI_API_KEY environment variable must be set");
}

interface ATSAnalysis {
  score: number;
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
  recommendations: string[];
  industrySpecific: string[];
  saRelevant: string[];
}

export async function analyzeATSKeywords(cvText: string, jobDescription: string): Promise<ATSAnalysis> {
  try {
    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer specializing in the South African job market. 

Analyze the following CV against the job description and provide a comprehensive keyword analysis.

CV CONTENT:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Please provide your analysis in the following JSON format:
{
  "score": number (0-100, percentage of keyword match),
  "keywords": {
    "found": ["keyword1", "keyword2"], // Keywords from job description found in CV
    "missing": ["keyword3", "keyword4"], // Important keywords from job description missing in CV
    "suggested": ["keyword5", "keyword6"] // Additional relevant keywords that could improve ATS score
  },
  "recommendations": [
    "Specific actionable advice for improving ATS compatibility"
  ],
  "industrySpecific": ["industry relevant keywords"],
  "saRelevant": ["B-BBEE", "Employment Equity", "Skills Development"] // South African specific terms
}

Focus on:
1. Technical skills and qualifications mentioned in the job description
2. Soft skills and competencies
3. Industry-specific terminology
4. South African employment context (B-BBEE, Employment Equity, Skills Development, etc.)
5. Professional certifications and qualifications
6. Years of experience and seniority levels

Provide practical recommendations for keyword optimization while maintaining authenticity.
`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: "system",
            content: "You are an expert ATS optimization specialist with deep knowledge of the South African job market. Provide detailed, actionable keyword analysis. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();

    const analysisText = data.choices?.[0]?.message?.content;
    if (!analysisText) {
      throw new Error("No analysis received from xAI");
    }

    const analysis: ATSAnalysis = JSON.parse(analysisText);

    // Validate and ensure required fields
    if (!analysis.score || !analysis.keywords || !analysis.recommendations) {
      throw new Error("Invalid analysis format received");
    }

    // Ensure arrays exist
    analysis.keywords.found = analysis.keywords.found || [];
    analysis.keywords.missing = analysis.keywords.missing || [];
    analysis.keywords.suggested = analysis.keywords.suggested || [];
    analysis.recommendations = analysis.recommendations || [];
    analysis.industrySpecific = analysis.industrySpecific || [];
    analysis.saRelevant = analysis.saRelevant || [];

    // Ensure score is within valid range
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;

  } catch (error) {
    console.error("ATS Keywords analysis error:", error);
    
    // Return fallback analysis
    return {
      score: 0,
      keywords: {
        found: [],
        missing: [],
        suggested: []
      },
      recommendations: [
        "Analysis failed. Please try again or contact support.",
        "Ensure your CV includes relevant keywords from the job description.",
        "Consider adding industry-specific terms and qualifications."
      ],
      industrySpecific: [],
      saRelevant: []
    };
  }
}