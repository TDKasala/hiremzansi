import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileSearch, 
  Plus,
  BarChart4, 
  ArrowRight, 
  ArrowDown,
  Edit
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface InteractiveResumePreviewProps {
  initialContent?: string;
  jobDescription?: string;
}

// Sample resumeTemplate for South African market
const defaultResumeTemplate = `DENIS KASALA
B-BBEE Level 2 | +27 82 123 4567 | denis.kasala@email.co.za | Johannesburg, Gauteng

PROFESSIONAL SUMMARY
Dedicated Marketing Manager with 6+ years of experience in digital marketing, campaign management, and market analysis. Strong record of implementing successful marketing strategies in the South African retail sector, improving brand visibility and generating leads.

SKILLS
• Digital Marketing • Content Creation • SEO/SEM
• Budget Management • Campaign Analytics • Team Leadership
• CRM Systems • Adobe Creative Suite • Market Research

PROFESSIONAL EXPERIENCE
MARKETING MANAGER
RetailSA Group, Johannesburg
January 2020 - Present
• Lead digital marketing campaigns resulting in 35% increase in online engagement and 22% growth in conversion rates
• Manage a team of 5 marketing specialists, providing mentorship and performance feedback
• Develop and implement strategic marketing plans aligned with business objectives
• Coordinate with sales team to ensure marketing initiatives support sales targets
• Administer annual marketing budget of R1.5 million, consistently coming in under budget while exceeding KPIs

DIGITAL MARKETING SPECIALIST
MediaWorks SA, Cape Town
March 2017 - December 2019
• Created and optimized content for various digital platforms including social media, email, and company website
• Analyzed campaign performance using Google Analytics and other tools to optimize ROI
• Collaborated with design team to create compelling marketing materials
• Implemented SEO strategies resulting in 45% increase in organic search traffic

EDUCATION
BACHELOR OF COMMERCE IN MARKETING (NQF LEVEL 7)
University of Cape Town
2014 - 2017

DIGITAL MARKETING CERTIFICATE (NQF LEVEL 5)
SETA Accredited Marketing Institute
2018

LANGUAGES
English (Fluent), Zulu (Native), Xhosa (Conversational)`;

