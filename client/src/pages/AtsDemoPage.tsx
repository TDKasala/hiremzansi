/**
 * ATS Analyzer Demo Page 
 * 
 * A simplified, fully client-side implementation of the ATS analyzer
 * that works without needing server-side functionality.
 */

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ATSAnalysisResult from '@/components/ATSAnalysisResult';

// South African specific keywords
const SA_KEYWORDS = [
  "south africa", "sa", "cape town", "johannesburg", "pretoria", "durban", 
  "b-bbee", "bee", "bbbee", "nqf", "saqa", "matric", "seta", "unisa", "wits"
];

// Common skills to detect
const COMMON_SKILLS = [
  "javascript", "python", "java", "react", "angular", "node.js", 
  "html", "css", "sql", "aws", "communication", "leadership", "excel"
];

/**
 * Analyze CV text locally in the browser
 */
function analyzeCVText(text: string) {
  const content = text.trim().toLowerCase();
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Check formatting factors
  const hasSections = /education|experience|skills|qualifications|work history/i.test(content);
  const hasBulletPoints = /•|-|\*/i.test(content);
  const hasContactInfo = /email|phone|tel|mobile|address|linkedin/i.test(content);
  const hasDateRanges = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).+?-|to\b.+?(20\d{2}|present)/i.test(content);
  const hasDates = /\b(20\d{2}|19\d{2})\b/i.test(content);
  
  // Calculate format score
  const formatScore = Math.round(
    (hasSections ? 25 : 0) +
    (hasBulletPoints ? 25 : 0) +
    (hasContactInfo ? 20 : 0) +
    (hasDateRanges ? 15 : 0) +
    (hasDates ? 15 : 0)
  );
  
  // Check content quality
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const hasActionVerbs = /\b(managed|developed|created|implemented|led|designed|improved|increased|reduced|achieved)\b/i.test(content);
  const hasNumbers = /\b\d+%|\d+ percent|increased by \d+|decreased by \d+|reduced \d+|improved \d+/i.test(content);
  const hasKeySkills = COMMON_SKILLS.some(skill => content.includes(skill.toLowerCase()));
  
  // Calculate content score
  const contentScore = Math.round(
    (avgLineLength > 30 && avgLineLength < 200 ? 25 : 0) +
    (hasActionVerbs ? 25 : 0) +
    (hasNumbers ? 25 : 0) +
    (hasKeySkills ? 25 : 0)
  );
  
  // Calculate South African context score
  const foundSaKeywords = SA_KEYWORDS.filter(keyword => content.includes(keyword.toLowerCase()));
  
  const hasB_BBEE = /\b(b-bbee|bbbee|bee|broad.based black economic empowerment|level \d b-bbee)\b/i.test(content);
  const hasNQF = /\bnqf level \d+\b|national qualifications framework|saqa/i.test(content);
  const hasSaAddress = /\b(south africa|gauteng|western cape|eastern cape|kwazulu-natal|kzn|free state)\b/i.test(content);
  
  const saContextScore = Math.round(
    ((foundSaKeywords.length > 0 ? Math.min(foundSaKeywords.length * 5, 30) : 0)) +
    (hasB_BBEE ? 25 : 0) +
    (hasNQF ? 25 : 0) + 
    (hasSaAddress ? 20 : 0)
  );
  
  // Extract skills
  const skillsFound = COMMON_SKILLS.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(content)
  );
  
  // Calculate overall ATS score (format, content, and SA context)
  const overallScore = Math.round(
    formatScore * 0.3 + 
    contentScore * 0.4 + 
    saContextScore * 0.3
  );
  
  // Determine rating
  let rating = '';
  if (overallScore >= 80) rating = 'Excellent';
  else if (overallScore >= 65) rating = 'Good';
  else if (overallScore >= 50) rating = 'Average';
  else rating = 'Needs Improvement';
  
  // Determine SA relevance rating
  let saRelevance = '';
  if (saContextScore >= 80) saRelevance = 'Excellent';
  else if (saContextScore >= 60) saRelevance = 'Good';
  else if (saContextScore >= 40) saRelevance = 'Average';
  else saRelevance = 'Low';
  
  // Generate strengths
  const strengths: string[] = [];
  
  if (hasSections) strengths.push('Well-structured CV with clear sections');
  if (hasBulletPoints) strengths.push('Effective use of bullet points improves readability');
  if (hasActionVerbs) strengths.push('Uses strong action verbs to highlight achievements');
  if (hasNumbers) strengths.push('Quantifies achievements with specific numbers');
  if (hasKeySkills) strengths.push('Contains relevant skills that ATS systems look for');
  if (hasDateRanges) strengths.push('Clear timeline of work experience');
  if (hasB_BBEE) strengths.push('Includes B-BBEE status, important for South African employers');
  if (hasNQF) strengths.push('Specifies NQF levels for qualifications');
  if (hasSaAddress) strengths.push('Includes South African location information');
  if (foundSaKeywords.length > 3) strengths.push('Well-optimized for South African job market');
  
  // Generate improvements
  const improvements: string[] = [];
  
  if (!hasSections) improvements.push('Add clear section headings (Education, Experience, Skills)');
  if (!hasBulletPoints) improvements.push('Use bullet points to highlight achievements');
  if (!hasActionVerbs) improvements.push('Include strong action verbs to describe achievements');
  if (!hasNumbers) improvements.push('Quantify achievements with specific numbers');
  if (!hasKeySkills) improvements.push('Add industry-relevant skills and keywords');
  if (!hasDateRanges) improvements.push('Include clear date ranges for education and work experience');
  if (!hasB_BBEE && saContextScore < 60) improvements.push('Consider adding B-BBEE status information if applicable');
  if (!hasNQF && saContextScore < 60) improvements.push('Add NQF levels to your qualifications');
  if (!hasSaAddress && saContextScore < 60) improvements.push('Include your location in South Africa');
  
  // Format feedback
  const formatFeedback: string[] = [];
  
  if (avgLineLength > 200) formatFeedback.push('Shorten your bullet points to 1-2 lines each');
  if (!hasContactInfo) formatFeedback.push('Add complete contact information (phone, email, LinkedIn)');
  if (content.length > 5000) formatFeedback.push('Consider shortening your CV to 2-3 pages maximum');
  if (content.length < 1500) formatFeedback.push('Your CV may be too short - add more relevant details');
  if (!hasDates) formatFeedback.push('Add dates to your work experience and education sections');
  
  // Shuffle arrays for variety
  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);
  
  return {
    overall_score: overallScore,
    rating,
    strengths: shuffle(strengths),
    improvements: shuffle(improvements),
    format_feedback: shuffle(formatFeedback),
    skills_identified: shuffle(skillsFound.slice(0, 15)),
    sa_score: saContextScore,
    sa_relevance: saRelevance
  };
}

