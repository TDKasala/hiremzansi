import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload, FileUp, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CVImprovementDemo = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const handleFileUpload = () => {
    setIsUploading(true);
    
    // Simulate file upload processing
    setTimeout(() => {
      setIsUploading(false);
      setIsAnalyzing(true);
      
      // Simulate analysis processing
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
      }, 2500);
    }, 1500);
  };
  
  const handleDownloadPDF = () => {
    toast({
      title: "PDF Downloaded",
      description: "Your ATS analysis report has been downloaded."
    });
  };
  
  const handleShare = () => {
    // In a real application, this would copy a link to the clipboard
    navigator.clipboard.writeText("https://atsboost.co.za/shared/analysis-report");
    
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ATS Analyzer</h1>
          <p className="text-xl text-gray-600">
            Check how well your CV will perform with South African Applicant Tracking Systems
          </p>
        </div>
        
        {!showResults ? (
          <div className="max-w-lg mx-auto">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Upload Your CV</CardTitle>
                <CardDescription>
                  We'll analyze your CV against South African ATS systems and provide detailed feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
                  <div className="mx-auto mb-4 w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Drag and drop your CV here</h3>
                  <p className="text-gray-500 mb-4">
                    Supports PDF, DOCX, and TXT formats up to 5MB
                  </p>
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={isUploading || isAnalyzing}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {isUploading 
                      ? "Uploading..." 
                      : isAnalyzing 
                        ? "Analyzing..." 
                        : "Select File"
                    }
                  </Button>
                </div>
                
                {(isUploading || isAnalyzing) && (
                  <div className="mt-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isUploading ? "Uploading file..." : "Analyzing CV..."}
                      </span>
                      <span className="text-sm font-medium">
                        {isUploading ? "50%" : "75%"}
                      </span>
                    </div>
                    <Progress value={isUploading ? 50 : 75} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col text-center text-sm text-gray-500">
                <p>Your CV data is secure and will not be shared with third parties.</p>
                <p className="mt-1">
                  By uploading your CV, you agree to our{" "}
                  <a href="/terms" className="text-amber-600 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</a>.
                </p>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Results Section */}
            <Card className="shadow-lg mb-10">
              <CardHeader className="pb-0">
                <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <span>ATS Compatibility Score</span>
                  <Badge className="bg-amber-100 text-amber-800 text-sm hover:bg-amber-200">
                    Marketing_CV_2025.pdf
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-48 h-48 relative flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full bg-white shadow-inner flex items-center justify-center relative">
                        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#f0f0f0"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#FFCA28"
                            strokeWidth="10"
                            strokeDasharray="282.7"
                            strokeDashoffset={(282.7 * (100 - 78)) / 100}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-4xl font-bold">78%</div>
                          <div className="text-gray-500 text-sm">ATS Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-4">Section Scores</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Format & Structure</span>
                          <span className="text-sm font-medium text-amber-600">85%</span>
                        </div>
                        <Progress value={85} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500 rounded-full" />
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Keywords & Skills</span>
                          <span className="text-sm font-medium text-amber-600">72%</span>
                        </div>
                        <Progress value={72} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500 rounded-full" />
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Content Quality</span>
                          <span className="text-sm font-medium text-amber-600">79%</span>
                        </div>
                        <Progress value={79} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500 rounded-full" />
                        </Progress>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">South African Context</span>
                          <span className="text-sm font-medium text-amber-600">65%</span>
                        </div>
                        <Progress value={65} className="h-2 bg-gray-100">
                          <div className="h-full bg-amber-500 rounded-full" />
                        </Progress>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-end">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Results
                  </Button>
                  <Button className="bg-amber-500 hover:bg-amber-600" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed Analysis */}
            <Tabs defaultValue="strengths" className="w-full mb-10">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="strengths">
                <Card>
                  <CardHeader>
                    <CardTitle>CV Strengths</CardTitle>
                    <CardDescription>These aspects of your CV are working well</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800">Clear Contact Information</h3>
                            <p className="text-gray-700">Your contact information is clearly formatted and includes all necessary details. South African phone number is properly formatted with country code (+27).</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800">Well-Structured Format</h3>
                            <p className="text-gray-700">Your CV follows a clean, chronological format with clear section headings that will be easily recognized by ATS systems.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800">Education Properly Formatted</h3>
                            <p className="text-gray-700">Your qualifications are well-structured with proper NQF levels indicated, which is important for South African ATS systems.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800">Quantifiable Achievements</h3>
                            <p className="text-gray-700">You've included specific metrics and numbers to demonstrate your impact, which helps your CV stand out once it passes the ATS screening.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="improvements">
                <Card>
                  <CardHeader>
                    <CardTitle>Areas to Improve</CardTitle>
                    <CardDescription>Make these changes to improve your ATS compatibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-0.5">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-800">Add More South African Context</h3>
                            <p className="text-gray-700">Your CV needs more South African-specific context. Consider adding references to local regulations, standards, or market knowledge relevant to your industry.</p>
                            <div className="mt-2 bg-white p-3 rounded border border-red-100">
                              <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                              <p className="text-sm text-gray-600">Mention experience with South African regulations like POPIA, B-BBEE, or industry-specific frameworks depending on your field.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-0.5">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-800">Enhance Industry-Specific Keywords</h3>
                            <p className="text-gray-700">Your CV is missing key South African industry-specific keywords that many ATS systems scan for.</p>
                            <div className="mt-2 bg-white p-3 rounded border border-red-100">
                              <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                              <p className="text-sm text-gray-600">Add more industry-specific terminology relevant to South African job listings in your field. Review job descriptions for the roles you're targeting to identify common keywords.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="bg-red-100 p-1 rounded-full mr-3 mt-0.5">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-800">Simplify Formatting in Skills Section</h3>
                            <p className="text-gray-700">The formatting in your skills section may be too complex for ATS systems to interpret correctly.</p>
                            <div className="mt-2 bg-white p-3 rounded border border-red-100">
                              <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                              <p className="text-sm text-gray-600">Use a simple bullet point format for your skills section instead of columns or tables. List skills clearly with relevant proficiency levels if appropriate.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="keywords">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                    <CardDescription>Keyword presence and optimization in your CV</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Missing Important Keywords</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="bg-red-50 text-red-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> POPIA compliance
                          </div>
                          <div className="bg-red-50 text-red-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> Stakeholder management
                          </div>
                          <div className="bg-red-50 text-red-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> B-BBEE knowledge
                          </div>
                          <div className="bg-red-50 text-red-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> South African market
                          </div>
                          <div className="bg-red-50 text-red-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> Digital transformation
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Detected Keywords</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Marketing strategy
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Campaign management
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Analytics
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Social media
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Content creation
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Budgeting
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Lead generation
                          </div>
                          <div className="bg-green-50 text-green-800 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Project management
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Industry-Specific Keyword Suggestions</h3>
                        <Card className="bg-amber-50 border-amber-200">
                          <CardContent className="p-4">
                            <p className="text-gray-700 mb-4">
                              Based on South African marketing job listings, consider adding these keywords to your CV:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>Integrated marketing</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>Omnichannel strategy</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>Marketing automation</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>Growth marketing</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>Market research</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>CRM systems</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>POPIA compliance</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>B-BBEE marketing</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                <span>South African consumer</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Next Steps Card */}
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Ready to improve your CV?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Improved Version
                </Button>
                <Button variant="outline">
                  View Detailed Recommendations
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVImprovementDemo;