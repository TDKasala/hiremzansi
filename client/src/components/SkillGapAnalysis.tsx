import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Star,
  Brain,
  Users,
  Building2,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relevance: number;
  marketDemand: 'low' | 'medium' | 'high' | 'very-high';
  salaryImpact: number;
  learningTime: string;
  sources: string[];
}

interface SkillGap {
  skill: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  marketValue: number;
  learningPath: string[];
  timeToAcquire: string;
  relatedRoles: string[];
}

interface LearningRecommendation {
  skill: string;
  priority: number;
  description: string;
  resources: Array<{
    title: string;
    type: 'course' | 'certification' | 'project' | 'book';
    provider: string;
    duration: string;
    cost: 'free' | 'paid' | 'varies';
  }>;
  prerequisites: string[];
  outcomes: string[];
}

export function SkillGapAnalysis() {
  const [selectedRole, setSelectedRole] = useState<string>("software-developer");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Get user's current skills from CV
  const { data: userSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['/api/user-skills'],
    retry: false,
  });

  // Get latest CV for analysis
  const { data: latestCV } = useQuery({
    queryKey: ['/api/latest-cv'],
    retry: false,
  });

  // Analyze skill gaps
  const analyzeSkillGaps = useMutation({
    mutationFn: async (targetRole: string) => {
      const response = await fetch('/api/analyze-skill-gaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          targetRole,
          cvId: latestCV?.id,
          currentSkills: userSkills || []
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisData(data);
      toast({
        title: "Analysis Complete",
        description: "Your skill gap analysis has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze skill gaps. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeSkillGaps.mutateAsync(selectedRole);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock data for demonstration - in production this would come from AI analysis
  const mockAnalysisData = {
    currentSkills: [
      { name: "React", level: "advanced", marketDemand: "very-high", salaryImpact: 15 },
      { name: "JavaScript", level: "advanced", marketDemand: "very-high", salaryImpact: 20 },
      { name: "TypeScript", level: "intermediate", marketDemand: "high", salaryImpact: 12 },
      { name: "Node.js", level: "intermediate", marketDemand: "high", salaryImpact: 18 },
      { name: "PostgreSQL", level: "beginner", marketDemand: "medium", salaryImpact: 8 }
    ],
    skillGaps: [
      {
        skill: "Docker & Containerization",
        priority: "critical",
        reason: "Essential for modern DevOps practices and cloud deployment",
        marketValue: 25,
        learningPath: ["Docker Basics", "Docker Compose", "Kubernetes Fundamentals"],
        timeToAcquire: "2-3 months",
        relatedRoles: ["Full Stack Developer", "DevOps Engineer", "Cloud Architect"]
      },
      {
        skill: "AWS Cloud Services",
        priority: "high",
        reason: "High demand in South African tech companies, 35% salary increase potential",
        marketValue: 30,
        learningPath: ["AWS Fundamentals", "EC2 & S3", "Lambda Functions", "AWS Certification"],
        timeToAcquire: "3-4 months",
        relatedRoles: ["Cloud Developer", "Solutions Architect", "DevOps Engineer"]
      },
      {
        skill: "Python",
        priority: "medium",
        reason: "Expanding opportunities in data science and machine learning",
        marketValue: 22,
        learningPath: ["Python Basics", "Data Analysis with Pandas", "Web Development with Django"],
        timeToAcquire: "2-3 months",
        relatedRoles: ["Data Scientist", "Backend Developer", "ML Engineer"]
      },
      {
        skill: "GraphQL",
        priority: "medium",
        reason: "Growing adoption in modern web applications",
        marketValue: 15,
        learningPath: ["GraphQL Basics", "Apollo Server", "GraphQL with React"],
        timeToAcquire: "1-2 months",
        relatedRoles: ["Frontend Developer", "Full Stack Developer", "API Developer"]
      }
    ],
    learningRecommendations: [
      {
        skill: "Docker & Containerization",
        priority: 1,
        description: "Master containerization for modern application deployment",
        resources: [
          {
            title: "Docker Mastery Course",
            type: "course",
            provider: "Udemy",
            duration: "20 hours",
            cost: "paid"
          },
          {
            title: "Docker Certified Associate",
            type: "certification",
            provider: "Docker",
            duration: "3 months prep",
            cost: "paid"
          }
        ],
        prerequisites: ["Basic Linux commands", "Understanding of web applications"],
        outcomes: ["Deploy containerized applications", "Manage Docker containers", "Use Docker Compose"]
      },
      {
        skill: "AWS Cloud Services",
        priority: 2,
        description: "Learn cloud computing fundamentals and AWS services",
        resources: [
          {
            title: "AWS Cloud Practitioner",
            type: "certification",
            provider: "AWS",
            duration: "2 months",
            cost: "paid"
          },
          {
            title: "AWS Free Tier Hands-on",
            type: "project",
            provider: "AWS",
            duration: "1 month",
            cost: "free"
          }
        ],
        prerequisites: ["Basic networking knowledge", "Understanding of web hosting"],
        outcomes: ["Deploy applications on AWS", "Manage cloud resources", "Implement scalable solutions"]
      }
    ],
    salaryProjection: {
      current: 45000,
      potential: 58500,
      increase: 30
    },
    marketInsights: {
      trending: ["AI/ML", "Cloud Computing", "Cybersecurity", "Data Science"],
      inDemand: ["React", "Python", "AWS", "Docker", "Kubernetes"],
      emerging: ["Web3", "Blockchain", "IoT", "Edge Computing"]
    }
  };

  const data = analysisData || mockAnalysisData;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="mr-2 h-6 w-6 text-primary" />
            Skill Gap Analysis
          </h2>
          <p className="text-muted-foreground">
            Identify missing skills and create your learning roadmap for career advancement
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !latestCV}>
          <Brain className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze Skills"}
        </Button>
      </div>

      {!latestCV && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload a CV first to get personalized skill gap analysis.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-green-600" />
                  Current Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.currentSkills.map((skill: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <p className="text-xs text-muted-foreground">
                          +{skill.salaryImpact}% salary impact
                        </p>
                      </div>
                      <Badge className={getSkillLevelColor(skill.level)}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Gaps Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-orange-600" />
                  Priority Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.skillGaps.slice(0, 3).map((gap: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{gap.skill}</span>
                        <p className="text-xs text-muted-foreground">
                          {gap.timeToAcquire} to learn
                        </p>
                      </div>
                      <Badge className={getPriorityColor(gap.priority)}>
                        {gap.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Salary Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Range</span>
                      <span>R{data.salaryProjection.current.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Potential Range</span>
                      <span className="font-medium text-green-600">
                        R{data.salaryProjection.potential.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      +{data.salaryProjection.increase}% increase potential
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {data.skillGaps.map((gap: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{gap.skill}</CardTitle>
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority} priority
                    </Badge>
                  </div>
                  <CardDescription>{gap.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Market Value</h4>
                      <p className="text-2xl font-bold text-green-600">+{gap.marketValue}%</p>
                      <p className="text-sm text-muted-foreground">salary increase</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Learning Path</h4>
                      <div className="space-y-1">
                        {gap.learningPath.map((step: string, stepIndex: number) => (
                          <div key={stepIndex} className="flex items-center text-sm">
                            <ArrowRight className="h-3 w-3 mr-1 text-muted-foreground" />
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Related Roles</h4>
                      <div className="space-y-1">
                        {gap.relatedRoles.map((role: string, roleIndex: number) => (
                          <Badge key={roleIndex} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {data.learningRecommendations.map((rec: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                    {rec.skill}
                  </CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Learning Resources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rec.resources.map((resource: any, resIndex: number) => (
                          <div key={resIndex} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{resource.title}</span>
                              <Badge variant={resource.cost === 'free' ? 'secondary' : 'outline'}>
                                {resource.cost}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {resource.provider} • {resource.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Prerequisites</h4>
                        <ul className="text-sm space-y-1">
                          {rec.prerequisites.map((prereq: string, prereqIndex: number) => (
                            <li key={prereqIndex} className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              {prereq}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Learning Outcomes</h4>
                        <ul className="text-sm space-y-1">
                          {rec.outcomes.map((outcome: string, outcomeIndex: number) => (
                            <li key={outcomeIndex} className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Trending Skills
                </CardTitle>
                <CardDescription>Hot skills in the South African market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.marketInsights.trending.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <Badge variant="secondary">🔥 Hot</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                  In-Demand Skills
                </CardTitle>
                <CardDescription>Skills with high job demand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.marketInsights.inDemand.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <Badge variant="outline">High Demand</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-purple-600" />
                  Emerging Skills
                </CardTitle>
                <CardDescription>Future-focused skills to watch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.marketInsights.emerging.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <Badge variant="outline">🚀 Emerging</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}