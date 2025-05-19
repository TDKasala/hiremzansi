import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import CVAnalysisResults from '@/components/CVAnalysisResults';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Printer, Share2, FileText, AlertCircle, CheckCircle, AlertTriangle, Info, LogIn, Upload, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import DownloadReportButton from '@/components/DownloadReportButton';

const ATSResultsPage: React.FC = () => {
  const { cvId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  // Get CV data
  const { data: cv, isLoading: cvLoading } = useQuery<{
    id: number;
    fileName: string;
    userId: number;
    content: string;
    mimeType: string;
  }>({
    queryKey: cvId ? [`/api/cv/${cvId}`] : ['/api/latest-cv'],
    retry: 1,
    enabled: true,
  });

  // Get ATS score data
  const { data: atsData, isLoading: atsLoading } = useQuery<{
    id: number;
    cvId: number;
    score: number;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    skills: string[];
    skillsScore: number;
    formatScore: number;
    contentScore: number;
    saContextScore: number;
    saKeywordsFound: string[];
  }>({
    queryKey: cvId ? [`/api/ats-score/${cvId}`] : [`/api/ats-score/${cv?.id}`],
    retry: 1,
    enabled: !!cv?.id,
  });
  
  const isLoading = cvLoading || atsLoading || authLoading;
  
  // Prepare analysis data for the CV
  const getAnalysisData = () => {
    if (!atsData) return null;
    
    // Calculate rating based on score
    const getRating = (score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Average";
      return "Needs Improvement";
    };
    
    // Calculate SA relevance based on SA context score
    const getSARelevance = (score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "High";
      if (score >= 40) return "Medium";
      return "Low";
    };
    
    return {
      score: atsData.score || 0,
      rating: getRating(atsData.score || 0),
      strengths: atsData.strengths || [],
      weaknesses: atsData.improvements || [],
      suggestions: atsData.suggestions || [],
      skills: atsData.skills || [],
      saScore: atsData.saContextScore || 0,
      saRelevance: getSARelevance(atsData.saContextScore || 0),
      saElements: atsData.saKeywordsFound || []
    };
  };
  
  // Generate analysis data from fetched data
  const analysisData = atsData ? {
    score: atsData.score || 0,
    rating: atsData.score >= 80 ? "Excellent" : 
            atsData.score >= 60 ? "Good" :
            atsData.score >= 40 ? "Average" : "Needs Improvement",
    strengths: atsData.strengths || [],
    weaknesses: atsData.improvements || [],
    suggestions: atsData.suggestions || [],
    skills: atsData.skills || [],
    saScore: atsData.saContextScore || 0,
    saRelevance: atsData.saContextScore >= 80 ? "Excellent" : 
                atsData.saContextScore >= 60 ? "High" :
                atsData.saContextScore >= 40 ? "Medium" : "Low",
    saElements: atsData.saKeywordsFound || []
  } : null;
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">ATS Analysis Results</h1>
          
          {/* Action buttons - PDF download available only for logged-in users */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            {user ? (
              // PDF Report button for logged-in users
              <DownloadReportButton 
                score={analysisData?.score || 0}
                strengths={analysisData?.strengths || []}
                improvements={analysisData?.weaknesses || []}
                suggestions={analysisData?.suggestions || []}
                saScore={analysisData?.saScore}
                saKeywords={analysisData?.saElements}
                userName={user.username}
                cvName={cv?.fileName}
                variant="outline"
                size="sm"
              />
            ) : (
              // Sign up prompt for non-logged-in users
              <Button variant="outline" size="sm" onClick={() => setLocation("/auth")}>
                <FileText className="h-4 w-4 mr-2" />
                Sign Up for PDF Report
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : !analysisData ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                No Analysis Data Available
              </CardTitle>
              <CardDescription>We couldn't find analysis data for this CV.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/upload")}>Upload a CV for Analysis</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Premium upsell for non-logged in users or free tier users */}
            {!user && (
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Get Full Access to Your ATS Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">
                      Sign up now to access your complete CV analysis, detailed recommendations, and PDF reports. Our ATS tools are optimized for the South African job market.
                    </p>
                    <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setLocation("/auth")}>
                      Sign Up Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Premium upsell for logged-in users */}
            {user && (
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Upgrade Your Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">
                      Upgrade to Premium for advanced insights, industry-specific recommendations, and unlimited CV scans with South African market focus.
                    </p>
                    <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setLocation("/pricing")}>
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Main results display */}
            <CVAnalysisResults {...analysisData} />
            
            {/* South African specific recommendations */}
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="pb-2 bg-blue-50">
                <CardTitle className="text-lg font-medium">South African Job Market Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Include your B-BBEE status:</strong> Many South African employers require this information for compliance and reporting.
                  </p>
                  <p className="text-sm">
                    <strong>Add NQF levels:</strong> Clearly state the NQF level of your qualifications to help employers understand your education level.
                  </p>
                  <p className="text-sm">
                    <strong>Show language skills:</strong> Mention your proficiency in local languages such as Afrikaans, isiZulu, isiXhosa, etc.
                  </p>
                  <p className="text-sm">
                    <strong>Reference local companies:</strong> If you've worked with well-known South African companies, make sure to highlight those experiences.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Non-logged in users see limited information */}
            {!user && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Get Your Full ATS Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Sign up for free to unlock your complete ATS report with detailed recommendations designed specifically for South African job seekers.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setLocation("/auth")}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      Sign Up Free
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/pricing")}
                    >
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-center mt-8">
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => setLocation("/upload")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Analyze Another CV
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ATSResultsPage;