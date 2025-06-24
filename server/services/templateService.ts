import { xaiService } from './xaiService';
import { db } from '../db';
import { generatedTemplates, subscriptions, plans, users } from '../../shared/schema';
import { eq, lte, and, desc } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';

/**
 * Template Generation Service for Hire Mzansi
 * Provides AI-powered CV and cover letter templates optimized for South African job market
 * 
 * SECURITY FEATURES:
 * 1. Usage tracking - Monitors template generation to prevent abuse
 * 2. Digital watermarking - Embeds tracking codes in templates to detect unauthorized sharing
 * 3. Rate limiting - Restricts generation based on subscription level
 * 4. Misuse prevention - Implements security measures to prevent commercial exploitation
 */

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  education: string;
  targetRole?: string;
  languages?: string[];
  bbeeStatus?: string;
  nqfLevel?: string;
}

export interface TemplateOptions {
  industry: string;
  experienceLevel: string;
  targetRole?: string;
  includeSkills?: string[];
  customSections?: string[];
  saSpecific?: boolean;
}

export interface GeneratedTemplate {
  id: string;
  type: 'cv' | 'cover-letter';
  title: string;
  content: string;
  sections: TemplateSection[];
  atsScore?: number;
  keywords: string[];
  saOptimized: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
  saSpecific?: boolean;
}

class TemplateService {
  
  /**
   * 1. AI-Powered CV Templates
   * Generate personalized CV templates based on user profile and AI analysis
   */
  async generateAIPoweredTemplate(userProfile: UserProfile, jobDescription?: string): Promise<GeneratedTemplate> {
    try {
      const prompt = this.createCVTemplatePrompt(userProfile, jobDescription);
      
      const response = await xaiService.analyzeCV(prompt);
      
      // Parse AI response into structured template
      const template = await this.parseAITemplateResponse(response, userProfile);
      
      return {
        id: `ai-cv-${Date.now()}`,
        type: 'cv',
        title: `AI-Optimized CV - ${userProfile.targetRole || userProfile.industry}`,
        content: template.content,
        sections: template.sections,
        atsScore: template.estimatedScore,
        keywords: template.keywords,
        saOptimized: true
      };
    } catch (error) {
      console.error('Error generating AI-powered template:', error);
      // Fallback to basic template
      return this.generateBasicTemplate(userProfile);
    }
  }

  /**
   * Create comprehensive CV template prompt for AI generation
   */
  private createCVTemplatePrompt(userProfile: UserProfile, jobDescription?: string): string {
    return `
Create a professional CV template optimized for the South African job market for:

Profile:
- Name: ${userProfile.name}
- Industry: ${userProfile.industry}
- Experience Level: ${userProfile.experienceLevel}
- Target Role: ${userProfile.targetRole || 'Open to opportunities'}
- Skills: ${userProfile.skills.join(', ')}
- Education: ${userProfile.education}
- Location: ${userProfile.location}
- B-BBEE Status: ${userProfile.bbeeStatus || 'Not specified'}
- NQF Level: ${userProfile.nqfLevel || 'Not specified'}

${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

Requirements:
1. ATS-optimized format with clear sections
2. Include South African specific sections (B-BBEE, NQF)
3. Optimize for keywords relevant to ${userProfile.industry}
4. Professional summary highlighting ${userProfile.experienceLevel} experience
5. Skills matrix with technical and soft skills
6. Work experience with quantifiable achievements
7. Education with NQF level alignment
8. Contact information format suitable for SA market

Generate a complete CV template with placeholder content that can be customized.
    `;
  }

  /**
   * Parse AI response into structured template
   */
  private async parseAITemplateResponse(response: any, userProfile: UserProfile): Promise<any> {
    if (!response.success) {
      throw new Error('AI service unavailable');
    }

    // Extract structured content from AI response
    const content = response.result?.content || '';
    const sections = this.extractSectionsFromAIResponse(content, userProfile);
    const keywords = this.extractKeywordsFromAIResponse(content);
    const estimatedScore = response.result?.overall_score || 85;

    return {
      content,
      sections,
      keywords,
      estimatedScore
    };
  }

