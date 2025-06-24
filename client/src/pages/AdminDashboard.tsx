import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Eye,
  Trash2,
  Download,
  LogOut
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCVs: number;
  premiumUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isPremium: boolean;
}

interface AdminCV {
  id: number;
  fileName: string;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  analysisStatus: string;
}

const AdminDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLocation('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setLocation('/admin/login');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setLocation('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [setLocation]);
  
  // Custom query function for admin requests
  const adminQuery = async (url: string) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setLocation('/admin/login');
        throw new Error('Authentication expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };
  
  // Fetch admin dashboard stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: () => adminQuery('/api/admin/stats'),
    enabled: !!adminUser,
  });
  
  // Fetch users for management
  const { data: usersData, isLoading: isUsersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => adminQuery('/api/admin/users'),
    enabled: !!adminUser && activeTab === 'users',
  });
  
  // Fetch CVs for management
  const { data: cvsData, isLoading: isCvsLoading } = useQuery<AdminCV[]>({
    queryKey: ['/api/admin/cvs'],
    queryFn: () => adminQuery('/api/admin/cvs'),
    enabled: !!adminUser && activeTab === 'cvs',
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setLocation('/admin/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Hire Mzansi</title>
        <meta name="description" content="Admin dashboard for Hire Mzansi platform management" />
      </Helmet>

      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your Hire Mzansi platform</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                Logged in as <span className="font-semibold ml-1">{adminUser.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cvs">CVs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isStatsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statsData?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Platform registered users
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statsData?.activeUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Users active this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statsData?.totalCVs || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        CVs uploaded and analyzed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statsData?.premiumUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Active premium subscriptions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">R{statsData?.totalRevenue || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        All-time revenue
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">R{statsData?.monthlyRevenue || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        This month's revenue
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage platform users and their access levels</CardDescription>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {usersData?.length ? (
                        usersData.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge variant={user.isPremium ? "default" : "secondary"}>
                                {user.isPremium ? "Premium" : "Free"}
                              </Badge>
                              <Badge variant="outline">{user.role}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" disabled={user.role === 'admin'}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No users found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cvs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CV Management</CardTitle>
                  <CardDescription>View and manage uploaded CVs</CardDescription>
                </CardHeader>
                <CardContent>
                  {isCvsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cvsData?.length ? (
                        cvsData.map((cv) => (
                          <div key={cv.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{cv.fileName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {cv.userEmail} • {new Date(cv.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{cv.analysisStatus}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No CVs found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Settings management is currently under development. Contact the development team for configuration changes.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;