import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  BookOpen, 
  Award,
  ArrowRight,
  Target,
  Building,
  GraduationCap,
  Briefcase,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const careerPaths: CareerPath[] = [
  {
    id: 'software-dev',
    industry: 'Technology',
    title: 'Software Development',
    description: 'Design, develop, and maintain software applications and systems',
    averageProgression: '2-3 years per level',
    marketDemand: 'High',
    growthProjection: '+15% by 2030',
    keyCompanies: ['Naspers', 'Takealot', 'Discovery', 'Standard Bank', 'Capitec'],
    levels: [
      {
        id: 'junior-dev',
        title: 'Junior Developer',
        description: 'Entry-level position focusing on learning and basic development tasks',
        salaryRange: 'R180,000 - R350,000',
        experience: '0-2 years',
        skills: ['HTML/CSS', 'JavaScript', 'Python/Java', 'Git', 'SQL'],
        qualifications: ['BSc Computer Science', 'Coding Bootcamp', 'IT Diploma'],
        responsibilities: ['Bug fixes', 'Feature implementation', 'Code reviews', 'Documentation'],
        nqfLevel: 6,
        bbbeePotential: 'Entry-level opportunities available'
      },
      {
        id: 'mid-dev',
        title: 'Mid-Level Developer',
        description: 'Experienced developer working independently on complex features',
        salaryRange: 'R350,000 - R650,000',
        experience: '2-5 years',
        skills: ['React/Angular', 'Node.js', 'AWS/Azure', 'Docker', 'Testing frameworks'],
        qualifications: ['Honours degree preferred', 'Industry certifications'],
        responsibilities: ['Feature design', 'Mentoring juniors', 'Technical decisions', 'Architecture planning'],
        nqfLevel: 7,
        bbbeePotential: 'Strong demand for diverse talent'
      },
      {
        id: 'senior-dev',
        title: 'Senior Developer',
        description: 'Technical leader responsible for complex systems and team guidance',
        salaryRange: 'R650,000 - R1,200,000',
        experience: '5-8 years',
        skills: ['System design', 'Microservices', 'DevOps', 'Team leadership', 'Cloud architecture'],
        qualifications: ['Masters preferred', 'AWS/Azure certifications'],
        responsibilities: ['System architecture', 'Technical leadership', 'Cross-team collaboration', 'Performance optimization'],
        nqfLevel: 8,
        bbbeePotential: 'Leadership roles increasingly available'
      },
      {
        id: 'tech-lead',
        title: 'Technical Lead / Architect',
        description: 'Strategic technical role shaping technology direction',
        salaryRange: 'R1,200,000 - R2,000,000+',
        experience: '8+ years',
        skills: ['Enterprise architecture', 'Strategy', 'Team management', 'Innovation', 'Business alignment'],
        qualifications: ['Advanced degree', 'Industry recognition'],
        responsibilities: ['Technology strategy', 'Team building', 'Innovation leadership', 'Stakeholder management'],
        nqfLevel: 9,
        bbbeePotential: 'Executive opportunities with transformation initiatives'
      }
    ]
  },
  {
    id: 'marketing',
    industry: 'Marketing & Communications',
    title: 'Digital Marketing',
    description: 'Drive brand growth through digital channels and customer engagement',
    averageProgression: '2-4 years per level',
    marketDemand: 'High',
    growthProjection: '+12% by 2030',
    keyCompanies: ['Ogilvy', 'Publicis', 'Joe Public', 'King James', 'Havas'],
    levels: [
      {
        id: 'marketing-coordinator',
        title: 'Marketing Coordinator',
        description: 'Support marketing campaigns and coordinate activities',
        salaryRange: 'R150,000 - R280,000',
        experience: '0-2 years',
        skills: ['Social media', 'Content creation', 'Analytics basics', 'Email marketing', 'Design tools'],
        qualifications: ['Marketing degree', 'Communications diploma', 'Google Ads certification'],
        responsibilities: ['Campaign support', 'Content scheduling', 'Data collection', 'Event coordination'],
        nqfLevel: 6,
        bbbeePotential: 'Growing opportunities in transformation marketing'
      },
      {
        id: 'marketing-specialist',
        title: 'Marketing Specialist',
        description: 'Manage specific marketing channels and campaigns',
        salaryRange: 'R280,000 - R450,000',
        experience: '2-4 years',
        skills: ['SEO/SEM', 'Facebook Ads', 'Google Analytics', 'CRM systems', 'A/B testing'],
        qualifications: ['Honours in Marketing', 'Digital marketing certificates'],
        responsibilities: ['Campaign management', 'Performance optimization', 'Budget management', 'Reporting'],
        nqfLevel: 7,
        bbbeePotential: 'Specialized roles in culturally relevant marketing'
      },
      {
        id: 'marketing-manager',
        title: 'Marketing Manager',
        description: 'Lead marketing strategies and manage teams',
        salaryRange: 'R450,000 - R800,000',
        experience: '4-7 years',
        skills: ['Strategy development', 'Team leadership', 'Budget planning', 'Stakeholder management', 'Brand management'],
        qualifications: ['MBA preferred', 'Senior management courses'],
        responsibilities: ['Strategy development', 'Team leadership', 'Budget oversight', 'Client relations'],
        nqfLevel: 8,
        bbbeePotential: 'Management positions with transformation focus'
      },
      {
        id: 'marketing-director',
        title: 'Marketing Director',
        description: 'Strategic leadership of marketing function',
        salaryRange: 'R800,000 - R1,500,000+',
        experience: '7+ years',
        skills: ['Executive leadership', 'Business strategy', 'P&L management', 'Innovation', 'Market expansion'],
        qualifications: ['MBA', 'Executive education'],
        responsibilities: ['Strategic direction', 'Executive reporting', 'Market expansion', 'Innovation leadership'],
        nqfLevel: 9,
        bbbeePotential: 'Executive roles driving transformation and inclusive growth'
      }
    ]
  },
  {
    id: 'finance',
    industry: 'Finance & Accounting',
    title: 'Financial Management',
    description: 'Manage financial operations, analysis, and strategic planning',
    averageProgression: '3-4 years per level',
    marketDemand: 'Medium',
    growthProjection: '+8% by 2030',
    keyCompanies: ['Standard Bank', 'FNB', 'Nedbank', 'Absa', 'Old Mutual'],
    levels: [
      {
        id: 'financial-analyst',
        title: 'Financial Analyst',
        description: 'Analyze financial data and support decision-making',
        salaryRange: 'R200,000 - R400,000',
        experience: '0-3 years',
        skills: ['Excel advanced', 'Financial modeling', 'Power BI', 'SAP basics', 'IFRS knowledge'],
        qualifications: ['BCom Accounting/Finance', 'CTA', 'CIMA Part 1'],
        responsibilities: ['Financial analysis', 'Report preparation', 'Variance analysis', 'Budget support'],
        nqfLevel: 7,
        bbbeePotential: 'Strong focus on transformation in financial services'
      },
      {
        id: 'senior-analyst',
        title: 'Senior Financial Analyst',
        description: 'Lead complex analysis and mentor junior staff',
        salaryRange: 'R400,000 - R650,000',
        experience: '3-6 years',
        skills: ['Advanced modeling', 'Treasury operations', 'Risk analysis', 'Team leadership', 'Presentation skills'],
        qualifications: ['Honours degree', 'CA(SA) progress', 'CFA Level 1'],
        responsibilities: ['Complex analysis', 'Process improvement', 'Junior mentoring', 'Stakeholder reporting'],
        nqfLevel: 8,
        bbbeePotential: 'Leadership development programs available'
      },
      {
        id: 'finance-manager',
        title: 'Finance Manager',
        description: 'Manage financial operations and team',
        salaryRange: 'R650,000 - R1,000,000',
        experience: '6-10 years',
        skills: ['Management accounting', 'Strategic planning', 'Team management', 'Compliance', 'ERP systems'],
        qualifications: ['CA(SA)', 'MBA', 'CFA Charter'],
        responsibilities: ['Team management', 'Financial planning', 'Compliance oversight', 'Strategic support'],
        nqfLevel: 9,
        bbbeePotential: 'Management roles with transformation mandates'
      },
      {
        id: 'finance-director',
        title: 'Finance Director / CFO',
        description: 'Executive financial leadership and strategy',
        salaryRange: 'R1,000,000 - R3,000,000+',
        experience: '10+ years',
        skills: ['Executive leadership', 'Corporate strategy', 'M&A', 'Board reporting', 'Regulatory compliance'],
        qualifications: ['CA(SA)', 'MBA', 'Executive development'],
        responsibilities: ['Financial strategy', 'Board reporting', 'Risk management', 'Investor relations'],
        nqfLevel: 10,
        bbbeePotential: 'C-suite opportunities with strong transformation focus'
      }
    ]
  }
];

