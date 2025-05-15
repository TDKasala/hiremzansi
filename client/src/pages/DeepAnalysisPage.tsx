import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { FileText, ChevronLeft, CloudUpload, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeepAnalysisPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get the latest CV
  const {
    data: latestCV,
    isLoading: isLoadingCV,
    error: cvError
  } = useQuery({
    queryKey: ['/api/latest-cv'],
    enabled: !!user,
  });

  // Get the deep analysis report if a CV is available
  const {
    data: analysisReport,
    isLoading: isLoadingReport,
    error: reportError
  } = useQuery({
    queryKey: ['/api/deep-analysis', latestCV?.id],
    enabled: !!latestCV?.id,
  });

  // Handle loading states
  if (isLoadingCV || isLoadingReport) {
    return (
      <div className="container max-w-4xl py-8">
        <Helmet>
          <title>Deep CV Analysis | ATSBoost</title>
          <meta name="description" content="Get a comprehensive analysis of your CV to understand how it measures against South African market expectations" />
        </Helmet>
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Deep CV Analysis</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4">
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle errors or no CV uploaded
  if (cvError || !latestCV) {
    return (
      <div className="container max-w-4xl py-8">
        <Helmet>
          <title>Deep CV Analysis | ATSBoost</title>
          <meta name="description" content="Get a comprehensive analysis of your CV to understand how it measures against South African market expectations" />
        </Helmet>
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Deep CV Analysis</h1>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No CV Available</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You need to upload a CV before we can perform a deep analysis. 
                Upload your CV to get detailed insights.
              </p>
              <Button asChild>
                <Link href="/upload">
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Upload CV
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render analysis report or upgrade prompt
  return (
    <div className="container max-w-4xl py-8">
      <Helmet>
        <title>Deep CV Analysis | ATSBoost</title>
        <meta name="description" content="Get a comprehensive analysis of your CV to understand how it measures against South African market expectations" />
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Deep CV Analysis</h1>
      </div>
      
      {!analysisReport || reportError ? (
        <Card>
          <CardHeader>
            <CardTitle>Premium Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Unlock Deep Analysis</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upgrade to Premium to access in-depth analysis of your CV with South African context,
                industry comparisons, and personalized recommendations.
              </p>
              <Button asChild>
                <Link href="/subscription">
                  Upgrade to Premium
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <span>Analysis for: {latestCV.fileName}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <p className="text-muted-foreground">
                    {analysisReport.detailedAnalysis?.summary || 
                      "Your CV has been analyzed with South African market context in mind."}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                  <ul className="space-y-2 pl-6 list-disc">
                    {analysisReport.detailedAnalysis?.keyFindings?.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    )) || (
                      <>
                        <li>Add B-BBEE status if applicable</li>
                        <li>Include NQF levels for qualifications</li>
                        <li>Add more quantifiable achievements</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Section Scores</h3>
                  <div className="space-y-4">
                    {Object.entries(analysisReport.detailedAnalysis?.sectionScores || {
                      professional: 70,
                      education: 75,
                      skills: 65,
                      achievements: 60
                    }).map(([section, score]) => (
                      <div key={section}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{section}</span>
                          <span className="text-sm font-medium">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="industry">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="industry">Industry Comparison</TabsTrigger>
              <TabsTrigger value="regional">Regional Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="industry">
              <Card>
                <CardHeader>
                  <CardTitle>Industry: {analysisReport.industryComparison?.industry || "South African Job Market"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Industry Average</div>
                        <div className="text-2xl font-bold">{analysisReport.industryComparison?.averageScore || 70}/100</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Your Score</div>
                        <div className="text-2xl font-bold text-primary">{analysisReport.industryComparison?.yourScore || 75}/100</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Key Differences</h3>
                      <ul className="space-y-2 pl-6 list-disc">
                        {analysisReport.industryComparison?.keyDifferences?.map((diff, index) => (
                          <li key={index}>{diff}</li>
                        )) || (
                          <>
                            <li>Industry average has more certifications</li>
                            <li>Your experience is aligned with market needs</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="regional">
              <Card>
                <CardHeader>
                  <CardTitle>South African Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommended Keywords</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {analysisReport.regionalRecommendations?.keywords?.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                            {keyword}
                          </span>
                        )) || (
                          <>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">B-BBEE</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">NQF Level</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommended Certifications</h3>
                      <ul className="space-y-2 pl-6 list-disc">
                        {analysisReport.regionalRecommendations?.certifications?.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        )) || (
                          <>
                            <li>SETA Accredited Training</li>
                            <li>Industry-specific certifications</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Market Trends</h3>
                      <p className="text-muted-foreground">
                        {analysisReport.regionalRecommendations?.marketTrends || 
                          "Including B-BBEE status and NQF levels is particularly important for the South African job market."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}