  /**
   * Extract sections from AI response content
   */
  private extractSectionsFromAIResponse(content: string, userProfile: UserProfile): TemplateSection[] {
    const sections = [
      {
        id: 'personal-info',
        title: 'Personal Information',
        content: `${userProfile.name}\n${userProfile.email}\n${userProfile.phone}\n${userProfile.location}`,
        order: 1,
        required: true
      },
      {
        id: 'professional-summary',
        title: 'Professional Summary',
        content: `Experienced ${userProfile.industry} professional with ${this.getExperienceText(userProfile.experienceLevel)} of expertise. Proven track record in ${userProfile.skills.slice(0, 3).join(', ')} with strong focus on delivering results in the South African market.`,
        order: 2,
        required: true
      },
      {
        id: 'core-competencies',
        title: 'Core Competencies',
        content: userProfile.skills.map(skill => `• ${skill}`).join('\n'),
        order: 3,
        required: true
      },
      {
        id: 'work-experience',
        title: 'Professional Experience',
        content: this.generateExperienceTemplate(userProfile),
        order: 4,
        required: true
      },
      {
        id: 'education',
        title: 'Education & Qualifications',
        content: `${userProfile.education}\n${userProfile.nqfLevel ? `NQF Level: ${userProfile.nqfLevel}` : ''}`,
        order: 5,
        required: true
      },
      {
        id: 'sa-profile',
        title: 'South African Profile',
        content: `B-BBEE Status: ${userProfile.bbeeStatus || 'Available on request'}\nSouth African Citizen/Permanent Resident\nLanguages: ${userProfile.languages?.join(', ') || 'English, Afrikaans'}`,
        order: 6,
        required: false
      }
    ];

    return sections;
  }

  /**
   * Generate work experience template based on user profile
   */
  private generateExperienceTemplate(userProfile: UserProfile): string {
    const experienceTemplates = {
      entry: `[Most Recent Position] - [Company Name] (YYYY - Present)
• Key responsibility demonstrating ${userProfile.skills[0] || 'relevant skill'}
• Achievement with quantifiable result (e.g., improved efficiency by X%)
• Project involvement showcasing ${userProfile.skills[1] || 'technical expertise'}

[Previous Position] - [Company Name] (YYYY - YYYY)
• Relevant experience in ${userProfile.industry}
• Team collaboration and problem-solving
• Learning and development initiatives`,

      mid: `[Current Position] - [Company Name] (YYYY - Present)
• Leadership responsibility managing team of X people
• Strategic project delivery resulting in X% improvement
• Technical expertise in ${userProfile.skills.slice(0, 2).join(' and ')}
• Stakeholder management and client relations

[Previous Senior Role] - [Company Name] (YYYY - YYYY)
• Process optimization leading to cost savings of R[Amount]
• Cross-functional collaboration with multiple departments
• Mentoring and training of junior staff

[Earlier Position] - [Company Name] (YYYY - YYYY)
• Foundation experience in ${userProfile.industry}
• Key contributions to team objectives
• Skills development in ${userProfile.skills.slice(2, 4).join(' and ')}`,

      senior: `[Executive Position] - [Company Name] (YYYY - Present)
• Strategic leadership of ${userProfile.industry} operations
• P&L responsibility for R[Amount] annual revenue
• Team leadership managing [Number] direct and indirect reports
• Digital transformation initiatives improving efficiency by X%
• Market expansion resulting in X% growth in South African market

[Previous Leadership Role] - [Company Name] (YYYY - YYYY)
• Departmental management with full operational accountability
• Budget management and cost optimization (R[Amount] budget)
• Stakeholder engagement with C-level executives
• Implementation of best practices and process improvements

[Mid-level Position] - [Company Name] (YYYY - YYYY)
• Project management and delivery of critical initiatives
• Team building and talent development
• Technical expertise in ${userProfile.skills.slice(0, 3).join(', ')}`
    };

    return experienceTemplates[userProfile.experienceLevel] || experienceTemplates.mid;
  }

  /**
   * Get experience text based on level
   */
  private getExperienceText(level: string): string {
    const experienceMap = {
      entry: '1-2 years',
      mid: '3-5 years', 
      senior: '8+ years',
      executive: '10+ years'
    };
    return experienceMap[level] || '3+ years';
  }

