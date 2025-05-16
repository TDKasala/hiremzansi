import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Building2, Users, Clock, User, MapPin, PlusCircle, Search, Briefcase, Settings, Trash2, Edit, Eye, BarChart, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Employer, JobPosting } from "@/types/employer";
import CreateEmployerProfileForm from "@/components/employer/CreateEmployerProfileForm";
import { AlertCircle } from "lucide-react";

// Helper function to get initials from a string
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

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
  const handleCreateEmployer = (data: any) => {
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
    },
  });
  
  // Filter jobs based on search term
  const filteredJobs = jobs?.filter(job => {
    if (!jobSearch) return true;
    return (
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.description.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.location?.toLowerCase().includes(jobSearch.toLowerCase())
    );
  });
  
  // If we're still loading the employer profile, show a loading skeleton
  if (isLoadingEmployer) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
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
              onSubmit={handleCreateEmployer}
              isSubmitting={createEmployerMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If there's an error fetching the employer profile
  if (employerError) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {employerError instanceof Error ? employerError.message : "Failed to load employer profile"}
          </AlertDescription>
        </Alert>
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
            Post New Job
          </Button>
        </div>
      </div>
      
      {/* Dashboard tabs */}
      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Company Profile
          </TabsTrigger>
        </TabsList>
        
        {/* Job Postings Tab */}
        <TabsContent value="jobs">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search job postings..." 
                className="pl-8" 
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
              />
            </div>
          </div>
          
          {isLoadingJobs ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : jobsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load job postings. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {filteredJobs && filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <Card key={job.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {job.location || 'Remote/Unspecified'}
                              {job.employmentType && (
                                <>
                                  <span className="mx-1">•</span>
                                  {job.employmentType.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                </>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Badge variant={job.isActive ? "default" : "outline"}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {job.isFeatured && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm line-clamp-2">
                          {job.description.length > 150 
                            ? `${job.description.substring(0, 150)}...` 
                            : job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {job.requiredSkills?.slice(0, 5).map((skill, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills && job.requiredSkills.length > 5 && (
                            <Badge variant="outline">+{job.requiredSkills.length - 5} more</Badge>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex text-sm text-muted-foreground">
                          <div className="flex items-center mr-4">
                            <Eye className="h-4 w-4 mr-1" />
                            {job.views} views
                          </div>
                          {job.deadline && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-blue-500 text-blue-500 hover:text-blue-500"
                            onClick={() => navigate(`/employer/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-12 rounded-lg text-center space-y-4">
                  <Briefcase className="h-12 w-12 mx-auto text-muted" />
                  <h3 className="text-xl font-bold">No job postings found</h3>
                  <p className="text-muted-foreground">
                    {jobSearch 
                      ? `No job postings match your search for "${jobSearch}"`
                      : "You haven't created any job postings yet"}
                  </p>
                  <Button onClick={() => navigate("/employer/jobs/new")} className="bg-amber-500 hover:bg-amber-600">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post Your First Job
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Company Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Name:</span>
                    <span>{employer?.companyName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Industry:</span>
                    <span>{employer?.industry?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-24">Location:</span>
                    <span>{employer?.location?.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Not specified'}</span>
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
                      <AvatarImage src="" alt={employer?.companyName || "Company"} />
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