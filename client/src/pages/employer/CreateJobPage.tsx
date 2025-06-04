import React from 'react';
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";

import { CreateJobPostingForm } from "@/components/employer/CreateJobPostingForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Building2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { type Employer } from "@shared/schema";

export default function CreateJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
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
  
  // Create job posting mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/job-postings", data);
      return res.json();
    },
    onSuccess: (job) => {
      toast({
        title: "Job posting created",
        description: "Your job posting has been created successfully.",
      });
      navigate(`/employer/jobs/${job.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting",
        variant: "destructive",
      });
    }
  });

  const handleCreateJob = (data: any) => {
    createJobMutation.mutate(data);
  };
  
  // No employer profile yet
  if (!isLoadingEmployer && !employer) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Helmet>
          <title>Create Job Posting | Hire Mzansi</title>
          <meta name="description" content="Create a new job posting on Hire Mzansi to find the right talent for your company." />
        </Helmet>
        
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-16 w-16 text-primary/40 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Create Your Employer Profile First</h1>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You need to create an employer profile before you can post jobs.
          </p>
          <Button onClick={() => navigate("/employer/dashboard")}>
            <Building2 className="mr-2 h-4 w-4" />
            Create Employer Profile
          </Button>
        </div>
      </div>
    );
  }
  
  // Handle loading or error states
  if (isLoadingEmployer) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="h-[600px] w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (isEmployerError) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {employerError instanceof Error ? employerError.message : "Failed to load employer profile"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/employer/dashboard")} className="mt-4">
          Go Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Helmet>
        <title>Create Job Posting | Hire Mzansi</title>
        <meta name="description" content="Create a new job posting on Hire Mzansi to find the right talent for your company." />
      </Helmet>
      
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/employer/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Create Job Posting</h1>
        <p className="text-muted-foreground mt-1">
          Create a new job posting for {employer?.companyName || 'your company'}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Enter the details for your job posting. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateJobPostingForm 
            onSubmit={handleCreateJob} 
            isSubmitting={createJobMutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}