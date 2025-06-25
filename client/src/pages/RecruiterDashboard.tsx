import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet';
import {
  Building2,
  Plus,
  Users,
  Eye,
  CreditCard,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Settings,
  BarChart3
} from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  bbbeeLevel?: number;
  nqfLevel?: number;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract';
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
  matchCount: number;
}

interface CandidateMatch {
  id: number;
  jobId: number;
  matchScore: number;
  skillsMatched: string[];
  experienceYears: number;
  location: string;
  bbbeeLevel?: number;
  nqfLevel?: string;
  isUnlocked: boolean;
  price: number;
  highlights: string[];
}

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    minScore: 80,
    location: '',
    bbbeeLevel: '',
    nqfLevel: ''
  });

  // Sample data - replace with actual API calls
  const jobPostings: JobPosting[] = [
    {
      id: 1,
      title: 'Senior Software Developer',
      company: 'Tech Solutions SA',
      location: 'Cape Town',
      description: 'We are looking for an experienced software developer...',
      requirements: ['React', 'Node.js', 'PostgreSQL'],
      bbbeeLevel: 2,
      nqfLevel: 7,
      salary: 'R650,000 - R850,000',
      type: 'full-time',
      status: 'active',
      createdAt: '2024-01-15',
      matchCount: 12
    },
    {
      id: 2,
      title: 'Project Manager',
      company: 'Construction Corp',
      location: 'Johannesburg',
      description: 'Experienced project manager for construction projects...',
      requirements: ['PMP Certification', 'Construction Experience', 'Team Leadership'],
      bbbeeLevel: 1,
      nqfLevel: 8,
      salary: 'R580,000 - R720,000',
      type: 'full-time',
      status: 'active',
      createdAt: '2024-01-10',
      matchCount: 8
    }
  ];

  const candidateMatches: CandidateMatch[] = [
    {
      id: 1,
      jobId: 1,
      matchScore: 92,
      skillsMatched: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      experienceYears: 8,
      location: 'Cape Town',
      bbbeeLevel: 1,
      nqfLevel: 'Level 7 (Bachelor\'s)',
      isUnlocked: false,
      price: 250,
      highlights: ['8+ years experience', 'Full-stack expertise', 'Local candidate']
    },
    {
      id: 2,
      jobId: 1,
      matchScore: 87,
      skillsMatched: ['React', 'Node.js', 'MongoDB'],
      experienceYears: 5,
      location: 'Stellenbosch',
      bbbeeLevel: 2,
      nqfLevel: 'Level 6 (Diploma)',
      isUnlocked: true,
      price: 200,
      highlights: ['Strong frontend skills', 'Agile experience', 'Available immediately']
    }
  ];

  const unlockCandidateMutation = useMutation({
    mutationFn: (candidateId: number) => 
      apiRequest(`/api/recruiter/unlock-candidate/${candidateId}`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/matches'] });
    }
  });

  const handleUnlockCandidate = (candidateId: number) => {
    unlockCandidateMutation.mutate(candidateId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Recruiter Dashboard | Hire Mzansi</title>
        <meta name="description" content="Manage job postings and access premium candidate matches on Hire Mzansi's recruiter platform." />
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Recruiter Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage private job postings and access premium candidate matches
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                  <p className="text-2xl font-bold">34</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unlocked Profiles</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">R2,850</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="matches">Candidate Matches</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Job Postings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Recent Job Postings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobPostings.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.matchCount} matches
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Candidate Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidateMatches.slice(0, 3).map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">{match.matchScore}%</span>
                          </div>
                          <span className="font-medium">Software Developer Match</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.experienceYears}+ years • {match.location}
                        </p>
                      </div>
                      <div className="text-right">
                        {match.isUnlocked ? (
                          <Badge className="bg-brand-green-light text-brand-green">Unlocked</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleUnlockCandidate(match.id)} className="btn-brand">
                            <Eye className="h-4 w-4 mr-1" />
                            R{match.price}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search job postings..."
                  className="max-w-sm"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {jobPostings.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.matchCount} candidates matched
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, index) => (
                            <Badge key={index} variant="secondary">{req}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Details</h4>
                        <div className="space-y-1 text-sm">
                          {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
                          {job.bbbeeLevel && <p><strong>B-BBEE Level:</strong> {job.bbbeeLevel}</p>}
                          {job.nqfLevel && <p><strong>NQF Level:</strong> {job.nqfLevel}</p>}
                          <p><strong>Type:</strong> {job.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedJob(job.id)}
                        className="border-brand-blue text-brand-blue hover:bg-brand-blue-light"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Matches ({job.matchCount})
                      </Button>
                      <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green-light">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Job
                      </Button>
                      <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange-light">
                        <Download className="h-4 w-4 mr-2" />
                        Export Matches
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Match Score</label>
                    <Input
                      type="number"
                      value={filters.minScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any location</SelectItem>
                        <SelectItem value="cape-town">Cape Town</SelectItem>
                        <SelectItem value="johannesburg">Johannesburg</SelectItem>
                        <SelectItem value="durban">Durban</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">B-BBEE Level</label>
                    <Select value={filters.bbbeeLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, bbbeeLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any level</SelectItem>
                        <SelectItem value="1">Level 1</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">NQF Level</label>
                    <Select value={filters.nqfLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, nqfLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any level</SelectItem>
                        <SelectItem value="6">Level 6 (Diploma)</SelectItem>
                        <SelectItem value="7">Level 7 (Bachelor's)</SelectItem>
                        <SelectItem value="8">Level 8 (Honours)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Matches */}
            <div className="grid gap-6">
              {candidateMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{match.matchScore}%</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Candidate Match</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.experienceYears}+ years experience</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {match.location}
                            </span>
                            {match.bbbeeLevel && (
                              <span>B-BBEE Level {match.bbbeeLevel}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {match.isUnlocked ? (
                          <div>
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Profile Unlocked
                            </Badge>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download CV
                              </Button>
                              <Button size="sm">
                                <Send className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Unlock full profile for R{match.price}
                            </p>
                            <Button 
                              onClick={() => handleUnlockCandidate(match.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Unlock Profile
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Skills Matched</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.skillsMatched.map((skill, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Highlights</h4>
                        <ul className="space-y-1">
                          {match.highlights.map((highlight, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Match Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Match Score</span>
                      <span className="font-bold">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profiles Unlocked</span>
                      <span className="font-bold">12/34</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-bold">35%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Spend</span>
                      <span className="font-bold">R2,850</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost per Hire</span>
                      <span className="font-bold">R950</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Time to Fill</span>
                      <span className="font-bold">12 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}