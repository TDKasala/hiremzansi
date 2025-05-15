import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { FileText, AlertCircle, ChevronLeft, Upload, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function LatestCVPage() {
  const { user, isLoading: authLoading } = useAuth();
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
  
  // Get ATS score if CV is available
  const {
    data: atsScore,
    isLoading: isLoadingScore,
    error: scoreError
  } = useQuery({
    queryKey: ['/api/ats-score', latestCV?.id],
    enabled: !!latestCV?.id,
  });

  // Loading state
  if (authLoading || isLoadingCV || isLoadingScore) {
    return (
      <div className="container max-w-4xl py-8">
        <Helmet>
          <title>Your Latest CV | ATSBoost</title>
          <meta name="description" content="View your most recent CV analysis and ATS score" />
        </Helmet>
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Your Latest CV</h1>
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

  // If not authenticated, redirect to auth page
  if (!authLoading && !user) {
    return <Redirect to="/auth" />;
  }

  // Error or no CV found
  if (cvError || !latestCV) {
    return (
      <div className="container max-w-4xl py-8">
        <Helmet>
          <title>Error Loading CV | ATSBoost</title>
          <meta name="description" content="Error loading your CV details" />
        </Helmet>
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Error Loading CV</h1>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">CV not found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                There was a problem loading the CV details
              </p>
              <Button asChild>
                <Link href="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Helmet>
        <title>{latestCV.fileName || 'Your CV'} | ATSBoost</title>
        <meta name="description" content="View your CV analysis and ATS score" />
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Your Latest CV</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{latestCV.fileName}</h2>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      Uploaded {latestCV.createdAt ? new Date(latestCV.createdAt).toLocaleDateString() : 'recently'}
                    </span>
                  </div>
                </div>
                <div className="text-center bg-primary text-white rounded-full w-16 h-16 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{atsScore?.score || 0}</span>
                  <span className="text-xs">Score</span>
                </div>
              </div>
              
              {/* CV Content Preview */}
              <div className="border rounded-md p-4 mb-6 bg-gray-50 max-h-60 overflow-y-auto">
                <div className="font-mono text-sm whitespace-pre-wrap">
                  {latestCV.content ? (
                    latestCV.content.substring(0, 500) + (latestCV.content.length > 500 ? '...' : '')
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      CV content preview not available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="w-full">
                  <Link href={`/cv/${latestCV.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Full Analysis
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New CV
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">ATS Score Breakdown</h3>
              
              {atsScore ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Format Score</span>
                      <span className="font-medium">{atsScore.formatScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${atsScore.formatScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Skills Match</span>
                      <span className="font-medium">{atsScore.skillsScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${atsScore.skillsScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Keyword Optimization</span>
                      <span className="font-medium">{atsScore.keywordScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${atsScore.keywordScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SA Context</span>
                      <span className="font-medium">{atsScore.contextScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${atsScore.contextScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  ATS score details not available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}