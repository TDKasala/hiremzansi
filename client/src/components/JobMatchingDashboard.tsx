import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobMatchingCard } from './JobMatchingCard';
import { useAuth } from '@/hooks/use-auth';
import { 
  Target, 
  TrendingUp, 
  MapPin, 
  Briefcase,
  Star,
  Filter,
  SortDesc,
  RefreshCw
} from 'lucide-react';

interface JobMatch {
  id: number;
  matchScore: number;
  skillsMatchScore: number;
  experienceMatchScore: number;
  locationMatchScore: number;
  saContextScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
  improvementSuggestions: string[];
  isViewed: boolean;
  isApplied: boolean;
  status: string;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    province: string;
    employmentType: string;
    salaryRange: string;
    description: string;
    requiredSkills: string[];
    isRemote: boolean;
    isFeatured: boolean;
  };
}

interface JobMatchingDashboardProps {
  cvId?: number;
}

export function JobMatchingDashboard({ cvId }: JobMatchingDashboardProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'matchScore' | 'recent'>('matchScore');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'applied'>('all');

  // Fetch job matches for user's CV
  const { data: jobMatches = [], isLoading, refetch } = useQuery<JobMatch[]>({
    queryKey: ['/api/cv-job-matches', cvId],
    enabled: !!user && !!cvId,
  });

  // Fetch user's CVs if no cvId provided
  const { data: userCVs = [] } = useQuery({
    queryKey: ['/api/cvs'],
    enabled: !!user && !cvId,
  });

  const defaultCv = userCVs.find((cv: any) => cv.isDefault) || userCVs[0];
  const activeCvId = cvId || defaultCv?.id;

  const handleViewJob = (jobId: number) => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  const handleSaveJob = (jobId: number) => {
    // Implementation for saving job
    console.log('Saving job:', jobId);
  };

  const handleApplyJob = (jobId: number) => {
    // Implementation for applying to job
    console.log('Applying to job:', jobId);
  };

  const filteredMatches = jobMatches.filter(match => {
    if (filterStatus === 'new') return !match.isViewed;
    if (filterStatus === 'applied') return match.isApplied;
    return true;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
    return new Date(b.id).getTime() - new Date(a.id).getTime(); // Assuming newer IDs are higher
  });

  const getMatchStats = () => {
    const totalMatches = jobMatches.length;
    const excellentMatches = jobMatches.filter(m => m.matchScore >= 80).length;
    const goodMatches = jobMatches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length;
    const averageScore = totalMatches > 0 
      ? Math.round(jobMatches.reduce((sum, m) => sum + m.matchScore, 0) / totalMatches)
      : 0;

    return { totalMatches, excellentMatches, goodMatches, averageScore };
  };

  const stats = getMatchStats();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to see job matches</h3>
          <p className="text-gray-600 mb-4">
            Upload your CV and get personalized job recommendations based on your skills and experience.
          </p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!activeCvId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your CV to get job matches</h3>
          <p className="text-gray-600 mb-4">
            We'll analyze your CV and find jobs that match your skills and experience.
          </p>
          <Button asChild>
            <a href="/upload">Upload CV</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMatches}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.excellentMatches}</div>
            <div className="text-sm text-gray-600">Excellent Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.goodMatches}</div>
            <div className="text-sm text-gray-600">Good Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy(sortBy === 'matchScore' ? 'recent' : 'matchScore')}
          >
            <SortDesc className="h-4 w-4 mr-2" />
            Sort by {sortBy === 'matchScore' ? 'Match Score' : 'Recent'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Job Matches */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedMatches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job matches found</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus !== 'all' 
                  ? `No ${filterStatus} matches found. Try changing the filter.`
                  : 'We\'re working on finding the perfect matches for your profile. Check back soon!'
                }
              </p>
              {filterStatus !== 'all' && (
                <Button variant="outline" onClick={() => setFilterStatus('all')}>
                  Show All Matches
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedMatches.map((match) => (
            <JobMatchingCard
              key={match.id}
              match={match}
              onViewJob={handleViewJob}
              onSaveJob={handleSaveJob}
              onApplyJob={handleApplyJob}
            />
          ))
        )}
      </div>

      {/* Call to action for better matches */}
      {stats.averageScore < 60 && stats.totalMatches > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Improve Your Match Scores</h3>
                <p className="text-blue-800 mb-4">
                  Your average match score is {stats.averageScore}%. Update your CV with more relevant skills 
                  and experience to get better job matches.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <a href="/premium-tools">Optimize CV</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/skill-gap-analysis">Skill Analysis</a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}