/**
 * Calculate job match score
 */
function calculateJobMatch(cvText: string, jobText: string) {
  if (!cvText || !jobText) return null;
  
  const cv = cvText.toLowerCase();
  const job = jobText.toLowerCase();
  
  // Extract potential keywords from job description
  const jobWords = job.split(/\s+/)
    .filter(word => word.length > 4) // Only words longer than 4 chars
    .filter(word => !['and', 'the', 'for', 'with', 'that', 'this', 'have', 'from'].includes(word)); // Skip common words
  
  // Count word matches
  const matches = jobWords.filter(word => cv.includes(word));
  const matchPercentage = Math.min(90, Math.round((matches.length / jobWords.length) * 100));
  
  // Determine job relevance rating
  let jobRelevance = 'Medium';
  if (matchPercentage >= 75) jobRelevance = 'High';
  else if (matchPercentage >= 50) jobRelevance = 'Medium';
  else jobRelevance = 'Low';
  
  return {
    matchScore: matchPercentage,
    jobRelevance
  };
}

const AtsDemoPage = () => {
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text before analyzing');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Simulate processing delay (for better UX)
      setTimeout(() => {
        // Analyze the CV text using our local South African ATS analyzer
        const analysis = analyzeCVText(cvText);
        
        // Calculate job match if job description is provided
        let jobKeywordMatch = null;
        if (jobText && jobText.trim()) {
          jobKeywordMatch = calculateJobMatch(cvText, jobText);
        }
        
        // Format the result for the UI component
        const result = {
          score: analysis.overall_score,
          rating: analysis.rating,
          strengths: analysis.strengths.slice(0, 3),
          weaknesses: analysis.improvements.slice(0, 3),
          suggestions: analysis.format_feedback.slice(0, 2),
          sa_score: analysis.sa_score,
          sa_relevance: analysis.sa_relevance,
          skills: analysis.skills_identified.slice(0, 8),
          job_match: jobKeywordMatch
        };
        
        setAnalysisResult(result);
        setIsAnalyzing(false);
      }, 1200);
    } catch (err) {
      setError('An error occurred while analyzing your CV. Please try again.');
      console.error('CV analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">CV ATS Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Analyze how your CV will perform with South African ATS systems and get personalized improvement suggestions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input section */}
        <div>
          <Tabs defaultValue="cv">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cv">CV Text</TabsTrigger>
              <TabsTrigger value="job">Job Description</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cv">
              <Card>
                <CardHeader>
                  <CardTitle>Paste Your CV</CardTitle>
                  <CardDescription>
                    Paste the full text of your CV to analyze its ATS score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cv-text">CV Content</Label>
                      <Textarea
                        id="cv-text"
                        placeholder="Paste your CV text here..."
                        className="min-h-[300px]"
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCvText('')}
                      >
                        Clear
                      </Button>
                      <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Analyze CV
                          </>
                        )}
                      </Button>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="job">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description (Optional)</CardTitle>
                  <CardDescription>
                    Paste the job description to see how well your CV matches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-text">Job Description</Label>
                      <Textarea
                        id="job-text"
                        placeholder="Paste the job description here for better matching..."
                        className="min-h-[300px]"
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mr-2"
                        onClick={() => setJobText('')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium text-amber-800 mb-2">South African ATS Tips</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
              <li>Include your B-BBEE status if applicable</li>
              <li>Specify NQF levels for your qualifications</li>
              <li>List South African language proficiencies</li>
              <li>Add relevant South African certifications and professional bodies</li>
              <li>Include South African cities/provinces in your address</li>
            </ul>
          </div>
        </div>

        {/* Results section */}
        <div>
          {analysisResult ? (
            <ATSAnalysisResult result={analysisResult} isLoading={isAnalyzing} />
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-6 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Analysis Results Yet</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Paste your CV text and click "Analyze CV" to get your ATS score and tailored recommendations.
              </p>
              <Separator className="my-4" />
              <p className="text-sm">
                Our analysis is optimized for the South African job market, with special attention to local requirements 
                and hiring practices.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsDemoPage;