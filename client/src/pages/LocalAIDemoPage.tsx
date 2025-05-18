import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Code, 
  Binary,
  Lightbulb,
  Flag,
  Award,
  Clipboard 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Sample CV for quick testing
const SAMPLE_CV = `Jane Ndlovu
Johannesburg, Gauteng | jane.ndlovu@email.com | +27 71 234 5678

PROFESSIONAL SUMMARY
Dedicated Marketing Specialist with 5+ years of experience in digital marketing and campaign management in the South African market. Strong track record of developing successful marketing strategies that increased brand awareness and lead generation.

SKILLS
• Digital Marketing
• Social Media Management
• Content Creation
• SEO & SEM
• Google Analytics
• Marketing Automation
• Project Management
• Team Leadership
• Budget Management
• Microsoft Office Suite

EXPERIENCE
Marketing Manager
ABC Company, Johannesburg
January 2020 - Present
• Led a team of 4 marketing specialists in planning and executing integrated marketing campaigns
• Increased social media engagement by 45% through strategic content initiatives
• Managed a monthly marketing budget of R250,000
• Collaborated with sales team to generate 30% more qualified leads year-over-year
• Implemented marketing automation solutions that reduced campaign launch time by 35%

Digital Marketing Specialist
XYZ Corporation, Cape Town
March 2017 - December 2019
• Created and optimized content for company website and social media platforms
• Achieved 25% improvement in website traffic through SEO strategies
• Managed Google Ads campaigns with a monthly budget of R100,000
• Produced monthly performance reports for executive team
• Coordinated with external agencies for creative content development

EDUCATION
Bachelor of Commerce in Marketing
University of Cape Town
2013 - 2016
NQF Level 7

Digital Marketing Certificate
Red & Yellow Creative School of Business
2017
NQF Level 5

ADDITIONAL INFORMATION
• Fluent in English, Zulu, and Afrikaans
• B-BBEE Status: Level 2 Contributor
• Valid driver's license
• South African citizen`;

// Sample CV without SA context for comparison
const SAMPLE_CV_NO_SA = `Jane Smith
123 Main Street | janesmith@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Dedicated Marketing Specialist with 5+ years of experience in digital marketing and campaign management. Strong track record of developing successful marketing strategies that increased brand awareness and lead generation.

SKILLS
• Digital Marketing
• Social Media Management
• Content Creation
• SEO & SEM
• Google Analytics
• Marketing Automation
• Project Management
• Team Leadership
• Budget Management
• Microsoft Office Suite

EXPERIENCE
Marketing Manager
ABC Company
January 2020 - Present
• Led a team of 4 marketing specialists in planning and executing integrated marketing campaigns
• Increased social media engagement by 45% through strategic content initiatives
• Managed a monthly marketing budget of $25,000
• Collaborated with sales team to generate 30% more qualified leads year-over-year
• Implemented marketing automation solutions that reduced campaign launch time by 35%

Digital Marketing Specialist
XYZ Corporation
March 2017 - December 2019
• Created and optimized content for company website and social media platforms
• Achieved 25% improvement in website traffic through SEO strategies
• Managed Google Ads campaigns with a monthly budget of $10,000
• Produced monthly performance reports for executive team
• Coordinated with external agencies for creative content development

EDUCATION
Bachelor of Commerce in Marketing
State University
2013 - 2016

Digital Marketing Certificate
Professional Institute
2017

ADDITIONAL INFORMATION
• Fluent in English and Spanish
• Valid driver's license`;

interface Analysis {
  overall_score: number;
  rating: string;
  format_score: number;
  skill_score: number;
  sa_score: number;
  sa_relevance: string;
  strengths: string[];
  improvements: string[];
  format_feedback: string[];
  sections_detected: string[];
  skills_identified: string[];
  sa_elements_detected: string[];
  [key: string]: any;
}

