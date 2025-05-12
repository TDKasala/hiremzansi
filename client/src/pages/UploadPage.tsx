import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import FileUpload from "@/components/FileUpload";
import { CV, ATSScore } from "@shared/schema";

export default function UploadPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [analysisResult, setAnalysisResult] = useState<{
    cv: CV;
    score: number;
  } | null>(null);

  // If you want to fetch existing CVs
  const { data: cvs, isLoading: isCVsLoading } = useQuery<CV[]>({
    queryKey: ["/api/cvs"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user, // Only run if user is logged in
  });

  const handleUploadComplete = (data: any) => {
    setAnalysisResult({
      cv: data.cv,
      score: data.score
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to upload and analyze CVs.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-8">
          <Button asChild>
            <Link href="/auth">Login or Register</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Upload and Analyze Your CV | ATSBoost</title>
        <meta name="description" content="Upload your CV to get AI-powered analysis and improve your chances of getting past ATS systems used by South African employers." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">CV Analysis Tool</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your CV to see how it performs against Applicant Tracking Systems (ATS)
            used by South African employers. Get tailored recommendations to improve your CV.
          </p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your CV</CardTitle>
              <CardDescription>
                Upload your CV in PDF or DOCX format for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUploadComplete={handleUploadComplete}
                title="Upload your CV"
                description="Drag and drop your CV here or click to browse"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>ATS Analysis Results</CardTitle>
              <CardDescription>
                See how your CV performs against ATS systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-medium">{analysisResult.cv.fileName}</h3>
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center justify-center p-1 rounded-full bg-gray-100 w-32 h-32">
                        <div 
                          className={`rounded-full w-28 h-28 flex items-center justify-center font-bold text-2xl ${
                            analysisResult.score >= 80 
                              ? 'bg-green-100 text-green-800' 
                              : analysisResult.score >= 60 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {analysisResult.score}%
                        </div>
                      </div>
                      
                      <p className="mt-2 font-medium">
                        {analysisResult.score >= 80 
                          ? 'Excellent' 
                          : analysisResult.score >= 60 
                          ? 'Good' 
                          : 'Needs Improvement'}
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Next Steps</AlertTitle>
                        <AlertDescription>
                          View detailed analysis and South African specific recommendations for your CV.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="mt-4 flex justify-center">
                        <Button onClick={() => navigate(`/cv/${analysisResult.cv.id}`)}>
                          View Full Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <p className="text-muted-foreground">
                    Upload your CV to see analysis results here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent CVs section */}
        {user && cvs && cvs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Your Recent CVs</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cvs.slice(0, 3).map(cv => (
                <Card key={cv.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{cv.title || cv.fileName}</CardTitle>
                    <CardDescription>
                      Uploaded on {typeof cv.createdAt === 'string' ? new Date(cv.createdAt).toLocaleDateString() : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/cv/${cv.id}`}>View Analysis</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* South African job market tips */}
        <div className="mt-12 bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">South African CV Best Practices</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                B-BBEE Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Include your B-BBEE status clearly. Many South African employers prioritize 
                this for employment equity.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                NQF Levels
              </h3>
              <p className="text-sm text-muted-foreground">
                Specify NQF levels for your qualifications. This standardized system helps 
                employers understand your education level.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Local Experience
              </h3>
              <p className="text-sm text-muted-foreground">
                Highlight experience relevant to South African industries and markets to 
                demonstrate local knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}