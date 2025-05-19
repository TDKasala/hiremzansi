import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  FileText,
  Settings,
  Shield,
  CreditCard,
  BarChart,
  AlertCircle,
  User,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive',
      });
    } else if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation, toast]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth');
        toast({
          title: 'Logged out',
          description: 'You have been logged out successfully',
        });
      },
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | ATSBoost</title>
        <meta name="description" content="Admin dashboard for ATSBoost platform management" />
      </Helmet>

      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your ATSBoost platform</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                Logged in as <span className="font-semibold ml-1">{user.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Admin Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setActiveTab('overview')}
                    >
                      <BarChart className="h-4 w-4 mr-2" />
                      Overview
                    </Button>
                    <Button 
                      variant={activeTab === 'users' ? 'default' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </Button>
                    <Button 
                      variant={activeTab === 'cvs' ? 'default' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setActiveTab('cvs')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CV Management
                    </Button>
                    <Button 
                      variant={activeTab === 'payments' ? 'default' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setActiveTab('payments')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payments
                    </Button>
                    <Button 
                      variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                      className="justify-start"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm flex items-center">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" className="justify-start" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                    <Button variant="outline" className="justify-start" size="sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      System Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              {activeTab === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>Key platform statistics and metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h3>
                          <p className="text-3xl font-bold">3</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">CVs Analyzed</h3>
                          <p className="text-3xl font-bold">18</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/5">
                        <CardContent className="p-4 text-center">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Paid Subscriptions</h3>
                          <p className="text-3xl font-bold">0</p>
                        </CardContent>
                      </Card>
                    </div>
                    <h3 className="font-medium mb-3">Recent Activity</h3>
                    <ul className="space-y-2">
                      <li className="p-3 bg-muted/50 rounded-md text-sm">
                        <span className="text-primary font-medium">deniskasala</span> uploaded a new CV
                        <div className="text-xs text-muted-foreground mt-0.5">2 minutes ago</div>
                      </li>
                      <li className="p-3 bg-muted/50 rounded-md text-sm">
                        <span className="text-primary font-medium">System</span> processed ATS analysis
                        <div className="text-xs text-muted-foreground mt-0.5">5 minutes ago</div>
                      </li>
                      <li className="p-3 bg-muted/50 rounded-md text-sm">
                        <span className="text-primary font-medium">deniskasala</span> was promoted to admin
                        <div className="text-xs text-muted-foreground mt-0.5">Just now</div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'users' && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Username</th>
                            <th className="text-left py-3 px-2">Email</th>
                            <th className="text-left py-3 px-2">Role</th>
                            <th className="text-left py-3 px-2">Status</th>
                            <th className="text-left py-3 px-2">Created</th>
                            <th className="text-left py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2 font-medium">deniskasala</td>
                            <td className="py-3 px-2">deniskasala@example.com</td>
                            <td className="py-3 px-2"><span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">admin</span></td>
                            <td className="py-3 px-2"><span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">active</span></td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">May 19, 2025</td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'cvs' && (
                <Card>
                  <CardHeader>
                    <CardTitle>CV Management</CardTitle>
                    <CardDescription>Manage uploaded CVs and analysis results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">ID</th>
                            <th className="text-left py-3 px-2">Filename</th>
                            <th className="text-left py-3 px-2">User</th>
                            <th className="text-left py-3 px-2">Score</th>
                            <th className="text-left py-3 px-2">Uploaded</th>
                            <th className="text-left py-3 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">40</td>
                            <td className="py-3 px-2 font-medium">cv_1747651541622.pdf</td>
                            <td className="py-3 px-2">deniskasala</td>
                            <td className="py-3 px-2">12%</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">May 19, 2025</td>
                            <td className="py-3 px-2">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Configure platform settings and defaults</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">AI Analysis Settings</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            The AI analysis settings control how the system evaluates CVs and generates recommendations.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Configure AI Settings
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">South African Market Settings</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Configure South African specific settings including B-BBEE detection, NQF levels, and other local requirements.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            SA Market Settings
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Subscription Plans</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Manage subscription plans, pricing, and available features.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Manage Plans
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'payments' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>Manage payments and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-12">
                      Payment management coming soon
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;