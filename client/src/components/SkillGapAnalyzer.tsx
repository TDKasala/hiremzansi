import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Target,
  Briefcase,
  ChevronRight,
  Lightbulb,
  GraduationCap,
  BarChart4
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for skill analysis
interface SkillProficiency {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience?: number;
  lastUsed?: string;
  verified?: boolean;
  category?: string;
  relevance?: number;
}

interface LearningResource {
  title: string;
  type: string;
  provider?: string;
  url?: string;
  cost?: {
    amount: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: string;
  };
  level: string;
  saRelevant: boolean;
  description?: string;
}

interface SkillGap {
  skill: string;
  importance: number;
  currentLevel?: "none" | "beginner" | "intermediate" | "advanced" | "expert";
  requiredLevel: "beginner" | "intermediate" | "advanced" | "expert";
  gap: "critical" | "major" | "minor" | "none";
  resources: LearningResource[];
  description: string;
}

interface CareerPathOption {
  title: string;
  description: string;
  requiredSkills: {
    name: string;
    level: string;
    importance: number;
  }[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  growthPotential: string;
  timeToAchieve?: {
    value: number;
    unit: string;
  };
  industries: string[];
  saJobMarketDemand: string;
}

interface SkillGapAnalysis {
  id: string;
  currentSkills: SkillProficiency[];
  targetRole?: string;
  targetIndustry?: string;
  identifiedGaps: SkillGap[];
  careerPathOptions: CareerPathOption[];
  marketInsights: {
    inDemandSkills: string[];
    emergingTechnologies: string[];
    industryTrends: string[];
    salaryInsights: {
      role: string;
      median: number;
      range: {
        min: number;
        max: number;
      };
      currency: string;
    }[];
  };
  summary: string;
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  createdAt: string;
}

// Convert skill level to numeric value
const skillLevelToValue = (level?: string): number => {
  switch(level) {
    case "expert": return 100;
    case "advanced": return 75;
    case "intermediate": return 50;
    case "beginner": return 25;
    case "none": return 0;
    default: return 0;
  }
};

// Format currency
const formatCurrency = (amount?: number, currency = "ZAR") => {
  if (amount === undefined) return "";
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function SkillGapAnalyzer() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Analysis states
  const [cvContent, setCvContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [currentSkills, setCurrentSkills] = useState<SkillProficiency[]>([]);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Selected resources
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  // Get job ID from URL if present
  const jobId = new URLSearchParams(window.location.search).get('jobId');
  
  // Fetch job details if jobId is provided
  const jobQuery = useQuery({
    queryKey: ['/api/job-details', jobId],
    queryFn: () => 
      fetch(`/api/job-details/${jobId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch job details');
          return res.json();
        }),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  // Update target role and industry when job is loaded
  useEffect(() => {
    if (jobQuery.data) {
      setTargetRole(jobQuery.data.title);
      setTargetIndustry(jobQuery.data.industry);
    }
  }, [jobQuery.data]);
  
  // Get CV content
  const cvQuery = useQuery({
    queryKey: ['/api/latest-cv'],
    queryFn: () => 
      fetch(`/api/latest-cv`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              return { error: "No CV found" };
            }
            throw new Error('Failed to fetch CV');
          }
          return res.json();
        }),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Update CV content when query completes
  useEffect(() => {
    if (cvQuery.data && !cvQuery.data.error) {
      setCvContent(cvQuery.data.content);
    }
  }, [cvQuery.data]);
  
  // Extract skills from CV
  const extractSkillsMutation = useMutation({
    mutationFn: async (data: { cvContent: string }) => {
      const response = await apiRequest("POST", "/api/skills/extract-from-cv", data);
      return response.json();
    },
    onSuccess: (data: SkillProficiency[]) => {
      setCurrentSkills(data);
      toast({
        title: "Skills Extracted",
        description: `Identified ${data.length} skills from your CV.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to extract skills: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Analyze skill gaps
  const analyzeGapsMutation = useMutation({
    mutationFn: async (data: {
      currentSkills: SkillProficiency[];
      targetRole: string;
      targetIndustry?: string;
    }) => {
      const response = await apiRequest("POST", "/api/skills/analyze-gaps", data);
      return response.json();
    },
    onSuccess: (data: SkillGapAnalysis) => {
      setAnalysis(data);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your personalized skill gap analysis is ready.",
      });
    },
    onError: (error: Error) => {
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze skill gaps: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Extract skills from CV
  const handleExtractSkills = () => {
    if (!cvContent) {
      toast({
        title: "No CV Content",
        description: "Please upload your CV first or enter CV content manually.",
        variant: "destructive"
      });
      return;
    }
    
    extractSkillsMutation.mutate({ cvContent });
  };
  
  // Start analysis
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentSkills.length === 0) {
      toast({
        title: "No Skills Detected",
        description: "Please extract skills from your CV first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!targetRole) {
      toast({
        title: "Target Role Required",
        description: "Please specify the role you're targeting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    analyzeGapsMutation.mutate({
      currentSkills,
      targetRole,
      targetIndustry: targetIndustry || undefined
    });
  };
  
  // Get learning resources for a specific skill
  const getResourceQuery = useQuery({
    queryKey: ['/api/skills/learning-resources', selectedSkill],
    queryFn: () => {
      if (!selectedSkill || !analysis) return null;
      
      const skillGap = analysis.identifiedGaps.find(gap => gap.skill === selectedSkill);
      if (!skillGap) return null;
      
      const params = new URLSearchParams({
        skillName: selectedSkill,
        currentLevel: skillGap.currentLevel || 'none',
        targetLevel: skillGap.requiredLevel
      });
      
      return fetch(`/api/skills/learning-resources?${params.toString()}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch learning resources');
          return res.json();
        });
    },
    enabled: !!selectedSkill,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });
  
  // Prepare skills data for radar chart
  const prepareSkillsChartData = () => {
    if (!analysis) return [];
    
    // Create categories
    const skillCategories: Record<string, { category: string, value: number, fullMark: number }> = {};
    
    // Process current skills
    analysis.currentSkills.forEach(skill => {
      const category = skill.category || "Other";
      
      if (!skillCategories[category]) {
        skillCategories[category] = {
          category,
          value: 0,
          fullMark: 100
        };
      }
      
      // Add skill level to category total
      const value = skillLevelToValue(skill.level);
      skillCategories[category].value = Math.max(skillCategories[category].value, value);
    });
    
    // Convert to array
    return Object.values(skillCategories);
  };
  
  // Prepare skill gaps data for visualization
  const prepareGapChartData = () => {
    if (!analysis) return [];
    
    return analysis.identifiedGaps.map(gap => ({
      skill: gap.skill,
      current: skillLevelToValue(gap.currentLevel),
      required: skillLevelToValue(gap.requiredLevel),
      gap: skillLevelToValue(gap.requiredLevel) - skillLevelToValue(gap.currentLevel),
      importance: gap.importance
    })).sort((a, b) => b.gap - a.gap).slice(0, 8);
  };
  
  // Get color for skill gap severity
  const getGapColor = (gap: string) => {
    switch(gap) {
      case "critical": return "text-red-500 bg-red-50";
      case "major": return "text-amber-500 bg-amber-50";
      case "minor": return "text-yellow-500 bg-yellow-50";
      case "none": return "text-green-500 bg-green-50";
      default: return "text-slate-500 bg-slate-50";
    }
  };
  
  // Get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch(level) {
      case "expert": return "bg-purple-100 text-purple-800";
      case "advanced": return "bg-blue-100 text-blue-800";
      case "intermediate": return "bg-green-100 text-green-800";
      case "beginner": return "bg-yellow-100 text-yellow-800";
      case "none": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center">Career Skill Gap Analyzer</h1>
      
      {/* Analysis Form */}
      {!analysis && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Identify Your Skill Gaps</CardTitle>
            <CardDescription>
              We'll analyze your CV against job market requirements to identify missing skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cv-content">Your CV</Label>
                {cvQuery.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading your CV...</span>
                  </div>
                ) : cvQuery.data && !cvQuery.data.error ? (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="font-medium">CV Loaded Successfully</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cvContent.substring(0, 150)}...
                    </p>
                    {!extractSkillsMutation.isPending && currentSkills.length === 0 && (
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={handleExtractSkills}
                        className="mt-2"
                      >
                        Extract Skills
                      </Button>
                    )}
                    {extractSkillsMutation.isPending && (
                      <div className="flex items-center mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Extracting skills...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                      <p className="text-yellow-700 font-medium">No CV Found</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Please upload your CV first.
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/upload">
                        Upload Your CV
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {currentSkills.length > 0 && (
                <div className="space-y-2">
                  <Label>Identified Skills</Label>
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {currentSkills.map((skill, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary"
                          className={getLevelBadgeColor(skill.level)}
                        >
                          {skill.name}
                          {skill.relevance !== undefined && (
                            <span className="ml-1 text-xs opacity-70">
                              ({skill.level})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-role">Target Job Role</Label>
                  {jobQuery.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading job details...</span>
                    </div>
                  ) : jobQuery.data ? (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="font-medium">{jobQuery.data.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        at {jobQuery.data.company}
                      </p>
                    </div>
                  ) : (
                    <Input
                      id="target-role"
                      placeholder="e.g. Data Scientist, Project Manager"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-industry">Target Industry (Optional)</Label>
                  <Input
                    id="target-industry"
                    placeholder="e.g. Technology, Finance, Healthcare"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAnalyze} 
              className="w-full sm:w-auto"
              disabled={analyzeGapsMutation.isPending || currentSkills.length === 0 || !targetRole}
            >
              {analyzeGapsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze My Skill Gaps
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Skills</CardTitle>
            <CardDescription>
              Please wait while we analyze your skills and the job market
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <div className="text-center space-y-2">
              <p className="font-medium">Comprehensive Analysis in Progress</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We're comparing your skills to market requirements, identifying gaps,
                and preparing personalized recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                {analysis.targetRole} {analysis.targetIndustry && `in ${analysis.targetIndustry}`}
              </CardTitle>
              <CardDescription>
                Skill gap analysis completed on {new Date(analysis.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p>{analysis.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Radar Chart */}
                <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                    Your Skill Profile
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={prepareSkillsChartData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar
                          name="Current Skills"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#93c5fd"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Action Plan */}
                <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Action Plan
                  </h3>
                  
                  <Tabs defaultValue="short">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="short">Short Term</TabsTrigger>
                      <TabsTrigger value="medium">Medium Term</TabsTrigger>
                      <TabsTrigger value="long">Long Term</TabsTrigger>
                    </TabsList>
                    <TabsContent value="short" className="pt-4">
                      <ul className="space-y-2">
                        {analysis.actionPlan.shortTerm.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                              {i + 1}
                            </div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="medium" className="pt-4">
                      <ul className="space-y-2">
                        {analysis.actionPlan.mediumTerm.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                              {i + 1}
                            </div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="long" className="pt-4">
                      <ul className="space-y-2">
                        {analysis.actionPlan.longTerm.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">
                              {i + 1}
                            </div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Skill Gaps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                Identified Skill Gaps
              </CardTitle>
              <CardDescription>
                Skills you need to develop to match the job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {analysis.identifiedGaps.map((gap, index) => (
                  <AccordionItem key={index} value={`gap-${index}`}>
                    <AccordionTrigger className="text-left py-4">
                      <div className="flex flex-col md:flex-row w-full md:items-center md:justify-between pr-4">
                        <div className="flex items-center">
                          <div className={`mr-3 px-3 py-1 rounded-full text-sm font-medium ${getGapColor(gap.gap)}`}>
                            {gap.gap}
                          </div>
                          <span className="font-medium">{gap.skill}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 md:mt-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Current:</span>
                            <Badge variant="outline" className={getLevelBadgeColor(gap.currentLevel || 'none')}>
                              {gap.currentLevel || "none"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Required:</span>
                            <Badge variant="outline" className={getLevelBadgeColor(gap.requiredLevel)}>
                              {gap.requiredLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <p className="text-sm">{gap.description}</p>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedSkill(gap.skill)}
                            className="w-full"
                          >
                            <Lightbulb className="mr-2 h-4 w-4" />
                            View Learning Resources
                          </Button>
                        </div>
                        
                        {selectedSkill === gap.skill && (
                          <div className="mt-4 border rounded-md p-4">
                            <h4 className="font-medium mb-3">Learning Resources for {gap.skill}</h4>
                            {getResourceQuery.isLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : getResourceQuery.isError ? (
                              <div className="p-4 bg-red-50 rounded-md text-red-800">
                                Failed to load resources. Please try again.
                              </div>
                            ) : getResourceQuery.data ? (
                              <div className="space-y-4">
                                {getResourceQuery.data.map((resource: LearningResource, i: number) => (
                                  <Card key={i} className="overflow-hidden">
                                    <CardHeader className="p-4 pb-0">
                                      <CardTitle className="text-base">
                                        {resource.title}
                                        {resource.saRelevant && (
                                          <Badge className="ml-2 bg-green-100 text-green-800">
                                            South Africa
                                          </Badge>
                                        )}
                                      </CardTitle>
                                      <CardDescription className="flex items-center mt-1">
                                        {resource.provider && (
                                          <span className="mr-2">{resource.provider}</span>
                                        )}
                                        <Badge variant="outline">{resource.type}</Badge>
                                        <Badge variant="outline" className="ml-2">
                                          {resource.level}
                                        </Badge>
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                      {resource.description && (
                                        <p className="text-sm mb-3">{resource.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-4 text-sm">
                                        {resource.cost && (
                                          <div>
                                            <span className="text-muted-foreground mr-1">Cost:</span>
                                            <span className="font-medium">
                                              {formatCurrency(resource.cost.amount, resource.cost.currency)}
                                            </span>
                                          </div>
                                        )}
                                        {resource.duration && (
                                          <div>
                                            <span className="text-muted-foreground mr-1">Duration:</span>
                                            <span className="font-medium">
                                              {resource.duration.value} {resource.duration.unit}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                    {resource.url && (
                                      <CardFooter className="p-4 pt-0 flex justify-end">
                                        <Button size="sm" asChild>
                                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                            Visit Resource
                                          </a>
                                        </Button>
                                      </CardFooter>
                                    )}
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-yellow-50 rounded-md">
                                No specific resources found.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          {/* Career Paths Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                Alternative Career Paths
              </CardTitle>
              <CardDescription>
                Other career options that match your current skill set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.careerPathOptions.map((career, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{career.title}</CardTitle>
                        <Badge 
                          variant={
                            career.saJobMarketDemand === "high" ? "default" :
                            career.saJobMarketDemand === "medium" ? "secondary" : "outline"
                          }
                        >
                          {career.saJobMarketDemand} demand
                        </Badge>
                      </div>
                      <CardDescription>
                        Growth potential: {career.growthPotential}
                        {career.timeToAchieve && (
                          <span className="ml-2">
                            • Achievable in {career.timeToAchieve.value} {career.timeToAchieve.unit}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm mb-4">{career.description}</p>
                      
                      {career.salaryRange && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground mr-2">Typical salary range:</span>
                          <span className="font-medium">
                            {formatCurrency(career.salaryRange.min, career.salaryRange.currency)} - 
                            {formatCurrency(career.salaryRange.max, career.salaryRange.currency)}
                          </span>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <span className="text-sm text-muted-foreground">Industries: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {career.industries.map((industry, i) => (
                            <Badge key={i} variant="outline">{industry}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground block mb-1">Key skills required:</span>
                        <div className="flex flex-wrap gap-2">
                          {career.requiredSkills.slice(0, 6).map((skill, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary"
                              className={skill.importance > 80 ? "border-primary" : ""}
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {career.requiredSkills.length > 6 && (
                            <Badge variant="outline">
                              +{career.requiredSkills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                setAnalysis(null);
                setSelectedSkill(null);
                setCurrentSkills([]);
              }} variant="outline">
                Start New Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}