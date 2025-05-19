import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

// Define types for admin dashboard data
interface AdminStats {
  userCount: number;
  activeUserCount: number;
  cvCount: number;
  atsCount: number;
  subscriptionCount: number;
  avgScore: number;
  latestUsers: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  latestCVs: Array<{
    id: number;
    fileName: string;
    createdAt: string;
  }>;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminCV {
  id: number;
  fileName: string;
  userId: number;
  username: string;
  score: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch admin dashboard stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Fetch users for management
  const { data: usersData, isLoading: isUsersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin' && activeTab === 'users',
  });
  
  // Fetch CVs for management
  const { data: cvsData, isLoading: isCvsLoading } = useQuery<AdminCV[]>({
    queryKey: ['/api/admin/cvs'],
    enabled: !!user && user.role === 'admin' && activeTab === 'cvs',
  });

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
            </div>

            <div className="md:col-span-3">
              {activeTab === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>Key platform statistics and metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isStatsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : statsData ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <Card className="bg-primary/5">
                            <CardContent className="p-4 text-center">
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h3>
                              <p className="text-3xl font-bold">{statsData.userCount || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {statsData.activeUserCount || 0} active in last 30 days
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-primary/5">
                            <CardContent className="p-4 text-center">
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">CVs Analyzed</h3>
                              <p className="text-3xl font-bold">{statsData.cvCount || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {statsData.atsCount || 0} ATS analysis reports
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-primary/5">
                            <CardContent className="p-4 text-center">
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Paid Subscriptions</h3>
                              <p className="text-3xl font-bold">{statsData.subscriptionCount || 0}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {statsData.avgScore || 0}% average ATS score
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-muted-foreground">Could not load admin statistics</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                          Retry
                        </Button>
                      </div>
                    )}
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
                    {isUsersLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : usersData ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2">Username</th>
                              <th className="text-left py-3 px-2">Email</th>
                              <th className="text-left py-3 px-2">Role</th>
                              <th className="text-left py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(usersData) && usersData.length > 0 ? (
                              usersData.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-2 font-medium">{user.username}</td>
                                  <td className="py-3 px-2">{user.email || 'N/A'}</td>
                                  <td className="py-3 px-2">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                      user.role === 'admin' 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'bg-primary/20 text-primary'
                                    }`}>
                                      {user.role || 'user'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                  No users found or insufficient permissions
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-muted-foreground">Could not load user data</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                          Retry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'cvs' && (
                <Card>
                  <CardHeader>
                    <CardTitle>CV Management</CardTitle>
                    <CardDescription>Manage uploaded CVs and analysis reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCvsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : cvsData ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2">Filename</th>
                              <th className="text-left py-3 px-2">User</th>
                              <th className="text-left py-3 px-2">Score</th>
                              <th className="text-left py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cvsData.map((cv) => (
                              <tr key={cv.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2 font-medium truncate max-w-[200px]">{cv.fileName}</td>
                                <td className="py-3 px-2">{cv.username || `User ${cv.userId}`}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                    cv.score > 70
                                      ? 'bg-green-100 text-green-800'
                                      : cv.score > 40
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {cv.score}%
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <Button variant="outline" size="sm">View</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-muted-foreground">Could not load CV data</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                          Retry
                        </Button>
                      </div>
                    )}
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
                        <h3 className="text-lg font-medium mb-4">ATS Analysis Settings</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure the weights for different components of ATS score analysis
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-1">
                                Keywords Weight (40%)
                              </label>
                              <input 
                                type="range" 
                                min="20" 
                                max="60" 
                                step="5"
                                defaultValue="40"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium block mb-1">
                                Format Weight (40%)
                              </label>
                              <input 
                                type="range" 
                                min="20" 
                                max="60"
                                step="5" 
                                defaultValue="40"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="text-sm font-medium block mb-1">
                              South African Context Weight (20%)
                            </label>
                            <input 
                              type="range" 
                              min="5" 
                              max="30"
                              step="5" 
                              defaultValue="20"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button>Save Analysis Settings</Button>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">South African Context Settings</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure how South African specific elements are detected and scored
                          </p>
                          <Button>Configure SA Context Detection</Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Subscription Plans</h3>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-4">
                            Manage subscription plans and pricing
                          </p>
                          <Button>Manage Plans</Button>
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
                    <CardDescription>Manage payment settings and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-center text-muted-foreground py-4">
                        Payment management functionality coming soon
                      </p>
                    </div>
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