export default function LocalAIDemoPage() {
  const [cvText, setCvText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [diffAnalysis, setDiffAnalysis] = useState<Analysis | null>(null);
  
  // Set sample CV text
  const setSampleCV = (withSAContext: boolean) => {
    setCvText(withSAContext ? SAMPLE_CV : SAMPLE_CV_NO_SA);
  };
  
  // Analyze the CV text using our local AI service
  const analyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter CV text to analyze');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest('POST', '/api/analyze-resume-text', {
        resumeContent: cvText
      });
      
      if (!res.ok) {
        throw new Error('Failed to analyze CV');
      }
      
      const data = await res.json();
      setAnalysis(data);
      setActiveTab('overview');
    } catch (err) {
      setError('Error analyzing CV. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run a comparison between SA and non-SA versions
  const compareVariants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Analyze SA version
      const resSA = await apiRequest('POST', '/api/analyze-resume-text', { 
        resumeContent: SAMPLE_CV 
      });
      
      // Analyze non-SA version
      const resNoSA = await apiRequest('POST', '/api/analyze-resume-text', { 
        resumeContent: SAMPLE_CV_NO_SA 
      });
      
      if (!resSA.ok || !resNoSA.ok) {
        throw new Error('Failed to analyze CVs for comparison');
      }
      
      const sampleWithSA = await resSA.json();
      const sampleWithoutSA = await resNoSA.json();
      
      setAnalysis(sampleWithSA);
      setDiffAnalysis(sampleWithoutSA);
      setShowDiff(true);
      setActiveTab('overview');
    } catch (err) {
      setError('Error running comparison. Please try again.');
      console.error('Comparison error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };
  
  // Get background color class based on score
  const getScoreBgClass = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-200";
    if (score >= 60) return "bg-amber-100 border-amber-200";
    if (score >= 40) return "bg-orange-100 border-orange-200";
    return "bg-red-100 border-red-200";
  };
  
  // Get SA relevance color
  const getSARelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'High': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Reset the analysis
  const resetAnalysis = () => {
    setAnalysis(null);
    setDiffAnalysis(null);
    setShowDiff(false);
    setCvText('');
    setError(null);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Local AI Demo: South African CV Analysis</h1>
        <p className="text-gray-600 mt-1">
          Test our AI CV analysis system that runs entirely locally - no external API keys required!
        </p>
      </div>
      
      {/* CV Input Area */}
      {!analysis && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Enter CV Text to Analyze</CardTitle>
            <CardDescription>
              Paste a CV text or use one of our sample CVs to see how our local AI evaluates it for South African job market relevance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste CV text here..."
              className="min-h-[300px] font-mono text-sm"
            />
            
            {error && (
              <div className="mt-2 text-red-600 text-sm">{error}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSampleCV(true)}
                className="text-xs sm:text-sm"
              >
                <Flag className="h-4 w-4 mr-1" />
                Use SA Sample
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSampleCV(false)}
                className="text-xs sm:text-sm"
              >
                <Globe className="h-4 w-4 mr-1" />
                Use Generic Sample
              </Button>
            </div>
            <div className="space-x-2 mt-2 sm:mt-0 sm:ml-auto">
              <Button 
                onClick={analyzeCV} 
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm"
              >
                {isLoading ? 'Analyzing...' : 'Analyze CV'}
              </Button>
              <Button 
                onClick={compareVariants} 
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm"
              >
                Compare Variants
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">CV Analysis Results</h2>
            <Button variant="outline" onClick={resetAnalysis}>
              Analyze Another CV
            </Button>
          </div>
          
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Score */}
            <Card className={`${getScoreBgClass(analysis.overall_score)}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Overall Score</h3>
                    <p className="text-sm text-gray-600">ATS compatibility</p>
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColorClass(analysis.overall_score)}`}>
                    {analysis.overall_score}%
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className={getScoreBgClass(analysis.overall_score)}>
                    {analysis.rating}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Format Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Format Score</h3>
                    <p className="text-sm text-gray-600">Structure & readability</p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColorClass(analysis.format_score)}`}>
                    {analysis.format_score}%
                  </div>
                </div>
                <div className="mt-3">
                  <Progress 
                    value={analysis.format_score} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Skills Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Skills Score</h3>
                    <p className="text-sm text-gray-600">Keyword relevance</p>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColorClass(analysis.skill_score)}`}>
                    {analysis.skill_score}%
                  </div>
                </div>
                <div className="mt-3">
                  <Progress 
                    value={analysis.skill_score} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* South African Context Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-amber-200">
              <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-white">
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2 text-amber-500" />
                  South African Relevance
                </CardTitle>
                <CardDescription>
                  Analysis of CV's contextual relevance to the South African job market
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Context Score</h3>
                  <Badge variant="outline" className={getSARelevanceColor(analysis.sa_relevance)}>
                    {analysis.sa_relevance} ({analysis.sa_score}%)
                  </Badge>
                </div>
                
                <Progress 
                  value={analysis.sa_score} 
                  className="h-2 mb-4"
                />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">South African Elements Detected:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.sa_elements_detected.length > 0 ? (
                      analysis.sa_elements_detected.map((element: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-amber-50">
                          {element}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No South African specific elements detected</p>
                    )}
                  </div>
                </div>
                
                {showDiff && diffAnalysis && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <h4 className="text-sm font-medium flex items-center text-blue-800">
                      <Info className="h-4 w-4 mr-1" />
                      SA vs. Generic Comparison
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="text-center p-1 bg-green-100 rounded">
                        <div className="text-xs text-gray-600">With SA Context</div>
                        <div className="font-bold text-lg text-green-700">{analysis.sa_score}%</div>
                      </div>
                      <div className="text-center p-1 bg-gray-100 rounded">
                        <div className="text-xs text-gray-600">Without SA Context</div>
                        <div className="font-bold text-lg text-gray-700">{diffAnalysis.sa_score}%</div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-blue-700">
                      South African context elements improved the score by {analysis.sa_score - diffAnalysis.sa_score}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-500" />
                  Skills Identified
                </CardTitle>
                <CardDescription>
                  Relevant skills detected in your CV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills_identified.length > 0 ? (
                    analysis.skills_identified.map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-blue-50">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific skills detected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analysis Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>
                In-depth review of your CV with actionable suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Key Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.slice(0, 3).map((strength: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <XCircle className="h-5 w-5 mr-2 text-orange-500" />
                        Priority Improvements
                      </h3>
                      <ul className="space-y-2">
                        {analysis.improvements.slice(0, 3).map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <XCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-500 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      South African Job Market Tips
                    </h3>
                    <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Flag className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-sm">
                            Include your B-BBEE status to increase employability with companies focused on transformation.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <BookOpen className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-sm">
                            Always specify NQF levels for qualifications to help employers understand your education level.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Clipboard className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span className="text-sm">
                            Highlight South African regulatory knowledge relevant to your industry (e.g., POPI Act, FAIS, etc.).
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="strengths" className="space-y-2">
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start p-2 rounded-md bg-green-50">
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="improvements" className="space-y-2">
                  <ul className="space-y-3">
                    {analysis.improvements.map((improvement: string, i: number) => (
                      <li key={i} className="flex items-start p-2 rounded-md bg-orange-50">
                        <XCircle className="h-5 w-5 mr-2 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Technical Section */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Code className="h-5 w-5 mr-2 text-gray-500" />
                Technical Details
              </CardTitle>
              <CardDescription>
                How our Local AI works under the hood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-4">
                <p>
                  This analysis was performed using our LocalAI engine that runs entirely within the application.
                  No external API calls were made - everything was processed right here in the browser and server.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <Binary className="h-4 w-4 mr-2 text-gray-500" />
                      Analysis Components
                    </h4>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• South African keyword detection</li>
                      <li>• ATS format compatibility analysis</li>
                      <li>• Skills and experience evaluation</li>
                      <li>• Structure and section detection</li>
                      <li>• B-BBEE and NQF level recognition</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <Flag className="h-4 w-4 mr-2 text-gray-500" />
                      South African Context Features
                    </h4>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• Recognition of local qualifications</li>
                      <li>• Detection of South African companies</li>
                      <li>• Awareness of local industry regulations</li>
                      <li>• Understanding of language skills relevance</li>
                      <li>• B-BBEE status identification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper component for global icon
const Globe = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};