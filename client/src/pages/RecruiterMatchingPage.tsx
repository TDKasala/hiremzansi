import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Unlock,
  Eye,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

interface CandidateMatch {
  id: number;
  jobId: number;
  candidateId: number;
  matchScore: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  saContextMatch: number;
  isRecruiterNotified: boolean;
  isPaid: boolean;
  isContactRevealed: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  candidate: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    location: string;
    experienceLevel: string;
    skills: string[];
    bbbeeLevel?: number;
    industry: string;
    cvScore: number;
    lastActive: string;
  };
  job?: {
    id: number;
    title: string;
    department: string;
    urgency: 'low' | 'medium' | 'high';
    postedDate: string;
  };
  price: number;
}

export default function RecruiterMatchingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMatch, setSelectedMatch] = useState<CandidateMatch | null>(null);

  // Fetch job matches for recruiter
  const { data: matchesResponse, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['/api/recruiter/job-matches'],
    enabled: !!user,
  });

  // Fetch recruiter stats
  const { data: stats } = useQuery({
    queryKey: ['/api/recruiter/stats'],
    enabled: !!user,
  });

  const matches: CandidateMatch[] = matchesResponse?.matches || [];
  const isDemo = matchesResponse?.isDemo || false;

  // Unlock candidate contact mutation
  const unlockCandidateMutation = useMutation({
    mutationFn: (matchId: number) => 
      apiRequest('POST', `/api/recruiter/unlock-candidate/${matchId}`),
    onSuccess: (response) => {
      toast({
        title: "Payment Processing",
        description: "Redirecting to secure payment gateway...",
      });
      
      // Redirect to payment URL
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/job-matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleUnlockCandidate = (match: CandidateMatch) => {
    if (match.isPaid) {
      setSelectedMatch(match);
      return;
    }

    unlockCandidateMutation.mutate(match.id);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingMatches) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
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
        <title>Candidate Matches | Hire Mzansi Recruiter</title>
        <meta name="description" content="View and unlock candidate matches for your job postings on Hire Mzansi." />
      </Helmet>

      <div className="container mx-auto py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Candidate Matches
            </h1>
            <p className="text-gray-600">
              AI-powered matches for your job postings
            </p>
            {isDemo && (
              <Badge variant="outline" className="mt-2">
                Demo Mode - Real matches will appear with active job postings
              </Badge>
            )}
          </div>

          {stats && (
            <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCandidates}</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{stats.unlockedContacts}</div>
                <div className="text-sm text-gray-600">Unlocked</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{stats.averageMatchScore}%</div>
                <div className="text-sm text-gray-600">Avg. Match</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{stats.creditsRemaining}</div>
                <div className="text-sm text-gray-600">Credits</div>
              </div>
            </div>
          )}
        </div>

        {/* Matches Grid */}
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Candidate Matches Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Post job openings to start receiving AI-matched candidates
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Building2 className="h-4 w-4 mr-2" />
                Post New Job
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
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`px-3 py-1 font-semibold ${getMatchScoreColor(match.matchScore)}`}>
                          {match.matchScore}% Match
                        </Badge>
                        {match.job && (
                          <Badge className={getUrgencyColor(match.job.urgency)}>
                            {match.job.urgency} Priority
                          </Badge>
                        )}
                        {match.candidate.bbbeeLevel && (
                          <Badge variant="outline">
                            B-BBEE Level {match.candidate.bbbeeLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 gap-4">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.candidate.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {match.candidate.experienceLevel}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          CV Score: {match.candidate.cvScore}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {match.isPaid ? (
                        <Button 
                          onClick={() => setSelectedMatch(match)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Contact
                        </Button>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            R{match.price}
                          </div>
                          <Button 
                            onClick={() => handleUnlockCandidate(match)}
                            disabled={unlockCandidateMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            {unlockCandidateMutation.isPending ? 'Processing...' : 'Unlock Contact'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Skills Match */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Skills Analysis
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Skills Match:</span>
                          <span className="font-semibold">{match.skillsMatch}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Experience:</span>
                          <span className="font-semibold">{match.experienceMatch}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Location:</span>
                          <span className="font-semibold">{match.locationMatch}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>SA Context:</span>
                          <span className="font-semibold">{match.saContextMatch}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Key Skills Matched
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedSkills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {match.matchedSkills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.matchedSkills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Skills Gap
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-orange-600">
                            {skill}
                          </Badge>
                        ))}
                        {match.missingSkills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.missingSkills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Details Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Candidate Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>Match Score:</strong> {selectedMatch.matchScore}%
                  </div>
                </div>

                {selectedMatch.candidate.name && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">{selectedMatch.candidate.name}</span>
                    </div>
                    
                    {selectedMatch.candidate.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-600" />
                        <a 
                          href={`mailto:${selectedMatch.candidate.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedMatch.candidate.email}
                        </a>
                      </div>
                    )}
                    
                    {selectedMatch.candidate.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-600" />
                        <a 
                          href={`tel:${selectedMatch.candidate.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedMatch.candidate.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                      <span>{selectedMatch.candidate.location}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setSelectedMatch(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedMatch.candidate.email && (
                    <Button 
                      onClick={() => window.open(`mailto:${selectedMatch.candidate.email}`, '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contact Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}