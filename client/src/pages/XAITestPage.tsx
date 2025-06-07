import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileText, Briefcase, User, Target } from 'lucide-react';

interface CVAnalysisResult {
  atsScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  southAfricanContext: {
    beeCompliance: string;
    localMarketFit: string;
    industryRelevance: string;
    languageAppropriate: boolean;
  };
  industry: string;
  experienceLevel: string;
}

interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  salaryEstimate: string;
  recommendations: string[];
}

interface CareerGuidanceResult {
  nextSteps: string[];
  skillGaps: string[];
  trainingRecommendations: string[];
  careerPath: string;
}

export default function XAITestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(null);
  const [careerGuidance, setCareerGuidance] = useState<CareerGuidanceResult | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [linkedInOptimization, setLinkedInOptimization] = useState<any>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [salaryBenchmark, setSalaryBenchmark] = useState<any>(null);
  
  const [loading, setLoading] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const analyzeCVFile = async () => {
    if (!selectedFile) return;
    
    setLoading('analyze-file');
    const formData = new FormData();
    formData.append('cv', selectedFile);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    
    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setAnalysisResult(result.data.analysis);
        setCvText(result.data.originalText);
      }
    } catch (error) {
      console.error('CV analysis error:', error);
    }
    setLoading('');
  };

  const analyzeCVText = async () => {
    if (!cvText) return;
    
    setLoading('analyze-text');
    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      });
      
      const result = await response.json();
      if (result.success) {
        setAnalysisResult(result.data.analysis);
      }
    } catch (error) {
      console.error('CV analysis error:', error);
    }
    setLoading('');
  };

  const matchJob = async () => {
    if (!cvText || !jobDescription) return;
    
    setLoading('job-match');
    try {
      const response = await fetch('/api/cv/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription }),
      });
      
      const result = await response.json();
      if (result.success) {
        setJobMatchResult(result.data);
      }
    } catch (error) {
      console.error('Job matching error:', error);
    }
    setLoading('');
  };

  const generateCareerGuidance = async () => {
    if (!cvText) return;
    
    setLoading('career-guidance');
    try {
      const response = await fetch('/api/cv/career-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, targetRole }),
      });
      
      const result = await response.json();
      if (result.success) {
        setCareerGuidance(result.data);
      }
    } catch (error) {
      console.error('Career guidance error:', error);
    }
    setLoading('');
  };

  const generateCoverLetter = async () => {
    if (!cvText || !jobDescription || !companyName) return;
    
    setLoading('cover-letter');
    try {
      const response = await fetch('/api/cv/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription, companyName }),
      });
      
      const result = await response.json();
      if (result.success) {
        setCoverLetter(result.data.coverLetter);
      }
    } catch (error) {
      console.error('Cover letter generation error:', error);
    }
    setLoading('');
  };

  const optimizeLinkedIn = async () => {
    if (!cvText) return;
    
    setLoading('linkedin');
    try {
      const response = await fetch('/api/cv/optimize-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });
      
      const result = await response.json();
      if (result.success) {
        setLinkedInOptimization(result.data);
      }
    } catch (error) {
      console.error('LinkedIn optimization error:', error);
    }
    setLoading('');
  };

  const generateInterviewQuestions = async () => {
    if (!jobDescription || !experience) return;
    
    setLoading('interview-questions');
    try {
      const response = await fetch('/api/cv/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, experienceLevel: experience }),
      });
      
      const result = await response.json();
      if (result.success) {
        setInterviewQuestions(result.data.questions);
      }
    } catch (error) {
      console.error('Interview questions error:', error);
    }
    setLoading('');
  };

  const analyzeSalary = async () => {
    if (!position || !location || !experience) return;
    
    setLoading('salary-benchmark');
    try {
      const response = await fetch('/api/cv/salary-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, location, experience }),
      });
      
      const result = await response.json();
      if (result.success) {
        setSalaryBenchmark(result.data);
      }
    } catch (error) {
      console.error('Salary benchmark error:', error);
    }
    setLoading('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">xAI-Powered CV Optimization</h1>
        <p className="text-muted-foreground">
          Test all CV analysis features powered by xAI Grok for the South African job market
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload & Analyze
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Matching
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Career Tools
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CV Upload & Analysis</CardTitle>
                <CardDescription>
                  Upload your CV file or paste text for xAI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cv-file">Upload CV File</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cv-text">Or Paste CV Text</Label>
                  <Textarea
                    id="cv-text"
                    placeholder="Paste your CV content here..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="job-desc">Job Description (Optional)</Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Paste job description for targeted analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeCVFile} 
                    disabled={!selectedFile || loading === 'analyze-file'}
                    className="flex-1"
                  >
                    {loading === 'analyze-file' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Analyze File
                  </Button>
                  <Button 
                    onClick={analyzeCVText} 
                    disabled={!cvText || loading === 'analyze-text'}
                    className="flex-1"
                  >
                    {loading === 'analyze-text' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Analyze Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>ATS Score</span>
                      <span className="font-semibold">{analysisResult.atsScore}/100</span>
                    </div>
                    <Progress value={analysisResult.atsScore} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score</span>
                      <span className="font-semibold">{analysisResult.overallScore}/100</span>
                    </div>
                    <Progress value={analysisResult.overallScore} />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Industry & Level</Label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{analysisResult.industry}</Badge>
                      <Badge variant="outline">{analysisResult.experienceLevel}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-green-600">Strengths</Label>
                    <ul className="text-sm space-y-1 mt-1">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-orange-600">Improvements</Label>
                    <ul className="text-sm space-y-1 mt-1">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-orange-500 mt-1">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-blue-600">South African Context</Label>
                    <div className="text-sm space-y-1 mt-1">
                      <p><strong>B-BBEE:</strong> {analysisResult.southAfricanContext.beeCompliance}</p>
                      <p><strong>Market Fit:</strong> {analysisResult.southAfricanContext.localMarketFit}</p>
                      <p><strong>Industry Relevance:</strong> {analysisResult.southAfricanContext.industryRelevance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Matching & Salary Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Software Developer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Cape Town, Western Cape"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 3-5 years, Entry level, Senior"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={matchJob} 
                  disabled={!cvText || !jobDescription || loading === 'job-match'}
                  className="flex-1"
                >
                  {loading === 'job-match' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Match Job
                </Button>
                <Button 
                  onClick={analyzeSalary} 
                  disabled={!position || !location || !experience || loading === 'salary-benchmark'}
                  className="flex-1"
                >
                  {loading === 'salary-benchmark' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Analyze Salary
                </Button>
              </div>
            </CardContent>
          </Card>

          {jobMatchResult && (
            <Card>
              <CardHeader>
                <CardTitle>Job Match Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Match Score</span>
                      <span className="font-semibold">{jobMatchResult.matchScore}/100</span>
                    </div>
                    <Progress value={jobMatchResult.matchScore} />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Salary Estimate</Label>
                    <p className="text-lg font-semibold text-green-600">{jobMatchResult.salaryEstimate}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-green-600">Matching Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobMatchResult.matchingSkills.map((skill, index) => (
                        <Badge key={index} variant="default" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-red-600">Missing Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobMatchResult.missingSkills.map((skill, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {salaryBenchmark && (
            <Card>
              <CardHeader>
                <CardTitle>Salary Benchmark</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Salary Range</Label>
                    <p className="text-lg font-semibold text-green-600">{salaryBenchmark.salaryRange}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Market Analysis</Label>
                    <p className="text-sm">{salaryBenchmark.marketAnalysis}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Key Factors</Label>
                    <ul className="text-sm space-y-1">
                      {salaryBenchmark.factors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-500 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Guidance & Interview Prep</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-role">Target Role (Optional)</Label>
                <Input
                  id="target-role"
                  placeholder="e.g., Senior Developer, Team Lead"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateCareerGuidance} 
                  disabled={!cvText || loading === 'career-guidance'}
                  className="flex-1"
                >
                  {loading === 'career-guidance' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Get Career Guidance
                </Button>
                <Button 
                  onClick={generateInterviewQuestions} 
                  disabled={!jobDescription || !experience || loading === 'interview-questions'}
                  className="flex-1"
                >
                  {loading === 'interview-questions' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Interview Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          {careerGuidance && (
            <Card>
              <CardHeader>
                <CardTitle>Career Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Career Path</Label>
                  <p className="text-sm mt-1">{careerGuidance.careerPath}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-600">Next Steps</Label>
                  <ul className="text-sm space-y-1 mt-1">
                    {careerGuidance.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500 mt-1">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label className="text-sm font-medium text-orange-600">Skill Gaps</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {careerGuidance.skillGaps.map((gap, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{gap}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-green-600">Training Recommendations</Label>
                  <ul className="text-sm space-y-1 mt-1">
                    {careerGuidance.trainingRecommendations.map((training, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-500 mt-1">•</span>
                        {training}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {interviewQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewQuestions.map((question, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Question {index + 1}</p>
                      <p className="text-sm mt-1">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateCoverLetter} 
                  disabled={!cvText || !jobDescription || !companyName || loading === 'cover-letter'}
                  className="flex-1"
                >
                  {loading === 'cover-letter' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Cover Letter
                </Button>
                <Button 
                  onClick={optimizeLinkedIn} 
                  disabled={!cvText || loading === 'linkedin'}
                  className="flex-1"
                >
                  {loading === 'linkedin' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Optimize LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          {coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{coverLetter}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {linkedInOptimization && (
            <Card>
              <CardHeader>
                <CardTitle>LinkedIn Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Professional Headline</Label>
                  <div className="p-3 bg-muted rounded-lg mt-1">
                    <p className="text-sm">{linkedInOptimization.headline}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Summary</Label>
                  <div className="p-3 bg-muted rounded-lg mt-1">
                    <p className="text-sm whitespace-pre-wrap">{linkedInOptimization.summary}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Recommended Skills</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {linkedInOptimization.skillsRecommendations.map((skill: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}