import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  MapPin, 
  Briefcase, 
  Award, 
  Calendar, 
  Tag, 
  BarChart, 
  Sparkles, 
  GraduationCap,
  Filter,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";

interface JobRecommendation {
  jobId: number;
  title: string;
  company: string;
  location: string | null;
  matchScore: number;
  matchDetails: {
    skillsMatch: number;
    skillsMatched: string[];
    industryMatch: number;
    locationMatch: number;
    saContextMatch: number;
    experienceMatch: number;
    bbbeeRelevance: number;
    nqfMatch: number;
  };
  postedAt: Date;
  applicationDeadline?: Date | null;
  salary?: string | null;
  employmentType: string | null;
}

interface ReferenceData {
  provinces: { code: string; name: string }[];
  industries: { code: string; name: string }[];
  bbbeeLevels: { level: number | string; points: string; description: string }[];
  nqfLevels: { level: number; description: string }[];
  employmentTypes: { code: string; name: string }[];
}

const JobRecommendationsPage = () => {
  const { toast } = useToast();
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [industriesFilter, setIndustriesFilter] = useState<string[]>([]);
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>("");
  const [includeAppliedJobs, setIncludeAppliedJobs] = useState(false);
  const [matchScoreThreshold, setMatchScoreThreshold] = useState(50);

  // Get user's CVs
  const { data: cvs } = useQuery({
    queryKey: ['/api/cvs'],
    enabled: true,
  });

  // Get reference data for filters
  const { data: referenceData } = useQuery<ReferenceData>({
    queryKey: ['/api/sa-reference-data'],
    enabled: true,
  });

  // Get the latest CV as default selection
  const { data: latestCv } = useQuery({
    queryKey: ['/api/latest-cv'],
    onSuccess: (data) => {
      if (data && data.id && !selectedCvId) {
        setSelectedCvId(data.id);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not load your latest CV. Please upload one to get personalized recommendations.",
        variant: "destructive",
      });
    },
  });

  // Get job recommendations based on CV and filters
  const { 
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    refetch: refetchRecommendations
  } = useQuery({
    queryKey: ['/api/sa-job-recommendations', selectedCvId, provinceFilter, industriesFilter, experienceLevelFilter, includeAppliedJobs],
    queryFn: async () => {
      if (!selectedCvId) return null;
      
      let url = `/api/sa-job-recommendations?cvId=${selectedCvId}&includeApplied=${includeAppliedJobs}`;
      
      if (provinceFilter) {
        url += `&province=${provinceFilter}`;
      }
      
      if (industriesFilter.length > 0) {
        url += `&industries=${industriesFilter.join(',')}`;
      }
      
      if (experienceLevelFilter) {
        url += `&experienceLevel=${experienceLevelFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch job recommendations");
      }
      
      return response.json();
    },
    enabled: !!selectedCvId,
  });

  const recommendations = recommendationsData?.recommendations || [];
  const filteredRecommendations = recommendations.filter(
    (job: JobRecommendation) => job.matchScore >= matchScoreThreshold
  );

  // Handle refreshing job recommendations
  const handleRefresh = () => {
    refetchRecommendations();
    toast({
      title: "Refreshing recommendations",
      description: "Finding the best job matches for your profile",
    });
  };

  // Format date display
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  // Calculate days ago for posting date
  const getDaysAgo = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  };

  return (
    <div className="container py-6 space-y-6">
      <Helmet>
        <title>Job Recommendations | South African Job Marketplace</title>
        <meta 
          name="description" 
          content="Personalized job recommendations based on your CV with South African context recognition, including B-BBEE status, NQF levels, and provincial targeting."
        />
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Personalized Job Recommendations</h1>
        <p className="text-muted-foreground">
          Jobs matched to your CV with South African context recognition
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Filter size={18} /> Filters
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isLoadingRecommendations}
                >
                  <RefreshCw size={16} className={isLoadingRecommendations ? "animate-spin" : ""} />
                </Button>
              </div>
              <CardDescription>
                Refine job recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CV Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose your CV</label>
                <Select 
                  value={selectedCvId?.toString() || ""} 
                  onValueChange={(value) => setSelectedCvId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a CV" />
                  </SelectTrigger>
                  <SelectContent>
                    {cvs?.map((cv: any) => (
                      <SelectItem key={cv.id} value={cv.id.toString()}>
                        {cv.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Province</label>
                <Select 
                  value={provinceFilter} 
                  onValueChange={setProvinceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Provinces</SelectItem>
                    {referenceData?.provinces.map((province) => (
                      <SelectItem key={province.code} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industries Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Industries</label>
                <Select 
                  value={industriesFilter[0] || ""} 
                  onValueChange={(value) => setIndustriesFilter(value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {referenceData?.industries.map((industry) => (
                      <SelectItem key={industry.code} value={industry.name}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select 
                  value={experienceLevelFilter} 
                  onValueChange={setExperienceLevelFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Experience</SelectItem>
                    <SelectItem value="entry level">Entry Level</SelectItem>
                    <SelectItem value="mid level">Mid Level</SelectItem>
                    <SelectItem value="senior level">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Match Score Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Minimum Match Score</label>
                  <span className="text-sm font-medium">{matchScoreThreshold}%</span>
                </div>
                <Slider
                  value={[matchScoreThreshold]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setMatchScoreThreshold(value[0])}
                />
              </div>

              {/* Include Applied Jobs */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="includeApplied"
                  checked={includeAppliedJobs}
                  onChange={() => setIncludeAppliedJobs(!includeAppliedJobs)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="includeApplied" className="text-sm font-medium">
                  Include jobs I've applied to
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleRefresh} 
                className="w-full"
                disabled={isLoadingRecommendations || !selectedCvId}
              >
                Apply Filters
              </Button>
            </CardFooter>
          </Card>

          {/* SA Context Explainer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">South African Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <Award size={16} className="text-yellow-500" /> 
                  B-BBEE Recognition
                </div>
                <p className="text-muted-foreground">
                  Jobs matched to your B-BBEE status for improved transformation alignment
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <GraduationCap size={16} className="text-blue-500" /> 
                  NQF Level Recognition
                </div>
                <p className="text-muted-foreground">
                  Matches your South African qualifications framework level to job requirements
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-green-500" /> 
                  Provincial Targeting
                </div>
                <p className="text-muted-foreground">
                  Optimizes for South African provinces and major cities in each region
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" /> 
                  SA Keyword Recognition
                </div>
                <p className="text-muted-foreground">
                  Identifies South African specific terms and requirements in your CV
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - job recommendations */}
        <div className="lg:col-span-9">
          {isLoadingRecommendations ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <RefreshCw size={40} className="animate-spin text-primary" />
              <p className="text-lg">Finding your perfect job matches...</p>
            </div>
          ) : filteredRecommendations.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {filteredRecommendations.length} Job Recommendations
                </h2>
                <Select 
                  defaultValue="match" 
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary">Salary (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredRecommendations.map((job: JobRecommendation) => (
                  <Card key={job.jobId} className="overflow-hidden border-l-4" style={{ borderLeftColor: getMatchColor(job.matchScore) }}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <div className="text-lg text-muted-foreground mt-1">
                              {job.company}
                            </div>
                          </div>
                          <Badge 
                            className={getMatchScoreBadgeClass(job.matchScore)}
                          >
                            {job.matchScore}% Match
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.location && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job.location}
                            </Badge>
                          )}
                          {job.employmentType && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase size={14} />
                              {job.employmentType}
                            </Badge>
                          )}
                          {job.salary && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Tag size={14} />
                              {job.salary}
                            </Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar size={14} />
                            Posted {getDaysAgo(job.postedAt)}
                          </Badge>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Skills Match</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {job.matchDetails.skillsMatched.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.matchDetails.skillsMatched.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.matchDetails.skillsMatched.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {job.applicationDeadline && (
                          <div className="mt-4 text-sm">
                            <span className="font-medium">Apply by:</span>{" "}
                            {formatDate(job.applicationDeadline)}
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-4 bg-muted/30 p-6">
                        <h4 className="text-sm font-medium mb-3">Match Analysis</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Skills Match</span>
                              <span>{Math.round(job.matchDetails.skillsMatch * 100)}%</span>
                            </div>
                            <Progress value={job.matchDetails.skillsMatch * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Industry Match</span>
                              <span>{Math.round(job.matchDetails.industryMatch * 100)}%</span>
                            </div>
                            <Progress value={job.matchDetails.industryMatch * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Location Match</span>
                              <span>{Math.round(job.matchDetails.locationMatch * 100)}%</span>
                            </div>
                            <Progress value={job.matchDetails.locationMatch * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>SA Context Match</span>
                              <span>{Math.round(job.matchDetails.saContextMatch * 100)}%</span>
                            </div>
                            <Progress value={job.matchDetails.saContextMatch * 100} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Experience Level</span>
                              <span>{Math.round(job.matchDetails.experienceMatch * 100)}%</span>
                            </div>
                            <Progress value={job.matchDetails.experienceMatch * 100} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Link to={`/jobs/${job.jobId}`}>
                            <Button className="w-full">
                              View Job <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="min-h-[400px] flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full p-4 inline-block">
                  <BarChart size={32} className="text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">No matching jobs found</h2>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any jobs that match your criteria. Try adjusting your filters or selecting a different CV.
                </p>
                <Button onClick={handleRefresh} className="mt-4">
                  Refresh Recommendations
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for UI
const getMatchColor = (score: number): string => {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#3b82f6"; // blue
  if (score >= 40) return "#f97316"; // orange
  return "#ef4444"; // red
};

const getMatchScoreBadgeClass = (score: number): string => {
  if (score >= 80) return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
  if (score >= 60) return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
  if (score >= 40) return "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20";
  return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
};

export default JobRecommendationsPage;