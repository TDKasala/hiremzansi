import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface JobMatch {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  industry: string;
  matchScore: number;
  salaryMatch: boolean;
  experienceMatch: boolean;
  skillsMatch: number;
  isRecruiterInterested: boolean;
  recruiterPaid: boolean;
  canViewCompany: boolean;
  notificationDate: string;
  matchReasons: string[];
}

export default function JobSeekerMatchesPage() {
  const { user } = useAuth();

  // Fetch job seeker matches
  const { data: matchesResponse, isLoading } = useQuery({
    queryKey: ['/api/job-seeker/matches'],
    enabled: !!user,
  });

  const matches: JobMatch[] = matchesResponse?.matches || [];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Fair Match';
  };

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
        <title>My Job Matches | Hire Mzansi</title>
        <meta name="description" content="View anonymous job opportunities that match your CV and skills on Hire Mzansi." />
      </Helmet>

      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Job Matches
              </h1>
              <p className="text-gray-600">
                Anonymous opportunities from recruiters interested in your profile
              </p>
            </div>

          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {matches.filter(m => m.isRecruiterInterested).length}
                  </div>
                  <div className="text-sm text-gray-600">Recruiter Interest</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Match Score</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {matches.filter(m => m.salaryMatch).length}
                  </div>
                  <div className="text-sm text-gray-600">Salary Matches</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Job Matches Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Recruiters haven't shown interest in your profile yet. Make sure your CV is optimized and complete to attract more opportunities.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Optimize My CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`px-3 py-1 font-semibold ${getMatchScoreColor(match.matchScore)}`}>
                          {match.matchScore}% • {getMatchScoreLabel(match.matchScore)}
                        </Badge>
                        {match.isRecruiterInterested && (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Recruiter Interested
                          </Badge>
                        )}
                        {match.salaryMatch && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Salary Match
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {match.jobTitle}
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(match.notificationDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 gap-4 mb-3">
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {match.canViewCompany ? match.company : 'Confidential Company'}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.location}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {match.industry}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      {match.canViewCompany ? (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-2">
                            {match.isRecruiterInterested ? 'Recruiter interested!' : 'Waiting for recruiter'}
                          </div>
                          <Button variant="outline" disabled>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Anonymous
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Match Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Match Analysis
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Skills Match:</span>
                          <span className="font-semibold">{match.skillsMatch}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Experience:</span>
                          <span className="font-semibold">
                            {match.experienceMatch ? '✓ Match' : '○ Partial'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Salary Range:</span>
                          <span className="font-semibold">
                            {match.salaryMatch ? '✓ Compatible' : '○ Negotiable'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Overall:</span>
                          <span className="font-semibold text-blue-600">{match.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Why This Match
                      </h4>
                      <div className="space-y-2">
                        {match.matchReasons.map((reason, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  {match.isRecruiterInterested && !match.canViewCompany && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <Eye className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-blue-900 mb-1">
                            A recruiter is interested in your profile!
                          </h5>
                          <p className="text-sm text-blue-700 mb-3">
                            This company wants to learn more about you. They're reviewing your CV and may reach out directly.
                          </p>
                          <div className="text-xs text-blue-600">
                            You'll be notified if they decide to contact you
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Information Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Zap className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                How Anonymous Job Matching Works
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Recruiters see your skills and experience but not your personal details</p>
                <p>• You see job opportunities but company details remain confidential</p>
                <p>• When both parties show interest, contact details are revealed</p>
                <p>• All interactions are secure and privacy-focused</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}