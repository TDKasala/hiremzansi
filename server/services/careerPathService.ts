import { Request, Response } from 'express';

interface CareerLevel {
  id: string;
  title: string;
  description: string;
  salaryRange: string;
  experience: string;
  skills: string[];
  qualifications: string[];
  responsibilities: string[];
  nqfLevel?: number;
  bbbeePotential: string;
}

interface CareerPath {
  id: string;
  industry: string;
  title: string;
  description: string;
  levels: CareerLevel[];
  averageProgression: string;
  marketDemand: 'High' | 'Medium' | 'Low';
  growthProjection: string;
  keyCompanies: string[];
  relatedPaths?: string[];
}

interface IndustryInsight {
  industry: string;
  totalJobs: number;
  averageSalary: string;
  growthRate: string;
  topSkills: string[];
  emergingRoles: string[];
  transformationOpportunities: string;
}

export class CareerPathService {
  private careerPaths: CareerPath[] = [
    {
      id: 'software-dev',
      industry: 'Technology',
      title: 'Software Development',
      description: 'Design, develop, and maintain software applications and systems using modern technologies',
      averageProgression: '2-3 years per level',
      marketDemand: 'High',
      growthProjection: '+15% by 2030',
      keyCompanies: ['Naspers', 'Takealot', 'Discovery', 'Standard Bank', 'Capitec', 'Amazon Web Services', 'Microsoft South Africa'],
      relatedPaths: ['data-science', 'cybersecurity', 'devops'],
      levels: [
        {
          id: 'junior-dev',
          title: 'Junior Developer',
          description: 'Entry-level position focusing on learning fundamental programming concepts and contributing to team projects',
          salaryRange: 'R180,000 - R350,000',
          experience: '0-2 years',
          skills: ['HTML/CSS', 'JavaScript', 'Python/Java', 'Git', 'SQL', 'React/Angular basics', 'Agile methodology'],
          qualifications: ['BSc Computer Science', 'Coding Bootcamp', 'IT Diploma (NQF 6)', 'Self-taught with portfolio'],
          responsibilities: ['Bug fixes and testing', 'Feature implementation under guidance', 'Code reviews participation', 'Documentation writing', 'Learning new technologies'],
          nqfLevel: 6,
          bbbeePotential: 'Strong entry-level opportunities with skills development programs and mentorship initiatives'
        },
        {
          id: 'mid-dev',
          title: 'Mid-Level Developer',
          description: 'Experienced developer working independently on complex features and mentoring junior team members',
          salaryRange: 'R350,000 - R650,000',
          experience: '2-5 years',
          skills: ['Advanced React/Angular', 'Node.js/Spring Boot', 'AWS/Azure', 'Docker/Kubernetes', 'Testing frameworks', 'Database design', 'API development'],
          qualifications: ['Honours degree preferred', 'AWS/Azure certifications', 'Scrum Master certification'],
          responsibilities: ['Feature design and architecture', 'Mentoring junior developers', 'Technical decision making', 'Sprint planning participation', 'Code quality assurance'],
          nqfLevel: 7,
          bbbeePotential: 'Growing demand for diverse talent in technical leadership roles with accelerated development programs'
        },
        {
          id: 'senior-dev',
          title: 'Senior Developer',
          description: 'Technical leader responsible for complex systems architecture and cross-team collaboration',
          salaryRange: 'R650,000 - R1,200,000',
          experience: '5-8 years',
          skills: ['System architecture', 'Microservices design', 'DevOps practices', 'Team leadership', 'Cloud architecture', 'Performance optimization', 'Security best practices'],
          qualifications: ['Masters degree preferred', 'Multiple cloud certifications', 'Technical leadership courses'],
          responsibilities: ['System architecture design', 'Technical leadership across teams', 'Technology strategy input', 'Performance optimization', 'Security implementation'],
          nqfLevel: 8,
          bbbeePotential: 'Leadership roles increasingly available with transformation mandates and executive development pathways'
        },
        {
          id: 'tech-lead',
          title: 'Technical Lead / Principal Engineer',
          description: 'Strategic technical role shaping technology direction and organizational technical standards',
          salaryRange: 'R1,200,000 - R2,500,000+',
          experience: '8+ years',
          skills: ['Enterprise architecture', 'Strategic planning', 'Innovation leadership', 'Team building', 'Business alignment', 'Emerging technologies', 'Technical vision'],
          qualifications: ['Advanced degree or equivalent experience', 'Industry thought leadership', 'Executive education'],
          responsibilities: ['Technology strategy development', 'Technical vision setting', 'Innovation leadership', 'Cross-departmental collaboration', 'Technical hiring decisions'],
          nqfLevel: 9,
          bbbeePotential: 'Executive opportunities with strong transformation focus and C-suite development programs'
        }
      ]
    },
    {
      id: 'data-science',
      industry: 'Technology',
      title: 'Data Science & Analytics',
      description: 'Extract insights from data to drive business decisions and create predictive models',
      averageProgression: '2-4 years per level',
      marketDemand: 'High',
      growthProjection: '+22% by 2030',
      keyCompanies: ['Discovery', 'Nedbank', 'Woolworths', 'MultiChoice', 'Old Mutual', 'Naspers', 'Standard Bank'],
      relatedPaths: ['software-dev', 'business-intelligence', 'machine-learning'],
      levels: [
        {
          id: 'data-analyst',
          title: 'Data Analyst',
          description: 'Analyze data to identify trends, create reports, and support business decision-making',
          salaryRange: 'R200,000 - R400,000',
          experience: '0-2 years',
          skills: ['SQL', 'Python/R', 'Excel advanced', 'Power BI/Tableau', 'Statistical analysis', 'Data visualization'],
          qualifications: ['BSc Mathematics/Statistics', 'Data Science certificate', 'Analytics bootcamp'],
          responsibilities: ['Data collection and cleaning', 'Report generation', 'Basic statistical analysis', 'Dashboard creation'],
          nqfLevel: 6,
          bbbeePotential: 'High demand for analytical skills with strong development programs in financial services'
        },
        {
          id: 'data-scientist',
          title: 'Data Scientist',
          description: 'Develop predictive models and advanced analytics solutions for complex business problems',
          salaryRange: 'R450,000 - R800,000',
          experience: '2-5 years',
          skills: ['Machine Learning', 'Python/R advanced', 'Deep Learning', 'MLOps', 'Big Data tools', 'Cloud platforms'],
          qualifications: ['Masters in Data Science', 'Machine Learning certifications', 'Cloud analytics certifications'],
          responsibilities: ['Model development', 'Algorithm optimization', 'A/B testing', 'Business stakeholder collaboration'],
          nqfLevel: 8,
          bbbeePotential: 'Strategic roles in digital transformation with executive mentorship opportunities'
        },
        {
          id: 'senior-data-scientist',
          title: 'Senior Data Scientist',
          description: 'Lead data science initiatives and mentor teams while solving strategic business challenges',
          salaryRange: 'R800,000 - R1,400,000',
          experience: '5-8 years',
          skills: ['Advanced ML/AI', 'Team leadership', 'Research methodology', 'Product strategy', 'Cross-functional collaboration'],
          qualifications: ['PhD preferred', 'Industry thought leadership', 'Advanced certifications'],
          responsibilities: ['Research leadership', 'Strategic project guidance', 'Team mentoring', 'Innovation driving'],
          nqfLevel: 9,
          bbbeePotential: 'Leadership in AI/ML transformation with C-suite development pathways'
        }
      ]
    },
    {
      id: 'digital-marketing',
      industry: 'Marketing & Communications',
      title: 'Digital Marketing',
      description: 'Drive brand growth and customer engagement through digital channels and data-driven strategies',
      averageProgression: '2-4 years per level',
      marketDemand: 'High',
      growthProjection: '+12% by 2030',
      keyCompanies: ['Ogilvy', 'Publicis', 'Joe Public', 'King James', 'Havas', 'Dentsu', 'M&C Saatchi Abel'],
      relatedPaths: ['content-creation', 'social-media', 'brand-management'],
      levels: [
        {
          id: 'marketing-coordinator',
          title: 'Marketing Coordinator',
          description: 'Support marketing campaigns and coordinate digital marketing activities across channels',
          salaryRange: 'R150,000 - R280,000',
          experience: '0-2 years',
          skills: ['Social media management', 'Content creation', 'Google Analytics', 'Email marketing', 'Adobe Creative Suite', 'Campaign coordination'],
          qualifications: ['Marketing degree', 'Communications diploma', 'Google Ads certification', 'Social media certifications'],
          responsibilities: ['Campaign execution support', 'Content calendar management', 'Social media posting', 'Performance tracking', 'Event coordination'],
          nqfLevel: 6,
          bbbeePotential: 'Growing opportunities in culturally relevant marketing and transformation-focused campaigns'
        },
        {
          id: 'marketing-specialist',
          title: 'Digital Marketing Specialist',
          description: 'Manage specific digital marketing channels and optimize campaign performance',
          salaryRange: 'R280,000 - R450,000',
          experience: '2-4 years',
          skills: ['SEO/SEM', 'Facebook/Instagram Ads', 'Google Ads advanced', 'Marketing automation', 'A/B testing', 'Analytics and reporting'],
          qualifications: ['Honours in Marketing', 'Google/Facebook certifications', 'HubSpot certification'],
          responsibilities: ['Campaign strategy development', 'Performance optimization', 'Budget management', 'ROI analysis', 'Cross-channel coordination'],
          nqfLevel: 7,
          bbbeePotential: 'Specialized roles in authentic African storytelling and inclusive marketing strategies'
        },
        {
          id: 'marketing-manager',
          title: 'Marketing Manager',
          description: 'Lead marketing strategies, manage teams, and drive brand growth initiatives',
          salaryRange: 'R450,000 - R800,000',
          experience: '4-7 years',
          skills: ['Strategic planning', 'Team leadership', 'Budget management', 'Brand strategy', 'Stakeholder management', 'Market research'],
          qualifications: ['MBA preferred', 'Senior management courses', 'Brand management certification'],
          responsibilities: ['Strategy development', 'Team leadership', 'Budget oversight', 'Client relationship management', 'Performance reporting'],
          nqfLevel: 8,
          bbbeePotential: 'Management positions focusing on transformation marketing and inclusive brand strategies'
        },
        {
          id: 'marketing-director',
          title: 'Marketing Director',
          description: 'Executive leadership of marketing function with strategic business impact',
          salaryRange: 'R800,000 - R1,800,000+',
          experience: '7+ years',
          skills: ['Executive leadership', 'Business strategy alignment', 'P&L management', 'Innovation leadership', 'Market expansion'],
          qualifications: ['MBA', 'Executive education', 'Board-level experience'],
          responsibilities: ['Strategic direction setting', 'Executive team collaboration', 'Market expansion leadership', 'Innovation driving'],
          nqfLevel: 9,
          bbbeePotential: 'C-suite opportunities driving transformation and inclusive growth strategies across Africa'
        }
      ]
    },
    {
      id: 'finance',
      industry: 'Finance & Banking',
      title: 'Financial Management',
      description: 'Manage financial operations, analysis, and strategic planning for organizational success',
      averageProgression: '3-4 years per level',
      marketDemand: 'Medium',
      growthProjection: '+8% by 2030',
      keyCompanies: ['Standard Bank', 'FNB', 'Nedbank', 'Absa', 'Old Mutual', 'Sanlam', 'Momentum'],
      relatedPaths: ['investment-banking', 'risk-management', 'fintech'],
      levels: [
        {
          id: 'financial-analyst',
          title: 'Financial Analyst',
          description: 'Analyze financial data, prepare reports, and support strategic financial decision-making',
          salaryRange: 'R200,000 - R400,000',
          experience: '0-3 years',
          skills: ['Advanced Excel', 'Financial modeling', 'Power BI', 'SAP/Oracle', 'IFRS knowledge', 'Regulatory compliance'],
          qualifications: ['BCom Accounting/Finance', 'CTA', 'CIMA Part 1', 'Financial modeling certification'],
          responsibilities: ['Financial analysis and reporting', 'Budget variance analysis', 'Model development', 'Compliance monitoring'],
          nqfLevel: 7,
          bbbeePotential: 'Strong transformation focus in financial services with accelerated development programs'
        },
        {
          id: 'senior-analyst',
          title: 'Senior Financial Analyst',
          description: 'Lead complex financial analysis and provide strategic insights to senior management',
          salaryRange: 'R400,000 - R650,000',
          experience: '3-6 years',
          skills: ['Advanced financial modeling', 'Treasury operations', 'Risk analysis', 'Team leadership', 'Strategic planning'],
          qualifications: ['Honours degree', 'CA(SA) progress', 'CFA Level 1-2', 'Risk management certification'],
          responsibilities: ['Complex financial analysis', 'Process improvement', 'Junior staff mentoring', 'Strategic recommendations'],
          nqfLevel: 8,
          bbbeePotential: 'Leadership development opportunities with focus on transformation and inclusive finance'
        },
        {
          id: 'finance-manager',
          title: 'Finance Manager',
          description: 'Manage financial operations, lead teams, and contribute to strategic business planning',
          salaryRange: 'R650,000 - R1,000,000',
          experience: '6-10 years',
          skills: ['Management accounting', 'Strategic financial planning', 'Team management', 'Regulatory compliance', 'ERP implementation'],
          qualifications: ['CA(SA)', 'MBA preferred', 'CFA Charter', 'Management development programs'],
          responsibilities: ['Financial planning and analysis', 'Team leadership', 'Compliance oversight', 'Strategic business partnering'],
          nqfLevel: 9,
          bbbeePotential: 'Senior management roles with transformation mandates and executive development pathways'
        },
        {
          id: 'finance-director',
          title: 'Finance Director / CFO',
          description: 'Executive financial leadership responsible for organizational financial strategy and governance',
          salaryRange: 'R1,000,000 - R3,500,000+',
          experience: '10+ years',
          skills: ['Executive leadership', 'Corporate strategy', 'M&A expertise', 'Board governance', 'Investor relations'],
          qualifications: ['CA(SA)', 'MBA', 'Executive education', 'Board certification'],
          responsibilities: ['Financial strategy development', 'Board reporting', 'Risk management oversight', 'Investor relations'],
          nqfLevel: 10,
          bbbeePotential: 'C-suite opportunities with strong transformation focus and leadership in financial inclusion'
        }
      ]
    },
    {
      id: 'cybersecurity',
      industry: 'Technology',
      title: 'Cybersecurity',
      description: 'Protect organizations from cyber threats and ensure information security compliance',
      averageProgression: '2-3 years per level',
      marketDemand: 'High',
      growthProjection: '+18% by 2030',
      keyCompanies: ['Dimension Data', 'EOH', 'BCX', 'Telkom', 'MTN', 'Vodacom', 'Standard Bank'],
      relatedPaths: ['risk-management', 'compliance', 'network-engineering'],
      levels: [
        {
          id: 'security-analyst',
          title: 'Security Analyst',
          description: 'Monitor security systems, investigate incidents, and maintain security protocols',
          salaryRange: 'R220,000 - R450,000',
          experience: '0-2 years',
          skills: ['SIEM tools', 'Incident response', 'Network security', 'Vulnerability assessment', 'Compliance frameworks'],
          qualifications: ['IT Security diploma', 'CompTIA Security+', 'CISSP Associate', 'Ethical hacking certification'],
          responsibilities: ['Security monitoring', 'Incident investigation', 'Compliance reporting', 'Security awareness training'],
          nqfLevel: 6,
          bbbeePotential: 'Critical skills shortage creating opportunities for diverse talent with accelerated training'
        },
        {
          id: 'security-engineer',
          title: 'Security Engineer',
          description: 'Design and implement security solutions and architecture',
          salaryRange: 'R450,000 - R750,000',
          experience: '2-5 years',
          skills: ['Security architecture', 'Cloud security', 'DevSecOps', 'Penetration testing', 'Risk assessment'],
          qualifications: ['CISSP', 'CISM', 'Cloud security certifications', 'Advanced penetration testing'],
          responsibilities: ['Security solution design', 'Architecture reviews', 'Security testing', 'Tool implementation'],
          nqfLevel: 8,
          bbbeePotential: 'Strategic roles in digital transformation security with leadership development opportunities'
        },
        {
          id: 'security-manager',
          title: 'Security Manager',
          description: 'Lead security teams and develop organizational security strategies',
          salaryRange: 'R750,000 - R1,300,000',
          experience: '5-8 years',
          skills: ['Team leadership', 'Security strategy', 'Risk management', 'Compliance management', 'Business alignment'],
          qualifications: ['CISSP', 'CISM', 'MBA preferred', 'Management certification'],
          responsibilities: ['Team leadership', 'Security strategy development', 'Risk management', 'Executive reporting'],
          nqfLevel: 9,
          bbbeePotential: 'Executive leadership in critical infrastructure protection with transformation mandates'
        }
      ]
    }
  ];

