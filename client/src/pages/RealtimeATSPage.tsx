import React from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart4, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import InteractiveResumePreview from "@/components/InteractiveResumePreview";

export default function RealtimeATSPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Real-Time ATS Scanner | Hire Mzansi - South African CV Optimization</title>
        <meta name="description" content="Check your CV against Applicant Tracking Systems in real-time and get instant feedback to improve your resume for the South African job market." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Real-Time ATS Scanner</h1>
                <Badge variant="outline" className="text-xs bg-primary text-white">
                  BETA
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Instantly see how your resume performs against Applicant Tracking Systems
              </p>
            </div>
          </div>
          
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <BarChart4 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">South African ATS Optimization</h3>
                      <p className="text-sm text-muted-foreground">
                        Our scanner is specifically calibrated for the South African job market, 
                        checking for B-BBEE status, NQF levels, and local context.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-Time Feedback</h3>
                      <p className="text-sm text-muted-foreground">
                        Get instant analysis of your resume's compatibility with ATS systems
                        used by 70% of South African employers.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="md:border-l md:pl-6 space-y-4">
                  <h3 className="font-medium">How It Works</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="flex-none flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary font-medium text-xs">1</div>
                      <span>Enter your resume content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex-none flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary font-medium text-xs">2</div>
                      <span>Add a job description (optional)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="flex-none flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary font-medium text-xs">3</div>
                      <span>Get your ATS score and improvement tips</span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {!user ? (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Please log in to use the real-time ATS scanner.</p>
                    <div className="flex gap-3 mt-2">
                      <Button asChild variant="default">
                        <Link href="/auth">Log In</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/auth?tab=register">Sign Up</Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Resume ATS Analyzer</CardTitle>
                <CardDescription>
                  Check how well your resume will perform with Applicant Tracking Systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InteractiveResumePreview />
              </CardContent>
            </Card>
          )}
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                  Upload Your CV
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Prefer to upload a file? Use our full CV analysis tool for a more comprehensive report.
              </CardContent>
              <div className="px-6 pb-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/upload">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload CV
                  </Link>
                </Button>
              </div>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart4 className="mr-2 h-5 w-5 text-primary" />
                  Full CV Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Get a comprehensive ATS report including industry-specific keyword recommendations.
              </CardContent>
              <div className="px-6 pb-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/cv/latest">
                    <BarChart4 className="mr-2 h-4 w-4" />
                    CV Analysis
                  </Link>
                </Button>
              </div>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Premium Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upgrade to premium for deep analysis reports, real-time CV editing, and job alerts.
              </CardContent>
              <div className="px-6 pb-4">
                <Button asChild className="w-full">
                  <Link href="/premium-tools">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Premium Features
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>South African Job Market Insights</CardTitle>
              <CardDescription>
                Understanding local context is crucial for ATS optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">B-BBEE Status Importance</h3>
                  <p className="text-sm text-muted-foreground">
                    Broad-Based Black Economic Empowerment (B-BBEE) status is a significant factor for 
                    employers in South Africa. Including your B-BBEE level can significantly increase 
                    your chances, especially with larger corporations and government entities.
                  </p>
                  
                  <h3 className="font-medium">NQF Levels</h3>
                  <p className="text-sm text-muted-foreground">
                    The National Qualifications Framework (NQF) is South Africa's system for measuring 
                    education levels. Always include NQF levels for your qualifications (e.g., "Bachelor's 
                    Degree in Marketing - NQF Level 7") to help employers understand your education level.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Provincial Context</h3>
                  <p className="text-sm text-muted-foreground">
                    South Africa's job markets differ by province. Specifying your location and willingness 
                    to relocate can be important, especially for opportunities in economic hubs like 
                    Gauteng, Western Cape, and KwaZulu-Natal.
                  </p>
                  
                  <h3 className="font-medium">Industry-Specific Regulations</h3>
                  <p className="text-sm text-muted-foreground">
                    Mentioning familiarity with South African regulations relevant to your industry 
                    (like POPIA for data handling, or National Credit Act for financial services) 
                    can make your resume stand out to ATS systems and human recruiters alike.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}