import { xaiService } from './xaiService';

export interface ResumeSection {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'languages' | 'volunteer';
  title: string;
  content: any;
  order: number;
  isRequired: boolean;
  isVisible: boolean;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  sections: ResumeSection[];
  style: {
    layout: 'modern' | 'classic' | 'creative' | 'ats-friendly';
    colorScheme: string;
    fontFamily: string;
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

export interface SkillSuggestion {
  skill: string;
  category: 'technical' | 'soft' | 'industry' | 'certification';
  relevance: number;
  reason: string;
  trending: boolean;
  salaryImpact?: string;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResumeValidation {
  score: number;
  issues: Array<{
    section: string;
    severity: 'error' | 'warning' | 'suggestion';
    message: string;
    suggestion: string;
  }>;
  strengths: string[];
  improvements: string[];
  atsCompatibility: number;
  saMarketFit: number;
}

class DynamicResumeBuilderService {
  private skillDatabase = {
    technical: {
      'software_development': [
        'JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Angular', 'Vue.js',
        'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Jenkins'
      ],
      'data_science': [
        'Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch',
        'Tableau', 'Power BI', 'Apache Spark', 'Hadoop', 'Jupyter', 'Statistics', 'Machine Learning'
      ],
      'finance': [
        'Excel', 'VBA', 'SQL', 'Bloomberg Terminal', 'SAP', 'QuickBooks', 'Sage',
        'Financial Modeling', 'Risk Management', 'Portfolio Management', 'IFRS', 'GAAP'
      ],
      'marketing': [
        'Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO', 'SEM', 'Content Marketing',
        'Social Media Marketing', 'Email Marketing', 'Adobe Creative Suite', 'Canva', 'Hootsuite'
      ]
    },
    soft: [
      'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management',
      'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity', 'Negotiation',
      'Conflict Resolution', 'Public Speaking', 'Customer Service', 'Emotional Intelligence'
    ],
    southAfrica: [
      'B-BBEE Knowledge', 'Employment Equity', 'Skills Development', 'Local Market Knowledge',
      'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'SARS Tax', 'CIPC Compliance', 'JSE Knowledge'
    ]
  };

  /**
   * Get resume templates based on industry and experience level
   */
  async getResumeTemplates(industry?: string, experienceLevel?: string): Promise<ResumeTemplate[]> {
    const templates: ResumeTemplate[] = [
      {
        id: 'ats-friendly-tech',
        name: 'ATS-Friendly Technology',
        industry: 'technology',
        description: 'Clean, professional template optimized for Applicant Tracking Systems',
        sections: this.getDefaultSections('technology'),
        style: {
          layout: 'ats-friendly',
          colorScheme: 'blue',
          fontFamily: 'Arial',
          spacing: 'normal'
        }
      },
      {
        id: 'modern-finance',
        name: 'Modern Finance Professional',
        industry: 'finance',
        description: 'Sophisticated template for banking and financial services',
        sections: this.getDefaultSections('finance'),
        style: {
          layout: 'modern',
          colorScheme: 'navy',
          fontFamily: 'Calibri',
          spacing: 'compact'
        }
      },
      {
        id: 'creative-marketing',
        name: 'Creative Marketing',
        industry: 'marketing',
        description: 'Dynamic template for marketing and creative professionals',
        sections: this.getDefaultSections('marketing'),
        style: {
          layout: 'creative',
          colorScheme: 'green',
          fontFamily: 'Montserrat',
          spacing: 'spacious'
        }
      },
      {
        id: 'classic-general',
        name: 'Classic Professional',
        industry: 'general',
        description: 'Timeless design suitable for any industry',
        sections: this.getDefaultSections('general'),
        style: {
          layout: 'classic',
          colorScheme: 'black',
          fontFamily: 'Times New Roman',
          spacing: 'normal'
        }
      }
    ];

    if (industry) {
      return templates.filter(t => t.industry === industry || t.industry === 'general');
    }

    return templates;
  }

  /**
   * Generate real-time skill suggestions based on current resume content
   */
  async generateSkillSuggestions(
    currentSkills: string[],
    industry: string,
    jobTitle: string,
    experience: string[]
  ): Promise<SkillSuggestion[]> {
    try {
      const suggestions: SkillSuggestion[] = [];
      
      // Get industry-relevant technical skills
      const industrySkills = this.getIndustrySkills(industry);
      const missingTechnicalSkills = industrySkills.filter(
        skill => !currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      );

      // Add technical skill suggestions
      missingTechnicalSkills.slice(0, 8).forEach(skill => {
        suggestions.push({
          skill,
          category: 'technical',
          relevance: this.calculateRelevance(skill, jobTitle, experience),
          reason: `High demand skill in ${industry}`,
          trending: this.isTrendingSkill(skill),
          demandLevel: this.getSkillDemand(skill, industry),
          salaryImpact: this.getSalaryImpact(skill, industry)
        });
      });

      // Add soft skills
      const missingSoftSkills = this.skillDatabase.soft.filter(
        skill => !currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      );

      missingSoftSkills.slice(0, 4).forEach(skill => {
        suggestions.push({
          skill,
          category: 'soft',
          relevance: this.calculateSoftSkillRelevance(skill, jobTitle),
          reason: `Essential for leadership and career growth`,
          trending: false,
          demandLevel: 'high'
        });
      });

      // Add South African context skills
      const missingSASkills = this.skillDatabase.southAfrica.filter(
        skill => !currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      );

      missingSASkills.slice(0, 3).forEach(skill => {
        suggestions.push({
          skill,
          category: 'industry',
          relevance: 85,
          reason: 'Important for South African market',
          trending: false,
          demandLevel: 'medium'
        });
      });

      // Use AI for additional personalized suggestions if available
      try {
        const aiSuggestions = await this.getAISuggestions(currentSkills, industry, jobTitle);
        suggestions.push(...aiSuggestions.slice(0, 3));
      } catch (error) {
        console.log('AI suggestions unavailable, using rule-based suggestions');
      }

      // Sort by relevance and return top suggestions
      return suggestions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 15);

    } catch (error) {
      console.error('Error generating skill suggestions:', error);
      return this.getFallbackSuggestions(industry);
    }
  }

  /**
   * Validate resume content in real-time
   */
  async validateResume(resumeData: any): Promise<ResumeValidation> {
    const issues: any[] = [];
    const strengths: string[] = [];
    let atsScore = 100;
    let saScore = 50;

    // Validate personal information
    if (!resumeData.personal?.name) {
      issues.push({
        section: 'personal',
        severity: 'error',
        message: 'Name is required',
        suggestion: 'Add your full name to the personal section'
      });
      atsScore -= 15;
    }

    if (!resumeData.personal?.email) {
      issues.push({
        section: 'personal',
        severity: 'error',
        message: 'Email is required',
        suggestion: 'Add a professional email address'
      });
      atsScore -= 10;
    }

    if (!resumeData.personal?.phone) {
      issues.push({
        section: 'personal',
        severity: 'warning',
        message: 'Phone number missing',
        suggestion: 'Add your contact number for better accessibility'
      });
      atsScore -= 5;
    }

    // Validate professional summary
    if (!resumeData.summary?.content || resumeData.summary.content.length < 50) {
      issues.push({
        section: 'summary',
        severity: 'warning',
        message: 'Professional summary too short',
        suggestion: 'Write a compelling 2-3 sentence summary highlighting your key strengths'
      });
      atsScore -= 10;
    } else {
      strengths.push('Strong professional summary');
    }

    // Validate experience section
    if (!resumeData.experience?.length) {
      issues.push({
        section: 'experience',
        severity: 'error',
        message: 'No work experience listed',
        suggestion: 'Add your work experience with specific achievements'
      });
      atsScore -= 20;
    } else {
      // Check for quantified achievements
      const hasQuantifiedAchievements = resumeData.experience.some((exp: any) =>
        /\d+/.test(exp.description || '')
      );

      if (hasQuantifiedAchievements) {
        strengths.push('Includes quantified achievements');
      } else {
        issues.push({
          section: 'experience',
          severity: 'suggestion',
          message: 'Add quantified achievements',
          suggestion: 'Include numbers, percentages, or metrics to demonstrate impact'
        });
        atsScore -= 8;
      }
    }

    // Validate skills section
    if (!resumeData.skills?.length || resumeData.skills.length < 5) {
      issues.push({
        section: 'skills',
        severity: 'warning',
        message: 'Limited skills listed',
        suggestion: 'Add more relevant technical and soft skills'
      });
      atsScore -= 10;
    } else if (resumeData.skills.length >= 10) {
      strengths.push('Comprehensive skills section');
    }

    // Check for South African context
    const saKeywords = ['south africa', 'johannesburg', 'cape town', 'durban', 'b-bbee', 'equity'];
    const hasSAContext = saKeywords.some(keyword =>
      JSON.stringify(resumeData).toLowerCase().includes(keyword)
    );

    if (hasSAContext) {
      saScore += 30;
      strengths.push('Strong South African market context');
    } else {
      issues.push({
        section: 'general',
        severity: 'suggestion',
        message: 'Limited South African context',
        suggestion: 'Consider adding local market knowledge or SA-specific skills'
      });
    }

    // Education validation
    if (!resumeData.education?.length) {
      issues.push({
        section: 'education',
        severity: 'warning',
        message: 'No education listed',
        suggestion: 'Add your educational background'
      });
      atsScore -= 8;
    }

    const overallScore = Math.round((atsScore + saScore) / 2);

    return {
      score: Math.max(0, Math.min(100, overallScore)),
      issues,
      strengths,
      improvements: issues
        .filter(issue => issue.severity !== 'error')
        .map(issue => issue.suggestion),
      atsCompatibility: Math.max(0, atsScore),
      saMarketFit: saScore
    };
  }

  /**
   * Generate optimized resume content based on job description
   */
  async optimizeForJob(resumeData: any, jobDescription: string): Promise<any> {
    try {
      // Use AI to analyze job requirements and suggest optimizations
      const optimization = await xaiService.generateCareerGuidance(
        JSON.stringify(resumeData),
        `Optimize resume for: ${jobDescription}`
      );

      return {
        optimizedSummary: this.generateOptimizedSummary(resumeData, jobDescription),
        skillsToHighlight: this.extractJobSkills(jobDescription),
        experienceOptimizations: optimization.nextSteps || [],
        keywords: this.extractKeywords(jobDescription),
        suggestions: optimization.trainingRecommendations || []
      };

    } catch (error) {
      console.error('Error optimizing resume:', error);
      return this.getFallbackOptimization(resumeData, jobDescription);
    }
  }

  /**
   * Export resume in various formats
   */
  async exportResume(resumeData: any, format: 'json' | 'html' | 'text'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(resumeData, null, 2);
      
      case 'html':
        return this.generateHTMLResume(resumeData);
      
      case 'text':
        return this.generateTextResume(resumeData);
      
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Private helper methods

  private getDefaultSections(industry: string): ResumeSection[] {
    const baseSections: ResumeSection[] = [
      {
        id: 'personal',
        type: 'personal',
        title: 'Personal Information',
        content: {},
        order: 1,
        isRequired: true,
        isVisible: true
      },
      {
        id: 'summary',
        type: 'summary',
        title: 'Professional Summary',
        content: { text: '' },
        order: 2,
        isRequired: true,
        isVisible: true
      },
      {
        id: 'experience',
        type: 'experience',
        title: 'Work Experience',
        content: [],
        order: 3,
        isRequired: true,
        isVisible: true
      },
      {
        id: 'education',
        type: 'education',
        title: 'Education',
        content: [],
        order: 4,
        isRequired: true,
        isVisible: true
      },
      {
        id: 'skills',
        type: 'skills',
        title: 'Skills',
        content: [],
        order: 5,
        isRequired: true,
        isVisible: true
      }
    ];

    // Add industry-specific sections
    if (industry === 'technology') {
      baseSections.push({
        id: 'projects',
        type: 'projects',
        title: 'Projects',
        content: [],
        order: 6,
        isRequired: false,
        isVisible: true
      });
    }

    if (industry === 'finance') {
      baseSections.push({
        id: 'certifications',
        type: 'certifications',
        title: 'Certifications',
        content: [],
        order: 6,
        isRequired: false,
        isVisible: true
      });
    }

    return baseSections;
  }

  private getIndustrySkills(industry: string): string[] {
    switch (industry.toLowerCase()) {
      case 'technology':
      case 'software':
        return this.skillDatabase.technical.software_development;
      case 'data':
      case 'analytics':
        return this.skillDatabase.technical.data_science;
      case 'finance':
      case 'banking':
        return this.skillDatabase.technical.finance;
      case 'marketing':
        return this.skillDatabase.technical.marketing;
      default:
        return [
          ...this.skillDatabase.technical.software_development.slice(0, 5),
          ...this.skillDatabase.technical.finance.slice(0, 3),
          ...this.skillDatabase.technical.marketing.slice(0, 2)
        ];
    }
  }

  private calculateRelevance(skill: string, jobTitle: string, experience: string[]): number {
    let relevance = 60; // Base relevance

    // Job title matching
    if (jobTitle.toLowerCase().includes(skill.toLowerCase())) {
      relevance += 30;
    }

    // Experience matching
    const experienceMatch = experience.some(exp =>
      exp.toLowerCase().includes(skill.toLowerCase())
    );
    if (experienceMatch) {
      relevance += 20;
    }

    // High-demand skills bonus
    const highDemandSkills = ['react', 'python', 'aws', 'kubernetes', 'machine learning'];
    if (highDemandSkills.some(hds => skill.toLowerCase().includes(hds))) {
      relevance += 15;
    }

    return Math.min(100, relevance);
  }

  private calculateSoftSkillRelevance(skill: string, jobTitle: string): number {
    const leadershipRoles = ['manager', 'lead', 'director', 'senior'];
    const isLeadershipRole = leadershipRoles.some(role =>
      jobTitle.toLowerCase().includes(role)
    );

    if (isLeadershipRole && ['Leadership', 'Project Management', 'Communication'].includes(skill)) {
      return 90;
    }

    return 70;
  }

  private isTrendingSkill(skill: string): boolean {
    const trendingSkills = [
      'artificial intelligence', 'machine learning', 'kubernetes', 'react',
      'typescript', 'aws', 'azure', 'docker', 'microservices'
    ];
    return trendingSkills.some(ts => skill.toLowerCase().includes(ts.toLowerCase()));
  }

  private getSkillDemand(skill: string, industry: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalSkills = ['javascript', 'python', 'sql', 'communication', 'project management'];
    const highDemandSkills = ['react', 'aws', 'kubernetes', 'leadership'];

    if (criticalSkills.some(cs => skill.toLowerCase().includes(cs.toLowerCase()))) {
      return 'critical';
    }
    if (highDemandSkills.some(hds => skill.toLowerCase().includes(hds.toLowerCase()))) {
      return 'high';
    }
    return 'medium';
  }

  private getSalaryImpact(skill: string, industry: string): string {
    const highImpactSkills = {
      'aws': '+15-25%',
      'kubernetes': '+20-30%',
      'machine learning': '+25-35%',
      'leadership': '+20-40%',
      'project management': '+15-25%'
    };

    const skillKey = Object.keys(highImpactSkills).find(key =>
      skill.toLowerCase().includes(key)
    );

    return skillKey ? highImpactSkills[skillKey as keyof typeof highImpactSkills] : '+5-15%';
  }

  private async getAISuggestions(
    currentSkills: string[],
    industry: string,
    jobTitle: string
  ): Promise<SkillSuggestion[]> {
    const prompt = `Based on these current skills: ${currentSkills.join(', ')} for a ${jobTitle} in ${industry}, suggest 3 additional skills that would be most valuable. Consider South African job market trends.`;

    try {
      const response = await xaiService.generateCareerGuidance(
        `Skills: ${currentSkills.join(', ')}`,
        jobTitle
      );

      return response.skillGaps?.slice(0, 3).map(skill => ({
        skill,
        category: 'technical' as const,
        relevance: 85,
        reason: 'AI-recommended based on market analysis',
        trending: true,
        demandLevel: 'high' as const
      })) || [];

    } catch (error) {
      throw error;
    }
  }

  private getFallbackSuggestions(industry: string): SkillSuggestion[] {
    const fallbacks = [
      {
        skill: 'Communication',
        category: 'soft' as const,
        relevance: 90,
        reason: 'Essential for all roles',
        trending: false,
        demandLevel: 'critical' as const
      },
      {
        skill: 'Problem Solving',
        category: 'soft' as const,
        relevance: 85,
        reason: 'Highly valued across industries',
        trending: false,
        demandLevel: 'high' as const
      },
      {
        skill: 'Team Collaboration',
        category: 'soft' as const,
        relevance: 80,
        reason: 'Important for workplace success',
        trending: false,
        demandLevel: 'high' as const
      }
    ];

    return fallbacks;
  }

  private generateOptimizedSummary(resumeData: any, jobDescription: string): string {
    const keywords = this.extractKeywords(jobDescription);
    const experience = resumeData.experience?.[0]?.title || 'Professional';
    
    return `Results-driven ${experience} with expertise in ${keywords.slice(0, 3).join(', ')}. Proven track record of delivering impactful solutions and driving business growth in the South African market.`;
  }

  private extractJobSkills(jobDescription: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'SQL', 'Project Management',
      'Communication', 'Leadership', 'Analytics', 'AWS', 'Git'
    ];

    return commonSkills.filter(skill =>
      jobDescription.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private extractKeywords(jobDescription: string): string[] {
    const text = jobDescription.toLowerCase();
    const keywords: string[] = [];
    
    // Technical terms
    const techTerms = ['agile', 'scrum', 'api', 'database', 'cloud', 'security'];
    techTerms.forEach(term => {
      if (text.includes(term)) keywords.push(term);
    });

    // Common action words
    const actionWords = ['develop', 'manage', 'lead', 'implement', 'design', 'optimize'];
    actionWords.forEach(word => {
      if (text.includes(word)) keywords.push(word);
    });

    return keywords.slice(0, 10);
  }

  private getFallbackOptimization(resumeData: any, jobDescription: string): any {
    return {
      optimizedSummary: this.generateOptimizedSummary(resumeData, jobDescription),
      skillsToHighlight: this.extractJobSkills(jobDescription),
      experienceOptimizations: [
        'Quantify achievements with specific numbers',
        'Highlight relevant technologies and tools',
        'Emphasize leadership and collaboration skills'
      ],
      keywords: this.extractKeywords(jobDescription),
      suggestions: []
    };
  }

  private generateHTMLResume(resumeData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.personal?.name || 'Resume'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .section h3 { color: #333; border-bottom: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resumeData.personal?.name || 'Name'}</h1>
          <p>${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}</p>
        </div>
        <div class="section">
          <h3>Professional Summary</h3>
          <p>${resumeData.summary?.content || ''}</p>
        </div>
        <!-- Additional sections would be generated here -->
      </body>
      </html>
    `;
  }

  private generateTextResume(resumeData: any): string {
    let text = `${resumeData.personal?.name || 'Name'}\n`;
    text += `${resumeData.personal?.email || ''} | ${resumeData.personal?.phone || ''}\n\n`;
    text += `PROFESSIONAL SUMMARY\n${resumeData.summary?.content || ''}\n\n`;
    
    if (resumeData.experience?.length) {
      text += 'WORK EXPERIENCE\n';
      resumeData.experience.forEach((exp: any) => {
        text += `${exp.title} - ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
        text += `${exp.description}\n\n`;
      });
    }

    return text;
  }
}

export const dynamicResumeBuilderService = new DynamicResumeBuilderService();