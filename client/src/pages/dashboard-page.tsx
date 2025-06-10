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
} from "lucide-react";
import { CV } from "@shared/schema";
import DeepAnalysisCard from "@/components/DeepAnalysisCard";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { JobMatchingDashboard } from "@/components/JobMatchingDashboard";
import { JobSeekerMatchNotifications } from "@/components/JobSeekerMatchNotifications";

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
        
        <MotivationalBanner 
          location="dashboard"
          cvCount={userCVs?.length || 0}
        />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link href="/upload">
                <CloudUpload className="mr-2 h-4 w-4" />
                Upload New CV
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/premium-tools">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Premium Tools
              </Link>
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid md:grid-cols-5 grid-cols-3 gap-2 h-auto">
            <TabsTrigger value="overview" className="px-4 py-2">
              <PieChart className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="cvs" className="px-4 py-2">
              <FileText className="mr-2 h-4 w-4" />
              My CVs
            </TabsTrigger>
            <TabsTrigger value="deep-analysis" className="px-4 py-2">
              <LineChart className="mr-2 h-4 w-4" />
              Deep Analysis
            </TabsTrigger>
            <TabsTrigger value="job-matches" className="px-4 py-2">
              <Target className="mr-2 h-4 w-4" />
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
                        <div className="bg-primary h-full rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Formatting</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SA Context</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
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
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
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
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
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
                      <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
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
          
          <TabsContent value="deep-analysis" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Deep Analysis Report */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ScrollText className="mr-2 h-5 w-5 text-primary" />
                  Deep Analysis Report
                </h2>
                
                {userCVs && userCVs.length > 0 ? (
                  <DeepAnalysisCard cv={userCVs[0]} />
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center">
                        <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No CV Available</h3>
                        <p className="text-muted-foreground mb-4">
                          Please upload a CV to get a detailed deep analysis report.
                        </p>
                        <Button asChild>
                          <Link href="/upload">
                            <CloudUpload className="mr-2 h-4 w-4" />
                            Upload CV
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Premium features preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                    Premium Features
                  </CardTitle>
                  <CardDescription>
                    Access additional tools tailored for the South African job market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Real-time CV Editor</h3>
                          <p className="text-sm text-muted-foreground">
                            Get AI-powered suggestions specific to the South African job market.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">B-BBEE Optimization</h3>
                          <p className="text-sm text-muted-foreground">
                            Enhance your CV with proper B-BBEE certification presentation.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Job Alert Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive SMS alerts when jobs matching your skills become available.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">South African Interview Prep</h3>
                          <p className="text-sm text-muted-foreground">
                            Practice with questions specific to South African employers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/premium-tools">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Access Premium Tools
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="job-matches" className="space-y-6">
            <JobMatchingDashboard cvId={userCVs?.[0]?.id} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>South African professional information</CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="text-center py-8">
                    <div className="spinner border-4 border-primary border-t-transparent h-12 w-12 rounded-full mx-auto animate-spin"></div>
                    <p className="mt-4 text-muted-foreground">Loading your profile...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={user?.name || ""}
                          readOnly
                          className="w-full p-2 border rounded-md bg-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          readOnly
                          className="w-full p-2 border rounded-md bg-muted"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">South African Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">B-BBEE Status</label>
                          <select
                            className="w-full p-2 border rounded-md"
                            defaultValue=""
                          >
                            <option value="" disabled>Select B-BBEE Level</option>
                            <option value="level-1">Level 1 Contributor</option>
                            <option value="level-2">Level 2 Contributor</option>
                            <option value="level-3">Level 3 Contributor</option>
                            <option value="level-4">Level 4 Contributor</option>
                            <option value="level-5">Level 5 Contributor</option>
                            <option value="level-6">Level 6 Contributor</option>
                            <option value="level-7">Level 7 Contributor</option>
                            <option value="level-8">Level 8 Contributor</option>
                            <option value="non-compliant">Non-Compliant</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Province</label>
                          <select
                            className="w-full p-2 border rounded-md"
                            defaultValue=""
                          >
                            <option value="" disabled>Select Province</option>
                            <option value="gauteng">Gauteng</option>
                            <option value="western-cape">Western Cape</option>
                            <option value="eastern-cape">Eastern Cape</option>
                            <option value="northern-cape">Northern Cape</option>
                            <option value="kwazulu-natal">KwaZulu-Natal</option>
                            <option value="free-state">Free State</option>
                            <option value="north-west">North West</option>
                            <option value="mpumalanga">Mpumalanga</option>
                            <option value="limpopo">Limpopo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">WhatsApp Notifications</h3>
                      <form onSubmit={handleWhatsappSubmit}>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="whatsapp-enabled"
                              className="mr-2"
                              checked={whatsappEnabled}
                              onChange={() => setWhatsappEnabled(!whatsappEnabled)}
                            />
                            <label htmlFor="whatsapp-enabled">
                              Enable WhatsApp notifications for job alerts and CV analysis
                            </label>
                          </div>
                          
                          {whatsappEnabled && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                WhatsApp Number (South African format)
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder="e.g. 0711234567"
                                  className="flex-1 p-2 border rounded-md"
                                />
                                {!whatsappSettings?.verified && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSendVerification}
                                    disabled={isVerifyingWhatsapp}
                                  >
                                    {isVerifyingWhatsapp ? "Sending..." : "Verify"}
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                We'll send a verification code to this number
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-2">
                            <Button 
                              type="submit" 
                              disabled={isUpdatingWhatsapp}
                            >
                              {isUpdatingWhatsapp ? "Saving..." : "Save Settings"}
                            </Button>
                          </div>
                        </div>
                        
                        {whatsappSettings?.verified && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 text-sm mt-4">
                            <div className="flex items-center">
                              <div className="mr-2 text-green-500">✓</div>
                              <span>Your WhatsApp number has been verified</span>
                            </div>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>
                  Manage your Hire Mzansi subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border border-primary/30 rounded-lg bg-primary/5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Award className="text-primary mr-2 h-5 w-5" />
                          Free Plan
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Basic ATS scanning with limited features
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Button asChild>
                          <Link href="/premium-tools">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Available Plans</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">Deep Analysis</h3>
                          <p className="text-sm text-muted-foreground">
                            ZAR 30.00 per CV
                          </p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li className="flex items-center">
                              <span className="text-primary mr-2">✓</span>
                              South African market optimization
                            </li>
                            <li className="flex items-center">
                              <span className="text-primary mr-2">✓</span>
                              B-BBEE presentation suggestions
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button variant="outline" asChild>
                            <Link href="/deep-analysis">
                              Get Deep Analysis
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">Premium Monthly</h3>
                          <p className="text-sm text-muted-foreground">
                            ZAR 185.00 per month
                          </p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li className="flex items-center">
                              <span className="text-primary mr-2">✓</span>
                              Unlimited CV analyses
                            </li>
                            <li className="flex items-center">
                              <span className="text-primary mr-2">✓</span>
                              Real-time CV editor
                            </li>
                            <li className="flex items-center">
                              <span className="text-primary mr-2">✓</span>
                              Job alert notifications
                            </li>
                          </ul>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button variant="outline" asChild>
                            <Link href="/premium-tools">
                              Subscribe
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}