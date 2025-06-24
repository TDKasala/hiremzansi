import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  LogOut,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  Server,
  Settings,
  Mail,
  Bell,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  username?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isPremium: boolean;
  isActive: boolean;
  emailVerified: boolean;
  subscriptionStatus?: string;
  totalCVs?: number;
}

interface AdminCV {
  id: number;
  fileName: string;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
  analysisStatus: string;
  fileSize?: number;
  atsScore?: number;
  saScore?: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: boolean;
  aiService: boolean;
  emailService: boolean;
  storage: boolean;
  uptime: string;
  responseTime: number;
}

interface ActivityLog {
  id: number;
  action: string;
  userId?: number;
  userEmail?: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

const AdminDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [cvSearchQuery, setCvSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedCV, setSelectedCV] = useState<AdminCV | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCVDetails, setShowCVDetails] = useState(false);

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
  const adminQuery = async (url: string, options: any = {}) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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

  // Fetch system health
  const { data: systemHealth, isLoading: isHealthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/health'],
    queryFn: () => adminQuery('/api/admin/health'),
    enabled: !!adminUser && activeTab === 'system',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch activity logs
  const { data: activityLogs, isLoading: isLogsLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/admin/activity'],
    queryFn: () => adminQuery('/api/admin/activity'),
    enabled: !!adminUser && activeTab === 'activity',
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: number; updates: Partial<AdminUser> }) => {
      return adminQuery(`/api/admin/users/${data.userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return adminQuery(`/api/admin/users/${userId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    },
  });

  const deleteCVMutation = useMutation({
    mutationFn: async (cvId: number) => {
      return adminQuery(`/api/admin/cvs/${cvId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cvs'] });
      toast({ title: 'CV deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete CV', variant: 'destructive' });
    },
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cvs">CVs</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage platform users and their access levels</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search users by name or email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <Select value={userFilterRole} onValueChange={setUserFilterRole}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isUsersLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>CVs</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData?.filter(user => {
                          const matchesSearch = user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                              user.email.toLowerCase().includes(userSearchQuery.toLowerCase());
                          const matchesRole = userFilterRole === 'all' || 
                                            (userFilterRole === 'premium' && user.isPremium) ||
                                            user.role === userFilterRole;
                          return matchesSearch && matchesRole;
                        }).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.name || user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant={user.emailVerified ? "outline" : "destructive"}>
                                  {user.emailVerified ? "Verified" : "Unverified"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isPremium ? "default" : "secondary"}>
                                {user.isPremium ? "Premium" : "Free"}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.totalCVs || 0}</TableCell>
                            <TableCell>
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user.role !== 'admin' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
                                        deleteUserMutation.mutate(user.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cvs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>CV Management</CardTitle>
                      <CardDescription>View and manage uploaded CVs</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CV Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Input
                      placeholder="Search CVs by filename or user..."
                      value={cvSearchQuery}
                      onChange={(e) => setCvSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {isCvsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Scores</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cvsData?.filter(cv => 
                          cv.fileName.toLowerCase().includes(cvSearchQuery.toLowerCase()) ||
                          cv.userEmail.toLowerCase().includes(cvSearchQuery.toLowerCase())
                        ).map((cv) => (
                          <TableRow key={cv.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{cv.fileName}</p>
                                  {cv.fileSize && (
                                    <p className="text-sm text-muted-foreground">
                                      {(cv.fileSize / 1024 / 1024).toFixed(1)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{cv.userName}</p>
                                <p className="text-sm text-muted-foreground">{cv.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(cv.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={
                                cv.analysisStatus === 'completed' ? 'default' :
                                cv.analysisStatus === 'processing' ? 'secondary' : 'destructive'
                              }>
                                {cv.analysisStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {cv.atsScore && (
                                  <Badge variant="outline">ATS: {cv.atsScore}%</Badge>
                                )}
                                {cv.saScore && (
                                  <Badge variant="outline">SA: {cv.saScore}%</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCV(cv);
                                    setShowCVDetails(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${cv.fileName}?`)) {
                                      deleteCVMutation.mutate(cv.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isHealthLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : systemHealth ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Overall Status</span>
                          <Badge variant={
                            systemHealth.status === 'healthy' ? 'default' :
                            systemHealth.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {systemHealth.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Database</span>
                            {systemHealth.database ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex justify-between">
                            <span>AI Service</span>
                            {systemHealth.aiService ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex justify-between">
                            <span>Email Service</span>
                            {systemHealth.emailService ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Uptime</span>
                            <span>{systemHealth.uptime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Response Time</span>
                            <span>{systemHealth.responseTime}ms</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>Unable to load system health</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Server className="h-4 w-4 mr-2" />
                      System Backup
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send System Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Test Notifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Monitor system activity and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLogsLoading ? (
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activityLogs?.map((log) => (
                        <div key={log.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.userEmail} • {log.details}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                            {log.ipAddress && (
                              <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure email templates and delivery</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input id="fromEmail" defaultValue="noreply@hiremzansi.co.za" />
                    </div>
                    <div>
                      <Label htmlFor="replyEmail">Reply-To Email</Label>
                      <Input id="replyEmail" defaultValue="support@hiremzansi.co.za" />
                    </div>
                    <Button>Save Email Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Configuration</CardTitle>
                    <CardDescription>Manage AI service settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="aiProvider">Primary AI Provider</Label>
                      <Select defaultValue="xai">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xai">xAI (Grok)</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input id="maxTokens" type="number" defaultValue="4000" />
                    </div>
                    <Button>Save AI Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>General platform settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maxFileSize">Max CV File Size (MB)</Label>
                      <Input id="maxFileSize" type="number" defaultValue="10" />
                    </div>
                    <div>
                      <Label htmlFor="allowedFormats">Allowed File Formats</Label>
                      <Input id="allowedFormats" defaultValue="pdf,doc,docx,txt" />
                    </div>
                    <Button>Save Platform Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>Manage premium subscription tiers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="basicPrice">Basic Plan Price (ZAR)</Label>
                      <Input id="basicPrice" type="number" defaultValue="99" />
                    </div>
                    <div>
                      <Label htmlFor="premiumPrice">Premium Plan Price (ZAR)</Label>
                      <Input id="premiumPrice" type="number" defaultValue="199" />
                    </div>
                    <Button>Update Pricing</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* User Details Dialog */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Manage user account and permissions
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input defaultValue={selectedUser.name || selectedUser.username} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={selectedUser.email} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select defaultValue={selectedUser.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select defaultValue={selectedUser.isActive ? "active" : "inactive"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                      {selectedUser.lastLogin && (
                        <span> • Last login: {new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle user update
                  setShowUserDetails(false);
                  toast({ title: 'User updated successfully' });
                }}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* CV Details Dialog */}
          <Dialog open={showCVDetails} onOpenChange={setShowCVDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>CV Details</DialogTitle>
                <DialogDescription>
                  View CV analysis results and manage file
                </DialogDescription>
              </DialogHeader>
              {selectedCV && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>File Name</Label>
                      <p className="font-medium">{selectedCV.fileName}</p>
                    </div>
                    <div>
                      <Label>Upload Date</Label>
                      <p>{new Date(selectedCV.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>User</Label>
                      <p>{selectedCV.userName} ({selectedCV.userEmail})</p>
                    </div>
                    <div>
                      <Label>Analysis Status</Label>
                      <Badge variant={
                        selectedCV.analysisStatus === 'completed' ? 'default' :
                        selectedCV.analysisStatus === 'processing' ? 'secondary' : 'destructive'
                      }>
                        {selectedCV.analysisStatus}
                      </Badge>
                    </div>
                  </div>
                  {(selectedCV.atsScore || selectedCV.saScore) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedCV.atsScore && (
                        <div>
                          <Label>ATS Score</Label>
                          <p className="text-2xl font-bold">{selectedCV.atsScore}%</p>
                        </div>
                      )}
                      {selectedCV.saScore && (
                        <div>
                          <Label>SA Context Score</Label>
                          <p className="text-2xl font-bold">{selectedCV.saScore}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCVDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
                <Button variant="outline">
                  Reprocess Analysis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;