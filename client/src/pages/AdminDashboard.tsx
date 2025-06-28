import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  Settings,
  Download,
  Trash2,
  Edit,
  Eye,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  Filter,
  Search,
  MoreHorizontal,
  LogOut,
  Save,
  Database,
  Send,
  Shield,
  Archive
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';
import LinkAnalyticsDashboard from '@/components/admin/LinkAnalyticsDashboard';

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

interface AdminJobPosting {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  experienceLevel: string;
  industry: string;
  createdAt: string;
  isActive: boolean;
  applications: number;
  employerId: number;
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCVDetails, setShowCVDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedCV, setSelectedCV] = useState<AdminCV | null>(null);
  const [selectedJobPosting, setSelectedJobPosting] = useState<AdminJobPosting | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [cvSearchTerm, setCvSearchTerm] = useState('');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [showJobDetails, setShowJobDetails] = useState(false);
  
  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    maxCVSize: 10,
    autoAnalysis: true,
    emailNotifications: true
  });

  // Admin settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: typeof platformSettings) => {
      const response = await adminQuery('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: 'Settings updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating settings', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async (exportType: string) => {
      const response = await adminQuery(`/api/admin/export/${exportType}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data, exportType) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: `${exportType} data exported successfully` });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Export failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // System backup mutation
  const backupSystemMutation = useMutation({
    mutationFn: async () => {
      const response = await adminQuery('/api/admin/backup', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: 'System backup initiated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Backup failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Check admin authentication on component mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log('AdminDashboard: Starting authentication check...');
      
      // Add a small delay to ensure token is properly stored after redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      
      console.log('AdminDashboard: Token found:', !!token);
      console.log('AdminDashboard: Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        console.log('AdminDashboard: No token found, redirecting to login');
        setTimeout(() => setLocation('/admin/login'), 100);
        return;
      }

      try {
        console.log('AdminDashboard: Verifying token with server...');
        const response = await fetch('/api/admin/platform/overview', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('AdminDashboard: Server response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('AdminDashboard: Authentication successful, staying on dashboard');
          console.log('AdminDashboard: Platform data:', data);
          
          // Set admin user info
          setAdminUser({
            email: 'deniskasala17@gmail.com',
            name: 'Denis Kasala',
            role: 'admin'
          });
          
          console.log('AdminDashboard: Admin user set, authentication complete');
        } else {
          console.log('AdminDashboard: Token verification failed, clearing storage');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin_user');
          setTimeout(() => setLocation('/admin/login'), 100);
        }
      } catch (error) {
        console.error('AdminDashboard: Authentication check failed:', error);
        setTimeout(() => setLocation('/admin/login'), 100);
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
        console.log('AdminQuery: 401 detected, but not redirecting to avoid conflicts');
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
    retry: false, // Don't retry failed requests
  });

  // Fetch users
  const { data: usersData, isLoading: isUsersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => adminQuery('/api/admin/users'),
    enabled: !!adminUser && activeTab === 'users',
  });

  // Fetch CVs
  const { data: cvsData, isLoading: isCvsLoading } = useQuery<AdminCV[]>({
    queryKey: ['/api/admin/cvs'],
    queryFn: () => adminQuery('/api/admin/cvs'),
    enabled: !!adminUser && activeTab === 'cvs',
  });

  // Fetch job postings
  const { data: jobPostingsData, isLoading: isJobPostingsLoading } = useQuery<AdminJobPosting[]>({
    queryKey: ['/api/admin/job-postings'],
    queryFn: () => adminQuery('/api/admin/job-postings'),
    enabled: !!adminUser && activeTab === 'jobs',
  });

  // Fetch system health
  const { data: healthData, isLoading: isHealthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/admin/health'],
    queryFn: () => adminQuery('/api/admin/health'),
    enabled: !!adminUser && activeTab === 'health',
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
      console.log('Updating user:', data.userId, 'with data:', data.updates);
      const response = await adminQuery(`/api/admin/users/${data.userId}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates),
      });
      console.log('Update response:', response);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ 
        title: 'User updated successfully',
        description: `User ${variables.userId} has been updated`
      });
      setShowUserDetails(false); // Close the details modal
    },
    onError: (error: any, variables) => {
      console.error('User update error:', error);
      toast({ 
        title: 'Failed to update user', 
        description: error.message || `Could not update user ${variables.userId}`,
        variant: 'destructive' 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('Deleting user:', userId);
      const response = await adminQuery(`/api/admin/users/${userId}`, { method: 'DELETE' });
      console.log('Delete response:', response);
      return response;
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ 
        title: 'User deleted successfully',
        description: `User ${userId} has been permanently removed`
      });
    },
    onError: (error: any, userId) => {
      console.error('User delete error:', error);
      toast({ 
        title: 'Failed to delete user', 
        description: error.message || `Could not delete user ${userId}`,
        variant: 'destructive' 
      });
    },
  });

  const deleteCVMutation = useMutation({
    mutationFn: async (cvId: number) => {
      console.log('Deleting CV:', cvId);
      const response = await adminQuery(`/api/admin/cvs/${cvId}`, { method: 'DELETE' });
      console.log('CV delete response:', response);
      return response;
    },
    onSuccess: (data, cvId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ 
        title: 'CV deleted successfully',
        description: `CV ${cvId} has been permanently removed`
      });
    },
    onError: (error: any, cvId) => {
      console.error('CV delete error:', error);
      toast({ 
        title: 'Failed to delete CV', 
        description: error.message || `Could not delete CV ${cvId}`,
        variant: 'destructive' 
      });
    },
  });

  // Job posting management mutations
  const updateJobPostingMutation = useMutation({
    mutationFn: async (data: { jobId: number; updates: Partial<AdminJobPosting> }) => {
      console.log('Updating job posting:', data.jobId, 'with data:', data.updates);
      const response = await adminQuery(`/api/admin/job-postings/${data.jobId}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      });
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ 
        title: 'Job posting updated successfully',
        description: `Job ${variables.jobId} has been updated`
      });
      setShowJobDetails(false);
    },
    onError: (error: any, variables) => {
      console.error('Job posting update error:', error);
      toast({ 
        title: 'Failed to update job posting', 
        description: error.message || `Could not update job ${variables.jobId}`,
        variant: 'destructive' 
      });
    },
  });

  const deleteJobPostingMutation = useMutation({
    mutationFn: async (jobId: number) => {
      console.log('Deleting job posting:', jobId);
      const response = await adminQuery(`/api/admin/job-postings/${jobId}`, { method: 'DELETE' });
      return response;
    },
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ 
        title: 'Job posting deleted successfully',
        description: `Job ${jobId} has been permanently removed`
      });
    },
    onError: (error: any, jobId) => {
      console.error('Job posting delete error:', error);
      toast({ 
        title: 'Failed to delete job posting', 
        description: error.message || `Could not delete job ${jobId}`,
        variant: 'destructive' 
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = usersData?.filter(user => 
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(userSearchTerm.toLowerCase())
  ) || [];

  const filteredCVs = cvsData?.filter(cv => 
    cv.fileName.toLowerCase().includes(cvSearchTerm.toLowerCase()) ||
    cv.userEmail.toLowerCase().includes(cvSearchTerm.toLowerCase())
  ) || [];

  const filteredJobPostings = jobPostingsData?.filter(job => 
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(jobSearchTerm.toLowerCase())
  ) || [];

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
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cvs">CVs</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="health">System</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {statsData?.activeUsers || 0} active users
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
                    <p className="text-xs text-muted-foreground">CVs uploaded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData?.premiumUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Premium subscriptions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{statsData?.monthlyRevenue || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage registered users and their permissions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => exportDataMutation.mutate('users')}
                        disabled={exportDataMutation.isPending}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Role</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Joined</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{user.name || user.username}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {user.isPremium && (
                                    <Badge variant="outline">Premium</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserDetails(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteUserMutation.mutate(user.id)}
                                    disabled={deleteUserMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cvs">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>CV Management</CardTitle>
                      <CardDescription>Manage uploaded CVs and analysis results</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search CVs..."
                          className="pl-8"
                          value={cvSearchTerm}
                          onChange={(e) => setCvSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => exportDataMutation.mutate('cvs')}
                        disabled={exportDataMutation.isPending}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCvsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">File</th>
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Uploaded</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCVs.map((cv) => (
                            <tr key={cv.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <div className="font-medium">{cv.fileName}</div>
                                {cv.fileSize && (
                                  <div className="text-sm text-muted-foreground">
                                    {(cv.fileSize / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{cv.userName}</div>
                                  <div className="text-sm text-muted-foreground">{cv.userEmail}</div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={cv.analysisStatus === 'completed' ? 'default' : 'secondary'}>
                                  {cv.analysisStatus}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {formatDate(cv.createdAt)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedCV(cv);
                                      setShowCVDetails(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteCVMutation.mutate(cv.id)}
                                    disabled={deleteCVMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Job Postings Management</CardTitle>
                      <CardDescription>Manage job postings and recruitment activities</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search jobs..."
                          className="pl-8"
                          value={jobSearchTerm}
                          onChange={(e) => setJobSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={() => exportDataMutation.mutate('jobs')}
                        disabled={exportDataMutation.isPending}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isJobPostingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Job Title</th>
                            <th className="text-left p-3">Company</th>
                            <th className="text-left p-3">Location</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Applications</th>
                            <th className="text-left p-3">Posted</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobPostings.map((job) => (
                            <tr key={job.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <div className="font-medium">{job.title}</div>
                                <div className="text-sm text-muted-foreground">{job.employmentType} • {job.experienceLevel}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium">{job.company}</div>
                                <div className="text-sm text-muted-foreground">{job.industry}</div>
                              </td>
                              <td className="p-3">{job.location}</td>
                              <td className="p-3">
                                <Badge variant={job.isActive ? 'default' : 'secondary'}>
                                  {job.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="text-center">
                                  <div className="text-lg font-bold">{job.applications || 0}</div>
                                  <div className="text-xs text-muted-foreground">applications</div>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {formatDate(job.createdAt)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedJobPosting(job);
                                      setShowJobDetails(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteJobPostingMutation.mutate(job.id)}
                                    disabled={deleteJobPostingMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredJobPostings.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No job postings found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <LinkAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor system status and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {isHealthLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          {healthData?.database ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">Database</div>
                            <div className="text-sm text-muted-foreground">
                              {healthData?.database ? 'Connected' : 'Disconnected'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          {healthData?.aiService ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">AI Service</div>
                            <div className="text-sm text-muted-foreground">
                              {healthData?.aiService ? 'Online' : 'Offline'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          {healthData?.emailService ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">Email Service</div>
                            <div className="text-sm text-muted-foreground">
                              {healthData?.emailService ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {healthData && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 border rounded-lg">
                            <div className="font-medium mb-2">System Uptime</div>
                            <div className="text-2xl font-bold">{healthData.uptime}</div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="font-medium mb-2">Response Time</div>
                            <div className="text-2xl font-bold">{healthData.responseTime}ms</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Activity Logs</CardTitle>
                      <CardDescription>Recent platform activity and events</CardDescription>
                    </div>
                    <Button 
                      onClick={() => exportDataMutation.mutate('activities')}
                      disabled={exportDataMutation.isPending}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLogsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Action</th>
                            <th className="text-left p-3">User</th>
                            <th className="text-left p-3">Details</th>
                            <th className="text-left p-3">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityLogs?.map((activity) => (
                            <tr key={activity.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <Badge variant="outline">{activity.action}</Badge>
                              </td>
                              <td className="p-3">
                                {activity.userEmail || `User ${activity.userId}`}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {activity.details}
                              </td>
                              <td className="p-3 text-sm text-gray-500">{formatDate(activity.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure platform behavior and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">System Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="maintenance">Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                        </div>
                        <Switch
                          id="maintenance"
                          checked={platformSettings.maintenanceMode}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            maintenanceMode: checked 
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="registrations">Allow Registrations</Label>
                          <p className="text-sm text-muted-foreground">Enable new user registrations</p>
                        </div>
                        <Switch
                          id="registrations"
                          checked={platformSettings.allowRegistrations}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            allowRegistrations: checked 
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxCVSize">Max CV Size (MB)</Label>
                        <Input
                          id="maxCVSize"
                          type="number"
                          value={platformSettings.maxCVSize}
                          onChange={(e) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            maxCVSize: parseInt(e.target.value) || 10 
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Feature Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoAnalysis">Auto CV Analysis</Label>
                          <p className="text-sm text-muted-foreground">Automatically analyze uploaded CVs</p>
                        </div>
                        <Switch
                          id="autoAnalysis"
                          checked={platformSettings.autoAnalysis}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            autoAnalysis: checked 
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={platformSettings.emailNotifications}
                          onCheckedChange={(checked) => setPlatformSettings(prev => ({ 
                            ...prev, 
                            emailNotifications: checked 
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => exportDataMutation.mutate('users')}
                        disabled={exportDataMutation.isPending}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Users
                      </Button>
                      <Button 
                        onClick={() => exportDataMutation.mutate('cvs')}
                        disabled={exportDataMutation.isPending}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CVs
                      </Button>
                      <Button 
                        onClick={() => backupSystemMutation.mutate()}
                        disabled={backupSystemMutation.isPending}
                        variant="outline"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Backup System
                      </Button>
                    </div>
                    <Button 
                      onClick={() => updateSettingsMutation.mutate(platformSettings)}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* User Details Dialog */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View and edit user information and permissions
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Name</Label>
                      <Input
                        id="userName"
                        value={selectedUser.name || ''}
                        onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select 
                        value={selectedUser.role} 
                        onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch 
                        checked={selectedUser.isActive} 
                        onCheckedChange={(checked) => setSelectedUser({...selectedUser, isActive: checked})}
                      />
                      <Label>Active User</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={selectedUser.isPremium} 
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, isPremium: checked})}
                    />
                    <Label>Premium Subscription</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      const updates = {
                        name: selectedUser.name,
                        email: selectedUser.email,
                        role: selectedUser.role,
                        isActive: selectedUser.isActive,
                        isPremium: selectedUser.isPremium
                      };
                      updateUserMutation.mutate({ userId: selectedUser.id, updates });
                    }
                  }}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
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
                      <Badge variant={selectedCV.analysisStatus === 'completed' ? 'default' : 'secondary'}>
                        {selectedCV.analysisStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedCV.atsScore && selectedCV.saScore && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ATS Score</Label>
                        <div className="text-2xl font-bold text-blue-600">{selectedCV.atsScore}/100</div>
                      </div>
                      <div>
                        <Label>SA Context Score</Label>
                        <div className="text-2xl font-bold text-green-600">{selectedCV.saScore}/100</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCVDetails(false)}>
                  Close
                </Button>
                {selectedCV && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteCVMutation.mutate(selectedCV.id);
                      setShowCVDetails(false);
                    }}
                    disabled={deleteCVMutation.isPending}
                  >
                    Delete CV
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Job Posting Details Dialog */}
          <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Job Posting Details</DialogTitle>
                <DialogDescription>
                  View and edit job posting information
                </DialogDescription>
              </DialogHeader>
              {selectedJobPosting && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={selectedJobPosting.title}
                        onChange={(e) => setSelectedJobPosting({...selectedJobPosting, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobCompany">Company</Label>
                      <Input
                        id="jobCompany"
                        value={selectedJobPosting.company}
                        onChange={(e) => setSelectedJobPosting({...selectedJobPosting, company: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobLocation">Location</Label>
                      <Input
                        id="jobLocation"
                        value={selectedJobPosting.location}
                        onChange={(e) => setSelectedJobPosting({...selectedJobPosting, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobSalary">Salary Range</Label>
                      <Input
                        id="jobSalary"
                        value={selectedJobPosting.salaryRange}
                        onChange={(e) => setSelectedJobPosting({...selectedJobPosting, salaryRange: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Employment Type</Label>
                      <Select 
                        value={selectedJobPosting.employmentType} 
                        onValueChange={(value) => setSelectedJobPosting({...selectedJobPosting, employmentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobLevel">Experience Level</Label>
                      <Select 
                        value={selectedJobPosting.experienceLevel} 
                        onValueChange={(value) => setSelectedJobPosting({...selectedJobPosting, experienceLevel: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch 
                        checked={selectedJobPosting.isActive} 
                        onCheckedChange={(checked) => setSelectedJobPosting({...selectedJobPosting, isActive: checked})}
                      />
                      <Label>Active Job Posting</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <textarea
                      id="jobDescription"
                      className="w-full h-32 p-3 border rounded-md resize-none"
                      value={selectedJobPosting.description}
                      onChange={(e) => setSelectedJobPosting({...selectedJobPosting, description: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (selectedJobPosting) {
                      const updates = {
                        title: selectedJobPosting.title,
                        company: selectedJobPosting.company,
                        location: selectedJobPosting.location,
                        salaryRange: selectedJobPosting.salaryRange,
                        employmentType: selectedJobPosting.employmentType,
                        experienceLevel: selectedJobPosting.experienceLevel,
                        description: selectedJobPosting.description,
                        isActive: selectedJobPosting.isActive
                      };
                      updateJobPostingMutation.mutate({ jobId: selectedJobPosting.id, updates });
                    }
                  }}
                  disabled={updateJobPostingMutation.isPending}
                >
                  {updateJobPostingMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}