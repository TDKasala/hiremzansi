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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-3">Latest Users</h3>
                            {statsData.latestUsers && statsData.latestUsers.length > 0 ? (
                              <ul className="space-y-2">
                                {statsData.latestUsers.map((user) => (
                                  <li key={user.id} className="p-3 bg-muted/50 rounded-md text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-primary font-medium">{user.username}</span>
                                      <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                                        {user.role}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No users found</p>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-3">Latest CV Uploads</h3>
                            {statsData.latestCVs && statsData.latestCVs.length > 0 ? (
                              <ul className="space-y-2">
                                {statsData.latestCVs.map((cv) => (
                                  <li key={cv.id} className="p-3 bg-muted/50 rounded-md text-sm">
                                    <div className="flex justify-between items-start">
                                      <span className="font-medium truncate">{cv.fileName}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2"
                                        onClick={() => window.open(`/cv/${cv.id}`, '_blank')}
                                      >
                                        View
                                      </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Uploaded: {new Date(cv.createdAt).toLocaleDateString()}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No CVs found</p>
                            )}
                          </div>
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
                              <th className="text-left py-3 px-2">Status</th>
                              <th className="text-left py-3 px-2">Created</th>
                              <th className="text-left py-3 px-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersData && usersData.length > 0 ? (
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
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                      user.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {user.isActive ? 'active' : 'inactive'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-sm text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-2">
                                    <div className="flex space-x-2">
                                      <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                                      {user.role !== 'admin' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                                        >
                                          Make Admin
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                  No users found
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
                    <CardDescription>Manage uploaded CVs and analysis results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCvsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : cvsData && cvsData.length > 0 ? (
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
                            {cvsData.map((cv) => (
                              <tr key={cv.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2">{cv.id}</td>
                                <td className="py-3 px-2 font-medium">{cv.fileName}</td>
                                <td className="py-3 px-2">{cv.username}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    cv.score > 70 
                                      ? 'bg-green-100 text-green-800' 
                                      : cv.score > 40 
                                        ? 'bg-amber-100 text-amber-800' 
                                        : 'bg-red-100 text-red-800'
                                  }`}>
                                    {cv.score}%
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                  {new Date(cv.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => window.open(`/cv/${cv.id}`, '_blank')}
                                    >
                                      View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No CVs found</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                          Refresh
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
                  <CardContent className="pb-6">
                    <Tabs defaultValue="ai-settings">
                      <TabsList className="mb-4">
                        <TabsTrigger value="ai-settings">ATS Analysis</TabsTrigger>
                        <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="site">Site Settings</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                      </TabsList>
                    
                      <TabsContent value="ai-settings" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">ATS Score Analysis Weights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card className="p-4">
                              <h4 className="font-medium">Keywords Weight</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                How much importance to give to keywords matching
                              </p>
                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">
                                    Importance factor
                                  </label>
                                  <span className="font-medium text-amber-600">40%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="20" 
                                  max="60" 
                                  step="5"
                                  defaultValue="40"
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                />
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium">Format Weight</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                How much importance to give to CV formatting
                              </p>
                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">
                                    Importance factor
                                  </label>
                                  <span className="font-medium text-amber-600">40%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="20" 
                                  max="60"
                                  step="5" 
                                  defaultValue="40"
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                />
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium">SA Context Weight</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Importance of South African contextual elements
                              </p>
                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">
                                    Importance factor
                                  </label>
                                  <span className="font-medium text-amber-600">20%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="5" 
                                  max="30"
                                  step="5" 
                                  defaultValue="20"
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                />
                              </div>
                            </Card>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-4">South African Context Settings</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card className="p-4">
                              <h4 className="font-medium">B-BBEE Detection</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Configure how B-BBEE mentions are scored
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Points per mention</label>
                                    <span className="font-medium text-amber-600">10</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="5" 
                                    max="15"
                                    step="1" 
                                    defaultValue="10"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Maximum score</label>
                                    <span className="font-medium text-amber-600">20</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="10" 
                                    max="30"
                                    step="5" 
                                    defaultValue="20"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                  />
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium">NQF Level Detection</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                Configure how NQF level mentions are scored
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Points per mention</label>
                                    <span className="font-medium text-amber-600">5</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="1" 
                                    max="10"
                                    step="1" 
                                    defaultValue="5"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Maximum score</label>
                                    <span className="font-medium text-amber-600">10</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="5" 
                                    max="20"
                                    step="5" 
                                    defaultValue="10"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                                  />
                                </div>
                              </div>
                            </Card>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button>Save ATS Analysis Settings</Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="plans" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Subscription Plans</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                            <Card className="p-5 border-primary">
                              <div className="mb-4">
                                <h4 className="text-lg font-medium">Basic Plan</h4>
                                <p className="text-sm text-muted-foreground">Entry level subscription</p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Price (ZAR)
                                  </label>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-l-md border-gray-300">
                                      R
                                    </span>
                                    <input 
                                      type="number" 
                                      defaultValue="30"
                                      className="flex-1 rounded-none rounded-r-lg bg-white border border-gray-300 p-2 focus:ring-primary"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Monthly scan limit
                                  </label>
                                  <input 
                                    type="number" 
                                    defaultValue="5"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Features (comma separated)
                                  </label>
                                  <textarea 
                                    defaultValue="Basic ATS Score, Format Analysis, 5 Scans/Month"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="basic-active" defaultChecked />
                                    <label 
                                      htmlFor="basic-active"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Active
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-5 border-amber-500 relative bg-amber-50/50">
                              <div className="absolute -top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                              </div>
                              <div className="mb-4">
                                <h4 className="text-lg font-medium">Standard Plan</h4>
                                <p className="text-sm text-muted-foreground">Most popular option</p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Price (ZAR)
                                  </label>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-l-md border-gray-300">
                                      R
                                    </span>
                                    <input 
                                      type="number" 
                                      defaultValue="100"
                                      className="flex-1 rounded-none rounded-r-lg bg-white border border-gray-300 p-2 focus:ring-primary"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Monthly scan limit
                                  </label>
                                  <input 
                                    type="number" 
                                    defaultValue="15"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Features (comma separated)
                                  </label>
                                  <textarea 
                                    defaultValue="Full ATS Score, Detailed Format Analysis, Skills Gap Analysis, 15 Scans/Month, SA Context Analysis"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="standard-active" defaultChecked />
                                    <label 
                                      htmlFor="standard-active"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Active
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-5 border-primary">
                              <div className="mb-4">
                                <h4 className="text-lg font-medium">Premium Plan</h4>
                                <p className="text-sm text-muted-foreground">Full featured premium package</p>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Price (ZAR)
                                  </label>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-l-md border-gray-300">
                                      R
                                    </span>
                                    <input 
                                      type="number" 
                                      defaultValue="200"
                                      className="flex-1 rounded-none rounded-r-lg bg-white border border-gray-300 p-2 focus:ring-primary"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Monthly scan limit
                                  </label>
                                  <input 
                                    type="number" 
                                    defaultValue="50"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Features (comma separated)
                                  </label>
                                  <textarea 
                                    defaultValue="Full ATS Score, Advanced Format Analysis, Skills Gap Analysis, Interview Training, 50 Scans/Month, SA Context Analysis, Premium Support"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="pt-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="premium-active" defaultChecked />
                                    <label 
                                      htmlFor="premium-active"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Active
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button>Save Subscription Plans</Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="notifications" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">Email Notifications</CardTitle>
                              <CardDescription>Configure system email notifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div>
                                    <h4 className="font-medium">Welcome Email</h4>
                                    <p className="text-sm text-muted-foreground">Sent when a user creates a new account</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Preview</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Switch defaultChecked />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div>
                                    <h4 className="font-medium">CV Analysis Complete</h4>
                                    <p className="text-sm text-muted-foreground">Sent when CV analysis is complete</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Preview</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Switch defaultChecked />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div>
                                    <h4 className="font-medium">Subscription Confirmation</h4>
                                    <p className="text-sm text-muted-foreground">Sent when a user subscribes to a plan</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Preview</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Switch defaultChecked />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div>
                                    <h4 className="font-medium">Subscription Renewal Reminder</h4>
                                    <p className="text-sm text-muted-foreground">Sent 3 days before subscription renewal</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Preview</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Switch defaultChecked />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">Password Reset</h4>
                                    <p className="text-sm text-muted-foreground">Sent when a user requests password reset</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Preview</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Switch defaultChecked />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">WhatsApp Notifications</CardTitle>
                              <CardDescription>Configure WhatsApp Business integration</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">WhatsApp Business Integration</h4>
                                    <Switch />
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Enable WhatsApp notifications for users who opt-in
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="text-sm font-medium block mb-1">
                                      WhatsApp Business API Token
                                    </label>
                                    <input 
                                      type="password"
                                      placeholder="Enter WhatsApp Business API Token" 
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium block mb-1">
                                      WhatsApp Business Phone Number
                                    </label>
                                    <input 
                                      type="text"
                                      placeholder="+27XXXXXXXXX" 
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Active Notifications</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox id="whatsapp-cv-analysis" defaultChecked />
                                        <label 
                                          htmlFor="whatsapp-cv-analysis"
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          CV Analysis Complete
                                        </label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox id="whatsapp-subscription" defaultChecked />
                                        <label 
                                          htmlFor="whatsapp-subscription"
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          Subscription Confirmation
                                        </label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox id="whatsapp-reminder" />
                                        <label 
                                          htmlFor="whatsapp-reminder"
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          Renewal Reminder
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-end">
                            <Button>Save Notification Settings</Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="site" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Site Configuration</h3>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">General Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Site Name
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="ATSBoost"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Primary Domain
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="atsboost.co.za"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Support Email
                                  </label>
                                  <input 
                                    type="email" 
                                    defaultValue="support@atsboost.co.za"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Contact Phone
                                  </label>
                                  <input 
                                    type="tel" 
                                    defaultValue="+27 XXXX XXXX"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">Social Media Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Twitter/X Handle
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="@supportatsboost"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    LinkedIn URL
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="https://linkedin.com/company/atsboost"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Facebook URL
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="https://facebook.com/atsboost"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    WhatsApp Contact
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue="+27 XXXX XXXX"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">Pre-Launch Banner</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium">Enable Pre-Launch Banner</h4>
                                  <Switch defaultChecked />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Banner Text
                                  </label>
                                  <textarea 
                                    defaultValue="🚀 We're launching soon! Join our waitlist for early access and exclusive benefits!"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={2}
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Launch Date
                                  </label>
                                  <input 
                                    type="date" 
                                    defaultValue="2025-06-30"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-end">
                            <Button>Save Site Settings</Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="system" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">System Settings</h3>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">Maintenance Mode</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">Enable Maintenance Mode</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Site will display a maintenance message to all non-admin users
                                    </p>
                                  </div>
                                  <Switch />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Maintenance Message
                                  </label>
                                  <textarea 
                                    defaultValue="We're currently performing scheduled maintenance to improve your experience. Please check back shortly."
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-1">
                                    Expected Completion
                                  </label>
                                  <input 
                                    type="datetime-local"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">Database Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="bg-muted/50 p-4 rounded-md mb-4">
                                  <h4 className="font-medium mb-2">Database Status</h4>
                                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <div>Connection Status:</div>
                                    <div className="flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                                      <span className="font-medium">Connected</span>
                                    </div>
                                    
                                    <div>Database Size:</div>
                                    <div className="font-medium">9.4 MB</div>
                                    
                                    <div>Active Connections:</div>
                                    <div className="font-medium">5</div>
                                    
                                    <div>PostgreSQL Version:</div>
                                    <div className="font-medium">16.8</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Backup & Maintenance</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <Button variant="outline" className="justify-start">
                                        <span className="mr-2">🔄</span> Run Health Check
                                      </Button>
                                      <Button variant="outline" className="justify-start">
                                        <span className="mr-2">📦</span> Backup Database
                                      </Button>
                                      <Button variant="outline" className="justify-start">
                                        <span className="mr-2">⚡</span> Optimize Database
                                      </Button>
                                      <Button variant="outline" className="justify-start text-amber-600">
                                        <span className="mr-2">🧹</span> Clear Expired Sessions
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="mb-6">
                            <CardHeader>
                              <CardTitle className="text-base">API Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Payment Gateway</h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <select className="flex-1 p-2 border border-gray-300 rounded-md">
                                      <option value="payfast">PayFast</option>
                                      <option value="paygate">PayGate</option>
                                      <option value="peach">Peach Payments</option>
                                    </select>
                                    <Button variant="outline" size="sm">Configure</Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">AI Service</h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <select className="flex-1 p-2 border border-gray-300 rounded-md">
                                      <option value="local">Local AI Model</option>
                                      <option value="openai">OpenAI</option>
                                      <option value="anthropic">Anthropic Claude</option>
                                      <option value="minimax">MiniMax</option>
                                    </select>
                                    <Button variant="outline" size="sm">Configure</Button>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Email Service</h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <select className="flex-1 p-2 border border-gray-300 rounded-md">
                                      <option value="sendgrid">SendGrid</option>
                                      <option value="mailgun">Mailgun</option>
                                      <option value="ses">Amazon SES</option>
                                      <option value="smtp">Custom SMTP</option>
                                    </select>
                                    <Button variant="outline" size="sm">Configure</Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-end">
                            <Button>Save System Settings</Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
                      
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