import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmailPreferences from '@/components/EmailPreferences';
import { Loader2, ArrowLeft, Bell, Mail, Shield, User } from 'lucide-react';

const SettingsPage = () => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If not logged in, redirect to auth page
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via effect
  }

  return (
    <>
      <Helmet>
        <title>Account Settings | ATSBoost</title>
        <meta name="description" content="Manage your account settings, notifications, and email preferences on ATSBoost - the South African CV optimization platform." />
      </Helmet>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-primary transition mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="email" className="w-full" orientation="vertical">
                  <TabsList className="flex flex-col items-start p-0 bg-transparent border-r h-full">
                    <TabsTrigger 
                      value="profile" 
                      className="w-full justify-start py-2 px-4 data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger 
                      value="email" 
                      className="w-full justify-start py-2 px-4 data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="w-full justify-start py-2 px-4 data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="privacy" 
                      className="w-full justify-start py-2 px-4 data-[state=active]:border-l-2 data-[state=active]:border-primary rounded-none"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Tabs defaultValue="email" className="w-full">
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your personal information and public profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Profile settings will be implemented in a future update.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <EmailPreferences initialValue={user.receiveEmailDigest !== false} />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Control what notifications you receive</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Notification settings will be implemented in a future update.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences and data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Privacy settings will be implemented in a future update.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;