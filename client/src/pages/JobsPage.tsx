import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Users, 
  Search,
  Filter,
  Eye,
  Heart,
  Briefcase,
  Calendar
} from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  province: string;
  city: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string;
  requiredSkills: string[];
  preferredSkills: string[];
  industry: string;
  deadline: string;
  isActive: boolean;
  isFeatured: boolean;
  isRemote: boolean;
  views: number;
  applications: number;
  createdAt: string;
  employer: {
    id: number;
    companyName: string;
    industry: string;
    logo: string;
  };
}

export default function JobsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');

  // Fetch job postings
  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/job-postings', { 
      title: searchQuery, 
      location: locationFilter,
      industry: industryFilter,
      employmentType: employmentTypeFilter,
      limit: 50
    }],
    enabled: true
  });

  const provinces = [
    'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State',
    'KwaZulu-Natal', 'North West', 'Gauteng', 'Mpumalanga', 'Limpopo'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Mining', 'Agriculture', 'Tourism'
  ];

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'
  ];

  const handleSearch = () => {
    // The query will automatically refetch due to dependency on searchQuery
  };

  const formatSalary = (salaryRange: string) => {
    if (!salaryRange) return 'Salary not specified';
    return `R${salaryRange}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-purple-100 text-purple-800',
      'Temporary': 'bg-orange-100 text-orange-800',
      'Internship': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Helmet>
        <title>Find Jobs in South Africa | Hire Mzansi Job Search</title>
        <meta name="description" content="Search thousands of job opportunities in South Africa. Find your perfect match with our AI-powered job search platform tailored for the SA market." />
        <meta property="og:title" content="Job Search - Find Your Dream Job in South Africa" />
        <meta property="og:description" content="Discover job opportunities across South Africa with intelligent matching based on your skills and preferences." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
              <p className="text-lg text-gray-600">Discover job opportunities across South Africa</p>
            </div>

            {/* Search Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Job title or keywords"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Provinces</SelectItem>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {employmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          {/* Results count */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading...' : `${(jobs as JobPosting[]).length} jobs found`}
            </h2>
            {user && (
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Saved Jobs
              </Button>
            )}
          </div>

          {/* Job listings */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (jobs as JobPosting[]).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">Try adjusting your search filters or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              (jobs as JobPosting[]).map((job: JobPosting) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {job.employer?.logo ? (
                            <img 
                              src={job.employer.logo} 
                              alt={job.employer.companyName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Building className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                              {job.title}
                            </h3>
                            <p className="text-gray-600">{job.employer?.companyName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {job.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        <Badge className={getJobTypeColor(job.employmentType)}>
                          {job.employmentType}
                        </Badge>
                      </div>
                    </div>

                    {/* Job details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.isRemote ? 'Remote' : `${job.city}, ${job.province}`}
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {formatSalary(job.salaryRange)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Posted {formatDate(job.createdAt)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.requiredSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {job.views} views
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {job.applications} applications
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user && (
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        )}
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}