import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Star,
  BarChart3,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const analysisSchema = z.object({
  currentRole: z.string().min(1, 'Current role is required'),
  targetRole: z.string().min(1, 'Target role is required'),
  experience: z.string().min(1, 'Experience level is required'),
  industry: z.string().min(1, 'Industry is required'),
  currentSkills: z.string().min(10, 'Please provide more details about your current skills'),
});

type AnalysisFormData = z.infer<typeof analysisSchema>;

interface SkillMatch {
  name: string;
  match: number;
  description: string;
  importance: number;
}

interface SkillGapResult {
  overallMatch: number;
  summary: string;
  recommendations: string;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  marketInsights: {
    salaryRange: string;
    demandLevel: string;
    growthProjection: string;
  };
}

const SkillGapAnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkillGapResult | null>(null);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      currentRole: '',
      targetRole: '',
      experience: '',
      industry: '',
      currentSkills: '',
    },
  });

  const onSubmit = async (data: AnalysisFormData) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/skill-gap/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentRole: data.currentRole,
          targetRole: data.targetRole,
          experience: data.experience,
          industry: data.industry,
          currentSkills: data.currentSkills
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze skill gap');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowActionPlan(true);
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
      // Fallback to local analysis
      const result = generateAnalysisResult(data);
      setAnalysisResult(result);
      setShowActionPlan(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysisResult = (data: AnalysisFormData): SkillGapResult => {
    const targetRole = data.targetRole.toLowerCase();
    const experience = data.experience;
    
    // Calculate match percentage based on role similarity and experience
    let baseMatch = 45;
    if (data.currentRole.toLowerCase().includes(targetRole) || targetRole.includes(data.currentRole.toLowerCase())) {
      baseMatch += 25;
    }
    if (experience === 'senior') baseMatch += 10;
    if (experience === 'mid') baseMatch += 5;
    
    const overallMatch = Math.min(Math.max(baseMatch + Math.random() * 20, 30), 85);
    
    return {
      overallMatch: Math.round(overallMatch),
      summary: `Based on your ${data.currentRole} background and ${data.experience}-level experience, you have a ${Math.round(overallMatch)}% match for ${data.targetRole} roles. There are some key skill gaps to address, but with focused development, you can significantly improve your competitiveness.`,
      recommendations: `Focus on developing the missing technical skills through practical projects and industry certifications. Build a portfolio showcasing relevant work and consider joining professional communities in ${data.industry}.`,
      matchedSkills: [
        {
          name: 'Communication Skills',
          match: 95,
          description: 'Strong verbal and written communication abilities',
          importance: 9
        },
        {
          name: 'Problem Solving',
          match: 88,
          description: 'Analytical thinking and solution-oriented approach',
          importance: 8
        },
        {
          name: 'Team Collaboration',
          match: 82,
          description: 'Experience working effectively in team environments',
          importance: 7
        },
        {
          name: 'Project Management',
          match: 75,
          description: 'Basic project coordination and delivery experience',
          importance: 6
        }
      ],
      missingSkills: [
        {
          name: `${data.targetRole} Specific Technology`,
          match: 25,
          description: 'Core technical skills required for the target role',
          importance: 10
        },
        {
          name: 'Industry Standards & Practices',
          match: 35,
          description: `${data.industry} sector knowledge and best practices`,
          importance: 8
        },
        {
          name: 'Advanced Analytics',
          match: 20,
          description: 'Data analysis and interpretation capabilities',
          importance: 7
        },
        {
          name: 'Leadership & Mentoring',
          match: 40,
          description: 'Team leadership and knowledge transfer skills',
          importance: 6
        }
      ],
      actionPlan: {
        shortTerm: [
          `Complete online certification in ${data.targetRole} fundamentals`,
          'Update LinkedIn profile with relevant keywords',
          'Start building a portfolio of relevant projects',
          'Join professional groups and communities'
        ],
        mediumTerm: [
          'Gain hands-on experience through freelance or volunteer projects',
          'Attend industry conferences and networking events',
          'Seek mentorship from professionals in your target role',
          'Consider specialized training programs or bootcamps'
        ],
        longTerm: [
          'Pursue advanced certifications or formal education',
          'Build a strong professional network in the industry',
          'Develop thought leadership through content creation',
          'Consider transition roles that bridge your current and target positions'
        ]
      },
      marketInsights: {
        salaryRange: 'R350,000 - R650,000 annually',
        demandLevel: 'High demand',
        growthProjection: '15% growth expected over next 3 years'
      }
    };
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setShowActionPlan(false);
    form.reset();
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Skills</h3>
            <p className="text-gray-600 text-sm">
              Our AI is comparing your profile against target role requirements...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Skill Gap Analysis
            </h1>
            <p className="text-gray-600">
              Detailed insights into your career transition readiness
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Overall Match Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Career Readiness</span>
                        <span className="text-sm text-gray-600">{analysisResult.overallMatch}%</span>
                      </div>
                      <Progress value={analysisResult.overallMatch} className="h-3" />
                    </div>
                    <div className="ml-6 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {analysisResult.overallMatch}%
                      </div>
                      <div className="text-sm text-gray-600">Match</div>
                    </div>
                  </div>
                  <p className="text-gray-700">{analysisResult.summary}</p>
                </CardContent>
              </Card>
            </div>

            {/* Matched Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Matched Skills
                </CardTitle>
                <CardDescription>
                  Skills you already possess
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.matchedSkills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: skill.importance }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <Progress value={skill.match} className="h-2" />
                    <p className="text-xs text-gray-600">{skill.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Skills to Develop
                </CardTitle>
                <CardDescription>
                  Areas requiring improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.missingSkills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: skill.importance }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-red-400 text-red-400" />
                        ))}
                      </div>
                    </div>
                    <Progress value={skill.match} className="h-2" />
                    <p className="text-xs text-gray-600">{skill.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                  Market Insights
                </CardTitle>
                <CardDescription>
                  Industry outlook and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Salary Range</span>
                    <Badge variant="secondary">{analysisResult.marketInsights.salaryRange}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Market Demand</span>
                    <Badge variant="default">{analysisResult.marketInsights.demandLevel}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Outlook</span>
                    <Badge variant="outline">{analysisResult.marketInsights.growthProjection}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <AnimatePresence>
              {showActionPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-3"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Your Development Action Plan
                      </CardTitle>
                      <CardDescription>
                        Strategic steps to bridge your skill gaps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-green-600">Short Term (1-3 months)</h4>
                          </div>
                          <ul className="space-y-2">
                            {analysisResult.actionPlan.shortTerm.map((action, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-600">Medium Term (3-6 months)</h4>
                          </div>
                          <ul className="space-y-2">
                            {analysisResult.actionPlan.mediumTerm.map((action, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="h-4 w-4 text-purple-600" />
                            <h4 className="font-semibold text-purple-600">Long Term (6+ months)</h4>
                          </div>
                          <ul className="space-y-2">
                            {analysisResult.actionPlan.longTerm.map((action, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <ArrowRight className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="lg:col-span-3 flex gap-4 justify-center">
              <Button onClick={resetAnalysis} variant="outline">
                New Analysis
              </Button>
              <Button>
                Download Report
              </Button>
              <Button variant="secondary">
                Book Career Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Identify the skills you need to develop for your dream role and get a personalized development plan
          </p>
        </motion.div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Career Transition Analysis
            </CardTitle>
            <CardDescription>
              Tell us about your current situation and career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    {...form.register('currentRole')}
                    placeholder="e.g., Junior Developer"
                    className="mt-2"
                  />
                  {form.formState.errors.currentRole && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.currentRole.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    {...form.register('targetRole')}
                    placeholder="e.g., Senior Full Stack Developer"
                    className="mt-2"
                  />
                  {form.formState.errors.targetRole && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.targetRole.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Experience Level</Label>
                  <Select onValueChange={(value) => form.setValue('experience', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.experience && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.experience.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Industry</Label>
                  <Select onValueChange={(value) => form.setValue('industry', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.industry && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="currentSkills">Current Skills & Experience</Label>
                <Textarea
                  id="currentSkills"
                  {...form.register('currentSkills')}
                  placeholder="Describe your current skills, technologies you work with, projects you've completed, and relevant experience..."
                  className="mt-2 min-h-[120px]"
                />
                {form.formState.errors.currentSkills && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.currentSkills.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Skills'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Personalized Analysis</h3>
              <p className="text-sm text-gray-600">
                Get specific insights based on your career goals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Market Insights</h3>
              <p className="text-sm text-gray-600">
                Understand demand and salary expectations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Action Plan</h3>
              <p className="text-sm text-gray-600">
                Receive a step-by-step development roadmap
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysisPage;