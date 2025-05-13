import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Award, 
  Puzzle, 
  Layout, 
  ArrowLeft,
  FileSearch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { CVAnalysisButton } from '@/components/CVAnalysisButton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { CV, ATSScore, AnalysisReport } from '@shared/schema';

interface CombinedData {
  cv: CV;
  atsScore: ATSScore;
}

export default function CVDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const numericId = parseInt(id);

  // Fetch the combined data
  const { data, isLoading, error } = useQuery<CombinedData>({
    queryKey: [`/api/cv/${id}`, `/api/ats-score/${id}`],
    queryFn: async () => {
      // Fetch CV data
      const cvResponse = await fetch(`/api/cv/${id}`);
      if (!cvResponse.ok) {
        throw new Error('Failed to fetch CV data');
      }
      const cvData = await cvResponse.json();
      
      // Fetch ATS score data
      const scoreResponse = await fetch(`/api/ats-score/${id}`);
      if (!scoreResponse.ok) {
        throw new Error('Failed to fetch ATS score data');
      }
      const scoreData = await scoreResponse.json();
      
      return { 
        cv: cvData, 
        atsScore: scoreData 
      };
    },
    enabled: !!id && !isNaN(numericId),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading CV</CardTitle>
            <CardDescription>
              There was a problem loading the CV details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error?.message || 'CV not found'}</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely extract data
  const { cv, atsScore } = data;
  
  // Format scores as percentages
  const formatScore = (score: number) => `${Math.round(score)}%`;
  
  // Determine score level classes
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Determine progress bar colors
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <Helmet>
        <title>{cv.title || cv.fileName} | CV Analysis | ATSBoost</title>
        <meta name="description" content="Detailed analysis of your CV performance against ATS systems used by South African employers." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold">{cv.title || cv.fileName}</h1>
          <p className="text-muted-foreground">
            Uploaded on {typeof cv.createdAt === 'string' ? new Date(cv.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Score Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>ATS Score</CardTitle>
              <CardDescription>Your CV's performance score</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 w-32 h-32 mx-auto">
                <div 
                  className={`rounded-full w-28 h-28 flex items-center justify-center font-bold text-2xl ${
                    atsScore.score >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : atsScore.score >= 60 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {atsScore.score}%
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Skills Match</span>
                    <span className={getScoreClass(atsScore.skillsScore || 0)}>
                      {formatScore(atsScore.skillsScore || 0)}
                    </span>
                  </div>
                  <Progress value={atsScore.skillsScore || 0} className={getProgressColor(atsScore.skillsScore || 0)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Context Match</span>
                    <span className={getScoreClass(atsScore.contextScore || 0)}>
                      {formatScore(atsScore.contextScore || 0)}
                    </span>
                  </div>
                  <Progress value={atsScore.contextScore || 0} className={getProgressColor(atsScore.contextScore || 0)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Format Score</span>
                    <span className={getScoreClass(atsScore.formatScore || 0)}>
                      {formatScore(atsScore.formatScore || 0)}
                    </span>
                  </div>
                  <Progress value={atsScore.formatScore || 0} className={getProgressColor(atsScore.formatScore || 0)} />
                </div>
                
                {atsScore.saContextScore !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>SA Context</span>
                      <span className={getScoreClass(atsScore.saContextScore || 0)}>
                        {formatScore(atsScore.saContextScore || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={atsScore.saContextScore || 0} 
                      className={getProgressColor(atsScore.saContextScore || 0)} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6 flex-wrap">
                {atsScore.bbbeeDetected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    B-BBEE Detected
                  </Badge>
                )}
                
                {atsScore.nqfDetected && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    NQF Level Detected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analysis Details</CardTitle>
              <CardDescription>Detailed feedback on your CV</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="strengths">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="strengths" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Strengths</span>
                  </TabsTrigger>
                  <TabsTrigger value="improvements" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Improve</span>
                  </TabsTrigger>
                  <TabsTrigger value="issues" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Issues</span>
                  </TabsTrigger>
                </TabsList>

                {/* Strengths Tab */}
                <TabsContent value="strengths" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your CV has the following strengths that will help it perform well with ATS systems:
                  </p>
                  
                  <ul className="space-y-3">
                    {atsScore.strengths && atsScore.strengths.length > 0 ? (
                      atsScore.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground text-sm">No strengths data available</li>
                    )}
                  </ul>
                </TabsContent>

                {/* Improvements Tab */}
                <TabsContent value="improvements" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Here are areas you can improve to boost your ATS score:
                  </p>
                  
                  <ul className="space-y-3">
                    {atsScore.improvements && atsScore.improvements.length > 0 ? (
                      atsScore.improvements.map((improvement, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground text-sm">No improvement suggestions available</li>
                    )}
                  </ul>
                </TabsContent>

                {/* Issues Tab */}
                <TabsContent value="issues" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    These critical issues may prevent your CV from passing ATS filters:
                  </p>
                  
                  <ul className="space-y-3">
                    {atsScore.issues && atsScore.issues.length > 0 ? (
                      atsScore.issues.map((issue, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>No critical issues detected. Great job!</span>
                      </li>
                    )}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* South African Context Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>South African Context Analysis</CardTitle>
              <CardDescription>How your CV aligns with the South African job market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* SA Keywords */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Detected South African Keywords</h3>
                  {atsScore.saKeywordsFound && atsScore.saKeywordsFound.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {atsScore.saKeywordsFound.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No South African specific keywords detected. Consider adding relevant terms.
                    </p>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Keyword Recommendations</h3>
                  {atsScore.keywordRecommendations && atsScore.keywordRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {atsScore.keywordRecommendations.map((group, index) => (
                        <div key={index} className="border p-3 rounded-md">
                          <h4 className="font-medium mb-2">Category {index + 1}</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.map((keyword, kIndex) => (
                              <Badge key={kIndex} variant="outline" className="bg-blue-50">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No keyword recommendations available.
                    </p>
                  )}
                </div>
              </div>

              {/* SA Specific Advice */}
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">B-BBEE Details</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {atsScore.bbbeeDetected
                      ? "B-BBEE information detected. This can be advantageous for employment equity considerations."
                      : "Consider adding your B-BBEE status if applicable. This information is valuable for South African employers."}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="mb-3 flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">NQF Qualifications</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {atsScore.nqfDetected
                      ? "NQF level information detected. This helps employers understand your qualification level."
                      : "Consider adding NQF levels to your qualifications to align with South African education frameworks."}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="mb-3 flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Local Context</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(atsScore.saContextScore || 0) >= 70
                      ? "Strong South African context. Your CV is well-aligned with local requirements."
                      : "Consider enhancing South African context by mentioning relevant industries, companies, or regulations."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Analysis Card */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                Premium Deep Analysis
              </CardTitle>
              <CardDescription>
                Get a comprehensive AI-powered analysis of your CV with detailed feedback and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Premium Analysis includes:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>AI-powered feedback from our premium GPT-4o model</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Industry-specific recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>Detailed content optimization suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>South African context awareness</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center items-center md:border-l md:pl-6 space-y-4">
                  <p className="text-center text-muted-foreground">
                    Unlock detailed insights and get personalized recommendations to make your CV stand out.
                  </p>
                  <CVAnalysisButton 
                    cvId={cv.id} 
                    size="lg"
                    text="Run Deep Analysis" 
                    onAnalysisComplete={(reportId) => {
                      // Refresh the data when the analysis is complete
                      queryClient.invalidateQueries({
                        queryKey: [`/api/cv/${id}`, `/api/ats-score/${id}`]
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/upload">Upload New CV</Link>
          </Button>
          
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </>
  );
}