import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  Eye, 
  Clock, 
  Star,
  Target,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface JobMatch {
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
    name?: string; // Hidden until paid
    email?: string; // Hidden until paid
    location: string;
    experienceLevel: string;
    skills: string[];
    bbbeeLevel?: number;
    industry: string;
    cvScore: number;
    lastActive: string;
  };
  job: {
    id: number;
    title: string;
    department: string;
    urgency: 'low' | 'medium' | 'high';
    postedDate: string;
  };
  price: number; // Cost to unlock contact
}

export default function PremiumRecruiterMatchingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  // Fetch job matches for recruiter's jobs
  const { data: jobMatches = [], isLoading } = useQuery<JobMatch[]>({
    queryKey: ['/api/recruiter/job-matches'],
    enabled: !!user,
  });

  // Fetch recruiter's job posting stats
  const { data: recruiterStats } = useQuery({
    queryKey: ['/api/recruiter/stats'],
    enabled: !!user,
  });

  // Purchase contact access mutation
  const purchaseContactMutation = useMutation({
    mutationFn: async (matchId: number) => {
      return apiRequest(`/api/recruiter/purchase-contact/${matchId}`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/job-matches'] });
      toast({
        title: "Contact Access Purchased",
        description: "You can now view the candidate's full contact details.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase contact access",
        variant: "destructive",
      });
    },
  });

  const handlePurchaseContact = (match: JobMatch) => {
    purchaseContactMutation.mutate(match.id);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 55) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => `R${price}`;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recruiter Access Required</h3>
            <p className="text-gray-600 mb-4">Sign in to access premium candidate matching</p>
            <Button asChild>
              <a href="/auth">Sign In as Recruiter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Premium Candidate Matching | Hire Mzansi Recruiters</title>
        <meta name="description" content="Access pre-screened, AI-matched candidates for your job postings. Pay only when you find the perfect match." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Premium Candidate Matching</h1>
                <p className="text-gray-600">AI-powered matches for your job postings</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Service
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{jobMatches.length}</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {jobMatches.filter(m => m.matchScore >= 85).length}
                </div>
                <div className="text-sm text-gray-600">High Quality Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {jobMatches.filter(m => m.isPaid).length}
                </div>
                <div className="text-sm text-gray-600">Contacts Purchased</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {jobMatches.filter(m => !m.isRecruiterNotified).length}
                </div>
                <div className="text-sm text-gray-600">New Matches</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different match categories */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="new">New Matches</TabsTrigger>
              <TabsTrigger value="high-quality">High Quality</TabsTrigger>
              <TabsTrigger value="purchased">Purchased</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading matches...</div>
              ) : jobMatches.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-600">
                      Post more jobs or wait for new candidates to upload their CVs.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobMatches.map((match) => (
                    <Card key={match.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`w-16 h-16 rounded-lg ${getMatchScoreBg(match.matchScore)} flex items-center justify-center`}>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getMatchScoreColor(match.matchScore)}`}>
                                    {match.matchScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">match</div>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {match.isPaid ? match.candidate.name : `${match.candidate.experienceLevel} ${match.candidate.industry} Professional`}
                                </h3>
                                <p className="text-gray-600">
                                  {match.job.title} • {match.job.department}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getUrgencyColor(match.job.urgency)}>
                                    {match.job.urgency} priority
                                  </Badge>
                                  {!match.isRecruiterNotified && (
                                    <Badge className="bg-blue-100 text-blue-800">New</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatPrice(match.price)}</div>
                            <div className="text-sm text-gray-600">to unlock contact</div>
                          </div>
                        </div>

                        {/* Match breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Skills</div>
                            <div className={`text-lg font-semibold ${getMatchScoreColor(match.skillsMatch)}`}>
                              {match.skillsMatch}%
                            </div>
                            <Progress value={match.skillsMatch} className="h-2 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Experience</div>
                            <div className={`text-lg font-semibold ${getMatchScoreColor(match.experienceMatch)}`}>
                              {match.experienceMatch}%
                            </div>
                            <Progress value={match.experienceMatch} className="h-2 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Location</div>
                            <div className={`text-lg font-semibold ${getMatchScoreColor(match.locationMatch)}`}>
                              {match.locationMatch}%
                            </div>
                            <Progress value={match.locationMatch} className="h-2 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">SA Context</div>
                            <div className={`text-lg font-semibold ${getMatchScoreColor(match.saContextMatch)}`}>
                              {match.saContextMatch}%
                            </div>
                            <Progress value={match.saContextMatch} className="h-2 mt-1" />
                          </div>
                        </div>

                        {/* Candidate info preview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                          <div>
                            <strong>Location:</strong> {match.candidate.location}
                          </div>
                          <div>
                            <strong>Experience:</strong> {match.candidate.experienceLevel}
                          </div>
                          <div>
                            <strong>CV Score:</strong> {match.candidate.cvScore}%
                          </div>
                        </div>

                        {/* Skills preview */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Matching Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {match.matchedSkills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {match.matchedSkills.length > 5 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                +{match.matchedSkills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Posted {new Date(match.job.postedDate).toLocaleDateString()}
                          </div>
                          
                          {match.isPaid ? (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Profile
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Contact Candidate
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handlePurchaseContact(match)}
                              disabled={purchaseContactMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {purchaseContactMutation.isPending ? 'Processing...' : `Unlock Contact - ${formatPrice(match.price)}`}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Similar content for other tabs with appropriate filtering */}
            <TabsContent value="new">
              <div className="text-center py-8 text-gray-600">
                Showing only new matches that haven't been reviewed yet
              </div>
            </TabsContent>

            <TabsContent value="high-quality">
              <div className="text-center py-8 text-gray-600">
                Showing matches with 85%+ compatibility score
              </div>
            </TabsContent>

            <TabsContent value="purchased">
              <div className="text-center py-8 text-gray-600">
                Showing candidates whose contact details you've purchased
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}