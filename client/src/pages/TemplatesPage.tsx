import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Bot, 
  Building, 
  FileText, 
  Wrench, 
  Zap, 
  Star, 
  Download,
  Eye,
  Sparkles,
  Target,
  Globe,
  Users,
  Crown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function TemplatesPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("ai-powered");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has premium access
  const hasPremium = user?.subscription?.status === 'active' || user?.subscription?.plan === 'premium';

  // Handle button clicks
  const handleCreateAITemplate = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // Navigate to AI template creator (to be implemented)
    console.log('Creating AI template...');
  };

  const handleCreateIndustryTemplate = (industry: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // Navigate to industry template creator
    console.log(`Creating ${industry} template...`);
  };

  const handleCreateCoverLetter = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // Navigate to cover letter creator
    console.log('Creating cover letter...');
  };

  const handleStartDynamicBuilder = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    // Navigate to dynamic builder
    console.log('Starting dynamic builder...');
  };

  const handleViewExamples = (type: string) => {
    // Show examples modal or navigate to examples page
    console.log(`Viewing ${type} examples...`);
  };

  // Fetch template categories
  const { data: categories } = useQuery({
    queryKey: ["/api/templates/categories"],
    enabled: !!user
  });

  return (
    <>
      <Helmet>
        <title>CV & Cover Letter Templates - Hire Mzansi</title>
        <meta name="description" content="Create professional CVs and cover letters with AI-powered templates optimized for South African job market and ATS systems." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Templates
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Professional CV & Cover Letter Templates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create winning CVs and cover letters with our AI-powered templates, 
              optimized for South African ATS systems and designed to maximize your interview chances.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Bot className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Intelligent templates generated using advanced AI for your specific profile
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Industry-Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Templates tailored for different South African industries and sectors
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Cover Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Matching cover letter templates that complement your CV perfectly
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <Wrench className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Dynamic Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Build custom templates with real-time ATS score preview
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Template Types Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6 sm:mb-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0 h-auto sm:h-10 p-1 mb-6 sm:mb-8">
              <TabsTrigger value="ai-powered" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI-Powered</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="industry" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm">
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Industry</span>
                <span className="sm:hidden">Industry</span>
              </TabsTrigger>
              <TabsTrigger value="cover-letter" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cover Letters</span>
                <span className="sm:hidden">Letters</span>
              </TabsTrigger>
              <TabsTrigger value="dynamic" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm">
                <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Dynamic Builder</span>
                <span className="sm:hidden">Builder</span>
              </TabsTrigger>
            </TabsList>

            {/* AI-Powered Templates */}
            <TabsContent value="ai-powered">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI-Powered CV Templates
                  </CardTitle>
                  <CardDescription>
                    Let our AI analyze your profile and create a personalized CV template optimized for your target role and industry.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Key Features:</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">Personalized Content</p>
                            <p className="text-xs sm:text-sm text-gray-600">AI analyzes your experience and creates tailored content</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">SA Market Optimized</p>
                            <p className="text-xs sm:text-sm text-gray-600">Includes B-BBEE, NQF levels, and local requirements</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm sm:text-base">ATS Optimized</p>
                            <p className="text-xs sm:text-sm text-gray-600">Keywords and formatting designed to pass ATS screening</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-blue-50 p-4 sm:p-6 rounded-lg">
                      <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">How it works:</h4>
                      <ol className="space-y-2 text-xs sm:text-sm">
                        <li className="flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                          <span className="text-xs sm:text-sm">Input your profile information</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                          <span className="text-xs sm:text-sm">AI analyzes your background</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                          <span className="text-xs sm:text-sm">Generate personalized template</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                          <span className="text-xs sm:text-sm">Download and customize</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="default" className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11" onClick={handleCreateAITemplate}>
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="hidden sm:inline">{hasPremium ? 'Create AI Template' : 'Upgrade for AI Templates'}</span>
                      <span className="sm:hidden">{hasPremium ? 'Create AI' : 'Upgrade'}</span>
                    </Button>
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11" onClick={() => handleViewExamples('ai-powered')}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      View Examples
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Industry-Specific Templates */}
            <TabsContent value="industry">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Industry-Specific Templates
                  </CardTitle>
                  <CardDescription>
                    Choose from professionally designed templates tailored for specific South African industries.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categories?.categories?.industries && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      {categories.categories.industries.map((industry: string) => (
                        <Card key={industry} className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-400">
                          <CardHeader className="pb-2 p-3 sm:p-4">
                            <CardTitle className="text-sm sm:text-base">{industry}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 sm:p-4 pt-0">
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                              Optimized for {industry.toLowerCase()} sector requirements
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9" onClick={() => handleViewExamples(industry)}>
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9" onClick={() => handleCreateIndustryTemplate(industry)}>
                                <Download className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">{hasPremium ? 'Use Template' : 'Upgrade to Use'}</span>
                                <span className="sm:hidden">{hasPremium ? 'Use' : 'Upgrade'}</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Industry Benefits:</h4>
                    <ul className="text-xs sm:text-sm space-y-1">
                      <li>• Pre-loaded with industry-specific keywords</li>
                      <li>• Formatted according to sector standards</li>
                      <li>• Includes relevant skill categories</li>
                      <li>• Optimized for industry ATS systems</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cover Letter Templates */}
            <TabsContent value="cover-letter">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Cover Letter Templates
                  </CardTitle>
                  <CardDescription>
                    Create compelling cover letters that perfectly complement your CV and target specific positions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Template Types:</h3>
                      <div className="space-y-3">
                        <Card className="p-4 border-l-4 border-l-green-500">
                          <h4 className="font-medium">Job-Specific</h4>
                          <p className="text-sm text-gray-600">Tailored for specific job postings and companies</p>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-blue-500">
                          <h4 className="font-medium">Industry Standard</h4>
                          <p className="text-sm text-gray-600">Professional templates for industry applications</p>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-purple-500">
                          <h4 className="font-medium">Networking</h4>
                          <p className="text-sm text-gray-600">For referrals and networking opportunities</p>
                        </Card>
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-3">What You Get:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          Compelling opening paragraphs
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          Achievement-focused content
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          Professional closing statements
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          South African business etiquette
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="default" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11" onClick={handleCreateCoverLetter}>
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="hidden sm:inline">{hasPremium ? 'Create Cover Letter' : 'Upgrade for Cover Letters'}</span>
                      <span className="sm:hidden">{hasPremium ? 'Create Letter' : 'Upgrade'}</span>
                    </Button>
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11" onClick={() => handleViewExamples('cover-letter')}>
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Browse Examples
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dynamic Builder */}
            <TabsContent value="dynamic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-purple-600" />
                    Dynamic Template Builder
                  </CardTitle>
                  <CardDescription>
                    Build your custom CV template with drag-and-drop sections and real-time ATS score preview.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold mb-4">Builder Features:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Wrench className="h-5 w-5 text-purple-600" />
                            <h4 className="font-medium">Drag & Drop</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Easily reorder and customize CV sections
                          </p>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <h4 className="font-medium">Live Preview</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            See your ATS score update in real-time
                          </p>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <h4 className="font-medium">Smart Suggestions</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            AI-powered content recommendations
                          </p>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Globe className="h-5 w-5 text-purple-600" />
                            <h4 className="font-medium">SA Optimization</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Local market compliance built-in
                          </p>
                        </Card>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-4">Available Sections:</h4>
                      <div className="space-y-2 text-sm">
                        <Badge variant="outline">Personal Information</Badge>
                        <Badge variant="outline">Professional Summary</Badge>
                        <Badge variant="outline">Work Experience</Badge>
                        <Badge variant="outline">Education</Badge>
                        <Badge variant="outline">Skills</Badge>
                        <Badge variant="outline">Certifications</Badge>
                        <Badge variant="outline">Languages</Badge>
                        <Badge variant="outline">Projects</Badge>
                        <Badge variant="outline">Achievements</Badge>
                        <Badge variant="outline">References</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="default" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11" onClick={handleStartDynamicBuilder}>
                      <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="hidden sm:inline">{hasPremium ? 'Start Building' : 'Upgrade to Build'}</span>
                      <span className="sm:hidden">{hasPremium ? 'Start' : 'Upgrade'}</span>
                    </Button>
                    
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-4 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Create Your Perfect CV?</h2>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90 px-2">
                Join thousands of South African job seekers who have improved their interview chances with our templates.
              </p>
              {user ? (
                <Button size="default" variant="secondary" className="text-primary font-semibold w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Start Creating Templates
                </Button>
              ) : (
                <Link href="/auth">
                  <Button size="default" variant="secondary" className="text-primary font-semibold w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Sign Up to Get Started
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Modal */}
          <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[#FFCA28]" />
                  Upgrade to Premium
                </DialogTitle>
                <DialogDescription>
                  Unlock AI-powered CV and cover letter templates to boost your job search success.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#FFCA28] to-[#FFB000] p-4 rounded-lg text-black">
                  <h4 className="font-semibold mb-2">Premium Features Include:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ AI-powered CV templates</li>
                    <li>✓ Industry-specific templates</li>
                    <li>✓ Cover letter generation</li>
                    <li>✓ Dynamic template builder</li>
                    <li>✓ Real-time ATS scoring</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Link href="/pricing" className="flex-1">
                    <Button className="w-full bg-[#FFCA28] hover:bg-[#FFB000] text-black font-semibold">
                      View Pricing
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                    Later
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}