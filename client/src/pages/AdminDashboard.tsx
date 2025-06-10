import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Users, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Settings, 
  Shield,
  Eye,
  Trash2,
  UserCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  Download,
  Activity
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCVs: number;
  totalJobPostings: number;
  totalMatches: number;
  activeRecruiters: number;
  premiumUsers: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isPremium: boolean;
}

interface CV {
  id: number;
  fileName: string;
  userId: number;
  userName: string;
  uploadedAt: string;
  analysisScore?: number;
}

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedAt: string;
  status: string;
  employerId: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Show loading while checking auth
  if (authLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Fetch CVs
  const { data: cvs = [], isLoading: cvsLoading } = useQuery<CV[]>({
    queryKey: ['/api/admin/cvs'],
    retry: false,
  });

  // Fetch job postings
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/admin/job-postings'],
    retry: false,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Toggle user premium mutation
  const togglePremiumMutation = useMutation({
    mutationFn: async ({ userId, isPremium }: { userId: number; isPremium: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/premium`, 'PATCH', { isPremium });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User premium status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user premium status",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage the Hire Mzansi platform</p>
        </div>
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <Shield className="h-4 w-4 mr-2" />
          Super Admin
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="cvs">CVs</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-brand-blue">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-brand-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.premiumUsers || 0} premium users
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-brand-green">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                <FileText className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCVs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Uploaded by users
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-brand-orange">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
                <Briefcase className="h-4 w-4 text-brand-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalJobPostings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats?.activeRecruiters || 0} recruiters
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
                <p className="text-xs text-muted-foreground">
                  AI-powered matches
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cyan-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Recruiters</CardTitle>
                <Building className="h-4 w-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeRecruiters || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Posting jobs
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
                <Activity className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-blue" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.isPremium ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Admin' : user.isPremium ? 'Premium' : 'Free'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined: {formatDate(user.createdAt)}
                          </span>
                          {user.lastLogin && (
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Last login: {formatDate(user.lastLogin)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePremiumMutation.mutate({ 
                            userId: user.id, 
                            isPremium: !user.isPremium 
                          })}
                          disabled={user.role === 'admin'}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          {user.isPremium ? 'Remove Premium' : 'Make Premium'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={user.role === 'admin' || deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cvs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-green" />
                CV Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cvsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-green"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cvs.map((cv) => (
                    <div key={cv.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{cv.fileName}</h3>
                            <p className="text-sm text-gray-600">Uploaded by: {cv.userName}</p>
                          </div>
                          {cv.analysisScore && (
                            <Badge variant="outline">
                              Score: {cv.analysisScore}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          Uploaded: {formatDate(cv.uploadedAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-orange" />
                Job Posting Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-orange"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                          </div>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Posted: {formatDate(job.postedAt)}
                          </span>
                          {job.salary && (
                            <span>Salary: {job.salary}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="Hire Mzansi" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" defaultValue="support@hiremzansi.co.za" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="match-threshold">Match Threshold (%)</Label>
                    <Input id="match-threshold" type="number" defaultValue="75" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="analysis-model">Analysis Model</Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <Button className="bg-brand-blue hover:bg-brand-blue/90">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}