import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Briefcase, 
  GraduationCap, 
  FileCheck, 
  Flag 
} from "lucide-react";
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
          
          <Tabs defaultValue="essentials" className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="essentials">Key Elements</TabsTrigger>
              <TabsTrigger value="format">Format Tips</TabsTrigger>
              <TabsTrigger value="keywords">Industry Keywords</TabsTrigger>
              <TabsTrigger value="regulations">SA Regulations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="essentials">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Flag className="h-4 w-4 text-green-500 mr-2" />
                    B-BBEE Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Include your B-BBEE status clearly. Many South African employers prioritize 
                    this for employment equity requirements under the Employment Equity Act.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 flex items-center">
                    <GraduationCap className="h-4 w-4 text-green-500 mr-2" />
                    NQF Levels
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Specify NQF levels for your qualifications (e.g., "NQF Level 7" for a Bachelor's degree). 
                    This standardized system helps South African employers understand your education level.
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 text-green-500 mr-2" />
                    Local Experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Highlight experience relevant to South African industries and markets to 
                    demonstrate local knowledge. Mention specific provinces if applying to regional positions.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="format">
              <div className="space-y-4">
                <Alert variant="default" className="bg-white">
                  <FileCheck className="h-4 w-4" />
                  <AlertTitle>South African CV Format Tips</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                      <li>Keep your CV concise (2-3 pages max for most positions)</li>
                      <li>Include a professional summary at the top (5-6 lines)</li>
                      <li>List both hard skills (technical) and soft skills (communication)</li>
                      <li>Include South African ID number (first 6 digits only for privacy)</li>
                      <li>Mention your willingness to relocate if applicable</li>
                      <li>Include references with permission (common practice in South Africa)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            
            <TabsContent value="keywords">
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-medium mb-2">South African Industry Keywords</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Including these South African-specific terms can help your CV pass ATS filters:
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-primary">Business/Finance</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
                      <li>SARS compliance</li>
                      <li>JSE regulations</li>
                      <li>King IV Code</li>
                      <li>BBBEE certification</li>
                      <li>PFMA experience</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary">Education/Government</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
                      <li>SACE registration</li>
                      <li>SAQA accreditation</li>
                      <li>Public Service Act</li>
                      <li>SETA programs</li>
                      <li>Provincial experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="regulations">
              <Alert variant="default" className="bg-white">
                <Info className="h-4 w-4" />
                <AlertTitle>South African Employment Regulations</AlertTitle>
                <AlertDescription>
                  <p className="mt-2 mb-4 text-sm">
                    These regulations may be relevant to include in your CV based on your field:
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="border p-3 rounded-md">
                      <h4 className="font-medium">Professional Registrations</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
                        <li>ECSA (Engineering Council of SA)</li>
                        <li>HPCSA (Health Professions)</li>
                        <li>SAICA (Chartered Accountants)</li>
                        <li>SACSSP (Social Service Professionals)</li>
                      </ul>
                    </div>
                    
                    <div className="border p-3 rounded-md">
                      <h4 className="font-medium">Industry Certifications</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
                        <li>SHEQ certifications</li>
                        <li>Critical Skills Visa eligibility</li>
                        <li>Security clearance levels</li>
                        <li>SHE representative training</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/blog/south-african-cv-guide">Read Our Full SA CV Guide</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}