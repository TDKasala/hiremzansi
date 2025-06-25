import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ATSAnalysis {
  score: number;
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
  recommendations: string[];
  industrySpecific: string[];
  saRelevant: string[];
}

export default function ATSKeywordsPage() {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const analyzeKeywords = useMutation({
    mutationFn: async (data: { cvText: string; jobDescription: string }) => {
      const response = await apiRequest('POST', '/api/premium/ats-keywords', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your ATS keyword analysis is ready",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both CV content and job description",
        variant: "destructive",
      });
      return;
    }

    analyzeKeywords.mutate({ cvText, jobDescription });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">ATS Keywords Analyzer</h1>
          <p className="text-gray-600 mb-8">
            Premium tool to optimize your CV with the right keywords for Applicant Tracking Systems
          </p>
          <Button size="lg" onClick={() => window.location.href = '/login'}>
            Sign In to Access Premium Tools
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has premium access (you can implement this check based on your subscription system)
  const hasPremiumAccess = user?.subscription?.plan === 'premium' || user?.isAdmin;

  if (!hasPremiumAccess) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">ATS Keywords Analyzer</h1>
          <p className="text-gray-600 mb-6">
            This premium tool analyzes your CV against job descriptions to identify important keywords
            that will help your CV pass through Applicant Tracking Systems.
          </p>
          
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Premium Features Include:</h3>
              <ul className="text-left space-y-2">
                <li>✓ AI-powered keyword extraction</li>
                <li>✓ South African job market optimization</li>
                <li>✓ ATS compatibility scoring</li>
                <li>✓ Industry-specific keyword suggestions</li>
                <li>✓ B-BBEE and SA context keywords</li>
                <li>✓ Downloadable keyword reports</li>
              </ul>
            </CardContent>
          </Card>

          <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Premium Tool
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">ATS Keywords Analyzer</h1>
          <p className="text-gray-600">
            Optimize your CV with the right keywords to pass Applicant Tracking Systems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CV Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Your CV Content
              </CardTitle>
              <CardDescription>
                Paste your CV text here for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your CV content here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the job description you're targeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeKeywords.isPending}
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {analyzeKeywords.isPending ? 'Analyzing...' : 'Analyze Keywords'}
          </Button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  ATS Compatibility Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {analysis.score}%
                  </div>
                  <div className="text-gray-600">
                    Your CV matches {analysis.score}% of the required keywords
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Found Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Found Keywords</CardTitle>
                  <CardDescription>Keywords already in your CV</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.found.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Missing Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Missing Keywords</CardTitle>
                  <CardDescription>Important keywords to add</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.missing.map((keyword, index) => (
                      <Badge key={index} variant="destructive">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Suggested Keywords</CardTitle>
                  <CardDescription>Additional relevant keywords</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.suggested.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="border-blue-200 text-blue-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SA-Specific Keywords */}
            {analysis.saRelevant.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">🇿🇦</span>
                    South African Context Keywords
                  </CardTitle>
                  <CardDescription>
                    Keywords relevant to the South African job market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.saRelevant.map((keyword, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}