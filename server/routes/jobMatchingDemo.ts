import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

/**
 * Demo job matching endpoint - showcases the platform's matching capabilities
 * POST /api/demo/job-matches
 */
router.post('/demo/job-matches', async (req: Request, res: Response) => {
  try {
    const { 
      skills = [], 
      experience = 'mid', 
      location = 'South Africa',
      industry = 'technology' 
    } = req.body;

    // Demo job postings with realistic South African data
    const demoJobs = [
      {
        id: 1,
        title: 'Full Stack Developer',
        company: 'Discovery Bank',
        location: 'Johannesburg, Gauteng',
        salaryRange: 'R450,000 - R650,000',
        workType: 'hybrid',
        experienceLevel: 'mid',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'AWS'],
        description: 'Join our digital transformation team building innovative financial solutions for South African customers.',
        requirements: [
          '3+ years experience in full stack development',
          'Experience with React and Node.js',
          'Understanding of financial services preferred',
          'South African citizenship or work permit'
        ],
        benefits: ['Medical aid', 'Retirement fund', 'Flexible working hours', 'Learning budget'],
        matchScore: 0,
        matchReasons: [],
        saContextScore: 85
      },
      {
        id: 2,
        title: 'Marketing Manager',
        company: 'Woolworths Holdings',
        location: 'Cape Town, Western Cape',
        salaryRange: 'R380,000 - R520,000',
        workType: 'onsite',
        experienceLevel: 'mid',
        requiredSkills: ['Digital Marketing', 'Brand Management', 'Social Media', 'Analytics'],
        description: 'Lead marketing campaigns for premium retail brands across South Africa.',
        requirements: [
          '4+ years marketing experience',
          'Experience in retail or FMCG',
          'Strong understanding of South African market',
          'Bilingual (English and Afrikaans preferred)'
        ],
        benefits: ['Staff discount', 'Medical aid', 'Performance bonus', 'Career development'],
        matchScore: 0,
        matchReasons: [],
        saContextScore: 90
      },
      {
        id: 3,
        title: 'Data Scientist',
        company: 'Standard Bank',
        location: 'Johannesburg, Gauteng',
        salaryRange: 'R550,000 - R750,000',
        workType: 'hybrid',
        experienceLevel: 'senior',
        requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
        description: 'Build AI models to enhance banking services and risk management across Africa.',
        requirements: [
          '5+ years in data science',
          'Masters in Statistics, Mathematics or Computer Science',
          'Experience with financial data',
          'Understanding of regulatory requirements'
        ],
        benefits: ['Performance bonus', 'Medical aid', 'Study assistance', 'Flexible hours'],
        matchScore: 0,
        matchReasons: [],
        saContextScore: 80
      },
      {
        id: 4,
        title: 'Project Manager',
        company: 'Sasol',
        location: 'Secunda, Mpumalanga',
        salaryRange: 'R420,000 - R580,000',
        workType: 'onsite',
        experienceLevel: 'mid',
        requiredSkills: ['Project Management', 'PMP', 'Risk Management', 'Stakeholder Management'],
        description: 'Manage critical infrastructure projects in the energy sector.',
        requirements: [
          'PMP certification required',
          '3+ years project management experience',
          'Experience in engineering or energy sector',
          'Willingness to work in Secunda'
        ],
        benefits: ['Housing allowance', 'Medical aid', 'Pension fund', 'Transport allowance'],
        matchScore: 0,
        matchReasons: [],
        saContextScore: 95
      },
      {
        id: 5,
        title: 'UX Designer',
        company: 'Media24',
        location: 'Cape Town, Western Cape',
        salaryRange: 'R320,000 - R450,000',
        workType: 'hybrid',
        experienceLevel: 'mid',
        requiredSkills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
        description: 'Design digital experiences for leading South African media brands.',
        requirements: [
          '3+ years UX design experience',
          'Portfolio showcasing digital products',
          'Experience with design systems',
          'Understanding of South African user behavior'
        ],
        benefits: ['Creative environment', 'Medical aid', 'Flexible hours', 'Learning budget'],
        matchScore: 0,
        matchReasons: [],
        saContextScore: 75
      }
    ];

    // Calculate match scores based on provided skills and preferences
    const matches = demoJobs.map(job => {
      const userSkillsLower = skills.map((s: string) => s.toLowerCase());
      const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
      
      // Skills matching
      const matchingSkills = jobSkillsLower.filter(skill => 
        userSkillsLower.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      const skillsScore = jobSkillsLower.length > 0 
        ? Math.round((matchingSkills.length / jobSkillsLower.length) * 100)
        : 50;

      // Experience level matching
      const experienceScore = job.experienceLevel === experience ? 100 : 
                             (experience === 'entry' && job.experienceLevel === 'mid') ? 80 : 
                             (experience === 'senior' && job.experienceLevel === 'mid') ? 70 : 50;

      // Location matching (all jobs are in South Africa)
      const locationScore = location.toLowerCase().includes('south africa') ? 90 : 
                           location.toLowerCase().includes(job.location.toLowerCase()) ? 100 : 60;

      // Industry matching
      const industryScore = industry === 'technology' && 
                           (job.company.includes('Bank') || job.company.includes('Discovery')) ? 90 : 70;

      // Overall match calculation
      const overallScore = Math.round(
        (skillsScore * 0.4) + 
        (experienceScore * 0.2) + 
        (locationScore * 0.2) + 
        (job.saContextScore * 0.1) + 
        (industryScore * 0.1)
      );

      // Generate match reasons
      const reasons = [];
      if (skillsScore >= 70) reasons.push(`Strong skills match (${skillsScore}%)`);
      if (matchingSkills.length > 0) reasons.push(`Matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
      if (locationScore >= 80) reasons.push('Excellent location match');
      if (job.saContextScore >= 80) reasons.push('Strong South African market fit');
      if (experienceScore >= 80) reasons.push('Perfect experience level match');

      return {
        ...job,
        matchScore: overallScore,
        matchReasons: reasons,
        matchingSkills: matchingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        missingSkills: jobSkillsLower.filter(skill => !matchingSkills.includes(skill))
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      };
    });

    // Sort by match score
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches: sortedMatches,
      totalMatches: sortedMatches.length,
      searchCriteria: {
        skills,
        experience,
        location,
        industry
      },
      message: `Found ${sortedMatches.length} job matches based on your profile`
    });

  } catch (error) {
    console.error('Error in demo job matching:', error);
    res.status(500).json({ 
      error: 'Demo matching service unavailable',
      matches: []
    });
  }
});

/**
 * Demo CV analysis endpoint
 * POST /api/demo/cv-analysis
 */
router.post('/demo/cv-analysis', async (req: Request, res: Response) => {
  try {
    const { cvText = '' } = req.body;

    // Analyze CV content for South African context
    const analysisResult = {
      overallScore: 78,
      atsScore: 82,
      strengths: [
        'Clear professional summary',
        'Relevant technical skills listed',
        'Quantified achievements included',
        'South African contact information present'
      ],
      improvements: [
        'Add more industry-specific keywords',
        'Include B-BBEE status if applicable',
        'Expand on leadership experience',
        'Add professional certifications'
      ],
      skills: [
        'JavaScript', 'React', 'Node.js', 'Project Management', 
        'Communication', 'Problem Solving'
      ],
      skillsScore: 85,
      formatScore: 90,
      contextScore: 75,
      saKeywordsFound: [
        'Johannesburg', 'University of the Witwatersrand', 'English', 'Afrikaans'
      ],
      recommendations: [
        'Consider adding volunteer work or community involvement',
        'Include relevant South African qualifications (e.g., Matric, Honours)',
        'Mention any experience with local companies or markets',
        'Add language proficiencies if multilingual'
      ],
      industryRelevance: 'High match for technology and finance sectors',
      experienceLevel: 'Mid-level (3-5 years)',
      salaryEstimate: 'R380,000 - R520,000 based on skills and experience'
    };

    res.json({
      success: true,
      analysis: analysisResult,
      message: 'CV analysis completed successfully'
    });

  } catch (error) {
    console.error('Error in demo CV analysis:', error);
    res.status(500).json({ 
      success: false,
      error: 'Demo analysis service unavailable'
    });
  }
});

/**
 * Demo career guidance endpoint
 * POST /api/demo/career-guidance
 */
router.post('/demo/career-guidance', async (req: Request, res: Response) => {
  try {
    const { currentRole = '', targetRole = '', skills = [] } = req.body;

    const careerGuidance = {
      nextSteps: [
        'Upskill in cloud computing (AWS/Azure certifications)',
        'Gain experience in agile project management',
        'Develop leadership and mentoring skills',
        'Build network within South African tech community'
      ],
      skillGaps: [
        'Cloud architecture experience',
        'Team leadership experience',
        'Advanced data analytics',
        'Industry-specific knowledge'
      ],
      trainingRecommendations: [
        {
          course: 'AWS Certified Solutions Architect',
          provider: 'Amazon Web Services',
          duration: '3-6 months',
          cost: 'R8,500',
          priority: 'High'
        },
        {
          course: 'Project Management Professional (PMP)',
          provider: 'PMI South Africa',
          duration: '4-6 months',
          cost: 'R12,000',
          priority: 'Medium'
        },
        {
          course: 'Leadership Development Programme',
          provider: 'Wits Business School',
          duration: '6 months',
          cost: 'R25,000',
          priority: 'Medium'
        }
      ],
      careerPath: 'Software Developer → Senior Developer → Team Lead → Engineering Manager',
      timeEstimate: '18-24 months with focused development',
      salaryProgression: 'Current: R450k → Target: R650k-R800k',
      industryInsights: [
        'High demand for senior developers in financial services',
        'Remote work opportunities increasing post-COVID',
        'Strong growth in fintech and e-commerce sectors',
        'Emphasis on transformation and B-BBEE compliance'
      ]
    };

    res.json({
      success: true,
      guidance: careerGuidance,
      message: 'Career guidance generated successfully'
    });

  } catch (error) {
    console.error('Error in demo career guidance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Demo guidance service unavailable'
    });
  }
});

export default router;