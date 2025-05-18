import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, FileUp, Download, Share2, Trash2, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const CVImprovementPage = () => {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState('current');
  
  const cvHistory = [
    { 
      id: 1, 
      date: '15 May 2025', 
      score: 45, 
      strengths: ['Contact information clear', 'Education formatted properly'],
      improvements: ['Missing key skills', 'Experience section lacks metrics', 'No South African context']
    },
    { 
      id: 2, 
      date: '18 May 2025', 
      score: 68, 
      strengths: ['Contact information clear', 'Education formatted properly', 'Added key skills', 'South African context added'],
      improvements: ['Experience section lacks metrics', 'Complex formatting may confuse ATS']
    },
    { 
      id: 3, 
      date: '20 May 2025', 
      score: 92, 
      strengths: ['Contact information clear', 'Education with proper NQF levels', 'Skills section optimized', 'Experience includes metrics', 'South African context added', 'B-BBEE information included', 'ATS-friendly formatting'],
      improvements: ['Could add more industry-specific keywords']
    }
  ];
  
  const currentCV = cvHistory[2]; // Most recent entry
  const firstCV = cvHistory[0]; // First entry
  
  const handleDownloadPDF = () => {
    toast({
      title: "PDF Downloaded",
      description: "Your CV improvement report has been downloaded."
    });
  };
  
  const handleShare = () => {
    // In a real application, this would copy a link to the clipboard
    navigator.clipboard.writeText("https://atsboost.co.za/shared/improvement-report");
    
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard."
    });
  };
  
  const handleDelete = () => {
    toast({
      title: "Action Required",
      description: "Are you sure you want to delete this CV version? This action cannot be undone.",
      variant: "destructive",
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-500";
    if (score < 75) return "text-amber-500";
    return "text-green-500";
  };
  
  const getProgressColor = (score: number) => {
    if (score < 50) return "bg-red-500";
    if (score < 75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CV Improvement Tracker</h1>
          <p className="text-gray-600">
            Track how your CV has improved over time and see detailed before & after comparisons
          </p>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Initial ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className={`text-3xl font-bold ${getScoreColor(firstCV.score)}`}>{firstCV.score}%</span>
                <span className="ml-2 text-sm text-gray-500">First upload</span>
              </div>
              <Progress value={firstCV.score} className={`mt-2 ${getProgressColor(firstCV.score)}`} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Current ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className={`text-3xl font-bold ${getScoreColor(currentCV.score)}`}>{currentCV.score}%</span>
                <span className="ml-2 text-sm text-gray-500">Latest version</span>
              </div>
              <Progress value={currentCV.score} className={`mt-2 ${getProgressColor(currentCV.score)}`} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-500">+{currentCV.score - firstCV.score}%</span>
                <span className="ml-2 text-sm text-gray-500">Since first upload</span>
              </div>
              <div className="mt-2 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${((currentCV.score - firstCV.score)/100) * 100}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Section */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* CV History Sidebar */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>CV Version History</CardTitle>
                <CardDescription>Select a version to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cvHistory.map((version, index) => (
                  <div 
                    key={version.id}
                    className={`p-3 ${selectedVersion === String(version.id) 
                      ? 'bg-amber-50 border border-amber-200' 
                      : 'bg-white border border-gray-200'} 
                    rounded-lg cursor-pointer hover:bg-amber-50 transition-colors`}
                    onClick={() => setSelectedVersion(String(version.id))}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm">{version.date}</span>
                      </div>
                      <Badge variant={version.id === cvHistory.length ? "default" : "outline"}>
                        {version.id === cvHistory.length ? "Latest" : `v${version.id}`}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">ATS Score</span>
                          <span className={`text-sm font-bold ${getScoreColor(version.score)}`}>{version.score}%</span>
                        </div>
                        <Progress value={version.score} className={`h-2 ${getProgressColor(version.score)}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Share</span>
                  </Button>
                  <Button size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="mt-6">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <FileUp className="h-4 w-4 mr-2" />
                <span>Upload New Version</span>
              </Button>
            </div>
          </div>
          
          {/* CV Comparison Area */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Before & After Comparison</CardTitle>
                    <CardDescription>See how your CV has improved over time</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Compare with:</span>
                    <Select 
                      value="1" 
                      onValueChange={(value) => console.log(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="First Version" />
                      </SelectTrigger>
                      <SelectContent>
                        {cvHistory.map((version, index) => (
                          <SelectItem key={version.id} value={String(version.id)}>
                            {index === 0 ? "First Version" : `Version ${version.id}`} ({version.date})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Detailed Changes</TabsTrigger>
                    <TabsTrigger value="visual">Visual Comparison</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            Initial Version (Score: {firstCV.score}%)
                          </h3>
                          <Card>
                            <CardContent className="p-4 space-y-4">
                              <div>
                                <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {firstCV.strengths.map((strength, index) => (
                                    <li key={index} className="text-gray-700">{strength}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-600 mb-2">Areas for Improvement</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {firstCV.improvements.map((improvement, index) => (
                                    <li key={index} className="text-gray-700">{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                            Current Version (Score: {currentCV.score}%)
                          </h3>
                          <Card>
                            <CardContent className="p-4 space-y-4">
                              <div>
                                <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {currentCV.strengths.map((strength, index) => (
                                    <li key={index} className="text-gray-700">{strength}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-600 mb-2">Areas for Improvement</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {currentCV.improvements.map((improvement, index) => (
                                    <li key={index} className="text-gray-700">{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-10 bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 text-green-800">Key Improvements Made</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">Added Proper NQF Levels</h4>
                          <p className="text-gray-700">Educational qualifications now include proper NQF levels following South African standards.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">Quantified Achievements</h4>
                          <p className="text-gray-700">Experience section now includes specific metrics and quantifiable results.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">B-BBEE Information</h4>
                          <p className="text-gray-700">Added appropriate B-BBEE information relevant to South African employers.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">ATS-Friendly Formatting</h4>
                          <p className="text-gray-700">Simplified formatting to ensure compatibility with Applicant Tracking Systems.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">Optimized Skills Section</h4>
                          <p className="text-gray-700">Added relevant industry-specific and technical skills for the South African job market.</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-700 mb-2">South African Context</h4>
                          <p className="text-gray-700">Added relevant South African context including location-specific experience.</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-6">
                    <div className="space-y-8">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold">
                          Contact Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Before</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800">John Smith</p>
                              <p className="text-gray-800">john.smith@email.com</p>
                              <p className="text-gray-800">0821234567</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">After</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800">John Smith</p>
                              <p className="text-gray-800">john.smith@email.com</p>
                              <p className="text-gray-800">+27 82 123 4567</p>
                              <p className="text-gray-800">Johannesburg, Gauteng</p>
                              <p className="text-gray-800">LinkedIn: linkedin.com/in/johnsmith</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold">
                          Education
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Before</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800 font-medium">Bachelor of Commerce</p>
                              <p className="text-gray-700">University of Cape Town</p>
                              <p className="text-gray-700">2015 - 2018</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">After</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800 font-medium">Bachelor of Commerce (NQF Level 7)</p>
                              <p className="text-gray-700">University of Cape Town</p>
                              <p className="text-gray-700">2015 - 2018</p>
                              <p className="text-gray-700">Major: Accounting and Finance</p>
                              <p className="text-gray-700">Relevant Coursework: Financial Management, Business Analysis, Tax Law</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold">
                          Professional Experience
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Before</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800 font-medium">Financial Analyst</p>
                              <p className="text-gray-700">ABC Corporation</p>
                              <p className="text-gray-700">2019 - Present</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                                <li>Prepared financial reports</li>
                                <li>Analyzed business performance</li>
                                <li>Worked on budget planning</li>
                                <li>Collaborated with management team</li>
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">After</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-gray-800 font-medium">Financial Analyst</p>
                              <p className="text-gray-700">ABC Corporation, Johannesburg</p>
                              <p className="text-gray-700">2019 - Present</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                                <li>Prepared monthly financial reports, reducing reporting time by 35%</li>
                                <li>Analyzed business performance metrics across 5 departments, identifying R2.5M in cost-saving opportunities</li>
                                <li>Led budget planning process for R50M departmental budget</li>
                                <li>Collaborated with management team to implement IFRS compliance procedures</li>
                                <li>Developed financial models that improved forecast accuracy by 22%</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold">
                          Skills Section
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Before</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>Excel</li>
                                <li>Financial Analysis</li>
                                <li>Reporting</li>
                                <li>Teamwork</li>
                                <li>Communication</li>
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">After</h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="font-medium mb-1">Technical Skills:</p>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-3">
                                <li>Advanced Excel (VLOOKUP, Pivot Tables, Macros)</li>
                                <li>SAP Financial Modules</li>
                                <li>Power BI Dashboard Development</li>
                                <li>Financial Modeling & Forecasting</li>
                                <li>SQL Database Querying</li>
                              </ul>
                              <p className="font-medium mb-1">Industry Knowledge:</p>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>IFRS Reporting Standards</li>
                                <li>South African Tax Legislation</li>
                                <li>JSE Listing Requirements</li>
                                <li>FAIS Compliance</li>
                                <li>B-BBEE Reporting & Compliance</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="visual" className="mt-6">
                    <div className="mb-6 text-center text-gray-600">
                      <p>This visual comparison shows how your CV layout and content have improved.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-red-600">Before</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src="/cv-before.jpg" 
                            alt="CV Before Improvements" 
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                          <h5 className="font-semibold text-red-800 mb-2">Issues Identified</h5>
                          <ul className="list-disc pl-5 space-y-1 text-gray-800">
                            <li>Cluttered layout with excessive formatting</li>
                            <li>Hard-to-read font choices</li>
                            <li>Headers and footers that ATS can't process</li>
                            <li>Graphics and tables disrupting text flow</li>
                            <li>Missing section labels</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-green-600">After</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src="/cv-after.jpg" 
                            alt="CV After Improvements" 
                            className="w-full h-auto"
                          />
                        </div>
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2">Improvements Made</h5>
                          <ul className="list-disc pl-5 space-y-1 text-gray-800">
                            <li>Clean, ATS-friendly layout</li>
                            <li>Standard, readable fonts</li>
                            <li>Clear section headings</li>
                            <li>Proper formatting of achievements</li>
                            <li>South African context and terminology</li>
                            <li>NQF levels correctly displayed</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Next Steps Card */}
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Add Industry Keywords</h3>
                  <p className="text-center text-gray-700 mb-4">
                    Add more South African industry-specific keywords to further improve your ATS score.
                  </p>
                  <Button variant="outline" className="mt-auto">
                    Browse Keywords <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Test With Job Descriptions</h3>
                  <p className="text-center text-gray-700 mb-4">
                    Test your CV against specific job descriptions to optimize for target roles.
                  </p>
                  <Button variant="outline" className="mt-auto">
                    Job Matcher <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Prepare for Interviews</h3>
                  <p className="text-center text-gray-700 mb-4">
                    Prepare for interviews with our South African industry-specific guides.
                  </p>
                  <Button variant="outline" className="mt-auto">
                    Interview Prep <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CVImprovementPage;