import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Eye,
  Share2,
  Star
} from 'lucide-react';

export default function OptimizedCVPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cvContent, setCvContent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Get CV content from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get('content');
    
    if (content) {
      setCvContent(decodeURIComponent(content));
    } else {
      // If no content in URL, redirect back to dashboard
      setLocation('/dashboard');
    }
  }, [setLocation]);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create a downloadable text file
      const blob = new Blob([cvContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI-Optimized-CV.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Your optimized CV has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cvContent);
      toast({
        title: "Copied to Clipboard",
        description: "Your optimized CV has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CV. Please try manual selection.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewCV = () => {
    setLocation('/dashboard?tab=cv-editor');
  };

  if (!cvContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI-Optimized CV | Hire Mzansi - South African CV Optimization</title>
        <meta name="description" content="View and download your AI-optimized CV designed for South African ATS systems and recruiters." />
      </Helmet>
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')}
              className="mb-4 md:mb-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <Sparkles className="mr-3 h-8 w-8 text-primary" />
              Your AI-Optimized CV
            </h1>
            <p className="text-muted-foreground mt-2">
              Optimized for South African ATS systems and recruiters
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button onClick={handleCopyToClipboard} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download CV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CV Content Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Optimized CV Content
                </CardTitle>
                <CardDescription>
                  Your CV has been enhanced with ATS keywords and South African market context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {cvContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Check className="mr-2 h-5 w-5" />
                  Optimization Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">ATS Optimized</h4>
                      <p className="text-sm text-muted-foreground">
                        Enhanced with relevant keywords and proper formatting
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">SA Market Context</h4>
                      <p className="text-sm text-muted-foreground">
                        Tailored for South African hiring practices
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Professional Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Improved clarity and impact
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">B-BBEE Considerations</h4>
                      <p className="text-sm text-muted-foreground">
                        Local compliance and context added where relevant
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download CV
                    </>
                  )}
                </Button>
                
                <Button onClick={handleCreateNewCV} variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Create Another CV
                </Button>
                
                <Button onClick={() => setLocation('/dashboard')} variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Customize this CV for each job application</p>
                  <p>• Include specific keywords from job descriptions</p>
                  <p>• Keep formatting simple for ATS systems</p>
                  <p>• Review and update regularly</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}