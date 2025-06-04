import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, CheckCircle, ClipboardCheck, FileText, Lightbulb, MessageSquare, Phone, Save, ThumbsUp, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function PremiumToolsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(false);
  const [showJobAlertPreview, setShowJobAlertPreview] = useState(false);

  // Mock CV text for the editor
  const [cvText, setCVText] = useState(
    `SIPHO NKOSI
Marketing Specialist | B-BBEE Level 2
Cape Town, Western Cape | sipho.nkosi@email.co.za | +27 71 234 5678

PROFESSIONAL SUMMARY
Dedicated Marketing Specialist with 5+ years of experience in digital marketing, campaign management, and market analysis. Proven track record of increasing brand visibility and generating leads in the South African market.

SKILLS
• Digital Marketing • Content Creation • Social Media Management
• Market Research • Campaign Analytics • Project Management
• Adobe Creative Suite • Google Analytics • Team Leadership

WORK EXPERIENCE
Marketing Manager
Cape Town Media Group, Cape Town
January 2020 - Present
• Led digital marketing campaigns resulting in 35% increase in online engagement
• Managed a team of 4 marketing specialists, providing guidance and feedback
• Developed and implemented strategic marketing plans aligned with business goals
• Conducted market research to identify trends in the South African media landscape

Digital Marketing Specialist
Johannesburg Marketing Solutions, Johannesburg
March 2017 - December 2019
• Created and optimized content for various digital platforms
• Analyzed campaign performance using Google Analytics and other tools
• Collaborated with design team to create visually appealing marketing materials

EDUCATION
Bachelor of Commerce in Marketing (NQF Level 7)
University of Cape Town
2014 - 2017

Digital Marketing Certificate (NQF Level 5)
SETA Accredited Marketing Institute
2018

LANGUAGES
English (Fluent), Zulu (Native), Xhosa (Conversational)`
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSubscribe = () => {
    setSubscriptionLoading(true);
    
    // Simulate subscription processing
    setTimeout(() => {
      setSubscriptionLoading(false);
      
      toast({
        title: "Premium Subscription Activated",
        description: "You now have access to all premium features. Your subscription will renew on June 12, 2025.",
      });
    }, 2000);
  };

  const handleOptimize = () => {
    // Simulate optimization process
    toast({
      title: "Analyzing CV content",
      description: "Please wait while we process your CV...",
    });
    
    setTimeout(() => {
      setSuggestions([
        "Add your SA ID number to help with verification processes",
        "Specify your exact B-BBEE level (e.g., Level 2 Contributor)",
        "Include your SETA certification number for the Digital Marketing Certificate",
        "Add 'Proficient in South African market analysis' to your skills section",
        "Mention experience with local regulations like POPIA compliance",
        "Add provincial experience (Western Cape, Gauteng) to highlight mobility"
      ]);
      
      toast({
        title: "Optimization Complete",
        description: "We've identified 6 South African specific improvements for your CV.",
      });
    }, 3000);
  };

  const handleSave = () => {
    toast({
      title: "CV Saved Successfully",
      description: "Your optimized CV has been saved.",
    });
  };

  const toggleJobAlerts = () => {
    setJobAlertsEnabled(!jobAlertsEnabled);
    
    if (!jobAlertsEnabled) {
      toast({
        title: "Job Alerts Activated",
        description: "You will now receive job alerts based on your CV skills.",
      });
      
      // Show the preview after a short delay
      setTimeout(() => {
        setShowJobAlertPreview(true);
      }, 1000);
    } else {
      setShowJobAlertPreview(false);
      
      toast({
        title: "Job Alerts Deactivated",
        description: "You will no longer receive job alerts.",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/auth"><span className="underline cursor-pointer">login</span></Link> to access premium tools.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Premium Tools | Hire Mzansi - South African CV Optimization</title>
        <meta name="description" content="Access premium CV optimization tools designed specifically for the South African job market. Enhance your resume with B-BBEE and NQF optimization." />
      </Helmet>
      
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Premium Optimization Tools</h1>
          <p className="text-muted-foreground">
            Tools designed specifically for the South African job market
          </p>
        </div>
        
        <div className="mb-6">
          <Card>
            <CardHeader className="bg-primary text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Premium Subscription</CardTitle>
                  <CardDescription className="text-primary-foreground/90">
                    Unlock all premium features
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">ZAR 185</div>
                  <div className="text-sm">per month</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Real-time CV Editor</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit your CV with AI-powered suggestions tailored for South African employers
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Job Alerts via SMS</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive targeted job opportunities matching your skills via SMS
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Unlimited Deep Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Get comprehensive reports with B-BBEE and NQF optimization tips
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">South African Interview Prep</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice with questions specific to South African hiring practices
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSubscribe} 
                disabled={subscriptionLoading}
                className="w-full md:w-auto text-base"
                size="lg"
              >
                {subscriptionLoading ? "Processing..." : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="editor">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="editor">CV Editor</TabsTrigger>
              <TabsTrigger value="job-alerts">Job Alerts</TabsTrigger>
              <TabsTrigger value="interview">Interview Prep</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          Real-time CV Editor
                        </CardTitle>
                        <Button 
                          onClick={handleSave}
                          size="sm"
                          className="h-12 w-12 rounded-full p-0"
                        >
                          <Save className="h-6 w-6" />
                        </Button>
                      </div>
                      <CardDescription>
                        Edit your CV with AI-powered South African market optimization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        className="min-h-[500px] font-mono text-sm resize-none border-none focus-visible:ring-0"
                        value={cvText}
                        onChange={(e) => setCVText(e.target.value)}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        Auto-saving enabled
                      </div>
                      <Button variant="outline" onClick={handleOptimize}>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Optimize for SA
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ThumbsUp className="mr-2 h-5 w-5 text-primary" />
                        South African Suggestions
                      </CardTitle>
                      <CardDescription>
                        Tailored for local hiring practices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {suggestions.length > 0 ? (
                        <ul className="space-y-3">
                          {suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-4 w-4 text-primary shrink-0 mt-1 mr-2" />
                              <span className="text-sm">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Click "Optimize for SA" to get suggestions</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span>South African Relevance Score</span>
                          <span className="font-medium">74%</span>
                        </div>
                        <Progress value={74} className="h-2" />
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="job-alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-primary" />
                    Job Alert Notifications
                  </CardTitle>
                  <CardDescription>
                    Receive SMS notifications for jobs matching your skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Job Alerts via SMS</Label>
                      <p className="text-sm text-muted-foreground">Receive job matches via SMS to your mobile</p>
                    </div>
                    <Switch
                      checked={jobAlertsEnabled}
                      onCheckedChange={toggleJobAlerts}
                    />
                  </div>
                  
                  <Separator />
                  
                  {showJobAlertPreview && (
                    <div className="border rounded-lg p-4 max-w-md mx-auto">
                      <div className="text-sm text-muted-foreground mb-2">SMS Preview:</div>
                      <div className="bg-muted p-3 rounded text-sm font-medium">
                        Hire Mzansi: New Marketing Specialist job at Multichoice in Cape Town. 95% match to your skills! Check your email for details or log in to view. Reply STOP to unsubscribe.
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Job Alert Settings</h3>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="job-locations">Preferred Locations</Label>
                      <Input
                        id="job-locations"
                        defaultValue="Cape Town, Johannesburg, Durban"
                        disabled={!jobAlertsEnabled}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="job-frequency">Alert Frequency</Label>
                      <select 
                        id="job-frequency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="daily"
                        disabled={!jobAlertsEnabled}
                      >
                        <option value="instant">Instant (as soon as posted)</option>
                        <option value="daily">Daily Summary</option>
                        <option value="weekly">Weekly Digest</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="job-minimum-match">Minimum Match Score</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm w-8">70%</span>
                        <input 
                          type="range" 
                          min="50" 
                          max="95" 
                          step="5" 
                          defaultValue="70"
                          className="w-full"
                          disabled={!jobAlertsEnabled}
                        />
                        <span className="text-sm w-8">95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button disabled={!jobAlertsEnabled}>
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="interview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    South African Interview Preparation
                  </CardTitle>
                  <CardDescription>
                    Practice with questions relevant to South African employers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">B-BBEE Interview Questions</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <p className="font-medium mb-2">
                          How does your B-BBEE status contribute to our company's scorecard?
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          This question tests your understanding of how B-BBEE works in South African companies.
                        </p>
                        <Button variant="outline" size="sm">
                          View Sample Answer
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <p className="font-medium mb-2">
                          Can you explain your understanding of employment equity in the workplace?
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Employers may assess your knowledge of South African employment policies.
                        </p>
                        <Button variant="outline" size="sm">
                          View Sample Answer
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">South African Work Culture</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <p className="font-medium mb-2">
                          How do you adapt to working in multi-cultural South African teams?
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          This question assesses your cultural intelligence and adaptability.
                        </p>
                        <Button variant="outline" size="sm">
                          View Sample Answer
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <p className="font-medium mb-2">
                          How have you handled load shedding challenges in previous roles?
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          This is a practical question about working within South Africa's infrastructure challenges.
                        </p>
                        <Button variant="outline" size="sm">
                          View Sample Answer
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Start Practice Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Premium Community</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                South African Job Seekers Network
              </CardTitle>
              <CardDescription>
                Connect with other South African professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <User className="h-6 w-6 bg-secondary text-white rounded-full p-1 mr-2" />
                    <div>
                      <div className="font-medium">Thabo M.</div>
                      <div className="text-xs text-muted-foreground">Software Engineer, Johannesburg</div>
                    </div>
                  </div>
                  <p className="text-sm">
                    "The B-BBEE optimization feature helped me better present my qualifications. 
                    Landed an interview at Standard Bank within a week!"
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <User className="h-6 w-6 bg-secondary text-white rounded-full p-1 mr-2" />
                    <div>
                      <div className="font-medium">Nomsa K.</div>
                      <div className="text-xs text-muted-foreground">Marketing Specialist, Cape Town</div>
                    </div>
                  </div>
                  <p className="text-sm">
                    "The job alerts feature is amazing. I received a notification for a position 
                    that matched my skills perfectly, applied immediately, and got the job!"
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  Join Community Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}