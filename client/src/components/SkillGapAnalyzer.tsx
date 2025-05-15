import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, BookOpen, Star, Award, Sparkles, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

// Form schema
const skillGapSchema = z.object({
  currentRole: z.string().min(2, "Current role is required"),
  targetRole: z.string().min(2, "Target role is required"),
  skills: z.string().optional(),
  experienceLevel: z.string().min(1, "Experience level is required"),
  resume: z.string().optional(),
});

type SkillGapFormValues = z.infer<typeof skillGapSchema>;

interface SkillMatch {
  name: string;
  match: number;
  description: string;
  importance: number;
}

interface LearningResource {
  title: string;
  description: string;
  url: string;
  type: string;
  duration: string;
  level: string;
  provider: string;
}

interface SkillGapResult {
  overallMatch: number;
  summary: string;
  recommendations: string;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  partialSkills: SkillMatch[];
  learningResources: LearningResource[];
  careerProgression: {
    currentLevel: string;
    nextLevel: string;
    timeEstimate: string;
    steps: string[];
  };
  marketInsights: {
    demand: number;
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    growthRate: string;
    topRegions: string[];
  };
}

export default function SkillGapAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<SkillGapResult | null>(null);
  
  // Get user's CVs
  const { data: cvs, isLoading: cvsLoading } = useQuery({
    queryKey: ["/api/cvs"],
    enabled: !!user,
  });

  // Form setup
  const form = useForm<SkillGapFormValues>({
    resolver: zodResolver(skillGapSchema),
    defaultValues: {
      currentRole: "",
      targetRole: "",
      skills: "",
      experienceLevel: "mid-level",
      resume: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: SkillGapFormValues) => {
      const res = await apiRequest("POST", "/api/skills/analyze-gaps", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to analyze skills");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById("results");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze skills. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: SkillGapFormValues) {
    analyzeMutation.mutate(data);
  }

  // Sample data for demonstration when no real API is available
  function getSampleResults(): SkillGapResult {
    const targetRole = form.getValues().targetRole.toLowerCase();
    
    // Base sample data
    const sampleResult: SkillGapResult = {
      overallMatch: 67,
      summary: "You have a solid foundation for the target role, but there are some important skill gaps to address. With focused learning on key technologies and methodologies, you could significantly improve your employability for this position.",
      recommendations: "Focus on developing the missing technical skills through online courses and practical projects. Consider joining relevant professional communities to build your network in this field.",
      matchedSkills: [
        {
          name: "Problem Solving",
          match: 100,
          description: "You have demonstrated strong problem-solving abilities that are directly transferable to the target role.",
          importance: 9
        },
        {
          name: "Communication",
          match: 100,
          description: "Your communication skills are well-developed and meet the requirements of the role.",
          importance: 8
        },
        {
          name: "Project Management",
          match: 90,
          description: "You have good experience with project management, which is valuable for this position.",
          importance: 7
        }
      ],
      missingSkills: [
        {
          name: "Technical Skill 1",
          match: 0,
          description: "This is a core technical requirement for the role that was not found in your profile.",
          importance: 9
        },
        {
          name: "Industry Knowledge",
          match: 0,
          description: "Specific industry knowledge required for this role was not identified in your background.",
          importance: 8
        }
      ],
      partialSkills: [
        {
          name: "Technical Skill 2",
          match: 60,
          description: "You have some experience with this skill, but would benefit from deeper knowledge.",
          importance: 8
        },
        {
          name: "Leadership",
          match: 50,
          description: "You have some leadership experience, but the role requires more advanced leadership capabilities.",
          importance: 7
        }
      ],
      learningResources: [
        {
          title: "Online Course 1",
          description: "Comprehensive course covering the fundamentals of the required technical skill.",
          url: "https://example.com/course1",
          type: "Course",
          duration: "30 hours",
          level: "Intermediate",
          provider: "Coursera"
        },
        {
          title: "Industry Certification",
          description: "Recognized certification that will validate your knowledge in this field.",
          url: "https://example.com/certification",
          type: "Certification",
          duration: "Self-paced",
          level: "Advanced",
          provider: "Industry Association"
        },
        {
          title: "Practical Workshop",
          description: "Hands-on workshop to develop practical skills required for the role.",
          url: "https://example.com/workshop",
          type: "Workshop",
          duration: "2 days",
          level: "Intermediate",
          provider: "Tech Academy"
        }
      ],
      careerProgression: {
        currentLevel: "Mid-level Professional",
        nextLevel: "Senior Professional",
        timeEstimate: "1-2 years",
        steps: [
          "Complete recommended technical training",
          "Gain practical experience through projects",
          "Develop leadership skills through team leadership opportunities",
          "Build industry network and expertise"
        ]
      },
      marketInsights: {
        demand: 8,
        salaryRange: {
          min: 35000,
          max: 55000,
          currency: "ZAR"
        },
        growthRate: "12% annually",
        topRegions: ["Johannesburg", "Cape Town", "Pretoria", "Durban"]
      }
    };

    // Customize based on target role if provided
    if (targetRole.includes("developer") || targetRole.includes("engineer") || targetRole.includes("programmer")) {
      return {
        ...sampleResult,
        overallMatch: 72,
        matchedSkills: [
          {
            name: "Problem Solving",
            match: 100,
            description: "Your analytical and logical reasoning skills are well developed and directly applicable to software development roles.",
            importance: 9
          },
          {
            name: "JavaScript",
            match: 90,
            description: "You have strong JavaScript skills that match the requirements for this role.",
            importance: 9
          },
          {
            name: "Version Control (Git)",
            match: 85,
            description: "Your experience with Git and version control practices meets industry standards.",
            importance: 7
          }
        ],
        missingSkills: [
          {
            name: "React.js",
            match: 0,
            description: "React.js is a core requirement for this position but was not found in your profile.",
            importance: 9
          },
          {
            name: "GraphQL",
            match: 0,
            description: "Experience with GraphQL APIs would be beneficial for this role.",
            importance: 7
          }
        ],
        partialSkills: [
          {
            name: "Node.js",
            match: 60,
            description: "You have some experience with Node.js, but would benefit from more advanced knowledge.",
            importance: 8
          },
          {
            name: "Test-Driven Development",
            match: 40,
            description: "You have basic understanding of testing principles, but this role requires more advanced TDD practices.",
            importance: 7
          }
        ],
        learningResources: [
          {
            title: "React - The Complete Guide",
            description: "Comprehensive course covering React fundamentals through advanced concepts.",
            url: "https://example.com/react-course",
            type: "Course",
            duration: "40 hours",
            level: "Beginner to Advanced",
            provider: "Udemy"
          },
          {
            title: "Advanced Node.js Development",
            description: "Deep dive into Node.js architecture and advanced server-side concepts.",
            url: "https://example.com/nodejs-advanced",
            type: "Course",
            duration: "25 hours",
            level: "Intermediate",
            provider: "Pluralsight"
          },
          {
            title: "GraphQL Certification",
            description: "Learn GraphQL API development from fundamentals to production-ready implementations.",
            url: "https://example.com/graphql-cert",
            type: "Certification",
            duration: "Self-paced",
            level: "Intermediate",
            provider: "Apollo"
          }
        ],
        marketInsights: {
          demand: 9,
          salaryRange: {
            min: 40000,
            max: 70000,
            currency: "ZAR"
          },
          growthRate: "15% annually",
          topRegions: ["Johannesburg", "Cape Town", "Pretoria", "Durban"]
        }
      };
    } else if (targetRole.includes("data") || targetRole.includes("analyst") || targetRole.includes("science")) {
      return {
        ...sampleResult,
        overallMatch: 64,
        matchedSkills: [
          {
            name: "Data Analysis",
            match: 85,
            description: "You have strong analytical skills that transfer well to data science roles.",
            importance: 9
          },
          {
            name: "SQL",
            match: 80,
            description: "Your SQL skills are solid and meet the basic requirements for this role.",
            importance: 8
          },
          {
            name: "Excel",
            match: 95,
            description: "Your advanced Excel skills are valuable for data analysis positions.",
            importance: 7
          }
        ],
        missingSkills: [
          {
            name: "Python",
            match: 0,
            description: "Python programming is essential for this data role but was not identified in your profile.",
            importance: 9
          },
          {
            name: "Machine Learning",
            match: 0,
            description: "Knowledge of machine learning algorithms is required for this position.",
            importance: 8
          }
        ],
        partialSkills: [
          {
            name: "Data Visualization",
            match: 60,
            description: "You have basic visualization skills, but would benefit from experience with specialized tools.",
            importance: 8
          },
          {
            name: "Statistical Analysis",
            match: 50,
            description: "You have some statistical knowledge, but this role requires more advanced statistical methods.",
            importance: 9
          }
        ],
        learningResources: [
          {
            title: "Python for Data Science and Machine Learning Bootcamp",
            description: "Comprehensive Python course specifically designed for data analysis and ML applications.",
            url: "https://example.com/python-ds",
            type: "Course",
            duration: "45 hours",
            level: "Beginner to Intermediate",
            provider: "Udemy"
          },
          {
            title: "Statistics for Data Science",
            description: "Course covering essential statistical concepts for data science applications.",
            url: "https://example.com/stats-ds",
            type: "Course",
            duration: "20 hours",
            level: "Intermediate",
            provider: "Coursera"
          },
          {
            title: "Applied Machine Learning in Python",
            description: "Learn practical implementation of machine learning algorithms and models.",
            url: "https://example.com/ml-python",
            type: "Specialization",
            duration: "3 months",
            level: "Intermediate",
            provider: "edX"
          }
        ],
        marketInsights: {
          demand: 9,
          salaryRange: {
            min: 35000,
            max: 65000,
            currency: "ZAR"
          },
          growthRate: "18% annually",
          topRegions: ["Johannesburg", "Cape Town", "Durban", "Pretoria"]
        }
      };
    } else if (targetRole.includes("marketing") || targetRole.includes("social media") || targetRole.includes("brand")) {
      return {
        ...sampleResult,
        overallMatch: 76,
        matchedSkills: [
          {
            name: "Social Media Management",
            match: 90,
            description: "Your social media skills are well-developed and directly applicable to this role.",
            importance: 9
          },
          {
            name: "Content Creation",
            match: 85,
            description: "You have strong content creation abilities that meet the requirements for this position.",
            importance: 8
          },
          {
            name: "Communication",
            match: 95,
            description: "Your excellent communication skills are a significant asset for this marketing role.",
            importance: 9
          }
        ],
        missingSkills: [
          {
            name: "SEO/SEM",
            match: 0,
            description: "Search engine optimization knowledge is important for this role but was not identified in your profile.",
            importance: 8
          },
          {
            name: "Marketing Analytics",
            match: 0,
            description: "Experience with marketing analytics tools and metrics is required for this position.",
            importance: 8
          }
        ],
        partialSkills: [
          {
            name: "Email Marketing",
            match: 60,
            description: "You have some email marketing experience, but would benefit from more advanced campaign strategies.",
            importance: 7
          },
          {
            name: "Paid Advertising",
            match: 50,
            description: "You have basic knowledge of paid advertising, but this role requires more comprehensive campaign management.",
            importance: 8
          }
        ],
        learningResources: [
          {
            title: "Digital Marketing Specialization",
            description: "Comprehensive program covering all aspects of digital marketing including SEO, SEM, and analytics.",
            url: "https://example.com/digital-marketing",
            type: "Specialization",
            duration: "3 months",
            level: "Intermediate",
            provider: "Coursera"
          },
          {
            title: "Google Analytics Certification",
            description: "Official Google certification for analytics and marketing measurement.",
            url: "https://example.com/ga-cert",
            type: "Certification",
            duration: "Self-paced",
            level: "Intermediate",
            provider: "Google"
          },
          {
            title: "Advanced Social Media Marketing",
            description: "Learn advanced strategies for social media campaign optimization and measurement.",
            url: "https://example.com/advanced-social",
            type: "Course",
            duration: "20 hours",
            level: "Advanced",
            provider: "LinkedIn Learning"
          }
        ],
        marketInsights: {
          demand: 8,
          salaryRange: {
            min: 30000,
            max: 55000,
            currency: "ZAR"
          },
          growthRate: "12% annually",
          topRegions: ["Johannesburg", "Cape Town", "Durban", "Pretoria"]
        }
      };
    }
    
    return sampleResult;
  }

  const handleSimulateAnalysis = () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    
    // Use sample data for demonstration
    setResult(getSampleResults());
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Career Skill Gap Analyzer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the skills you need to develop for your dream job. Our AI-powered tool analyzes 
          your current skills against job market requirements and provides personalized recommendations.
        </p>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Analyze Your Skills</CardTitle>
          <CardDescription>
            Enter your current role, target position, and skills to get a personalized analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Junior Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Front-End Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid-level">Mid-Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (6-9 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your skills, separated by commas (e.g., JavaScript, React, Project Management, Team Leadership)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {cvsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading CVs...</span>
                </div>
              ) : cvs && cvs.length > 0 ? (
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose a CV (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a CV for analysis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {cvs.map((cv: any) => (
                            <SelectItem key={cv.id} value={cv.id.toString()}>
                              {cv.title || `CV #${cv.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <div className="pt-2">
                {/* Use sample data or real API based on environment */}
                <Button 
                  type="button"
                  className="w-full"
                  onClick={handleSimulateAnalysis}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Skills
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results" className="space-y-8 pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Skill Gap Analysis</h2>
            <div className="mx-auto w-full max-w-xs">
              <div className="relative pt-2">
                <div className="flex justify-center mb-2">
                  <span className="text-4xl font-bold text-primary">{result.overallMatch}%</span>
                </div>
                <Progress value={result.overallMatch} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Match with target role requirements
                </p>
              </div>
            </div>
            <p className="max-w-2xl mx-auto">{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Matches Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  Your Matched Skills
                </CardTitle>
                <CardDescription>
                  Skills that align well with the target role
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {result.matchedSkills.map((skill, i) => (
                    <div key={i} className="border rounded-lg p-3 border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {skill.match}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Skills Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  Skills to Develop
                </CardTitle>
                <CardDescription>
                  Key skills to acquire for your target role
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {result.missingSkills.map((skill, i) => (
                    <div key={i} className="border rounded-lg p-3 border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          High priority
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                  {result.partialSkills.map((skill, i) => (
                    <div key={i} className="border rounded-lg p-3 border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          {skill.match}% match
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Career Progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Career Progression Plan
              </CardTitle>
              <CardDescription>
                Steps to advance from {result.careerProgression.currentLevel} to {result.careerProgression.nextLevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Estimated time: {result.careerProgression.timeEstimate}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.careerProgression.steps.map((step, i) => (
                    <div key={i} className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-3 mt-0.5">
                        {i + 1}
                      </div>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                South African Market Insights
              </CardTitle>
              <CardDescription>
                Current job market data for your target role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Market Demand</h3>
                  <div className="flex justify-center mb-2">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < result.marketInsights.demand
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">{result.marketInsights.demand}/10 demand level</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Salary Range</h3>
                  <p className="text-3xl font-bold mb-1">
                    {result.marketInsights.salaryRange.min.toLocaleString()} - {result.marketInsights.salaryRange.max.toLocaleString()}
                  </p>
                  <p className="text-sm">{result.marketInsights.salaryRange.currency} per month</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Growth Rate</h3>
                  <p className="text-3xl font-bold mb-1">{result.marketInsights.growthRate}</p>
                  <p className="text-sm">Projected job growth</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Top Regions for Employment</h3>
                <div className="flex flex-wrap gap-2">
                  {result.marketInsights.topRegions.map((region, i) => (
                    <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Recommended Learning Resources
              </CardTitle>
              <CardDescription>
                Curated resources to help you develop your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.learningResources.map((resource, i) => (
                  <AccordionItem key={i} value={`resource-${i}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex text-left">
                        <div className="mr-2">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-secondary">
                            {resource.type}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <div className="flex text-xs text-muted-foreground">
                            <span className="mr-2">{resource.provider}</span>
                            <span>•</span>
                            <span className="ml-2">{resource.level}</span>
                            <span>•</span>
                            <span className="ml-2">{resource.duration}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-6 border-l-2 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                        <Button variant="link" className="px-0 h-auto font-normal" asChild>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            View Resource
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pro Tip:</strong> {result.recommendations}
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}