export default function InteractiveResumePreview({ 
  initialContent = "", 
  jobDescription = ""
}: InteractiveResumePreviewProps) {
  const { toast } = useToast();
  const [resumeContent, setResumeContent] = useState(initialContent || defaultResumeTemplate);
  const [jobDesc, setJobDesc] = useState(jobDescription || "");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState("resume");
  const [atsScore, setAtsScore] = useState<{
    overall: number;
    skills: number;
    format: number;
    saContext: number;
    keywords: string[];
    foundKeywords: string[];
    bbbeeDetected: boolean;
    nqfDetected: boolean;
    suggestions: string[];
  }>({
    overall: 0,
    skills: 0,
    format: 0,
    saContext: 0,
    keywords: [],
    foundKeywords: [],
    bbbeeDetected: false,
    nqfDetected: false,
    suggestions: []
  });

  // Performs ATS analysis of the resume against the job description using the backend API
  const analyzeResume = async () => {
    if (!resumeContent.trim()) {
      toast({
        title: "Resume content is empty",
        description: "Please enter your resume content to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call the backend API for analysis
      const response = await apiRequest("POST", "/api/analyze-resume-text", {
        resumeContent,
        jobDescription: jobDesc
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }
      
      const result = await response.json();
      setAtsScore({
        overall: result.overall,
        skills: result.skills,
        format: result.format,
        saContext: result.saContext,
        keywords: result.keywords || [],
        foundKeywords: result.foundKeywords || [],
        bbbeeDetected: result.bbbeeDetected,
        nqfDetected: result.nqfDetected,
        suggestions: result.suggestions || []
      });
      
      setShowResults(true);
      
      // Automatically switch to results tab
      setActiveSection("results");
      
      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${result.overall}% on ATS compatibility.`,
      });
    } catch (error) {
      // Fallback to client-side simulation if API fails
      const result = simulateATSAnalysis(resumeContent, jobDesc);
      setAtsScore(result);
      setShowResults(true);
      
      toast({
        title: "Analysis completed (offline mode)",
        description: "Check your resume's ATS compatibility score and suggestions.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulates ATS analysis with South African context
  const simulateATSAnalysis = (resume: string, job: string) => {
    // Create a more realistic scoring algorithm focused on South African context
    const resumeLower = resume.toLowerCase();
    
    // Check for B-BBEE mention
    const bbbeeDetected = /b-bbee|bbbee|broad.?based black economic empowerment|bee/i.test(resumeLower);
    
    // Check for NQF level mention
    const nqfDetected = /nqf level|saqa|qualification framework/i.test(resumeLower);
    
    // South African specific keywords that would be important in resumes
    const saKeywords = [
      "b-bbee", "nqf", "seta", "saqa", "employment equity", 
      "johannesburg", "cape town", "durban", "pretoria", "gauteng", "western cape",
      "south africa", "south african", "popia", "national credit act", "protection of personal information"
    ];
    
    // Count South African keywords found
    const foundSaKeywords = saKeywords.filter(keyword => 
      resumeLower.includes(keyword.toLowerCase())
    );
    
    // Calculate SA context score based on found keywords and specific mentions
    const saContextScore = Math.min(100, 
      Math.round(
        (foundSaKeywords.length / 5) * 50 + // Up to 50 points for keywords
        (bbbeeDetected ? 25 : 0) +           // 25 points for B-BBEE
        (nqfDetected ? 25 : 0)               // 25 points for NQF
      )
    );
    
    // Format score - check for proper sections, bullet points, etc.
    const hasProperSections = /education|experience|skills|qualifications/i.test(resumeLower);
    const hasBulletPoints = /•|-|\*/i.test(resume);
    const hasDates = /20\d{2}|19\d{2}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(resumeLower);
    
    const formatScore = Math.round(
      (hasProperSections ? 40 : 0) +
      (hasBulletPoints ? 30 : 0) +
      (hasDates ? 30 : 0)
    );
    
    // Skills match with job description if available
    let skillsScore = 65;
    let jobMatchScore = 0;
    let extractedJobKeywords: string[] = [];
    
    if (job) {
      // Extract keywords from job description
      const commonWords = ["and", "the", "a", "an", "is", "are", "in", "to", "for", "of", "with", "on"];
      extractedJobKeywords = job.toLowerCase()
        .replace(/[^\w\s]/gi, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => 
          word.length > 3 && // Only words longer than 3 chars
          !commonWords.includes(word) // Exclude common words
        )
        .slice(0, 15); // Get top 15 keywords
      
      // Count matches between resume and job keywords
      const matchCount = extractedJobKeywords.filter(keyword => 
        resumeLower.includes(keyword)
      ).length;
      
      // Calculate job match score (max 20 points)
      jobMatchScore = Math.min(20, Math.round((matchCount / Math.max(1, extractedJobKeywords.length)) * 20));
      
      // Adjust skills score based on job match
      skillsScore = Math.round(40 + (jobMatchScore * 2));
    }
    
    // Overall weighted score
    const overallScore = Math.round(
      (skillsScore * 0.4) +
      (formatScore * 0.3) +
      (saContextScore * 0.3)
    );
    
    // Generate improvement suggestions
    const suggestions = [];
    
    if (!bbbeeDetected) {
      suggestions.push("Add your B-BBEE status to increase your chances with South African employers");
    }
    
    if (!nqfDetected) {
      suggestions.push("Include NQF levels for your qualifications to align with South African standards");
    }
    
    if (foundSaKeywords.length < 3) {
      suggestions.push("Add more South African context (locations, regulatory frameworks, etc.)");
    }
    
    if (!hasProperSections) {
      suggestions.push("Structure your resume with clear sections (Education, Experience, Skills)");
    }
    
    if (!hasBulletPoints) {
      suggestions.push("Use bullet points to make achievements and responsibilities more scannable");
    }
    
    if (skillsScore < 70) {
      suggestions.push("Enhance skills section to better match typical job requirements");
    }
    
    // Job description keywords - use the previously extracted ones or fallback
    const commonJobKeywords = job ? 
      (extractedJobKeywords.length > 0 ? extractedJobKeywords : 
       ["communication", "teamwork", "leadership", "problem-solving", "analytical", "technical", "project management"]) :
      ["excel", "communication", "management", "reporting", "analysis", "strategic", "budget"];
    
    // Find keywords that exist in the resume
    const foundKeywords = commonJobKeywords.filter(keyword => 
      resumeLower.includes(keyword.toLowerCase())
    );
    
    return {
      overall: overallScore,
      skills: skillsScore,
      format: formatScore,
      saContext: saContextScore,
      jobMatch: jobMatchScore,
      keywords: commonJobKeywords,
      foundKeywords,
      bbbeeDetected,
      nqfDetected,
      suggestions
    };
  };

  // Reset the analysis and start over
  const resetAnalysis = () => {
    setShowResults(false);
    setAtsScore({
      overall: 0,
      skills: 0,
      format: 0,
      saContext: 0,
      keywords: [],
      foundKeywords: [],
      bbbeeDetected: false,
      nqfDetected: false,
      suggestions: []
    });
  };

  return (
    <div className="w-full">
      <Tabs 
        defaultValue="resume" 
        value={activeSection}
        onValueChange={setActiveSection}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume">Resume Content</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResults}>ATS Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resume" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Your Resume
                </CardTitle>
                <CardDescription>
                  Enter your resume content for real-time ATS analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Paste your resume content here..."
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setResumeContent(defaultResumeTemplate)}
                >
                  Use Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setResumeContent("")}
                >
                  Clear
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSearch className="mr-2 h-5 w-5 text-primary" />
                  Job Description (Optional)
                </CardTitle>
                <CardDescription>
                  Add a job description for more targeted analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm resize-none"
                  placeholder="Paste the job description here for tailored analysis..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={analyzeResume} 
                  disabled={isAnalyzing || !resumeContent.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart4 className="mr-2 h-4 w-4" />
                      Analyze ATS Compatibility
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6 mt-4">
          {showResults && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-xl font-semibold">ATS Analysis Results</h2>
                <Button variant="outline" onClick={resetAnalysis}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Resume
                </Button>
              </div>
              
              {/* Overall Score */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold mb-2">Overall ATS Score</h3>
                      <p className="text-muted-foreground">
                        How well your resume performs with Applicant Tracking Systems
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex items-center justify-center 
                        h-24 w-24 rounded-full border-4
                        ${atsScore.overall >= 80 ? 'border-green-500 text-green-600' : 
                           atsScore.overall >= 60 ? 'border-yellow-500 text-yellow-600' : 
                           'border-red-500 text-red-600'}
                      `}>
                        <span className="text-3xl font-bold">{atsScore.overall}%</span>
                      </div>
                      <div className="mt-2 text-sm font-medium">
                        {atsScore.overall >= 80 ? 'Excellent' : 
                         atsScore.overall >= 60 ? 'Good' : 
                         'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Score Breakdown */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart4 className="mr-2 h-4 w-4 text-primary" />
                      Skills Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className="font-medium">{atsScore.skills}%</span>
                      </div>
                      <Progress value={atsScore.skills} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        How well your skills align with job requirements
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      Format Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className="font-medium">{atsScore.format}%</span>
                      </div>
                      <Progress value={atsScore.format} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        How well your resume is structured for ATS scanning
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      SA Context Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className="font-medium">{atsScore.saContext}%</span>
                      </div>
                      <Progress value={atsScore.saContext} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        South African market relevance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* South African Specific Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>South African Context Analysis</CardTitle>
                  <CardDescription>
                    How well your resume is optimized for the South African job market
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">B-BBEE Status</h3>
                      <div className={`flex items-center p-3 rounded-md ${atsScore.bbbeeDetected ? 'bg-green-50' : 'bg-amber-50'}`}>
                        {atsScore.bbbeeDetected ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">Detected</p>
                              <p className="text-xs text-green-700">B-BBEE information found in your resume</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Not Detected</p>
                              <p className="text-xs text-amber-700">Consider adding your B-BBEE status</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">NQF Level Information</h3>
                      <div className={`flex items-center p-3 rounded-md ${atsScore.nqfDetected ? 'bg-green-50' : 'bg-amber-50'}`}>
                        {atsScore.nqfDetected ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">Detected</p>
                              <p className="text-xs text-green-700">NQF level information found in your resume</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Not Detected</p>
                              <p className="text-xs text-amber-700">Consider adding NQF levels for qualifications</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>
                    {jobDesc ? 'Keywords from the job description found in your resume' : 'Common keywords found in your resume'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <h3 className="text-sm font-medium">Matched Keywords</h3>
                        <span className="text-sm text-muted-foreground">
                          {atsScore.foundKeywords.length} of {atsScore.keywords.length} found
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {atsScore.keywords.map((keyword, index) => {
                          const isFound = atsScore.foundKeywords.includes(keyword);
                          return (
                            <div 
                              key={index} 
                              className={`px-3 py-1 rounded-full text-xs font-medium
                                ${isFound ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              `}
                            >
                              {isFound && <CheckCircle className="inline h-3 w-3 mr-1" />}
                              {keyword}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Improvement Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Improvements</CardTitle>
                  <CardDescription>
                    Apply these changes to improve your resume's ATS compatibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {atsScore.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1 mr-2" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                    {atsScore.suggestions.length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Great job! Your resume is well-optimized.</p>
                      </div>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setActiveSection("resume")}>
                    Return to Resume Editor
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
