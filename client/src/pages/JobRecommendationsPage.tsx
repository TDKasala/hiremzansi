import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  Star,
  Filter,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Heart,
  Bookmark
} from 'lucide-react';

interface JobRecommendation {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  industry: string;
  employmentType: string;
  experienceLevel: string;
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  bbbeeCompliant: boolean;
}

export default function JobRecommendationsPage() {
  const { user } = useAuth();
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  // Get user's latest CV ID for recommendations
  const { data: latestCV } = useQuery({
    queryKey: ['/api/latest-cv'],
    enabled: !!user,
  });

  // Fetch job recommendations
  const { data: recommendationsResponse, isLoading } = useQuery({
    queryKey: [
      '/api/job-recommendations', 
      latestCV?.id, 
      selectedProvince, 
      selectedIndustry, 
      selectedExperience
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (latestCV?.id) params.append('cvId', latestCV.id.toString());
      if (selectedProvince) params.append('province', selectedProvince);
      if (selectedIndustry) params.append('industries', selectedIndustry);
      if (selectedExperience) params.append('experienceLevel', selectedExperience);
      return fetch(`/api/job-recommendations?${params}`).then(res => res.json());
    },
    enabled: !!latestCV?.id,
  });

  const recommendations: JobRecommendation[] = recommendationsResponse?.recommendations || [];

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Mining', 'Government', 'Consulting'
  ];

  const experienceLevels = [
    'Entry Level', 'Mid-level', 'Senior', 'Executive'
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 65) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!latestCV && !isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your CV First
            </h3>
            <p className="text-gray-600 mb-6">
              To get personalized job recommendations, please upload your CV first
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upload CV
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Job Recommendations | Hire Mzansi</title>
        <meta name="description" content="Personalized job recommendations based on your CV and preferences in South Africa." />
      </Helmet>

      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Job Recommendations
              </h1>
              <p className="text-gray-600">
                Personalized opportunities based on your CV and skills
              </p>
            </div>

          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedProvince || selectedIndustry || selectedExperience) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProvince('');
                    setSelectedIndustry('');
                    setSelectedExperience('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                  <div className="text-sm text-gray-600">Recommendations</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {recommendations.length > 0 ? Math.round(recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Match</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(recommendations.map(r => r.company)).size}
                  </div>
                  <div className="text-sm text-gray-600">Companies</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {recommendations.filter(r => r.isRemote).length}
                  </div>
                  <div className="text-sm text-gray-600">Remote Jobs</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Job Recommendations */}
        {recommendations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-600 mb-6">
                No job opportunities match your current criteria. Try adjusting your filters or update your CV to attract more relevant positions.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Update CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map((job) => (
              <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`px-3 py-1 font-semibold ${getMatchScoreColor(job.matchScore)}`}>
                          {job.matchScore}% Match
                        </Badge>
                        {job.isRemote && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Remote
                          </Badge>
                        )}
                        {job.bbbeeCompliant && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            B-BBEE Compliant
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.jobTitle}
                      </h3>

                      <div className="flex items-center text-sm text-gray-600 gap-4 mb-3">
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {job.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salaryRange}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(job.postedDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{job.industry}</Badge>
                        <Badge variant="secondary">{job.employmentType}</Badge>
                        <Badge variant="secondary">{job.experienceLevel}</Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Job Description */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 6).map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Benefits
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}