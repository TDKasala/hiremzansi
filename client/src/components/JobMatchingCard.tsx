import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Eye,
  Heart
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

interface JobMatchingCardProps {
  match: JobMatch;
  onViewJob: (jobId: number) => void;
  onSaveJob: (jobId: number) => void;
  onApplyJob: (jobId: number) => void;
}

export function JobMatchingCard({ match, onViewJob, onSaveJob, onApplyJob }: JobMatchingCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${match.isViewed ? 'bg-gray-50' : 'bg-white'}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-16 h-16 rounded-lg ${getMatchScoreBg(match.matchScore)} flex items-center justify-center`}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getMatchScoreColor(match.matchScore)}`}>
                    {match.matchScore}%
                  </div>
                  <div className="text-xs text-gray-600">match</div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                    onClick={() => onViewJob(match.job.id)}>
                  {match.job.title}
                </h3>
                <p className="text-gray-600">{match.job.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getMatchScoreBg(match.matchScore) + ' ' + getMatchScoreColor(match.matchScore)}>
                    <Target className="w-3 h-3 mr-1" />
                    {getMatchLabel(match.matchScore)}
                  </Badge>
                  {match.job.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Match breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-600">Skills</div>
            <div className={`text-lg font-semibold ${getMatchScoreColor(match.skillsMatchScore)}`}>
              {match.skillsMatchScore}%
            </div>
            <Progress value={match.skillsMatchScore} className="h-2 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Experience</div>
            <div className={`text-lg font-semibold ${getMatchScoreColor(match.experienceMatchScore)}`}>
              {match.experienceMatchScore}%
            </div>
            <Progress value={match.experienceMatchScore} className="h-2 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Location</div>
            <div className={`text-lg font-semibold ${getMatchScoreColor(match.locationMatchScore)}`}>
              {match.locationMatchScore}%
            </div>
            <Progress value={match.locationMatchScore} className="h-2 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">SA Context</div>
            <div className={`text-lg font-semibold ${getMatchScoreColor(match.saContextScore)}`}>
              {match.saContextScore}%
            </div>
            <Progress value={match.saContextScore} className="h-2 mt-1" />
          </div>
        </div>

        {/* Job details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {match.job.isRemote ? 'Remote' : `${match.job.location}, ${match.job.province}`}
          </div>
          <div>
            <Badge variant="outline">{match.job.employmentType}</Badge>
          </div>
          {match.job.salaryRange && (
            <div className="font-medium text-gray-900">
              R{match.job.salaryRange}
            </div>
          )}
        </div>

        {/* Matched skills */}
        {match.matchedSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Matching Skills</span>
            </div>
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
        )}

        {/* Missing skills */}
        {match.missingSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Skills to Develop</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  {skill}
                </Badge>
              ))}
              {match.missingSkills.length > 3 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  +{match.missingSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Match reasons */}
        {match.matchReasons.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Why this matches</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              {match.matchReasons.slice(0, 2).map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement suggestions */}
        {match.improvementSuggestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Improve your chances</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              {match.improvementSuggestions.slice(0, 2).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSaveJob(match.job.id)}
            >
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewJob(match.job.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Job
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={() => onApplyJob(match.job.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}