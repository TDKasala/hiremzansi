import { Router } from 'express';
import type { Request, Response } from 'express';
import { dynamicResumeBuilderService } from '../services/dynamicResumeBuilderService';

const router = Router();

/**
 * Get available resume templates
 * GET /api/resume-builder/templates
 */
router.get('/resume-builder/templates', async (req: Request, res: Response) => {
  try {
    const { industry, experienceLevel } = req.query;
    
    const templates = await dynamicResumeBuilderService.getResumeTemplates(
      industry as string,
      experienceLevel as string
    );

    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resume templates'
    });
  }
});

/**
 * Generate real-time skill suggestions
 * POST /api/resume-builder/skill-suggestions
 */
router.post('/resume-builder/skill-suggestions', async (req: Request, res: Response) => {
  try {
    const { currentSkills, industry, jobTitle, experience } = req.body;

    if (!currentSkills || !Array.isArray(currentSkills)) {
      return res.status(400).json({
        success: false,
        error: 'Current skills array is required'
      });
    }

    const suggestions = await dynamicResumeBuilderService.generateSkillSuggestions(
      currentSkills,
      industry || 'general',
      jobTitle || 'Professional',
      experience || []
    );

    res.json({
      success: true,
      suggestions,
      count: suggestions.length,
      categories: {
        technical: suggestions.filter(s => s.category === 'technical').length,
        soft: suggestions.filter(s => s.category === 'soft').length,
        industry: suggestions.filter(s => s.category === 'industry').length,
        certification: suggestions.filter(s => s.category === 'certification').length
      }
    });
  } catch (error) {
    console.error('Error generating skill suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate skill suggestions'
    });
  }
});

/**
 * Validate resume content in real-time
 * POST /api/resume-builder/validate
 */
router.post('/resume-builder/validate', async (req: Request, res: Response) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Resume data is required'
      });
    }

    const validation = await dynamicResumeBuilderService.validateResume(resumeData);

    res.json({
      success: true,
      validation,
      recommendations: {
        priority: validation.issues.filter(issue => issue.severity === 'error').length,
        improvements: validation.issues.filter(issue => issue.severity === 'warning').length,
        suggestions: validation.issues.filter(issue => issue.severity === 'suggestion').length
      }
    });
  } catch (error) {
    console.error('Error validating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate resume'
    });
  }
});

/**
 * Optimize resume for specific job description
 * POST /api/resume-builder/optimize
 */
router.post('/resume-builder/optimize', async (req: Request, res: Response) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume data and job description are required'
      });
    }

    const optimization = await dynamicResumeBuilderService.optimizeForJob(
      resumeData,
      jobDescription
    );

    res.json({
      success: true,
      optimization,
      message: 'Resume optimized for target job'
    });
  } catch (error) {
    console.error('Error optimizing resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize resume'
    });
  }
});

/**
 * Export resume in various formats
 * POST /api/resume-builder/export
 */
