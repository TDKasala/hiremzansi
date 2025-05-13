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
  Users,
  ListChecks,
  FileText,
  Book,
  FileQuestion,
  LayoutGrid
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import FileUpload from "@/components/FileUpload";
import { CV, ATSScore } from "@shared/schema";

export default function UploadPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [jobDescription, setJobDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isWhatsappUploading, setIsWhatsappUploading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
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
        
        <div className="grid gap-8">
          {/* Job Description Input - Required for CV analysis */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
              <CardDescription>
                Add the job description for targeted CV analysis (required)
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          
          {/* Upload Methods - CV File Upload and WhatsApp */}
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center justify-center gap-2">
                <Smartphone className="h-4 w-4" />
                WhatsApp Upload
              </TabsTrigger>
            </TabsList>
            
            {/* File Upload Tab */}
            <TabsContent value="file">
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
                    withJobDescription={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* WhatsApp Upload Tab */}
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle>Send via WhatsApp</CardTitle>
                  <CardDescription>
                    Upload your CV through WhatsApp for convenience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We'll send instructions to your WhatsApp number on how to upload your CV directly from your phone
                    </p>
                    
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter your WhatsApp number"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        type="tel"
                      />
                      <Button 
                        onClick={handleWhatsappUpload} 
                        disabled={!whatsappNumber || isWhatsappUploading}
                        className="whitespace-nowrap"
                      >
                        {isWhatsappUploading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Instructions
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Example: +27823456789 (include country code)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Referral Program */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 text-primary mr-2" />
                Refer Friends & Earn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <p className="text-sm mb-2">
                    Share ATSBoost with friends and get <span className="font-semibold">free CV scans</span> after 3 referrals
                  </p>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Your referral code (optional)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">3 referrals = 1 free scan</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                      <Alert variant="default">
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
        
        {/* Job Seeker Tools Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-primary" />
            Job Seeker Tools
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* CV Templates */}
            <Card className="hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LayoutGrid className="h-5 w-5 mr-2 text-primary" />
                  CV Templates
                </CardTitle>
                <CardDescription>
                  South African focused resume templates
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Access professional CV templates optimized for the South African job market and ATS systems.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
                  <Link href="/tools/cv-templates">Browse Templates</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* ATS Keywords Tool */}
            <Card className="hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  ATS Keywords Tool
                </CardTitle>
                <CardDescription>
                  Industry-specific keywords for South Africa
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Generate tailored keywords for your industry that will help your CV pass ATS filters in South Africa.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
                  <Link href="/tools/ats-keywords">Find Keywords</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Cover Letter Generator */}
            <Card className="hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Cover Letter Ideas
                </CardTitle>
                <CardDescription>
                  South African cover letter guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Get industry-specific cover letter templates and prompts tailored for South African employers.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
                  <Link href="/tools/cover-letter">Create Cover Letter</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Premium Features (Interview Guide) */}
          <div className="mt-8 border border-primary/30 rounded-lg p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-lg">Premium Tools</h3>
              </div>
              <Button size="sm" variant="default">Upgrade</Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-background p-3 rounded border flex flex-col">
                <h4 className="font-medium flex items-center">
                  <ListChecks className="h-4 w-4 text-primary mr-2" />
                  CV Checklist
                </h4>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Complete South African specific CV checklist with 50+ points
                </p>
                <Button variant="outline" size="sm" className="mt-auto" disabled>
                  Premium Feature
                </Button>
              </div>
              
              <div className="bg-background p-3 rounded border flex flex-col">
                <h4 className="font-medium flex items-center">
                  <FileQuestion className="h-4 w-4 text-primary mr-2" />
                  Job Fit Quiz
                </h4>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  10-question assessment to match your skills to job requirements
                </p>
                <Button variant="outline" size="sm" className="mt-auto" disabled>
                  Premium Feature
                </Button>
              </div>
              
              <div className="bg-background p-3 rounded border flex flex-col">
                <h4 className="font-medium flex items-center">
                  <Book className="h-4 w-4 text-primary mr-2" />
                  Interview Guide
                </h4>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  South African interview preparation with common questions
                </p>
                <Button variant="outline" size="sm" className="mt-auto" disabled>
                  Premium Feature
                </Button>
              </div>
            </div>
          </div>
        </div>
        
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