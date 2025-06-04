import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Flag,
  Clipboard,
  BookOpen
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import SouthAfricanAnalysis from '@/components/SouthAfricanAnalysis';
import { Helmet } from 'react-helmet';

// Sample South African CV for demonstration
const SAMPLE_CV = `Thabo Nkosi
Johannesburg, Gauteng | thabo.nkosi@email.com | +27 73 456 7890

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development and a strong focus on creating scalable applications for South African businesses. Passionate about leveraging technology to solve local challenges.

SKILLS
• JavaScript, TypeScript, React, Node.js
• Python, Django, Flask
• SQL, PostgreSQL, MongoDB
• AWS, Azure, CI/CD pipelines
• Agile methodology, Scrum
• Problem-solving
• Team leadership

EXPERIENCE
Senior Software Engineer
ABC Technologies, Johannesburg
January 2022 - Present
• Lead a team of 5 developers building financial applications for South African banks
• Implemented security features compliant with POPI Act requirements
• Managed projects with budgets exceeding R500,000
• Reduced application loading time by 40% through code optimization
• Collaborated with Standard Bank and Nedbank on integration solutions

Software Developer
Tech Solutions SA, Cape Town
March 2019 - December 2021
• Developed web applications for government departments in Western Cape
• Created mobile-responsive designs optimized for South African internet infrastructure
• Mentored junior developers and conducted code reviews
• Established coding standards that improved team productivity by 25%

Junior Developer
Startup Hub, Pretoria
January 2017 - February 2019
• Built e-commerce solutions for small businesses in Gauteng
• Implemented payment integrations with local South African payment gateways
• Assisted in UI/UX design for multiple client projects

EDUCATION
Bachelor of Science in Computer Science
University of Cape Town
2013 - 2016
NQF Level 7

Advanced Certificate in Web Development
CodeX Academy, Johannesburg
2017
NQF Level 5

ADDITIONAL INFORMATION
• Languages: English (fluent), Zulu (native), Afrikaans (conversational)
• B-BBEE Status: Level 1 Contributor
• South African citizen
• Valid driver's license
• Available for travel throughout South Africa`;

// Sample non-South African CV for comparison
const GENERIC_CV = `John Smith
New York, NY | john.smith@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development and a strong focus on creating scalable applications. Passionate about leveraging technology to solve business challenges.

SKILLS
• JavaScript, TypeScript, React, Node.js
• Python, Django, Flask
• SQL, PostgreSQL, MongoDB
• AWS, Azure, CI/CD pipelines
• Agile methodology, Scrum
• Problem-solving
• Team leadership

EXPERIENCE
Senior Software Engineer
ABC Technologies, New York
January 2022 - Present
• Lead a team of 5 developers building financial applications for banks
• Implemented security features for regulatory compliance
• Managed projects with budgets exceeding $50,000
• Reduced application loading time by 40% through code optimization
• Collaborated with major financial institutions on integration solutions

Software Developer
Tech Solutions, San Francisco
March 2019 - December 2021
• Developed web applications for government departments
• Created mobile-responsive designs optimized for various internet infrastructures
• Mentored junior developers and conducted code reviews
• Established coding standards that improved team productivity by 25%

Junior Developer
Startup Hub, Chicago
January 2017 - February 2019
• Built e-commerce solutions for small businesses
• Implemented payment integrations with payment gateways
• Assisted in UI/UX design for multiple client projects

EDUCATION
Bachelor of Science in Computer Science
State University
2013 - 2016

Advanced Certificate in Web Development
Code Academy
2017

ADDITIONAL INFORMATION
• Languages: English (native), Spanish (conversational)
• US Citizen
• Valid driver's license
• Available for travel`;

interface CvAnalysisResult {
  overall_score: number;
  rating: string;
  format_score: number;
  skill_score: number;
  sa_score: number;
  sa_relevance: string;
  strengths: string[];
  improvements: string[];
  skills_identified: string[];
  sa_elements_detected: string[];
  [key: string]: any;
}

export default function SouthAfricanAIDemo() {
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<CvAnalysisResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const analyzeCV = async () => {
    if (!cvText) {
      setError('Please enter CV text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/analyze-resume-text', {
        resumeContent: cvText
      });

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error analyzing CV. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runComparison = async () => {
    setIsAnalyzing(true);
    setError(null);
    setShowComparison(true);

    try {
      // Analyze South African CV
      const saCVResponse = await apiRequest('POST', '/api/analyze-resume-text', {
        resumeContent: SAMPLE_CV
      });

      // Analyze generic CV
      const genericCVResponse = await apiRequest('POST', '/api/analyze-resume-text', {
        resumeContent: GENERIC_CV
      });

      if (!saCVResponse.ok || !genericCVResponse.ok) {
        throw new Error('Failed to complete analysis comparison');
      }

      const saData = await saCVResponse.json();
      const genericData = await genericCVResponse.json();

      setResult(saData);
      setComparisonResult(genericData);
    } catch (err) {
      setError('Error running comparison. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleCV = (useSA = true) => {
    setCvText(useSA ? SAMPLE_CV : GENERIC_CV);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>South African AI CV Analysis Demo | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Experience the South African-focused AI CV analysis tool that helps job seekers optimize their CVs for the local job market." 
        />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">South African AI CV Analysis</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Our localized AI analyzes CVs specifically for South African job market requirements,
          detecting B-BBEE status, NQF levels, and other SA-specific elements critical for job applications.
        </p>
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter Your CV</CardTitle>
            <CardDescription>
              Enter your CV text below or use one of our sample CVs to see how our AI analyzes for South African job market relevance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your CV text here..."
              className="min-h-[350px] font-mono text-sm"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => loadSampleCV(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Load SA Sample
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSampleCV(false)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Load Generic Sample
                </Button>
              </div>
              <div className="space-x-2 sm:ml-auto">
                <Button 
                  onClick={analyzeCV} 
                  disabled={isAnalyzing || !cvText} 
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze CV'
                  )}
                </Button>
                <Button 
                  onClick={runComparison} 
                  disabled={isAnalyzing}
                  variant="outline"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    'Run SA vs Generic Comparison'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <Button variant="outline" onClick={() => {
              setResult(null);
              setComparisonResult(null);
              setShowComparison(false);
            }}>
              Analyze Another CV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Overall Score: {result.overall_score}%</CardTitle>
                <CardDescription>
                  <Badge 
                    variant="outline"
                    className={
                      result.overall_score >= 80 ? "bg-green-100 text-green-800" :
                      result.overall_score >= 60 ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {result.rating}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>Format Score: {result.format_score}%</span>
                    <span>Skills Score: {result.skill_score}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Progress value={result.format_score} className="h-2 mb-4" />
                    </div>
                    <div>
                      <Progress value={result.skill_score} className="h-2 mb-4" />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="strengths">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="strengths" className="pt-4">
                    <ul className="space-y-2">
                      {result.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="improvements" className="pt-4">
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start">
                          <XCircle className="h-5 w-5 mr-2 mt-0.5 text-orange-500 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>

                <div>
                  <h3 className="text-lg font-medium mb-2">Skills Identified</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills_identified.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-medium flex items-center mb-2">
                    <Flag className="h-5 w-5 mr-2 text-amber-500" />
                    South African Job Market Tips
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Clipboard className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
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
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div>
              <SouthAfricanAnalysis 
                saScore={result.sa_score}
                saRelevance={result.sa_relevance}
                saElements={result.sa_elements_detected}
                showComparison={showComparison}
                comparisonScore={comparisonResult?.sa_score || 0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}