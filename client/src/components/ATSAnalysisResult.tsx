import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  InfoIcon,
  ArrowUp,
  Award,
  Loader2,
  BookOpen,
  Clock,
  Flag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Types for the analysis result
interface AnalysisResult {
  score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skills?: string[];
  sa_score?: number;
  sa_relevance?: string;
  job_match?: {
    matchScore: number;
    jobRelevance: string;
  } | null;
}

interface ATSAnalysisResultProps {
  result: AnalysisResult;
  isLoading?: boolean;
}

const ATSAnalysisResult: React.FC<ATSAnalysisResultProps> = ({ result, isLoading = false }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-amber-500';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 65) return 'bg-amber-100';
    if (score >= 50) return 'bg-amber-100';
    return 'bg-red-100';
  };
  
  const getRelevanceColor = (relevance: string) => {
    if (relevance === 'Excellent') return 'bg-green-100 text-green-800';
    if (relevance === 'Good') return 'bg-amber-100 text-amber-800';
    if (relevance === 'Average') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };
  
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
        <h3 className="text-lg font-medium">Analyzing Your CV</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we analyze your CV for ATS compatibility...
        </p>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>ATS Analysis Results</span>
          <Badge variant="outline" className="ml-2 font-normal">
            {new Date().toLocaleDateString()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Based on South African ATS standards and hiring practices
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center p-4 mb-4 rounded-lg border bg-background">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Overall ATS Score
          </div>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <Badge className={`${getScoreBg(result.score)} hover:${getScoreBg(result.score)} border-0`}>
            {result.rating}
          </Badge>
          
          <Progress 
            value={result.score} 
            className={`w-full mt-4 ${
              result.score >= 80 ? "bg-green-100" : 
              result.score >= 65 ? "bg-amber-100" : 
              result.score >= 50 ? "bg-amber-200" : "bg-red-100"
            }`}
          />
        </div>
        
        {/* South African Context Score */}
        {result.sa_score !== undefined && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col items-center p-3 rounded-lg border bg-background">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                SA Relevance
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.sa_score)}`}>
                {result.sa_score}%
              </div>
              {result.sa_relevance && (
                <Badge className={getRelevanceColor(result.sa_relevance)}>
                  {result.sa_relevance}
                </Badge>
              )}
            </div>
            
            {/* Job Match Score */}
            {result.job_match ? (
              <div className="flex flex-col items-center p-3 rounded-lg border bg-background">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Job Match
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(result.job_match.matchScore)}`}>
                  {result.job_match.matchScore}%
                </div>
                <Badge className={getRelevanceColor(result.job_match.jobRelevance)}>
                  {result.job_match.jobRelevance} Relevance
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-background">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Job Match
                </div>
                <div className="text-xl text-muted-foreground">N/A</div>
                <span className="text-xs text-center text-muted-foreground mt-1">Add job description</span>
              </div>
            )}
          </div>
        )}
        
        {/* Key Findings */}
        <div className="space-y-4 mb-4">
          {/* Strengths */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
              Strengths
            </h3>
            <ul className="space-y-1 pl-6">
              {result.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-800 list-disc">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Weaknesses/Areas for Improvement */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <ArrowUp className="h-4 w-4 text-amber-600 mr-2" />
              Areas for Improvement
            </h3>
            <ul className="space-y-1 pl-6">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-amber-800 list-disc">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Suggestions */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
              Quick Suggestions
            </h3>
            <ul className="space-y-1 pl-6">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-800 list-disc">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Skills Identified */}
        {result.skills && result.skills.length > 0 && (
          <div className="mt-auto">
            <Separator className="my-4" />
            <h3 className="text-sm font-medium mb-2">Skills Identified</h3>
            <div className="flex flex-wrap gap-2">
              {result.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-slate-100">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* South African-specific advice */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
          <div className="flex items-start">
            <Flag className="h-4 w-4 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">South African Tip</p>
              <p>Including your B-BBEE status, NQF levels, and South African certifications can significantly improve your CV's performance with local employers.</p>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default ATSAnalysisResult;