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

const ATSAnalyzerPage = () => {
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text before analyzing');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-resume-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: cvText,
          jobDescription: jobText || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError('An error occurred while analyzing your CV. Please try again.');
      console.error('CV analysis error:', err);
    } finally {
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

export default ATSAnalyzerPage;