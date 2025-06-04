import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Shield,
  Settings,
  BarChart3,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PlatformStats {
  total_users: number;
  total_cvs: number;
  total_job_postings: number;
  total_job_matches: number;
  active_subscriptions: number;
  revenue_this_month: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

interface JobPosting {
  id: number;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  is_active: boolean;
  views: number;
  applications: number;
  created_at: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/stats').then(res => res.json())
  });

  // Users management
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('GET', '/api/admin/users').then(res => res.json())
  });

  // Job postings management
  const { data: jobPostings, isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/admin/job-postings'],
    queryFn: () => apiRequest('GET', '/api/admin/job-postings').then(res => res.json())
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: number; updates: any }) =>
      apiRequest('PATCH', `/api/admin/users/${userId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Job posting management mutations
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, updates }: { jobId: number; updates: any }) =>
      apiRequest('PATCH', `/api/admin/job-postings/${jobId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/job-postings'] });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: number) =>
      apiRequest('DELETE', `/api/admin/job-postings/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/job-postings'] });
    }
  });

  const filteredUsers = users?.filter(u => 
    u.email.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.username.toLowerCase().includes(userFilter.toLowerCase())
  ) || [];

  const filteredJobs = jobPostings?.filter(j =>
    j.title.toLowerCase().includes(jobFilter.toLowerCase()) ||
    j.company_name?.toLowerCase().includes(jobFilter.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Hire Mzansi Platform Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Admin</Badge>
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.total_users || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Registered platform users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CVs Uploaded</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.total_cvs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total CV documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.total_job_postings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Live job postings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.total_job_matches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">CV-Job matches created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.active_subscriptions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Paying subscribers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R{statsLoading ? '...' : (stats?.revenue_this_month || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">This month's revenue</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users and their permissions</CardDescription>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.email_verified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserMutation.mutate({
                                  userId: user.id,
                                  updates: { is_active: !user.is_active }
                                })}
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              {user.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
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

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Postings Management</CardTitle>
                <CardDescription>Monitor and manage all job postings on the platform</CardDescription>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search jobs..."
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="text-center py-8">Loading job postings...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company_name}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.employment_type}</TableCell>
                          <TableCell>
                            <Badge variant={job.is_active ? 'default' : 'secondary'}>
                              {job.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.views}</TableCell>
                          <TableCell>{job.applications}</TableCell>
                          <TableCell>
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateJobMutation.mutate({
                                  jobId: job.id,
                                  updates: { is_active: !job.is_active }
                                })}
                              >
                                {job.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteJobMutation.mutate(job.id)}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics dashboard coming soon...
                  <br />
                  <small>This will include user engagement, job posting performance, and revenue trends.</small>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Platform settings coming soon...
                  <br />
                  <small>This will include email templates, pricing, and feature toggles.</small>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}