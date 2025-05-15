import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, User, Mail, Calendar, MapPin, ArrowLeft, ShieldCheck, Building, Clock, BarChart } from 'lucide-react';
import { Link, useLocation, Redirect } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Get SA profile if available
  const { 
    data: saProfile, 
    isLoading: profileLoading 
  } = useQuery({
    queryKey: ['/api/sa-profile'],
    enabled: !!user,
  });

  // If not authenticated, redirect to auth page
  if (!authLoading && !user) {
    return <Redirect to="/auth" />;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Helmet>
        <title>Your Profile | ATSBoost</title>
        <meta name="description" content="Manage your profile settings and information for South African job applications" />
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/dashboard")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user?.name || user?.username}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard">
                    <BarChart className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="sa">South African Context</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>
                    Update your personal information to enhance your CV analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Name</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {user?.name || user?.username || 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Email</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {user?.email || 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Joined</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Location</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {saProfile?.location || 'South Africa'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button size="sm">
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your password and account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                        <span>Password</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        <span>Email Verification</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Verified
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sa" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>South African Context</CardTitle>
                  <CardDescription>
                    Add specific South African details to improve your CV analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">B-BBEE Status</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {saProfile?.bbbeeLevel || 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Province</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {saProfile?.province || 'Not specified'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Availability</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {saProfile?.availability || 'Immediate'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Work Permit</span>
                      </div>
                      <div className="px-6 py-3 bg-muted rounded-md">
                        {saProfile?.workPermit ? 'Yes' : 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button>
                      Update SA Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive updates and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-updates" className="font-medium">
                          Email Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly tips to improve your CV
                        </p>
                      </div>
                      <Switch id="email-updates" defaultChecked={true} />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="job-matches" className="font-medium">
                          Job Match Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your CV matches a job posting
                        </p>
                      </div>
                      <Switch id="job-matches" defaultChecked={true} />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics" className="font-medium">
                          CV Analytics
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive performance reports for your CV
                        </p>
                      </div>
                      <Switch id="analytics" defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control how your information is used and shared
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profile-visibility" className="font-medium">
                          Profile Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow employers to view your profile
                        </p>
                      </div>
                      <Switch id="profile-visibility" defaultChecked={true} />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="data-collection" className="font-medium">
                          Data Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect usage data to improve services
                        </p>
                      </div>
                      <Switch id="data-collection" defaultChecked={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}