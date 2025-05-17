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
        {/* Overall Score with circular gauge */}
        <div className="flex flex-col items-center justify-center p-4 mb-4 rounded-lg border bg-background">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Overall ATS Score
          </div>
          
          {/* Circular Score Gauge */}
          <div className="relative w-32 h-32 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="8"
              />
              {/* Score indicator */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={
                  result.score >= 80 ? "#10b981" : 
                  result.score >= 65 ? "#f59e0b" : 
                  result.score >= 50 ? "#d97706" : "#ef4444"
                } 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${result.score * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              {/* Score text */}
              <text 
                x="50" 
                y="50" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="24" 
                fontWeight="bold"
                fill={
                  result.score >= 80 ? "#10b981" : 
                  result.score >= 65 ? "#f59e0b" : 
                  result.score >= 50 ? "#d97706" : "#ef4444"
                }
              >
                {result.score}%
              </text>
            </svg>
          </div>
          
          <Badge className={`${getScoreBg(result.score)} hover:${getScoreBg(result.score)} border-0 text-sm px-3 py-1`}>
            {result.rating}
          </Badge>
          
          <div className="w-full mt-4 grid grid-cols-4 gap-1 text-center text-xs">
            <div className="text-red-500">Poor</div>
            <div className="text-amber-600">Average</div>
            <div className="text-amber-500">Good</div>
            <div className="text-green-600">Excellent</div>
          </div>
          
          <Progress 
            value={result.score} 
            className={`w-full mt-2 ${
              result.score >= 80 ? "bg-green-100" : 
              result.score >= 65 ? "bg-amber-100" : 
              result.score >= 50 ? "bg-amber-200" : "bg-red-100"
            }`}
          />
        </div>
        
        {/* South African Context Score and Job Match scores */}
        {result.sa_score !== undefined && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col items-center p-3 rounded-lg border bg-background relative overflow-hidden">
              {/* Background flag indicator */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                <svg viewBox="0 0 800 533.33" className="w-full h-full">
                  <rect width="800" height="533.33" fill="#000" />
                  <rect y="133.33" width="800" height="400" fill="#ffb612" />
                  <rect y="266.67" width="800" height="266.67" fill="#fff" />
                  <path d="M0,0 L400,266.67 L0,533.33 Z" fill="#007a4d" />
                  <path d="M133.33,0 L800,0 L800,133.33 L400,266.67 Z" fill="#de3831" />
                </svg>
              </div>
              
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 z-10">
                SA Relevance
              </div>
              <div className="relative">
                <div className={`text-3xl font-bold ${getScoreColor(result.sa_score)} z-10`}>
                  {result.sa_score}%
                </div>
                <Progress 
                  value={result.sa_score} 
                  className="w-full mt-2 h-1.5"
                />
              </div>
              {result.sa_relevance && (
                <Badge className={`${getRelevanceColor(result.sa_relevance)} mt-2 z-10`}>
                  {result.sa_relevance}
                </Badge>
              )}
            </div>
            
            {/* Job Match Score */}
            {result.job_match ? (
              <div className="flex flex-col items-center p-3 rounded-lg border bg-background relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-blue-500 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 z-10">
                  Job Match
                </div>
                <div className="relative">
                  <div className={`text-3xl font-bold ${getScoreColor(result.job_match.matchScore)} z-10`}>
                    {result.job_match.matchScore}%
                  </div>
                  <Progress 
                    value={result.job_match.matchScore} 
                    className="w-full mt-2 h-1.5"
                  />
                </div>
                <Badge className={`${getRelevanceColor(result.job_match.jobRelevance)} mt-2 z-10`}>
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
                <div className="mt-3">
                  <Badge variant="outline" className="border-dashed">
                    <Upload className="h-3 w-3 mr-1" /> Add Job Info
                  </Badge>
                </div>
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
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Skills Identified
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              {result.skills.map((skill, index) => (
                <div key={index} className="flex items-center p-2 rounded-md bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              These skills were automatically detected in your CV. Consider adding more industry-specific keywords to improve ATS matches.
            </p>
          </div>
        )}
        
        {/* South African-specific advice section */}
        <div className="mt-6">
          <Separator className="my-4" />
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            South African Optimization Tips
          </h3>
          
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
              <p className="font-medium mb-1">B-BBEE Status</p>
              <p>Include your B-BBEE status level clearly on your CV to help South African employers with their hiring goals.</p>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-800">
              <p className="font-medium mb-1">NQF Qualifications</p>
              <p>Always specify the NQF level (1-10) for all your qualifications to align with South African standards.</p>
            </div>
            
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-xs text-green-800">
              <p className="font-medium mb-1">Local Language Skills</p>
              <p>Highlight proficiency in South African languages like Zulu, Xhosa, Afrikaans, etc., as this can be valuable to employers.</p>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-800">
              <p className="font-medium mb-1">Professional Bodies</p>
              <p>Mention memberships in South African professional organizations like ECSA, SAICA, SACNASP, or SABPP.</p>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default ATSAnalysisResult;