import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Building2, 
  Briefcase, 
  Users, 
  LineChart, 
  Plus, 
  FileEdit, 
  AlertCircle,
  ChevronRight,
  Layers,
  Award,
  Clock,
  Eye
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

import { CreateEmployerProfileForm } from "@/components/employer/CreateEmployerProfileForm";
import { type Employer, type JobPosting } from "@shared/schema";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateProfileForm, setShowCreateProfileForm] = useState(false);
  
  // Fetch employer profile for current user
  const { 
    data: employer, 
    isLoading: isLoadingEmployer,
    error: employerError,
    isError: isEmployerError
  } = useQuery<Employer>({
    queryKey: ['/api/employers/me'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });
  
  // Fetch job postings for this employer
  const {
    data: jobPostings,
    isLoading: isLoadingJobs,
  } = useQuery<JobPosting[]>({
    queryKey: ['/api/job-postings/employer'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!employer,
  });
  
  // Create employer profile mutation
  const createEmployerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/employers", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Employer profile created",
        description: "Your employer profile has been created successfully.",
      });
      setShowCreateProfileForm(false);
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

  const handleCreateProfile = (data: any) => {
    createEmployerMutation.mutate(data);
  };
  
  // No employer profile yet
  if (!isLoadingEmployer && !employer && !showCreateProfileForm) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Helmet>
          <title>Employer Dashboard | ATSBoost</title>
          <meta name="description" content="Manage your company profile and job postings with the ATSBoost employer dashboard." />
        </Helmet>
        
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-16 w-16 text-primary/40 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Create Your Employer Profile</h1>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You need to create an employer profile before you can post jobs and manage candidates.
          </p>
          <Button onClick={() => setShowCreateProfileForm(true)}>
            <Building2 className="mr-2 h-4 w-4" />
            Create Employer Profile
          </Button>
        </div>
      </div>
    );
  }
  
  // Show create profile form
  if (showCreateProfileForm) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Helmet>
          <title>Create Employer Profile | ATSBoost</title>
          <meta name="description" content="Create your employer profile on ATSBoost to start posting jobs and finding talent." />
        </Helmet>
        
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowCreateProfileForm(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Create Your Employer Profile</h1>
          <p className="text-muted-foreground mt-1">
            Fill in your company details to start posting jobs and finding talent.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              This information will be visible to job seekers on your job postings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEmployerProfileForm onSubmit={handleCreateProfile} isSubmitting={createEmployerMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (isLoadingEmployer) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }
  
  // Handle error
  if (isEmployerError) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading employer profile</AlertTitle>
          <AlertDescription>
            {employerError instanceof Error ? employerError.message : "Unknown error occurred"}
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/employers/me'] })} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  // Main dashboard view
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Helmet>
        <title>Employer Dashboard | ATSBoost</title>
        <meta name="description" content="Manage your company profile and job postings with the ATSBoost employer dashboard." />
      </Helmet>
      
      {/* Employer header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            {employer?.logo ? (
              <img 
                src={employer.logo} 
                alt={employer.companyName} 
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              {employer?.companyName}
              {employer?.isVerified && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">{employer?.industry || 'No industry specified'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/employer/profile/edit")}>
            <FileEdit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={() => navigate("/employer/jobs/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>
      
      {/* Dashboard tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    jobPostings?.filter(job => job.isActive).length || 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {jobPostings?.filter(job => !job.isActive).length || 0} inactive jobs
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingJobs ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    0 // Will be replaced with actual data
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  0 new this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-primary" />
                  Job Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingJobs ? (
                    <Skeleton className="h-8 w-10" />
                  ) : (
                    jobPostings?.reduce((sum, job) => sum + (job.views || 0), 0) || 0
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all job postings
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Job Postings</CardTitle>
              <CardDescription>
                Your most recently posted jobs and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : jobPostings && jobPostings.length > 0 ? (
                <div className="space-y-4">
                  {jobPostings.slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{job.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {job.location && (
                            <Badge variant="secondary" className="font-normal">
                              {job.location}
                            </Badge>
                          )}
                          {job.employmentType && (
                            <Badge variant="secondary" className="font-normal">
                              {job.employmentType}
                            </Badge>
                          )}
                          <Badge variant={job.isActive ? "success" : "outline"} className="font-normal">
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm flex items-center mb-1">
                          <Eye className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{job.views || 0} views</span>
                        </div>
                        <Link href={`/employer/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            Manage
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {jobPostings.length > 3 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" onClick={() => setActiveTab("jobs")}>
                        View All Jobs
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No job postings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first job posting to start receiving applications
                  </p>
                  <Button onClick={() => navigate("/employer/jobs/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Job Postings</h2>
            <Button onClick={() => navigate("/employer/jobs/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoadingJobs ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : jobPostings && jobPostings.length > 0 ? (
                <div className="divide-y">
                  {jobPostings.map(job => (
                    <div key={job.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-3 sm:mb-0">
                        <h3 className="font-medium mb-1 flex items-center">
                          {job.title}
                          {job.isFeatured && (
                            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
                              Featured
                            </Badge>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm mb-2">
                          {job.location && (
                            <span className="text-muted-foreground">
                              {job.location}
                            </span>
                          )}
                          {job.employmentType && (
                            <Badge variant="secondary" className="font-normal">
                              {job.employmentType}
                            </Badge>
                          )}
                          <Badge variant={job.isActive ? "success" : "outline"} className="font-normal">
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{job.views || 0} views</span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col md:flex-row">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/employer/jobs/${job.id}/candidates`)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Candidates
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                        >
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No job postings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first job posting to start receiving applications
                  </p>
                  <Button onClick={() => navigate("/employer/jobs/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Candidates</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Layers className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-medium mb-1">No candidates yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Candidates will appear here when they apply to your job postings
                </p>
                <Button onClick={() => navigate("/employer/jobs/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <BarChart className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Overview</CardTitle>
              <CardDescription>
                Track how your job postings are performing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <Skeleton className="h-[300px] w-full" />
              ) : jobPostings && jobPostings.length > 0 ? (
                <div className="space-y-4">
                  {jobPostings.slice(0, 5).map(job => (
                    <div key={job.id} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="truncate max-w-xs">{job.title}</span>
                        <span>{job.views || 0} views</span>
                      </div>
                      <Progress value={Math.min(job.views || 0, 100)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LineChart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No analytics data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Post jobs to start collecting performance analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}