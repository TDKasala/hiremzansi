import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Building,
  GraduationCap,
  Layers,
  Share2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Format currency for display
const formatCurrency = (amount?: number, currency = "ZAR") => {
  if (amount === undefined) return "";
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export default function JobDetailsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute("/job/:id");
  
  // Create state for copying job URL
  const [copied, setCopied] = useState(false);
  
  // Fetch job details
  const {
    data: job,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/job-details', params?.id],
    queryFn: () => 
      fetch(`/api/job-details/${params?.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch job details');
          return res.json();
        }),
    enabled: !!params?.id,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  if (!match) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>The requested job listing could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/jobs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Search
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Handle apply button
  const handleApply = () => {
    if (job?.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    } else {
      toast({
        title: "Application Link Unavailable",
        description: "This job doesn't have an external application link.",
        variant: "destructive"
      });
    }
  };
  
  // Handle share job
  const handleShare = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: url,
      })
      .catch(() => {
        // Fallback to copy if share fails
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };
  
  // Copy URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Job URL Copied",
          description: "The job listing URL has been copied to your clipboard.",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Failed to Copy",
          description: "Could not copy the URL to clipboard.",
          variant: "destructive"
        });
      });
  };
  
  // Handle analyze skill match
  const handleAnalyzeSkills = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to analyze skill matches.",
        variant: "destructive"
      });
      
      // Redirect to login page
      setLocation("/auth?redirect=/job/" + params?.id);
      return;
    }
    
    // Redirect to skill gap analyzer with this job
    setLocation("/skills/analyze?jobId=" + params?.id);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md mb-2"></div>
            <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-6 bg-muted animate-pulse rounded-md"></div>
                <div className="h-6 bg-muted animate-pulse rounded-md"></div>
              </div>
              <div className="h-32 bg-muted animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Job</CardTitle>
            <CardDescription>
              There was an error loading the job details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive/80">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      ) : job ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1 text-lg">
                      <Briefcase className="h-5 w-5 inline mr-1" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col space-y-2 items-end">
                    <Badge className="text-sm">{job.jobType}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Source: {job.source}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Posted on {formatDate(job.postDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Industry: {job.industry}</span>
                  </div>
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Experience: {job.experienceLevel}</span>
                  </div>
                  {job.educationLevel && (
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Education: {job.educationLevel}</span>
                    </div>
                  )}
                </div>
                
                {job.salary?.min && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-1">Salary</h3>
                    <p className="font-medium text-green-600 dark:text-green-400 text-lg">
                      {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary.currency} per {job.salary.period}
                    </p>
                  </div>
                )}
                
                <Tabs defaultValue="description" className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <div className="prose prose-blue max-w-none">
                      {job.description.split('\n').map((paragraph: string, index: number) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="requirements" className="mt-4">
                    <div className="prose prose-blue max-w-none">
                      <ul className="space-y-2">
                        {job.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={handleApply}>
                  Apply for This Job
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Share Job"}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Match Analysis</CardTitle>
                <CardDescription>
                  Check how well your skills match this job posting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Our AI-powered skill gap analyzer will:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Compare your CV to this job posting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Identify missing skills and experience</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Recommend ways to improve your application</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Suggest tailored learning resources</span>
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={handleAnalyzeSkills}
                >
                  Analyze My Skills Match
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Practice</CardTitle>
                <CardDescription>
                  Prepare for the interview with AI-powered simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Practice answering job-specific interview questions:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Get real interview questions for this role</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Record and submit your answers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Receive AI feedback on your responses</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-2 mt-0.5">✓</div>
                    <span>Improve your interview skills</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Login Required",
                        description: "You need to be logged in to practice interviews.",
                        variant: "destructive"
                      });
                      setLocation("/auth?redirect=/interview/practice?jobId=" + params?.id);
                      return;
                    }
                    setLocation("/interview/practice?jobId=" + params?.id);
                  }}
                >
                  Practice Interview
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Coming soon - we'll show you similar jobs that match your profile.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/jobs">
                    Browse All Jobs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>
              The requested job listing could not be found or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/jobs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Job Search
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}