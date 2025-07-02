import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import { ConsentDialog } from "@/components/ConsentDialog";
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Briefcase, 
  GraduationCap, 
  FileCheck, 
  Flag,
  Upload,
  Send,
  Smartphone,
  Gift,
  ListChecks,
  FileText,
  Book,
  FileQuestion,
  LayoutGrid,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { WhatsAppUpload } from "@/components/WhatsAppUpload";
import SimpleUploadForm from "@/components/SimpleUploadForm";
import { CV, ATSScore } from "@shared/schema";

export default function UploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [jobDescription, setJobDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isWhatsappUploading, setIsWhatsappUploading] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [uploadedCvId, setUploadedCvId] = useState<number | null>(null);
  const [uploadedScore, setUploadedScore] = useState<number>(0);
  
  // Define guest analysis interface
  interface GuestAnalysis {
    limitedStrengths?: string[];
    limitedImprovements?: string[];
    upgradeSuggestion?: string;
  }
  
  // Define upload result interface with guest support
  interface AnalysisResult {
    cv: CV;
    score: number;
    isGuest?: boolean;
    guestAnalysis?: GuestAnalysis;
    analysis?: {
      strengths: string[];
      improvements: string[];
      suggestions: string[];
    };
  }
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // If you want to fetch existing CVs
  const { data: cvs, isLoading: isCVsLoading } = useQuery<CV[]>({
    queryKey: ["/api/cvs"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user, // Only run if user is logged in
  });

  const handleUploadComplete = (data: any) => {
    console.log("handleUploadComplete called with data:", data);
    
    // Create analysis result with support for guest mode
    const result: AnalysisResult = {
      cv: data.cv,
      score: data.score,
    };
    
    // Add guest properties if present
    if (data.isGuest) {
      result.isGuest = true;
      result.guestAnalysis = {
        limitedStrengths: data.guestAnalysis?.limitedStrengths || [],
        limitedImprovements: data.guestAnalysis?.limitedImprovements || [],
        upgradeSuggestion: data.guestAnalysis?.upgradeSuggestion || "Create an account for more features."
      };
    }
    
    // Add full analysis if present
    if (data.analysis) {
      result.analysis = {
        strengths: data.analysis.strengths || [],
        improvements: data.analysis.improvements || [],
        suggestions: data.analysis.suggestions || []
      };
    }
    
    console.log("Setting analysisResult to:", result);
    setAnalysisResult(result);
    
    // Don't show consent dialog again since analysis is complete
    // setUploadedCvId(data.cv.id);
    // setUploadedScore(data.score);
    // setShowConsentDialog(true);
  };
  
  // Handle consent dialog confirm action
  const handleConsentConfirm = () => {
    if (uploadedCvId) {
      // Close the dialog and redirect to the analysis page
      setShowConsentDialog(false);
      navigate(`/cv/${uploadedCvId}`);
    }
  };
  
  // Handle consent dialog close action
  const handleConsentClose = () => {
    setShowConsentDialog(false);
  };
  
  const handleWhatsappUpload = async () => {
    if (!whatsappNumber) return;
    
    try {
      setIsWhatsappUploading(true);
      
      // Simulate sending a WhatsApp message with upload instructions
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show a success message
      alert(`Instructions sent to ${whatsappNumber}. Please follow the steps in the WhatsApp message to upload your CV.`);
      
      setIsWhatsappUploading(false);
    } catch (error) {
      setIsWhatsappUploading(false);
      console.error("WhatsApp upload error:", error);
    }
  };

  // For non-logged-in users, we'll still show the upload component
  // but with a limited features message

  return (
    <>
      {/* Consent Dialog */}
      <ConsentDialog 
        isOpen={showConsentDialog}
        onClose={handleConsentClose}
        onConfirm={handleConsentConfirm}
        cvId={uploadedCvId || 0}
        score={uploadedScore}
      />
      
      <Helmet>
        <title>Upload and Analyze Your CV | Hire Mzansi</title>
        <meta name="description" content="Upload your CV to get AI-powered analysis and improve your chances of getting past ATS systems used by South African employers." />
      </Helmet>
      
      <div className="container mx-auto py-5 sm:py-8 max-w-4xl">
        {!user ? (
          <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-1">Guest Upload Mode</h3>
                <p className="text-sm text-muted-foreground">
                  You're using Hire Mzansi without an account. You can upload 1 CV for a basic analysis, 
                  but creating a free account gives you access to:
                </p>
                <ul className="mt-2 text-sm grid gap-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Multiple CV uploads and comparison</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>Detailed ATS scoring and recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    <span>South African B-BBEE and NQF optimization</span>
                  </li>
                </ul>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/auth">Create Free Account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <MotivationalBanner
            location="upload"
            cvCount={cvs?.length || 0}
          />
        )}
        <header className="mb-5 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">CV Analysis Tool</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Upload your CV to see how it performs against ATS systems
            used by South African employers.
          </p>
        </header>
        
        <div className="grid gap-4 sm:gap-6 md:gap-8">
          {/* Job Description Input - Required for CV analysis */}
          <Card className="border-primary/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Job Description
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Add the job description for targeted CV analysis (required)
              </CardDescription>
            </CardHeader>
            <div className="p-4 sm:p-6">
              <Textarea
                placeholder="Paste the job description here to get tailored ATS scoring and recommendations"
                className="min-h-[120px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Adding a job description helps us analyze your CV specifically for the position you're applying for
              </p>
            </div>
          </Card>
          
          {/* Upload Methods - CV File Upload and WhatsApp */}
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="file" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
                <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                WhatsApp Upload
              </TabsTrigger>
            </TabsList>
            
            {/* File Upload Tab */}
            <TabsContent value="file">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Upload Your CV</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Upload your CV in PDF or DOCX format for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <SimpleUploadForm 
                    onUploadComplete={handleUploadComplete}
                    withJobDescription={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* WhatsApp Upload Tab */}
            <TabsContent value="whatsapp">
              <WhatsAppUpload />
            </TabsContent>
          </Tabs>
          
          {/* ATS Analysis Results */}
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
                      {analysisResult.isGuest ? (
                        <>
                          <Alert variant="default" className="mb-4 bg-primary/10 border-primary/20">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Guest Analysis</AlertTitle>
                            <AlertDescription>
                              <div className="space-y-3 pt-2">
                                {analysisResult.guestAnalysis && analysisResult.guestAnalysis.limitedStrengths && analysisResult.guestAnalysis.limitedStrengths.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm flex items-center">
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                                      Strengths:
                                    </h4>
                                    <ul className="mt-1 pl-6 text-sm list-disc">
                                      {analysisResult.guestAnalysis.limitedStrengths.map((strength: string, i: number) => (
                                        <li key={i}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {analysisResult.guestAnalysis && analysisResult.guestAnalysis.limitedImprovements && analysisResult.guestAnalysis.limitedImprovements.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm flex items-center">
                                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5" />
                                      Improvement Area:
                                    </h4>
                                    <ul className="mt-1 pl-6 text-sm list-disc">
                                      {analysisResult.guestAnalysis.limitedImprovements.map((improvement: string, i: number) => (
                                        <li key={i}>{improvement}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="pt-2">
                                  <p className="text-sm text-muted-foreground">{analysisResult.guestAnalysis?.upgradeSuggestion}</p>
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex justify-center">
                            <Button asChild>
                              <Link href="/auth">Create Free Account</Link>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Simple ATS Results Display */}
                          <div className="space-y-4">
                            {/* Score Display */}
                            <div className="text-center p-6 bg-primary/5 rounded-lg">
                              <h3 className="text-lg font-semibold mb-2">Your ATS Score</h3>
                              <div className="text-5xl font-bold text-primary mb-2">
                                {analysisResult.score || 0}%
                              </div>
                              {/* Debug info */}
                              <div className="text-xs text-gray-400 mt-1">
                                Debug: Score={analysisResult.score}, Analysis present={!!analysisResult.analysis}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {analysisResult.score >= 80 ? 'Excellent' : 
                                 analysisResult.score >= 60 ? 'Good' : 
                                 analysisResult.score >= 40 ? 'Fair' : 'Needs Improvement'}
                              </p>
                            </div>

                            {/* Key Findings */}
                            {analysisResult.analysis && (
                              <div className="space-y-3">
                                {/* Strengths */}
                                {analysisResult.analysis.strengths && analysisResult.analysis.strengths.length > 0 && (
                                  <div>
                                    <h4 className="font-medium flex items-center text-green-700 mb-2">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      What's Working Well
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {analysisResult.analysis.strengths.slice(0, 3).map((strength: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                          <span className="text-green-500 mr-2">•</span>
                                          <span>{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Areas to Improve */}
                                {analysisResult.analysis.improvements && analysisResult.analysis.improvements.length > 0 && (
                                  <div>
                                    <h4 className="font-medium flex items-center text-amber-700 mb-2">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Areas to Improve
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {analysisResult.analysis.improvements.slice(0, 3).map((improvement: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                          <span className="text-amber-500 mr-2">•</span>
                                          <span>{improvement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Quick Tips */}
                                {analysisResult.analysis.suggestions && analysisResult.analysis.suggestions.length > 0 && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Quick Tips</h4>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                      {analysisResult.analysis.suggestions.slice(0, 2).map((tip: string, i: number) => (
                                        <li key={i}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                              <Button onClick={() => navigate(`/cv/${analysisResult.cv.id}`)} variant="outline" className="flex-1">
                                View Detailed Report
                              </Button>
                              <Button 
                                onClick={() => {
                                  setAnalysisResult(null);
                                  setUploadedCvId(null);
                                  setJobDescription('');
                                }}
                                className="flex-1"
                              >
                                Analyze Another CV
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
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
        
        {/* Link to Job Seeker Tools Page */}
        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                Need more job search tools?
              </CardTitle>
              <CardDescription>
                Access our complete collection of South African job seeker resources
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>From CV templates to interview guides, our job seeker tools page has everything you need to succeed in the South African job market.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/job-seeker-tools">Browse Job Seeker Tools</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* South African job market tips */}
        <div className="mt-12 bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">South African CV Best Practices</h2>
          
          <Tabs defaultValue="essentials" className="mb-6">
            <div className="flex justify-center mb-4">
              <TabsList>
                <TabsTrigger value="essentials">Key Elements</TabsTrigger>
                <TabsTrigger value="format">Format Tips</TabsTrigger>
                <TabsTrigger value="keywords">Industry Keywords</TabsTrigger>
                <TabsTrigger value="regulations">SA Regulations</TabsTrigger>
              </TabsList>
            </div>
            
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