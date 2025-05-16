import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';

import { CreateEmployerProfileForm } from '@/components/employer/CreateEmployerProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  PlusCircle,
  Building2,
  Briefcase,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';

import { type Employer, type JobPosting } from '@shared/schema';

// Helper function to get initials from a name
function getInitials(name: string): string {
  if (!name) return 'CO';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobSearch, setJobSearch] = useState('');
  
  // Fetch employer profile
  const { 
    data: employer, 
    isLoading: isLoadingEmployer,
    error: employerError
  } = useQuery<Employer>({
    queryKey: ['/api/employers/me'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });
  
  // Fetch job postings
  const { 
    data: jobs, 
    isLoading: isLoadingJobs,
    error: jobsError
  } = useQuery<JobPosting[]>({
    queryKey: ['/api/job-postings/my'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!employer, // Only run if employer exists
  });
  
  // Function to handle employer profile creation submission
  const createEmployerProfile = (data: any) => {
    createEmployerMutation.mutate(data);
  };
  
  // Create employer profile mutation
  const createEmployerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/employers", data);
      return res.json();
    },
    onSuccess: (newEmployer) => {
      toast({
        title: "Profile created",
        description: "Your employer profile has been created successfully.",
      });
      
      // Refetch employer data
      queryClient.invalidateQueries({ queryKey: ['/api/employers/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employer profile",
        variant: "destructive",
      });
    }
  });
  
  // Toggle job activation status
  const toggleJobActivationMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: number, isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/job-postings/${jobId}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job status updated",
        description: "The job posting status has been updated successfully.",
      });
      
      // Refetch jobs data
      queryClient.invalidateQueries({ queryKey: ['/api/job-postings/my'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status",
        variant: "destructive",
      });
    }
  });
  
  const handleCreateEmployer = (data: any) => {
    createEmployerMutation.mutate(data);
  };
  
  const handleToggleJobActivation = (jobId: number, currentStatus: boolean) => {
    toggleJobActivationMutation.mutate({
      jobId,
      isActive: !currentStatus
    });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Filter jobs based on search input
  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    job.description.toLowerCase().includes(jobSearch.toLowerCase())
  );
  
  // If we don't have an employer profile yet, show the create form
  if (!isLoadingEmployer && !employer) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Helmet>
          <title>Create Employer Profile | ATSBoost</title>
          <meta name="description" content="Create your employer profile on ATSBoost to start posting jobs and finding top talent." />
        </Helmet>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Employer Profile</h1>
          <p className="text-muted-foreground mt-2">
            Get started with ATSBoost's employer tools by setting up your company profile
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Fill in your company details to create your employer profile. 
              This information will be visible to job seekers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEmployerProfileForm 
              onSubmit={handleCreateEmployer} 
              isSubmitting={createEmployerMutation.isPending} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (isLoadingEmployer) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-[300px] w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If employer doesn't exist, show create employer form
  if (!employer && !isLoadingEmployer) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Helmet>
          <title>Create Employer Profile | ATSBoost</title>
          <meta name="description" content="Create your employer profile on ATSBoost to start posting jobs." />
        </Helmet>
        
        <h1 className="text-3xl font-bold mb-8">Create Employer Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Complete your employer profile to start posting jobs and finding candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEmployerProfileForm 
              onSubmit={createEmployerProfile}
              isSubmitting={createEmployerMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Helmet>
        <title>Employer Dashboard | ATSBoost</title>
        <meta name="description" content="Manage your job postings and candidates on ATSBoost's employer dashboard." />
      </Helmet>
      
      {/* Header with employer info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{employer?.companyName}</h1>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3">
            <span className="flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              {employer?.industry ? employer.industry.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()) : 'Unspecified Industry'}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {employer?.size ? employer.size : 'Unspecified Size'}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Member since {employer?.createdAt ? new Date(employer.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/employer/jobs/new")} className="bg-amber-500 hover:bg-amber-600">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a New Job
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingJobs ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                jobs?.filter(job => job.isActive).length || 0
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Currently active job postings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingJobs ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                jobs?.reduce((total, job) => total + (job.views || 0), 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Combined views across all jobs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingJobs ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                0 // Replace with actual applications count when available
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Total applications received
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Job Postings</h2>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-8"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />
              </div>
              <Button onClick={() => navigate("/employer/jobs/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </div>
          </div>
          
          {isLoadingJobs ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge variant={job.isActive ? "default" : "outline"} className={`font-normal ${job.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "text-muted-foreground"}`}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {job.isFeatured && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" /> Posted {new Date(job.createdAt).toLocaleDateString()} 
                            {job.deadline && (
                              <span className="ml-3 flex items-center">
                                • Deadline: {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/employer/jobs/${job.id}`)}
                          >
                            View
                          </Button>
                          <Button 
                            variant={job.isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleJobActivation(job.id, job.isActive ?? false)}
                            disabled={toggleJobActivationMutation.isPending}
                          >
                            {job.isActive ? (
                              <XCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            {job.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {job.employmentType?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Unspecified Type'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {job.location?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Unspecified Location'}
                        </Badge>
                        {job.experienceLevel && (
                          <Badge variant="secondary" className="text-xs">
                            {job.experienceLevel.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t md:border-t-0 md:border-l border-gray-200 flex flex-row md:flex-col justify-around md:justify-center items-center p-4 gap-4 bg-gray-50">
                      <div className="text-center">
                        <div className="text-2xl font-semibold">{job.views || 0}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold">0</div>
                        <div className="text-xs text-muted-foreground">Applications</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:hidden border-t border-gray-200 p-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/employer/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                    <Button 
                      variant={job.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleJobActivation(job.id, job.isActive ?? false)}
                      disabled={toggleJobActivationMutation.isPending}
                    >
                      {job.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              {jobSearch ? (
                <>
                  <h3 className="font-medium mb-1">No jobs match your search</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try a different search term or clear the search
                  </p>
                  <Button variant="outline" onClick={() => setJobSearch("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-medium mb-1">No job postings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first job posting to start finding candidates
                  </p>
                  <Button onClick={() => navigate("/employer/jobs/new")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-6">
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-medium mb-1">No candidates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Candidates who apply to your jobs will appear here
            </p>
            <Button onClick={() => setActiveTab("jobs")}>
              Manage Job Postings
            </Button>
          </div>
        </TabsContent>
        
        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Company Profile</h2>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About {employer?.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">
                  {employer?.description || "No company description available."}
                </p>
                
                <div className="mt-6 space-y-4">
                  {employer?.websiteUrl && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-24">Website:</span>
                      <a 
                        href={employer?.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {employer?.websiteUrl}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Location:</span>
                    <span>{employer?.location?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Industry:</span>
                    <span>{employer?.industry?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Size:</span>
                    <span>{employer?.size || 'Not specified'}</span>
                  </div>
                  
                  {employer?.bbbeeLevel && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-24">B-BBEE Level:</span>
                      <span>{employer?.bbbeeLevel?.replace('level_', 'Level ').replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center mb-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employer?.logoUrl || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employer?.companyName ? getInitials(employer.companyName) : 'CO'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h3 className="font-medium">{employer?.companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employer?.size || 'Company'} • {employer?.location?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'No location'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Contact Details</h4>
                  <div className="space-y-2">
                    {employer?.contactEmail && (
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-muted-foreground">Email:</span>
                        <span>{employer.contactEmail}</span>
                      </div>
                    )}
                    
                    {employer?.contactPhone && (
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-muted-foreground">Phone:</span>
                        <span>{employer.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Account Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="w-16 text-muted-foreground">Member:</span>
                      <span>Since {employer?.createdAt ? new Date(employer.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-16 text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="font-normal">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}