const industries = [
  'All Industries',
  'Technology',
  'Finance & Banking',
  'Marketing & Communications',
  'Healthcare',
  'Engineering',
  'Education',
  'Manufacturing',
  'Consulting'
];

export default function CareerPathVisualizerPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CareerLevel | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const filteredPaths = selectedIndustry === 'All Industries' 
    ? careerPaths 
    : careerPaths.filter(path => path.industry === selectedIndustry);

  useEffect(() => {
    if (filteredPaths.length > 0 && !selectedPath) {
      setSelectedPath(filteredPaths[0]);
      setSelectedLevel(filteredPaths[0].levels[0]);
    }
  }, [filteredPaths, selectedPath]);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSalaryProgress = (salaryRange: string) => {
    const maxSalary = parseInt(salaryRange.split(' - ')[1]?.replace(/[R,]/g, '') || '0');
    return Math.min((maxSalary / 2000000) * 100, 100);
  };

  return (
    <>
      <Helmet>
        <title>Career Path Visualizer - Hire Mzansi | South African Career Planning</title>
        <meta name="description" content="Explore career paths in South Africa with our interactive visualizer. See salary progression, skill requirements, and growth opportunities across industries." />
        <meta name="keywords" content="career path, south africa careers, salary guide, career progression, job market, skills development" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Career Path Visualizer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore career opportunities in South Africa. Discover salary ranges, skill requirements, 
              and growth potential across different industries and experience levels.
            </p>
          </div>

          {/* Industry Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {industries.map((industry) => (
                <Button
                  key={industry}
                  variant={selectedIndustry === industry ? "default" : "outline"}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setSelectedPath(null);
                    setSelectedLevel(null);
                  }}
                  className="mb-2"
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>

          {/* Career Path Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPaths.map((path) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedPath?.id === path.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedPath(path);
                    setSelectedLevel(path.levels[0]);
                    setCurrentStep(0);
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <Badge className={getDemandColor(path.marketDemand)}>
                        {path.marketDemand} Demand
                      </Badge>
                    </div>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        {path.industry}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {path.growthProjection}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {path.averageProgression}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Selected Career Path Details */}
          {selectedPath && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedPath.title} Career Path</CardTitle>
                  <CardDescription>
                    {selectedPath.description} - {selectedPath.industry}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="progression" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="progression">Career Progression</TabsTrigger>
                      <TabsTrigger value="details">Level Details</TabsTrigger>
                      <TabsTrigger value="market">Market Insights</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="progression" className="space-y-6">
                      {/* Career Level Progression */}
                      <div className="space-y-4">
                        {selectedPath.levels.map((level, index) => (
                          <motion.div
                            key={level.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedLevel?.id === level.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedLevel(level)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{level.title}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{level.experience}</Badge>
                                <Badge className="bg-green-100 text-green-800">{level.salaryRange}</Badge>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{level.description}</p>
                            
                            {/* Salary Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Salary Level</span>
                                <span className="text-sm text-gray-500">{getSalaryProgress(level.salaryRange).toFixed(0)}%</span>
                              </div>
                              <Progress value={getSalaryProgress(level.salaryRange)} className="h-2" />
                            </div>

                            {/* Key Skills Preview */}
                            <div className="flex flex-wrap gap-1">
                              {level.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {level.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{level.skills.length - 3} more
                                </Badge>
                              )}
                            </div>

                            {index < selectedPath.levels.length - 1 && (
                              <div className="flex justify-center mt-4">
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                      {selectedLevel && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Required Skills */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                  Required Skills
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLevel.skills.map((skill) => (
                                    <Badge key={skill} className="bg-blue-100 text-blue-800">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Qualifications */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                                  Qualifications
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {selectedLevel.qualifications.map((qual) => (
                                    <div key={qual} className="flex items-center">
                                      <Award className="w-4 h-4 mr-2 text-gray-400" />
                                      <span className="text-sm">{qual}</span>
                                    </div>
                                  ))}
                                  {selectedLevel.nqfLevel && (
                                    <div className="flex items-center mt-2 p-2 bg-gray-50 rounded">
                                      <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                                      <span className="text-sm font-medium">NQF Level {selectedLevel.nqfLevel}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Responsibilities */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                                  Key Responsibilities
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-1">
                                  {selectedLevel.responsibilities.map((resp) => (
                                    <li key={resp} className="flex items-start">
                                      <Target className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                                      <span className="text-sm">{resp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>

                            {/* B-BBEE Opportunities */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <Users className="w-5 h-5 mr-2 text-orange-500" />
                                  B-BBEE Opportunities
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-700">{selectedLevel.bbbeePotential}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      )}
                    </TabsContent>

                    <TabsContent value="market" className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Market Demand */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                              Market Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Market Demand</span>
                                <Badge className={getDemandColor(selectedPath.marketDemand)}>
                                  {selectedPath.marketDemand}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Growth Projection</span>
                              <p className="text-sm text-gray-600">{selectedPath.growthProjection}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Average Progression</span>
                              <p className="text-sm text-gray-600">{selectedPath.averageProgression}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Key Companies */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Building className="w-5 h-5 mr-2 text-blue-500" />
                              Top Employers
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedPath.keyCompanies.map((company) => (
                                <div key={company} className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-sm">{company}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}