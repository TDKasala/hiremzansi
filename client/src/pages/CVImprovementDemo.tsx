import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CVBeforeAfterComparison from "@/components/CVBeforeAfterComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowUpCircle, CheckCircle } from "lucide-react";

const CVImprovementDemo = () => {
  // Mock data for demonstration
  const [latestAnalysis, setLatestAnalysis] = useState({
    id: 2,
    cvId: 1,
    score: 85,
    skillsScore: 90,
    formatScore: 80,
    saContextScore: 75,
    strengths: [
      "Clear and well-structured CV",
      "Good use of bullet points and white space",
      "Comprehensive skills section with relevant tech stack",
      "Includes B-BBEE status information",
      "NQF qualifications clearly stated"
    ],
    improvements: [
      "Add more quantifiable achievements",
      "Consider industry-specific keywords",
      "Tailor your CV more specifically to each job"
    ],
    createdAt: new Date().toISOString(),
    bbbeeDetected: true,
    nqfDetected: true
  });

  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  
  // Demo function to simulate uploading a new CV version
  const handleUploadNewVersion = () => {
    // Show loading indicator
    setShowBeforeAfter(true);
  };
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">CV Improvement Tracking</h1>
        <p className="text-muted-foreground">Track your CV improvements over time and see your progress</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Analysis</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl font-bold mr-2">Current CV Score: {latestAnalysis.score}%</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full">Good</span>
                  </CardTitle>
                  <CardDescription>
                    Your CV is well optimized for ATS systems. Last analyzed on {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Overall Score</span>
                        <span>{latestAnalysis.score}%</span>
                      </div>
                      <Progress value={latestAnalysis.score} className="h-2 bg-gray-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Skills Presentation</span>
                        <span>{latestAnalysis.skillsScore}%</span>
                      </div>
                      <Progress value={latestAnalysis.skillsScore} className="h-2 bg-gray-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">CV Format</span>
                        <span>{latestAnalysis.formatScore}%</span>
                      </div>
                      <Progress value={latestAnalysis.formatScore} className="h-2 bg-gray-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">South African Context</span>
                        <span>{latestAnalysis.saContextScore}%</span>
                      </div>
                      <Progress value={latestAnalysis.saContextScore} className="h-2 bg-gray-200" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h3 className="font-medium mb-3">Strengths</h3>
                        <ul className="space-y-2">
                          {latestAnalysis.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Areas to Improve</h3>
                        <ul className="space-y-2">
                          {latestAnalysis.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start">
                              <ArrowUpCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>CV Analysis History</CardTitle>
                  <CardDescription>Track your improvement journey over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border">
                      <div className="mr-4">
                        <div className="bg-green-100 text-green-700 p-3 rounded-full">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Latest Analysis</h3>
                        <p className="text-sm text-muted-foreground">{new Date(latestAnalysis.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm mt-1">Overall Score: <span className="font-medium">{latestAnalysis.score}%</span></p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg border">
                      <div className="mr-4">
                        <div className="bg-gray-100 text-gray-700 p-3 rounded-full">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">First Analysis</h3>
                        <p className="text-sm text-muted-foreground">{new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}</p>
                        <p className="text-sm mt-1">Overall Score: <span className="font-medium">70%</span></p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            {showBeforeAfter ? (
              <CVBeforeAfterComparison 
                cvId={1} 
                latestAnalysis={latestAnalysis}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Track Your CV Improvements</CardTitle>
                  <CardDescription>
                    Upload a new version of your CV to see how you've improved over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleUploadNewVersion}
                    className="w-full"
                  >
                    Show Before/After Comparison Demo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>South African Context</CardTitle>
              <CardDescription>
                Optimize your CV for the South African job market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-800 mb-2">B-BBEE Status</h3>
                  <p className="text-sm text-amber-800">
                    {latestAnalysis.bbbeeDetected ? 
                      "✓ Your CV includes B-BBEE status - this is advantageous for many South African employers." :
                      "✗ Consider adding your B-BBEE status to your CV if applicable."}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">NQF Qualifications</h3>
                  <p className="text-sm text-blue-800">
                    {latestAnalysis.nqfDetected ? 
                      "✓ Your CV includes NQF level references - this helps South African employers understand your qualifications." :
                      "✗ Include NQF levels for your qualifications to align with South African standards."}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Tips for South African CVs</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Include your ID number (last 3 digits can be masked)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Mention proficiency in South African languages</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>List relevant South African professional bodies</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Include provincial location preferences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help Improving?</CardTitle>
              <CardDescription>
                Get expert guidance to optimize your CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                <div className="text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V4H4v16h16l-3-3H4"></path><path d="M20 12h-9"></path><path d="M9 4v4"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Personalized CV Review</p>
                  <p className="text-xs text-blue-500">Professional feedback within 48 hours</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-amber-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-600">CV Templates</p>
                  <p className="text-xs text-amber-500">South African ATS-optimized templates</p>
                </div>
              </div>
              
              <Button className="w-full mt-4">Upgrade Plan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CVImprovementDemo;