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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Bell,
  Eye,
  TrendingUp,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Edit,
  Settings,
  Target,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string[];
  bbbeeLevel?: number;
  nqfLevel?: string;
  salary_expectation?: string;
  availability: 'immediate' | '2_weeks' | '1_month' | '3_months';
  employment_type: string[];
  profile_visibility: boolean;
  match_notifications: boolean;
  profile_completion: number;
}

interface JobMatch {
  id: number;
  matchScore: number;
  companyType: string;
  location: string;
  salaryRange?: string;
  skillsMatched: string[];
  missingSkills: string[];
  feedback: string;
  matchedDate: string;
  status: 'new' | 'viewed' | 'interested';
}

interface MatchInsight {
  totalMatches: number;
  averageScore: number;
  topSkills: string[];
  improvementAreas: string[];
  marketDemand: 'high' | 'medium' | 'low';
  profileViews: number;
}

export default function JobSeekerProfile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Sample data - replace with actual API calls
  const userProfile: UserProfile = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+27 82 123 4567',
    location: 'Cape Town, Western Cape',
    summary: 'Experienced software developer with 5+ years in full-stack development. Passionate about creating scalable web applications and mentoring junior developers.',
    experience: '5+ years',
    education: 'BSc Computer Science, University of Cape Town',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
    bbbeeLevel: 2,
    nqfLevel: 'Level 7 (Bachelor\'s Degree)',
    salary_expectation: 'R650,000 - R850,000',
    availability: '2_weeks',
    employment_type: ['full-time', 'remote'],
    profile_visibility: true,
    match_notifications: true,
    profile_completion: 85
  };

  const jobMatches: JobMatch[] = [
    {
      id: 1,
      matchScore: 92,
      companyType: 'Tech Startup',
      location: 'Cape Town (Remote)',
      salaryRange: 'R700,000 - R900,000',
      skillsMatched: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      missingSkills: ['Kubernetes', 'GraphQL'],
      feedback: 'Excellent match for senior full-stack role. Your React and Node.js experience aligns perfectly with requirements.',
      matchedDate: '2024-01-15',
      status: 'new'
    },
    {
      id: 2,
      matchScore: 87,
      companyType: 'Financial Services',
      location: 'Johannesburg (Hybrid)',
      salaryRange: 'R650,000 - R750,000',
      skillsMatched: ['React', 'TypeScript', 'AWS'],
      missingSkills: ['Java', 'Spring Boot'],
      feedback: 'Strong frontend skills match our requirements. Consider adding Java experience for backend development.',
      matchedDate: '2024-01-12',
      status: 'viewed'
    }
  ];

  const matchInsights: MatchInsight = {
    totalMatches: 12,
    averageScore: 84,
    topSkills: ['React', 'TypeScript', 'Node.js'],
    improvementAreas: ['Cloud Architecture', 'DevOps', 'System Design'],
    marketDemand: 'high',
    profileViews: 24
  };

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => 
      apiRequest('/api/profile', 'PUT', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
    }
  });

  const handleSaveProfile = (data: Partial<UserProfile>) => {
    updateProfileMutation.mutate(data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <>
      <Helmet>
        <title>My Profile | Hire Mzansi - Job Seeker Dashboard</title>
        <meta name="description" content="Manage your job seeker profile and view anonymous job matches on Hire Mzansi." />
      </Helmet>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional profile and view job matches
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload CV
            </Button>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {userProfile.profile_completion < 100 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-medium text-orange-900">Complete Your Profile</h3>
                    <p className="text-sm text-orange-700">
                      {userProfile.profile_completion}% complete. Complete your profile to get better job matches.
                    </p>
                  </div>
                </div>
                <Progress value={userProfile.profile_completion} className="w-24" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matching Benefits Banner */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Your Profile is Active in Our Matching Network
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Employers are anonymously matching your profile against exclusive job opportunities. 
                  Keep your profile updated to receive better matches.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {matchInsights.totalMatches} matches this month
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-blue-600" />
                    {matchInsights.profileViews} profile views
                  </span>
                  <Badge className="bg-green-100 text-green-800">100% Free</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="matches">Job Matches</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <Input defaultValue={userProfile.name} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input defaultValue={userProfile.email} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input defaultValue={userProfile.phone} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input defaultValue={userProfile.location} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Professional Summary</label>
                        <Textarea defaultValue={userProfile.summary} rows={4} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                        <p className="text-muted-foreground">{userProfile.email}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {userProfile.location}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Professional Summary</h4>
                        <p className="text-sm text-muted-foreground">{userProfile.summary}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Completion</span>
                    <span className="font-bold">{userProfile.profile_completion}%</span>
                  </div>
                  <Progress value={userProfile.profile_completion} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Job Matches</span>
                    <span className="font-bold">{matchInsights.totalMatches}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Match Score</span>
                    <span className="font-bold">{matchInsights.averageScore}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Views</span>
                    <span className="font-bold">{matchInsights.profileViews}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills and Experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Skills (comma separated)</label>
                        <Input defaultValue={userProfile.skills.join(', ')} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Experience Level</label>
                        <Select defaultValue={userProfile.experience}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="2-3">2-3 years</SelectItem>
                            <SelectItem value="4-5">4-5 years</SelectItem>
                            <SelectItem value="5+">5+ years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Experience</h4>
                        <p className="text-sm text-muted-foreground">{userProfile.experience}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Education</label>
                        <Textarea defaultValue={userProfile.education} rows={3} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">NQF Level</label>
                        <Select defaultValue={userProfile.nqfLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Level 4">Level 4 (Grade 12)</SelectItem>
                            <SelectItem value="Level 5">Level 5 (Higher Certificate)</SelectItem>
                            <SelectItem value="Level 6">Level 6 (Diploma)</SelectItem>
                            <SelectItem value="Level 7">Level 7 (Bachelor's)</SelectItem>
                            <SelectItem value="Level 8">Level 8 (Honours)</SelectItem>
                            <SelectItem value="Level 9">Level 9 (Master's)</SelectItem>
                            <SelectItem value="Level 10">Level 10 (Doctorate)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Education</h4>
                        <p className="text-sm text-muted-foreground">{userProfile.education}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">NQF Level</h4>
                        <p className="text-sm text-muted-foreground">{userProfile.nqfLevel}</p>
                      </div>
                      {userProfile.bbbeeLevel && (
                        <div>
                          <h4 className="font-medium mb-2">B-BBEE Status</h4>
                          <Badge className="bg-green-100 text-green-800">
                            Level {userProfile.bbbeeLevel}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveProfile(userProfile)}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Anonymous Job Matches
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Employers have matched your profile against private job opportunities. 
                  Details are anonymous to protect both parties.
                </p>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              {jobMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getScoreBgColor(match.matchScore)}`}>
                          <span className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                            {match.matchScore}%
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Job Match #{match.id}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.companyType}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {match.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(match.matchedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            match.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            match.status === 'viewed' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }
                        >
                          {match.status === 'new' ? 'New Match' : 
                           match.status === 'viewed' ? 'Viewed' : 'Interested'}
                        </Badge>
                        {match.salaryRange && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {match.salaryRange}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Skills You Have</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.skillsMatched.map((skill, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-orange-700">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.missingSkills.map((skill, index) => (
                            <Badge key={index} className="bg-orange-100 text-orange-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        Optimization Feedback
                      </h4>
                      <p className="text-sm text-gray-700">{match.feedback}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{matchInsights.totalMatches}</p>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{matchInsights.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Match Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{matchInsights.profileViews}</p>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold capitalize">{matchInsights.marketDemand}</p>
                  <p className="text-sm text-muted-foreground">Market Demand</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills in Demand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchInsights.topSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{skill}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {userProfile.skills.includes(skill) ? 'You have this' : 'In demand'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchInsights.improvementAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{area}</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Learn
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Salary Expectation</label>
                    <Input defaultValue={userProfile.salary_expectation} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Availability</label>
                    <Select defaultValue={userProfile.availability}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="2_weeks">2 weeks notice</SelectItem>
                        <SelectItem value="1_month">1 month notice</SelectItem>
                        <SelectItem value="3_months">3 months notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Employment Type</label>
                  <div className="mt-2 space-y-2">
                    {['full-time', 'part-time', 'contract', 'remote', 'hybrid'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={type} 
                          defaultChecked={userProfile.employment_type.includes(type)}
                        />
                        <label htmlFor={type} className="text-sm capitalize">{type.replace('-', ' ')}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Visibility Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow your profile to be matched against job opportunities
                    </p>
                  </div>
                  <Switch defaultChecked={userProfile.profile_visibility} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Match Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you match with job opportunities
                    </p>
                  </div>
                  <Switch defaultChecked={userProfile.match_notifications} />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Your Privacy is Protected
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Your contact details are never shared without your consent</li>
                    <li>• All job matches are completely anonymous</li>
                    <li>• Employers only see match scores and skill alignment</li>
                    <li>• You control when and how to respond to opportunities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}