  private industryInsights: IndustryInsight[] = [
    {
      industry: 'Technology',
      totalJobs: 85000,
      averageSalary: 'R650,000',
      growthRate: '+15%',
      topSkills: ['Cloud Computing', 'AI/ML', 'Cybersecurity', 'DevOps', 'Data Science'],
      emergingRoles: ['AI Engineer', 'Cloud Architect', 'DevOps Engineer', 'Data Engineer'],
      transformationOpportunities: 'High demand for diverse talent in emerging technologies with strong mentorship and development programs'
    },
    {
      industry: 'Finance & Banking',
      totalJobs: 120000,
      averageSalary: 'R580,000',
      growthRate: '+8%',
      topSkills: ['Digital Banking', 'Risk Management', 'Regulatory Compliance', 'Fintech', 'Data Analytics'],
      emergingRoles: ['Digital Banking Specialist', 'Fintech Product Manager', 'Risk Data Scientist'],
      transformationOpportunities: 'Strong transformation mandates creating executive pathways and leadership development in financial inclusion'
    },
    {
      industry: 'Marketing & Communications',
      totalJobs: 65000,
      averageSalary: 'R420,000',
      growthRate: '+12%',
      topSkills: ['Digital Marketing', 'Content Strategy', 'Data Analytics', 'Social Media', 'Brand Management'],
      emergingRoles: ['Growth Hacker', 'Marketing Technologist', 'Content Strategist', 'Brand Experience Designer'],
      transformationOpportunities: 'Growing demand for culturally relevant marketing and authentic African storytelling with creative leadership opportunities'
    }
  ];

