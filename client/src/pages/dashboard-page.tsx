import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Helmet } from "react-helmet";
import {
  CloudUpload,
  FileText,
  Award,
  Settings,
  PieChart,
  Clock,
  Plus,
  ChevronRight,
  BarChart3,
  User,
  Sparkles,
  LineChart,
  ScrollText,
  Bell,
  Target,
  CreditCard,
  Search,
  Edit,
  CheckCircle,
  Save,
  Crown,
} from "lucide-react";
import { CV } from "@shared/schema";
import DeepAnalysisCard from "@/components/DeepAnalysisCard";
import { CVEditor } from "@/components/CVEditor";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { JobMatchingDashboard } from "@/components/JobMatchingDashboard";
import { JobSeekerMatchNotifications } from "@/components/JobSeekerMatchNotifications";
import { JobSeekerBenefitsAlert } from "@/components/JobSeekerBenefitsAlert";
import { SkillGapAnalysis } from "@/components/SkillGapAnalysis";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const { 
    settings: whatsappSettings,
    isLoading: isWhatsappLoading,
    updateSettings: updateWhatsappSettings,
    isPendingUpdate: isUpdatingWhatsapp,
    sendVerification: sendWhatsappVerification,
    isVerifying: isVerifyingWhatsapp
  } = useWhatsApp();

  const { data: userCVs, isLoading: isCVsLoading } = useQuery<CV[], Error>({
    queryKey: ["/api/cvs"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: profileData, isLoading: isProfileLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Update local state when WhatsApp settings are loaded
  React.useEffect(() => {
    if (whatsappSettings) {
      setWhatsappEnabled(whatsappSettings.enabled);
      setPhoneNumber(whatsappSettings.phoneNumber || "");
    }
  }, [whatsappSettings]);
  
  // Handle WhatsApp settings form submission
  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsappSettings({
      enabled: whatsappEnabled,
      phoneNumber: phoneNumber.trim()
    });
  };
  
  // Handle verification request
  const handleSendVerification = () => {
    if (phoneNumber) {
      sendWhatsappVerification(phoneNumber);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Hire Mzansi - South African CV Optimization</title>
        <meta name="description" content="Manage your CVs, view ATS scores, and access premium South African job market optimization tools." />
      </Helmet>
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Show welcome banner for new users with no CVs */}
        {userCVs && userCVs.length === 0 && (
          <WelcomeBanner 
            userName={user?.name || user?.email?.split('@')[0]}
            emailVerified={true}
          />
        )}
        
        {/* Removed daily motivation feature as requested */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
        </div>

        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid md:grid-cols-6 grid-cols-3 gap-2 h-auto">
            <TabsTrigger value="overview" className="px-4 py-2">
              <PieChart className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cvs" className="px-4 py-2">
              <FileText className="mr-2 h-4 w-4" />
              My CVs
            </TabsTrigger>
            <TabsTrigger value="ats-keywords" className="px-4 py-2">
              <Search className="mr-2 h-4 w-4" />
              ATS Keywords
            </TabsTrigger>
            <TabsTrigger value="cv-editor" className="px-4 py-2">
              <Edit className="mr-2 h-4 w-4" />
              CV Editor
            </TabsTrigger>
            <TabsTrigger value="skill-gap-analysis" className="px-4 py-2">
              <Target className="mr-2 h-4 w-4" />
              Skill Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="job-matches" className="px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Job Matches
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-4 py-2">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="profile" className="px-4 py-2">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="px-4 py-2">
              <Award className="mr-2 h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <JobSeekerBenefitsAlert />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CV Score</CardTitle>
                  <CardDescription>Latest ATS score</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="ats-score-display mx-auto" style={{"--score-percentage": "73%"} as any}>
                    <div className="flex justify-center items-center h-full">
                      <span className="ats-score-text text-4xl font-bold">73%</span>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/cv/latest">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CV Analysis</CardTitle>
                  <CardDescription>Score breakdown</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Skills Match</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-brand-blue h-full rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Formatting</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-brand-green h-full rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SA Context</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-full rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/cv/latest">
                        Detailed Analysis
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Activity</CardTitle>
                  <CardDescription>Recent actions</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-brand-blue-light text-brand-blue">
                        <CloudUpload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">CV Uploaded</p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Just now
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-brand-green-light text-brand-green">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">ATS Analysis Completed</p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          5 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange-light text-brand-orange">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profile Updated</p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>South African CV Optimization Tips</CardTitle>
                <CardDescription>
                  Recommendations for the local job market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium flex items-center mb-2">
                      <Award className="text-yellow-500 mr-2 h-5 w-5" />
                      Add B-BBEE Status
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Including your B-BBEE status enhances your CV for South African employers who prioritize employment equity.
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile">Update Profile</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium flex items-center mb-2">
                      <Award className="text-yellow-500 mr-2 h-5 w-5" />
                      Add NQF Level Information
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Specifying your NQF level for qualifications helps employers understand your education level within the South African framework.
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile">Update Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cvs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My CVs</CardTitle>
                <CardDescription>Manage your uploaded CVs</CardDescription>
              </CardHeader>
              <CardContent>
                {isCVsLoading ? (
                  <div className="text-center py-8">
                    <div className="spinner border-4 border-primary border-t-transparent h-12 w-12 rounded-full mx-auto animate-spin"></div>
                    <p className="mt-4 text-muted-foreground">Loading your CVs...</p>
                  </div>
                ) : userCVs && userCVs.length > 0 ? (
                  <div className="space-y-4">
                    {userCVs.map((cv) => (
                      <div key={cv.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                        <div className="mb-4 md:mb-0">
                          <h3 className="font-medium text-lg">{cv.title || cv.fileName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {typeof cv.createdAt === 'string' ? new Date(cv.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {cv.targetPosition && (
                            <p className="text-sm">Target: {cv.targetPosition}</p>
                          )}
                          {cv.isDefault && (
                            <span className="inline-block mt-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                              Default CV
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/cv/${cv.id}`}>View Analysis</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="mt-4 font-medium">No CVs Found</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't uploaded any CVs yet.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/#upload">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Your First CV
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ats-keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  ATS Keywords Analysis
                </CardTitle>
                <CardDescription>
                  Analyze your CV against job descriptions to find missing keywords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Get detailed insights on how to optimize your CV for Applicant Tracking Systems (ATS) 
                    with our premium keywords analysis tool.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild>
                      <Link href="/tools/ats-keywords">
                        <Search className="mr-2 h-4 w-4" />
                        Start ATS Analysis
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/premium-tools">
                        View All Premium Tools
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv-editor" className="space-y-6">
            <CVEditor />
          </TabsContent>
          
          <TabsContent value="skill-gap-analysis" className="space-y-6">
            <SkillGapAnalysis />
          </TabsContent>

          {/* Job Matches Tab */}
          <TabsContent value="job-matches" className="space-y-6">
            <JobMatchingDashboard />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <JobSeekerMatchNotifications />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Section */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-muted-foreground">
                        {user.name || user.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Free Plan</h3>
                  <p className="text-muted-foreground mb-4">
                    You're currently on the free plan. Upgrade for advanced features.
                  </p>
                  <Button asChild>
                    <Link href="/pricing">
                      Upgrade to Premium
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
