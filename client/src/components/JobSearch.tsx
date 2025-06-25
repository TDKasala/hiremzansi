import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, MapPin, Calendar, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for the job board data
interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
  };
  skills: string[];
  jobType: string;
  industry: string;
  experienceLevel: string;
  educationLevel: string;
  postDate: string;
  applicationUrl: string;
  source: string;
}

interface JobSearchResults {
  jobs: JobPosting[];
  totalCount: number;
  sources: string[];
}

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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function JobSearch() {
  const { toast } = useToast();
  
  // Search params
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Track whether a search has been performed
  const [hasSearched, setHasSearched] = useState(false);
  
  // Prepare search query
  const searchQuery = {
    keywords,
    location,
    industry,
    jobType,
    experienceLevel,
    page,
    pageSize
  };
  
  // Convert to query string
  const queryString = Object.entries(searchQuery)
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  
  // Fetch job listings
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery<JobSearchResults>({
    queryKey: ['/api/job-search', queryString],
    queryFn: () => 
      fetch(`/api/job-search?${queryString}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch job listings');
          return res.json();
        }),
    enabled: hasSearched,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    setHasSearched(true);
    
    // Update the query
    queryClient.invalidateQueries({
      queryKey: ['/api/job-search']
    });
  };
  
  // Calculate total pages
  const totalPages = data?.totalCount 
    ? Math.ceil(data.totalCount / pageSize) 
    : 0;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">South African Job Search</h1>
      
      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Your Next Opportunity</CardTitle>
          <CardDescription>
            Search for jobs from top South African companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords or Job Title</Label>
                <Input
                  id="keywords"
                  placeholder="e.g. Software Developer, Accountant, Manager"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Johannesburg, Cape Town, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Finance">Finance & Banking</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Mining">Mining</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="Transportation">Transportation & Logistics</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="All Job Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Experience</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Jobs
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Results */}
      {hasSearched && (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p>There was an error loading job listings. Please try again.</p>
                <p className="text-sm text-destructive/80 mt-2">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setHasSearched(true)}>
                  Retry
                </Button>
              </CardFooter>
            </Card>
          ) : data?.jobs.length === 0 ? (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>No Jobs Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No jobs match your search criteria. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data?.totalCount || 0)} of {data?.totalCount || 0} jobs
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Sources:</p>
                  {data?.sources.map(source => (
                    <Badge key={source} variant="outline">{source}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {data?.jobs.map(job => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>
                            <Link href={`/job/${job.id}`} className="text-primary hover:underline">
                              {job.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            {job.company}
                          </CardDescription>
                        </div>
                        <Badge>{job.jobType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(job.postDate)}
                        </div>
                      </div>
                      
                      <p className="line-clamp-2 text-sm mb-3">
                        {job.description}
                      </p>
                      
                      {job.salary?.min && (
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary.currency} per {job.salary.period}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Source: {job.source}
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/job/${job.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && setPage(p => p - 1)}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Handle pagination display logic
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (page <= 3) {
                        pageNumber = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = page - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPage(pageNumber)}
                            isActive={pageNumber === page}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < totalPages && setPage(p => p + 1)}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}