  getCareerPaths(): CareerPath[] {
    return this.careerPaths;
  }

  getCareerPathById(id: string): CareerPath | undefined {
    return this.careerPaths.find(path => path.id === id);
  }

  getCareerPathsByIndustry(industry: string): CareerPath[] {
    if (industry === 'All Industries') {
      return this.careerPaths;
    }
    return this.careerPaths.filter(path => path.industry === industry);
  }

  getIndustryInsights(): IndustryInsight[] {
    return this.industryInsights;
  }

  getIndustryInsight(industry: string): IndustryInsight | undefined {
    return this.industryInsights.find(insight => insight.industry === industry);
  }

  searchCareerPaths(query: string): CareerPath[] {
    const lowercaseQuery = query.toLowerCase();
    return this.careerPaths.filter(path => 
      path.title.toLowerCase().includes(lowercaseQuery) ||
      path.description.toLowerCase().includes(lowercaseQuery) ||
      path.industry.toLowerCase().includes(lowercaseQuery) ||
      path.levels.some(level => 
        level.title.toLowerCase().includes(lowercaseQuery) ||
        level.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery))
      )
    );
  }

  getRelatedPaths(pathId: string): CareerPath[] {
    const path = this.getCareerPathById(pathId);
    if (!path || !path.relatedPaths) {
      return [];
    }
    
    return path.relatedPaths
      .map(id => this.getCareerPathById(id))
      .filter((path): path is CareerPath => path !== undefined);
  }

  getSalaryBenchmarks(industry?: string): { [key: string]: string } {
    let paths = industry ? this.getCareerPathsByIndustry(industry) : this.careerPaths;
    
    const benchmarks: { [key: string]: string } = {};
    
    paths.forEach(path => {
      path.levels.forEach(level => {
        if (!benchmarks[level.title] || this.compareSalary(level.salaryRange, benchmarks[level.title]) > 0) {
          benchmarks[level.title] = level.salaryRange;
        }
      });
    });
    
    return benchmarks;
  }

  private compareSalary(salary1: string, salary2: string): number {
    const extractMax = (salaryRange: string): number => {
      const matches = salaryRange.match(/R([\d,]+)/g);
      if (!matches) return 0;
      return Math.max(...matches.map(match => parseInt(match.replace(/[R,]/g, ''))));
    };
    
    return extractMax(salary1) - extractMax(salary2);
  }

  getSkillDemand(): { [key: string]: number } {
    const skillCount: { [key: string]: number } = {};
    
    this.careerPaths.forEach(path => {
      path.levels.forEach(level => {
        level.skills.forEach(skill => {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
      });
    });
    
    return skillCount;
  }
}

export const careerPathService = new CareerPathService();