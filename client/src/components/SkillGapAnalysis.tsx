import { useState } from "react";
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
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SkillGapResult {
  overallMatch: number;
  summary: string;
  recommendations: string;
  matchedSkills: any[];
  missingSkills: any[];
  actionPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  marketInsights: {
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    demandLevel: string;
    growthProjection: string;
  };
}

export default function SkillGapAnalysis() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<SkillGapResult | null>(null);

  // Get latest CV for analysis
  const { data: latestCV, isLoading: cvLoading } = useQuery({
    queryKey: ["/api/latest-cv"],
    enabled: true,
  });

  // Skill gap analysis mutation
  const analyzeSkillGaps = useMutation({
    mutationFn: async (targetRole: string) => {
      if (!latestCV) {
        throw new Error("No CV found. Please upload a CV first.");
      }

      const response = await fetch("/api/skill-gap/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentRole: "Based on CV analysis",
          targetRole: targetRole,
          experience: "mid-level",
          industry: "Technology",
          currentSkills: latestCV?.content || "No CV content available",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze skill gaps");
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
    onError: (error: any) => {
      toast({
        title: "Analysis Failed", 
        description: error.message || "Unable to analyze skill gaps. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeSkillGaps.mutateAsync("Software Developer"); // Default target role
    } finally {
      setIsAnalyzing(false);
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

      {!latestCV && !cvLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload a CV first to get personalized skill gap analysis.
          </AlertDescription>
        </Alert>
      )}

      {cvLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading your CV...</div>
        </div>
      )}

      {!analysisData && !isAnalyzing && latestCV && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Click "Analyze Skills" to identify skill gaps and get personalized recommendations.
            </p>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary animate-pulse mr-2" />
              <span className="text-lg font-semibold">Analyzing Your Skills...</span>
            </div>
            <Progress value={60} className="w-full" />
            <p className="text-muted-foreground mt-2">
              AI is analyzing your CV and identifying skill gaps...
            </p>
          </CardContent>
        </Card>
      )}

      {analysisData && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
            <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
            <TabsTrigger value="market">Market Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    Overall Match Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysisData.overallMatch}%
                  </div>
                  <Progress value={analysisData.overallMatch} className="mb-4" />
                  <p className="text-muted-foreground text-sm">
                    {analysisData.summary}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-500" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matched Skills</span>
                    <Badge variant="secondary">{analysisData.matchedSkills?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Missing Skills</span>
                    <Badge variant="destructive">{analysisData.missingSkills?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action Items</span>
                    <Badge variant="outline">
                      {(analysisData.actionPlan?.shortTerm?.length || 0) + 
                       (analysisData.actionPlan?.mediumTerm?.length || 0) + 
                       (analysisData.actionPlan?.longTerm?.length || 0)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {analysisData.recommendations}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-6">
            <div className="grid gap-4">
              {analysisData.missingSkills?.length > 0 ? (
                analysisData.missingSkills.map((skill: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{skill.name || `Skill ${index + 1}`}</h4>
                        <Badge variant={
                          skill.importance === 'high' ? 'destructive' :
                          skill.importance === 'medium' ? 'default' : 'secondary'
                        }>
                          {skill.importance || 'Medium'} Priority
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {skill.description || "Important skill for your target role"}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-700">Great job!</h3>
                    <p className="text-muted-foreground">No major skill gaps identified.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <div className="space-y-6">
              {analysisData.actionPlan?.shortTerm?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-500" />
                      Short Term (1-3 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisData.actionPlan.shortTerm.map((item: unknown, index: number) => (
                        <li key={index} className="flex items-start">
                          <ArrowRight className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysisData.actionPlan?.mediumTerm?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-yellow-500" />
                      Medium Term (3-6 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisData.actionPlan.mediumTerm.map((item: unknown, index: number) => (
                        <li key={index} className="flex items-start">
                          <ArrowRight className="mr-2 h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysisData.actionPlan?.longTerm?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-green-500" />
                      Long Term (6+ months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisData.actionPlan.longTerm.map((item: unknown, index: number) => (
                        <li key={index} className="flex items-start">
                          <ArrowRight className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(!analysisData.actionPlan?.shortTerm?.length && 
                !analysisData.actionPlan?.mediumTerm?.length && 
                !analysisData.actionPlan?.longTerm?.length) && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-semibold">No Learning Plan Available</h3>
                    <p className="text-muted-foreground">
                      Run the analysis to generate a personalized learning roadmap.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    Salary Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.marketInsights?.salaryRange ? (
                    <div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {analysisData.marketInsights.salaryRange.currency} {analysisData.marketInsights.salaryRange.min.toLocaleString()} - {analysisData.marketInsights.salaryRange.max.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Salary range for your target role in South Africa
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Salary data not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-blue-500" />
                    Market Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Demand Level</span>
                        <Badge variant="secondary">
                          {analysisData.marketInsights?.demandLevel || "Medium"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Growth Projection</div>
                      <p className="text-muted-foreground text-sm">
                        {analysisData.marketInsights?.growthProjection || "Steady growth expected"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}