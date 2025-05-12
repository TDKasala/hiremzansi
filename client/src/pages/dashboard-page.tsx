import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
} from "lucide-react";
import { CV } from "@shared/schema";

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
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.username}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/#upload">
              <CloudUpload className="mr-2 h-4 w-4" />
              Upload New CV
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
        <TabsList className="grid md:grid-cols-4 grid-cols-2 gap-2 h-auto">
          <TabsTrigger value="overview" className="px-4 py-2">
            <PieChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cvs" className="px-4 py-2">
            <FileText className="mr-2 h-4 w-4" />
            My CVs
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
                      <span className="font-medium">82%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "82%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SA Context</span>
                      <span className="font-medium">70%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/deep-analysis">
                      Get Deep Analysis
                      <BarChart3 className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <CloudUpload className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">CV Uploaded</p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <PieChart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Score Generated</p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Profile Updated</p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        3 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
              <CardDescription>Based on your latest CV analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold flex items-center">
                    <Award className="text-yellow-500 mr-2 h-5 w-5" />
                    Add B-BBEE Status
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Including your B-BBEE level can increase your visibility for positions with employment equity considerations in South Africa.
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">Update Profile</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold flex items-center">
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
                          Uploaded on {new Date(cv.createdAt).toLocaleDateString()}
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
              ) : profileData ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Account Information</h3>
                      <dl className="space-y-2">
                        <div className="flex items-center">
                          <dt className="font-medium w-32">Username:</dt>
                          <dd>{user?.username}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">Email:</dt>
                          <dd>{user?.email}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">Full Name:</dt>
                          <dd>{user?.name || "-"}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">South African Context</h3>
                      <dl className="space-y-2">
                        <div className="flex items-center">
                          <dt className="font-medium w-32">Province:</dt>
                          <dd>{profileData.profile?.province || "-"}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">City:</dt>
                          <dd>{profileData.profile?.city || "-"}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">B-BBEE Status:</dt>
                          <dd>{profileData.profile?.bbbeeStatus || "-"}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">B-BBEE Level:</dt>
                          <dd>{profileData.profile?.bbbeeLevel || "-"}</dd>
                        </div>
                        <div className="flex items-center">
                          <dt className="font-medium w-32">NQF Level:</dt>
                          <dd>{profileData.profile?.nqfLevel || "-"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Professional Preferences</h3>
                    <dl className="space-y-2">
                      <div className="flex">
                        <dt className="font-medium w-32">Languages:</dt>
                        <dd>
                          {profileData.profile?.preferredLanguages?.length > 0 
                            ? profileData.profile.preferredLanguages.join(", ") 
                            : "-"
                          }
                        </dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium w-32">Industries:</dt>
                        <dd>
                          {profileData.profile?.industries?.length > 0 
                            ? profileData.profile.industries.join(", ") 
                            : "-"
                          }
                        </dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium w-32">Job Types:</dt>
                        <dd>
                          {profileData.profile?.jobTypes?.length > 0 
                            ? profileData.profile.jobTypes.join(", ") 
                            : "-"
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href="/profile/edit">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="mt-4 font-medium">Profile Not Found</h3>
                  <p className="text-muted-foreground mt-1">
                    Something went wrong loading your profile.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/profile/edit">
                      <Settings className="h-4 w-4 mr-2" />
                      Set Up Profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your ATSBoost subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="text-center py-8">
                  <div className="spinner border-4 border-primary border-t-transparent h-12 w-12 rounded-full mx-auto animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="mt-4 text-lg font-medium">Free Tier</h3>
                  <p className="text-muted-foreground mt-1">
                    You're currently on the free tier plan
                  </p>
                  <div className="mt-6">
                    <h4 className="font-medium">Features:</h4>
                    <ul className="mt-2 space-y-2 text-left max-w-xs mx-auto">
                      <li className="flex items-baseline">
                        <div className="mr-2 text-primary">✓</div>
                        <span>Basic ATS score analysis</span>
                      </li>
                      <li className="flex items-baseline">
                        <div className="mr-2 text-primary">✓</div>
                        <span>Upload up to 3 CVs</span>
                      </li>
                      <li className="flex items-baseline">
                        <div className="mr-2 text-primary">✓</div>
                        <span>Basic improvement recommendations</span>
                      </li>
                    </ul>
                  </div>
                  <Button className="mt-6" asChild>
                    <Link href="/pricing">
                      Upgrade to Premium
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deep Analysis</CardTitle>
                <CardDescription>One-time analysis - ZAR 30</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Get a comprehensive one-time analysis of your CV:</p>
                  <ul className="space-y-2">
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>Detailed PDF report</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>Advanced keyword analysis</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>South African context recommendations</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>WhatsApp notifications</span>
                    </li>
                  </ul>
                  <form action="/api/create-payfast-payment" method="post" className="mt-6">
                    <input type="hidden" name="plan_type" value="deep_analysis" />
                    <input type="hidden" name="amount" value="30" />
                    <Button type="submit" className="w-full">Purchase Analysis</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Premium Subscription</CardTitle>
                <CardDescription>ZAR 100/month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Get unlimited access to all ATSBoost features:</p>
                  <ul className="space-y-2">
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>Real-time CV editor</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>Multiple CV versions</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>Regional job matching</span>
                    </li>
                    <li className="flex items-baseline">
                      <div className="mr-2 text-primary">✓</div>
                      <span>WhatsApp job alerts</span>
                    </li>
                  </ul>
                  <form action="/api/create-payfast-subscription" method="post" className="mt-6">
                    <input type="hidden" name="plan_type" value="premium" />
                    <input type="hidden" name="amount" value="100" />
                    <Button type="submit" className="w-full">Subscribe Monthly</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Notifications</CardTitle>
              <CardDescription>Get alerts and updates via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {isWhatsappLoading ? (
                <div className="text-center py-8">
                  <div className="spinner border-4 border-primary border-t-transparent h-12 w-12 rounded-full mx-auto animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading WhatsApp settings...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your South African phone number to receive CV analysis results, job alerts, 
                    and subscription updates via WhatsApp.
                  </p>
                  
                  <form onSubmit={handleWhatsappSubmit} className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="enable-whatsapp" 
                        checked={whatsappEnabled}
                        onChange={(e) => setWhatsappEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor="enable-whatsapp" className="text-sm font-medium">
                        Enable WhatsApp notifications
                      </label>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                          +27
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="82 123 4567" 
                          className="flex-1 rounded-r-md border border-gray-300 py-2 px-3 text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Enter your number without the leading zero (e.g., 82 123 4567)</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isUpdatingWhatsapp}
                      >
                        {isUpdatingWhatsapp ? (
                          <>
                            <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                            Saving...
                          </>
                        ) : "Save Settings"}
                      </Button>
                      
                      {whatsappSettings?.phoneNumber && !whatsappSettings.verified && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleSendVerification}
                          disabled={isVerifyingWhatsapp}
                          className="whitespace-nowrap"
                        >
                          {isVerifyingWhatsapp ? (
                            <>
                              <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Verifying...
                            </>
                          ) : "Verify Number"}
                        </Button>
                      )}
                    </div>
                    
                    {whatsappSettings?.verified && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 text-sm">
                        <div className="flex items-center">
                          <div className="mr-2 text-green-500">✓</div>
                          <span>Your WhatsApp number has been verified</span>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}