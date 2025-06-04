import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { 
  ArrowLeft, 
  CalendarIcon, 
  Users, 
  Eye, 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  Tags,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

import { type JobPosting, type Employer } from "@shared/schema";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch job posting
  const { 
    data: job, 
    isLoading: isLoadingJob,
    error: jobError,
    isError: isJobError
  } = useQuery<JobPosting>({
    queryKey: [`/api/job-postings/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch employer profile
  const { 
    data: employer 
  } = useQuery<Employer>({
    queryKey: ['/api/employers/me'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: false,
  });
  
  // Fetch candidates/applicants
  const {
    data: candidates,
    isLoading: isLoadingCandidates
  } = useQuery<any[]>({
    queryKey: [`/api/job-postings/${id}/candidates`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!job,
  });
  
  // Toggle job activation status
  const toggleActivationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/job-postings/${id}`, { 
        isActive: !job?.isActive 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: job?.isActive ? "Job deactivated" : "Job activated",
        description: job?.isActive 
          ? "Your job posting has been deactivated and is no longer visible to job seekers." 
          : "Your job posting has been activated and is now visible to job seekers.",
      });
      
      // Refetch job data
      queryClient.invalidateQueries({ queryKey: [`/api/job-postings/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status",
        variant: "destructive",
      });
    }
  });
  
  // Delete job
  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/job-postings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Job deleted",
        description: "Your job posting has been deleted successfully.",
      });
      navigate("/employer/dashboard");
      
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/job-postings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  });
  
  const handleToggleActivation = () => {
    toggleActivationMutation.mutate();
  };
  
  const handleDeleteJob = () => {
    deleteJobMutation.mutate();
    setShowDeleteDialog(false);
  };
  
  // Handle loading or error states
  if (isLoadingJob) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="h-[600px] w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (isJobError || !job) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {jobError instanceof Error ? jobError.message : "Failed to load job posting"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/employer/dashboard")} className="mt-4">
          Go Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Helmet>
        <title>{job.title} | Employer Dashboard | Hire Mzansi</title>
        <meta name="description" content={`Manage job posting: ${job.title} at ${employer?.companyName || 'your company'}`} />
      </Helmet>
      
      {/* Job posting header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/employer/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <Badge variant={job.isActive ? "default" : "outline"} className={`font-normal ${job.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "text-muted-foreground"}`}>
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
              {job.isFeatured && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{employer?.companyName || 'Your Company'}</span>
              </div>
              {job.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant={job.isActive ? "outline" : "default"}
              onClick={handleToggleActivation}
              disabled={toggleActivationMutation.isPending}
            >
              {job.isActive ? (
                <XCircle className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {job.isActive ? "Deactivate" : "Activate"}
            </Button>
            
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your job posting and remove it from our servers.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteJob}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{job.views || 0}</div>
            <p className="text-sm text-muted-foreground">
              Total views since posting
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
              {isLoadingCandidates ? 
                <Skeleton className="h-8 w-10" /> : 
                candidates?.length || 0
              }
            </div>
            <p className="text-sm text-muted-foreground">
              Total candidates applied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">
              {job.deadline ? 
                new Date(job.deadline).toLocaleDateString() : 
                "No deadline"
              }
            </div>
            <p className="text-sm text-muted-foreground">
              {job.deadline 
                ? new Date(job.deadline) > new Date()
                  ? `${Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                  : "Deadline passed"
                : "Open until filled"
              }
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
              <CardDescription>
                This is the full job description seen by candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tags className="h-4 w-4 mr-2 text-primary" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills && job.requiredSkills.length > 0 ? (
                    job.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No required skills specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tags className="h-4 w-4 mr-2 text-primary" />
                  Preferred Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills && job.preferredSkills.length > 0 ? (
                    job.preferredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No preferred skills specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Employment Type</dt>
                  <dd className="mt-1">{job.employmentType || "Not specified"}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Experience Level</dt>
                  <dd className="mt-1">{job.experienceLevel || "Not specified"}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Industry</dt>
                  <dd className="mt-1">{job.industry || "Not specified"}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Salary Range</dt>
                  <dd className="mt-1">{job.salaryRange || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidates</CardTitle>
              <CardDescription>
                Manage candidates who have applied to this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCandidates ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : candidates && candidates.length > 0 ? (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.email} • Applied on {new Date(candidate.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No candidates yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    When candidates apply for this job, they will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-yellow-800">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Actions here can have significant consequences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-yellow-300 rounded-md p-4 bg-yellow-100/50">
                <h3 className="font-medium text-yellow-800">Deactivate Job Posting</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Deactivating will hide this job from job seekers but keep it in your dashboard.
                </p>
                <Button 
                  variant={job.isActive ? "default" : "outline"}
                  onClick={handleToggleActivation}
                  disabled={toggleActivationMutation.isPending}
                  className={job.isActive ? "bg-yellow-600 hover:bg-yellow-700" : "border-yellow-300 text-yellow-800"}
                >
                  {toggleActivationMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {job.isActive ? "Deactivate Job" : "Activate Job"}
                </Button>
              </div>
              
              <div className="border border-red-300 rounded-md p-4 bg-red-50">
                <h3 className="font-medium text-red-800">Delete Job Posting</h3>
                <p className="text-sm text-red-700 mb-4">
                  This action is permanent and cannot be undone. All data related to this job posting will be deleted.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Job Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}