router.post('/resume-builder/export', async (req: Request, res: Response) => {
  try {
    const { resumeData, format } = req.body;

    if (!resumeData || !format) {
      return res.status(400).json({
        success: false,
        error: 'Resume data and format are required'
      });
    }

    if (!['json', 'html', 'text'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Format must be one of: json, html, text'
      });
    }

    const exportedContent = await dynamicResumeBuilderService.exportResume(
      resumeData,
      format
    );

    // Set appropriate content type
    const contentTypes = {
      json: 'application/json',
      html: 'text/html',
      text: 'text/plain'
    };

    res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="resume.${format}"`);

    res.send(exportedContent);
  } catch (error) {
    console.error('Error exporting resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export resume'
    });
  }
});

/**
 * Get industry-specific skill recommendations
 * GET /api/resume-builder/industry-skills/:industry
 */
router.get('/resume-builder/industry-skills/:industry', async (req: Request, res: Response) => {
  try {
    const { industry } = req.params;
    const { level = 'all' } = req.query;

    // Generate empty skill suggestions to get industry-relevant skills
    const suggestions = await dynamicResumeBuilderService.generateSkillSuggestions(
      [], // No current skills to get full industry skill set
      industry,
      'Professional',
      []
    );

    // Group skills by category and demand level
    const skillsByCategory = {
      technical: suggestions.filter(s => s.category === 'technical'),
      soft: suggestions.filter(s => s.category === 'soft'),
      industry: suggestions.filter(s => s.category === 'industry'),
      certification: suggestions.filter(s => s.category === 'certification')
    };

    const skillsByDemand = {
      critical: suggestions.filter(s => s.demandLevel === 'critical'),
      high: suggestions.filter(s => s.demandLevel === 'high'),
      medium: suggestions.filter(s => s.demandLevel === 'medium'),
      low: suggestions.filter(s => s.demandLevel === 'low')
    };

    res.json({
      success: true,
      industry,
      skills: {
        byCategory: skillsByCategory,
        byDemand: skillsByDemand,
        trending: suggestions.filter(s => s.trending),
        all: suggestions
      },
      insights: {
        mostInDemand: suggestions
          .filter(s => s.demandLevel === 'critical')
          .slice(0, 5)
          .map(s => s.skill),
        trending: suggestions
          .filter(s => s.trending)
          .slice(0, 3)
          .map(s => s.skill),
        highSalaryImpact: suggestions
          .filter(s => s.salaryImpact && s.salaryImpact.includes('+2'))
          .slice(0, 3)
          .map(s => ({ skill: s.skill, impact: s.salaryImpact }))
      }
    });
  } catch (error) {
    console.error('Error fetching industry skills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch industry skills'
    });
  }
});

/**
 * Get resume building tips and best practices
 * GET /api/resume-builder/tips
 */
router.get('/resume-builder/tips', async (req: Request, res: Response) => {
  try {
    const { section, industry } = req.query;

    const tips = {
      general: [
        'Keep your resume to 1-2 pages maximum',
        'Use clear, professional formatting with consistent fonts',
        'Include quantified achievements with specific numbers',
        'Tailor your resume for each job application',
        'Use action verbs to start bullet points',
        'Include relevant keywords from the job description'
      ],
      personal: [
        'Use a professional email address',
        'Include your LinkedIn profile URL',
        'Add your location (city, province)',
        'Consider adding a professional headshot for South African market',
        'Include language proficiencies if relevant'
      ],
      summary: [
        'Write 2-3 impactful sentences highlighting your value proposition',
        'Include your years of experience and key expertise',
        'Mention your most relevant achievements',
        'Align your summary with the target role',
        'Use industry-specific keywords'
      ],
      experience: [
        'List experiences in reverse chronological order',
        'Include company name, your title, and employment dates',
        'Use bullet points to describe achievements, not just duties',
        'Quantify your impact with numbers, percentages, or metrics',
        'Focus on results and outcomes',
        'Include promotions and career progression'
      ],
      skills: [
        'Separate technical and soft skills',
        'Include proficiency levels where relevant',
        'Add trending and in-demand skills for your industry',
        'Mention certifications and training programs',
        'Include South African market-specific skills when applicable'
      ],
      education: [
        'List degrees in reverse chronological order',
        'Include institution name, degree type, and graduation year',
        'Add relevant coursework for recent graduates',
        'Include GPA only if it\'s impressive (3.5+ or equivalent)',
        'Mention relevant academic achievements and honors'
      ]
    };

    const industrySpecificTips = {
      technology: [
        'Highlight programming languages and frameworks',
        'Include links to your GitHub profile or portfolio',
        'Mention specific projects and technologies used',
        'Add technical certifications (AWS, Google Cloud, etc.)',
        'Emphasize problem-solving and innovation skills'
      ],
      finance: [
        'Include relevant financial certifications (CFA, FRM, etc.)',
        'Highlight experience with financial software and tools',
        'Mention regulatory knowledge and compliance experience',
        'Quantify financial achievements (cost savings, revenue growth)',
        'Include risk management and analytical skills'
      ],
      marketing: [
        'Include digital marketing certifications',
        'Highlight campaign results with specific metrics',
        'Mention experience with marketing tools and platforms',
        'Add portfolio links or case studies',
        'Emphasize creativity and data-driven decision making'
      ]
    };

    let response = {
      success: true,
      tips: section ? tips[section as keyof typeof tips] || [] : tips.general,
      industryTips: industry ? industrySpecificTips[industry as keyof typeof industrySpecificTips] || [] : [],
      southAfricanContext: [
        'Consider mentioning B-BBEE status if applicable',
        'Include local university qualifications and Matric certificate',
        'Add experience with South African companies or markets',
        'Mention language skills relevant to the South African market',
        'Include knowledge of local regulations and compliance requirements'
      ]
    };

    if (!section) {
      response = {
        ...response,
        allTips: tips
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching resume tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resume tips'
    });
  }
});

/**
 * Save resume draft
 * POST /api/resume-builder/save
 */
router.post('/resume-builder/save', async (req: Request, res: Response) => {
  try {
    const { resumeData, templateId, name } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Resume data is required'
      });
    }

    // For now, return success without actually saving to database
    // In a full implementation, this would save to the database
    const savedResume = {
      id: Date.now(), // Temporary ID
      name: name || 'Untitled Resume',
      templateId: templateId || 'default',
      data: resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      resume: savedResume,
      message: 'Resume saved successfully'
    });
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save resume'
    });
  }
});

/**
 * Get South African market insights for resume optimization
 * GET /api/resume-builder/sa-insights
 */
router.get('/resume-builder/sa-insights', async (req: Request, res: Response) => {
  try {
    const insights = {
      marketTrends: [
        'High demand for digital transformation skills across all industries',
        'Increased focus on B-BBEE compliance and transformation',
        'Growing emphasis on local market knowledge and cultural fit',
        'Rising importance of remote work capabilities post-COVID',
        'Strong demand for multilingual professionals'
      ],
      inDemandSkills: [
        'Cloud computing (AWS, Azure, Google Cloud)',
        'Data analysis and business intelligence',
        'Digital marketing and e-commerce',
        'Project management and agile methodologies',
        'Cybersecurity and information security',
        'Financial technology (fintech) expertise'
      ],
      salaryInsights: {
        technology: 'R350k - R800k+ for senior roles',
        finance: 'R300k - R700k+ for experienced professionals',
        marketing: 'R250k - R500k+ for digital marketing specialists',
        consulting: 'R400k - R900k+ for management consultants'
      },
      topEmployers: [
        'Discovery Limited',
        'Standard Bank Group',
        'Nedbank',
        'Woolworths Holdings',
        'MTN Group',
        'Sasol',
        'Anglo American',
        'First National Bank (FNB)',
        'ABSA Group',
        'Vodacom'
      ],
      locationInsights: {
        johannesburg: 'Financial services, mining, consulting hub',
        capeTown: 'Technology, e-commerce, tourism center',
        durban: 'Manufacturing, logistics, automotive industry',
        pretoria: 'Government, engineering, telecommunications'
      },
      culturalConsiderations: [
        'Mention language proficiencies (English, Afrikaans, local languages)',
        'Include community involvement and social impact initiatives',
        'Highlight transformation and diversity experience',
        'Emphasize local market understanding and cultural sensitivity',
        'Consider mentioning experience working across diverse teams'
      ]
    };

    res.json({
      success: true,
      insights,
      lastUpdated: new Date().toISOString(),
      source: 'South African job market analysis'
    });
  } catch (error) {
    console.error('Error fetching SA insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch South African market insights'
    });
  }
});

export default router;