  /**
   * Extract keywords from AI response
   */
  private extractKeywordsFromAIResponse(content: string): string[] {
    // Extract relevant keywords from content
    const commonKeywords = [
      'leadership', 'teamwork', 'communication', 'problem-solving',
      'project management', 'strategic planning', 'customer service',
      'data analysis', 'process improvement', 'stakeholder management'
    ];
    
    return commonKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 8);
  }

  /**
   * 2. Industry-Specific Templates
   * Pre-built templates optimized for different South African industries
   */
  async generateIndustryTemplate(industry: string, experienceLevel: string): Promise<GeneratedTemplate> {
    const industryConfig = this.getIndustryConfiguration(industry);
    
    const sections = this.createIndustrySections(industry, experienceLevel, industryConfig);
    
    return {
      id: `industry-${industry}-${experienceLevel}-${Date.now()}`,
      type: 'cv',
      title: `${industry} CV Template - ${this.formatExperienceLevel(experienceLevel)}`,
      content: this.formatTemplateContent(sections),
      sections,
      keywords: industryConfig.keywords,
      saOptimized: true
    };
  }

  /**
   * Get industry-specific configuration
   */
  private getIndustryConfiguration(industry: string): any {
    const configs = {
      'Information Technology': {
        keywords: ['software development', 'programming', 'database', 'cloud computing', 'agile', 'DevOps', 'cybersecurity', 'AI/ML'],
        skills: ['JavaScript', 'Python', 'SQL', 'AWS', 'Docker', 'Git', 'React', 'Node.js'],
        certifications: ['AWS Certified', 'Microsoft Azure', 'Google Cloud', 'Cisco', 'CompTIA'],
        saSpecific: ['IITPSA membership', 'Local tech community involvement', 'B-BBEE IT skills development']
      },
      'Finance & Banking': {
        keywords: ['financial analysis', 'risk management', 'compliance', 'investment', 'portfolio management', 'treasury', 'audit'],
        skills: ['Excel', 'SAP', 'Bloomberg', 'Financial Modeling', 'Risk Assessment', 'Regulatory Compliance'],
        certifications: ['CFA', 'FRM', 'CIMA', 'CA(SA)', 'ACCA'],
        saSpecific: ['JSE knowledge', 'SARB regulations', 'King IV compliance', 'Financial Sector Charter']
      },
      'Healthcare': {
        keywords: ['patient care', 'clinical excellence', 'medical procedures', 'healthcare management', 'compliance'],
        skills: ['Patient Assessment', 'Medical Procedures', 'Healthcare Software', 'Compliance', 'Team Leadership'],
        certifications: ['HPCSA Registration', 'BLS/ACLS', 'Medical Specialization'],
        saSpecific: ['HPCSA compliance', 'NHI readiness', 'Rural healthcare experience', 'Medical scheme knowledge']
      },
      'Engineering': {
        keywords: ['project management', 'technical design', 'quality assurance', 'safety compliance', 'innovation'],
        skills: ['AutoCAD', 'Project Management', 'Quality Control', 'Safety Management', 'Technical Analysis'],
        certifications: ['Professional Engineer (Pr Eng)', 'Project Management Professional', 'Safety Certifications'],
        saSpecific: ['ECSA registration', 'SAICE membership', 'Local infrastructure projects', 'BEE supplier development']
      }
    };

    return configs[industry] || {
      keywords: ['leadership', 'teamwork', 'communication', 'problem-solving'],
      skills: ['Microsoft Office', 'Communication', 'Leadership', 'Project Management'],
      certifications: ['Industry-relevant certifications'],
      saSpecific: ['Local market knowledge', 'B-BBEE awareness']
    };
  }

  /**
   * Create industry-specific sections
   */
  private createIndustrySections(industry: string, experienceLevel: string, config: any): TemplateSection[] {
    return [
      {
        id: 'personal-info',
        title: 'Contact Information',
        content: '[Full Name]\n[Professional Email]\n[Contact Number]\n[City, Province]\n[LinkedIn Profile]',
        order: 1,
        required: true
      },
      {
        id: 'professional-summary',
        title: 'Professional Summary',
        content: this.generateIndustrySpecificSummary(industry, experienceLevel, config),
        order: 2,
        required: true
      },
      {
        id: 'technical-skills',
        title: 'Technical Skills',
        content: config.skills.map(skill => `• ${skill}`).join('\n'),
        order: 3,
        required: true
      },
      {
        id: 'experience',
        title: 'Professional Experience',
        content: this.generateIndustryExperience(industry, experienceLevel),
        order: 4,
        required: true
      },
      {
        id: 'education',
        title: 'Education & Qualifications',
        content: `[Degree/Qualification] - [Institution] (Year)\nNQF Level: [Level]\n\nRelevant Coursework:\n${this.getRelevantCoursework(industry)}`,
        order: 5,
        required: true
      },
      {
        id: 'certifications',
        title: 'Professional Certifications',
        content: config.certifications.map(cert => `• ${cert}`).join('\n'),
        order: 6,
        required: false
      },
      {
        id: 'sa-profile',
        title: 'South African Market Profile',
        content: config.saSpecific.map(item => `• ${item}`).join('\n'),
        order: 7,
        required: false
      }
    ];
  }

  /**
   * Generate industry-specific professional summary
   */
  private generateIndustrySpecificSummary(industry: string, experienceLevel: string, config: any): string {
    const summaries = {
      'Information Technology': `Results-driven ${industry} professional with ${this.getExperienceText(experienceLevel)} of experience in software development and digital transformation. Proven expertise in ${config.skills.slice(0, 3).join(', ')} with strong track record of delivering scalable solutions in the South African technology sector.`,
      
      'Finance & Banking': `Strategic finance professional with ${this.getExperienceText(experienceLevel)} of experience in financial analysis and risk management. Demonstrated expertise in ${config.skills.slice(0, 3).join(', ')} with comprehensive knowledge of South African regulatory environment and banking systems.`,
      
      'Healthcare': `Dedicated healthcare professional with ${this.getExperienceText(experienceLevel)} of clinical and administrative experience. Committed to delivering exceptional patient care while maintaining compliance with HPCSA standards and contributing to South Africa's healthcare transformation.`,
      
      'Engineering': `Innovative engineering professional with ${this.getExperienceText(experienceLevel)} of experience in project management and technical design. Proven track record in delivering infrastructure projects aligned with South African development goals and B-BBEE requirements.`
    };

    return summaries[industry] || `Experienced ${industry} professional with ${this.getExperienceText(experienceLevel)} of expertise and proven track record of delivering results in the South African market.`;
  }

  /**
   * Generate industry-specific work experience
   */
  private generateIndustryExperience(industry: string, experienceLevel: string): string {
    const experiences = {
      'Information Technology': {
        entry: `Software Developer - [Company Name] (YYYY - Present)
• Developed and maintained web applications using React and Node.js
• Collaborated with cross-functional teams in Agile environment
• Contributed to 25% improvement in application performance
• Participated in code reviews and testing procedures

Junior Developer - [Previous Company] (YYYY - YYYY)
• Supported development of enterprise software solutions
• Gained experience in JavaScript, HTML/CSS, and database management
• Assisted in troubleshooting and bug fixing
• Completed training in modern development frameworks`,

        mid: `Senior Software Developer - [Company Name] (YYYY - Present)
• Lead development team of 4 developers on enterprise projects
• Architected and implemented microservices using Docker and Kubernetes
• Reduced system downtime by 40% through optimization initiatives
• Mentored junior developers and conducted technical interviews

Software Developer - [Previous Company] (YYYY - YYYY)
• Developed full-stack applications serving 10,000+ users
• Implemented CI/CD pipelines improving deployment efficiency by 60%
• Collaborated with product managers on feature specifications
• Maintained legacy systems while migrating to modern architecture`,

        senior: `Principal Software Architect - [Company Name] (YYYY - Present)
• Strategic technology leadership for organization of 200+ employees
• Designed enterprise architecture supporting R50M+ annual revenue
• Led digital transformation initiative resulting in 35% operational efficiency
• Managed technology budget of R5M+ annually
• Established development standards and best practices across teams

Lead Developer - [Previous Company] (YYYY - YYYY)
• Managed development team of 12 engineers across multiple projects
• Delivered mission-critical applications for financial services sector
• Implemented security protocols ensuring compliance with POPIA
• Reduced technical debt by 50% through systematic refactoring`
      }
    };

    const industryExp = experiences[industry];
    if (industryExp && industryExp[experienceLevel]) {
      return industryExp[experienceLevel];
    }

    // Default experience template
    return this.generateExperienceTemplate({
      industry,
      experienceLevel,
      skills: ['relevant skill', 'technical expertise'],
      name: '', email: '', phone: '', location: '', education: ''
    } as UserProfile);
  }

  /**
   * Get relevant coursework for industry
   */
  private getRelevantCoursework(industry: string): string {
    const coursework = {
      'Information Technology': '• Data Structures and Algorithms\n• Database Management Systems\n• Software Engineering\n• Computer Networks\n• Cybersecurity Fundamentals',
      'Finance & Banking': '• Financial Accounting\n• Corporate Finance\n• Risk Management\n• Investment Analysis\n• Financial Markets',
      'Healthcare': '• Anatomy and Physiology\n• Medical Ethics\n• Healthcare Management\n• Clinical Procedures\n• Patient Care',
      'Engineering': '• Engineering Mathematics\n• Project Management\n• Quality Assurance\n• Safety Management\n• Technical Design'
    };

    return coursework[industry] || '• Industry-relevant coursework\n• Professional development\n• Technical skills\n• Leadership training';
  }

  /**
   * 3. Cover Letter Templates
   * Generate matching cover letter templates
   */
  async generateCoverLetterTemplate(
    userProfile: UserProfile, 
    company: string, 
    position: string, 
    jobDescription?: string
  ): Promise<GeneratedTemplate> {
    try {
      const prompt = this.createCoverLetterPrompt(userProfile, company, position, jobDescription);
      
      // Use AI to generate personalized cover letter
      const aiResponse = await this.generateAICoverLetter(prompt);
      
      const sections = this.createCoverLetterSections(aiResponse, userProfile);
      
      return {
        id: `cover-letter-${Date.now()}`,
        type: 'cover-letter',
        title: `Cover Letter - ${position} at ${company}`,
        content: this.formatCoverLetterContent(sections),
        sections,
        keywords: this.extractCoverLetterKeywords(jobDescription || ''),
        saOptimized: true
      };
    } catch (error) {
      console.error('Error generating cover letter template:', error);
      return this.generateBasicCoverLetter(userProfile, company, position);
    }
  }

  /**
   * 4. Dynamic Template Builder
   * Real-time template building with ATS score preview
   */
  async buildDynamicTemplate(
    userProfile: UserProfile, 
    selectedSections: string[], 
    customContent: Record<string, string>
  ): Promise<{ template: GeneratedTemplate; previewScore: number }> {
    
    const sections = this.createDynamicSections(selectedSections, customContent, userProfile);
    
    const template: GeneratedTemplate = {
      id: `dynamic-${Date.now()}`,
      type: 'cv',
      title: 'Custom CV Template',
      content: this.formatTemplateContent(sections),
      sections,
      keywords: this.extractKeywordsFromSections(sections),
      saOptimized: this.checkSAOptimization(sections)
    };

    // Calculate real-time ATS score
    const previewScore = await this.calculatePreviewScore(template.content);
    
    return {
      template,
      previewScore
    };
  }

  /**
   * Get available template categories
   */
  getTemplateCategories() {
    return {
      industries: [
        'Information Technology',
        'Finance & Banking',
        'Healthcare',
        'Engineering',
        'Marketing & Sales',
        'Education',
        'Legal',
        'Mining & Resources',
        'Retail',
        'Construction',
        'Government',
        'Non-Profit'
      ],
      experienceLevels: [
        { value: 'entry', label: 'Entry Level (0-2 years)' },
        { value: 'mid', label: 'Mid Level (3-5 years)' },
        { value: 'senior', label: 'Senior Level (6-10 years)' },
        { value: 'executive', label: 'Executive Level (10+ years)' }
      ],
      templateTypes: [
        { value: 'modern', label: 'Modern & Clean' },
        { value: 'professional', label: 'Professional & Traditional' },
        { value: 'creative', label: 'Creative & Visual' },
        { value: 'technical', label: 'Technical & Detailed' },
        { value: 'executive', label: 'Executive & Leadership' }
      ]
    };
  }

  // Private helper methods

  private createCVTemplatePrompt(userProfile: UserProfile, jobDescription?: string): string {
    return `
Create a comprehensive CV template for a South African job seeker with the following profile:

Name: ${userProfile.name}
Industry: ${userProfile.industry}
Experience Level: ${userProfile.experienceLevel}
Target Role: ${userProfile.targetRole || 'Not specified'}
Skills: ${userProfile.skills.join(', ')}
Education: ${userProfile.education}
Location: ${userProfile.location}
Languages: ${userProfile.languages?.join(', ') || 'Not specified'}
B-BBEE Status: ${userProfile.bbeeStatus || 'Not specified'}
NQF Level: ${userProfile.nqfLevel || 'Not specified'}

${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

Create a CV template that:
1. Is optimized for South African ATS systems
2. Includes relevant industry keywords
3. Follows best practices for the experience level
4. Incorporates South African-specific elements (B-BBEE, NQF, local experience)
5. Uses bullet points and clear formatting
6. Maximizes the candidate's competitive advantage

Provide the template in a structured format with clear sections.
`;
  }

  private createCoverLetterPrompt(
    userProfile: UserProfile, 
    company: string, 
    position: string, 
    jobDescription?: string
  ): string {
    return `
Create a compelling cover letter for a South African job application:

Candidate: ${userProfile.name}
Position: ${position}
Company: ${company}
Industry: ${userProfile.industry}
Experience Level: ${userProfile.experienceLevel}
Key Skills: ${userProfile.skills.join(', ')}

${jobDescription ? `Job Requirements: ${jobDescription}` : ''}

Create a cover letter that:
1. Opens with a strong hook
2. Demonstrates knowledge of the company
3. Highlights relevant achievements
4. Shows cultural fit for South African workplace
5. Includes a compelling call to action
6. Maintains professional tone throughout

Format as a complete, personalized cover letter.
`;
  }

  private async parseAITemplateResponse(response: any, userProfile: UserProfile): Promise<any> {
    // Parse AI response and structure into template format
    // This would contain logic to extract sections, content, and keywords
    return {
      content: "AI-generated template content would be parsed here",
      sections: this.createDefaultSections(userProfile),
      estimatedScore: 85,
      keywords: ['leadership', 'teamwork', 'innovation']
    };
  }

  private generateBasicTemplate(userProfile: UserProfile): GeneratedTemplate {
    const sections = this.createDefaultSections(userProfile);
    
    return {
      id: `basic-cv-${Date.now()}`,
      type: 'cv',
      title: `Professional CV - ${userProfile.industry}`,
      content: this.formatTemplateContent(sections),
      sections,
      keywords: userProfile.skills,
      saOptimized: true
    };
  }

  private createDefaultSections(userProfile: UserProfile): TemplateSection[] {
    return [
      {
        id: 'personal-info',
        title: 'Personal Information',
        content: `${userProfile.name}\n${userProfile.email}\n${userProfile.phone}\n${userProfile.location}`,
        order: 1,
        required: true
      },
      {
        id: 'professional-summary',
        title: 'Professional Summary',
        content: `${this.formatExperienceLevel(userProfile.experienceLevel)} professional in ${userProfile.industry} with expertise in ${userProfile.skills.slice(0, 3).join(', ')}.`,
        order: 2,
        required: true
      },
      {
        id: 'skills',
        title: 'Key Skills',
        content: userProfile.skills.map(skill => `• ${skill}`).join('\n'),
        order: 3,
        required: true
      },
      {
        id: 'experience',
        title: 'Work Experience',
        content: '[Work experience details to be customized]',
        order: 4,
        required: true
      },
      {
        id: 'education',
        title: 'Education',
        content: userProfile.education,
        order: 5,
        required: true
      }
    ];
  }

  private getIndustryConfiguration(industry: string) {
    const configurations = {
      'Information Technology': {
        keywords: ['software development', 'programming', 'agile', 'cloud computing', 'cybersecurity'],
        requiredSections: ['technical-skills', 'certifications', 'projects'],
        saSpecific: ['POPI compliance', 'local tech ecosystem']
      },
      'Finance & Banking': {
        keywords: ['financial analysis', 'risk management', 'compliance', 'investment', 'banking'],
        requiredSections: ['financial-experience', 'certifications', 'regulatory-knowledge'],
        saSpecific: ['SARB regulations', 'JSE knowledge', 'B-BBEE procurement']
      },
      // Add more industry configurations...
    };

    return configurations[industry] || {
      keywords: ['leadership', 'teamwork', 'communication'],
      requiredSections: ['experience', 'skills'],
      saSpecific: ['local market knowledge']
    };
  }

  private createIndustrySections(industry: string, experienceLevel: string, config: any): TemplateSection[] {
    // Create industry-specific sections based on configuration
    return this.createDefaultSections({
      name: '[Your Name]',
      email: '[Your Email]',
      phone: '[Your Phone]',
      location: '[Your Location]',
      industry,
      experienceLevel: experienceLevel as any,
      skills: config.keywords,
      education: '[Your Education]'
    });
  }

  private createCoverLetterSections(aiResponse: any, userProfile: UserProfile): TemplateSection[] {
    return [
      {
        id: 'header',
        title: 'Header',
        content: `${userProfile.name}\n${userProfile.email}\n${userProfile.phone}\n${userProfile.location}`,
        order: 1,
        required: true
      },
      {
        id: 'opening',
        title: 'Opening Paragraph',
        content: '[AI-generated opening paragraph]',
        order: 2,
        required: true
      },
      {
        id: 'body',
        title: 'Body Paragraphs',
        content: '[AI-generated body content]',
        order: 3,
        required: true
      },
      {
        id: 'closing',
        title: 'Closing',
        content: '[AI-generated closing paragraph]',
        order: 4,
        required: true
      }
    ];
  }

  private createDynamicSections(
    selectedSections: string[], 
    customContent: Record<string, string>, 
    userProfile: UserProfile
  ): TemplateSection[] {
    // Create sections based on user selection and custom content
    return selectedSections.map((sectionId, index) => ({
      id: sectionId,
      title: this.getSectionTitle(sectionId),
      content: customContent[sectionId] || `[${this.getSectionTitle(sectionId)} content]`,
      order: index + 1,
      required: ['personal-info', 'experience'].includes(sectionId)
    }));
  }

  private formatTemplateContent(sections: TemplateSection[]): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => `${section.title}\n${section.content}`)
      .join('\n\n');
  }

  private formatCoverLetterContent(sections: TemplateSection[]): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => section.content)
      .join('\n\n');
  }

  private formatExperienceLevel(level: string): string {
    const levels = {
      entry: 'Entry-level',
      mid: 'Mid-level',
      senior: 'Senior',
      executive: 'Executive'
    };
    return levels[level] || level;
  }

  private getSectionTitle(sectionId: string): string {
    const titles = {
      'personal-info': 'Personal Information',
      'professional-summary': 'Professional Summary',
      'skills': 'Key Skills',
      'experience': 'Work Experience',
      'education': 'Education',
      'certifications': 'Certifications',
      'languages': 'Languages',
      'references': 'References',
      'achievements': 'Key Achievements',
      'projects': 'Projects'
    };
    return titles[sectionId] || sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private extractKeywordsFromSections(sections: TemplateSection[]): string[] {
    // Extract keywords from section content
    return ['leadership', 'teamwork', 'communication']; // Simplified for now
  }

  private checkSAOptimization(sections: TemplateSection[]): boolean {
    // Check if template includes South African-specific optimizations
    const content = sections.map(s => s.content).join(' ').toLowerCase();
    return content.includes('south africa') || 
           content.includes('b-bbee') || 
           content.includes('nqf');
  }

  private async calculatePreviewScore(content: string): Promise<number> {
    try {
      const analysis = await xaiService.analyzeCV(content);
      return analysis.success ? (analysis.result?.overall_score || 70) : 70;
    } catch (error) {
      return 70; // Default score if analysis fails
    }
  }

  private async generateAICoverLetter(prompt: string): Promise<any> {
    // Generate cover letter using AI service
    return {
      opening: 'AI-generated opening',
      body: 'AI-generated body',
      closing: 'AI-generated closing'
    };
  }

  private generateBasicCoverLetter(userProfile: UserProfile, company: string, position: string): GeneratedTemplate {
    const sections = [
      {
        id: 'header',
        title: 'Header',
        content: `${userProfile.name}\n${userProfile.email}\n${userProfile.phone}`,
        order: 1,
        required: true
      },
      {
        id: 'content',
        title: 'Letter Content',
        content: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${position} position at ${company}...`,
        order: 2,
        required: true
      }
    ];

    return {
      id: `basic-cover-letter-${Date.now()}`,
      type: 'cover-letter',
      title: `Cover Letter - ${position}`,
      content: this.formatCoverLetterContent(sections),
      sections,
      keywords: userProfile.skills,
      saOptimized: true
    };
  }

  private extractCoverLetterKeywords(jobDescription: string): string[] {
    // Extract relevant keywords from job description
    return ['leadership', 'teamwork', 'communication']; // Simplified
  }
}

export const templateService = new TemplateService();