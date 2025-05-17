import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

interface AnalysisResult {
  score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sa_score?: number;
  sa_relevance?: string;
  skills?: string[];
  job_match?: {
    matchScore: number;
    jobRelevance: string;
  };
}

interface ATSAnalysisResultProps {
  result: AnalysisResult;
  isLoading?: boolean;
}

const RatingBadge = ({ rating }: { rating: string }) => {
  let color = "";
  
  switch (rating.toLowerCase()) {
    case "excellent":
      color = "bg-green-100 text-green-800 hover:bg-green-100";
      break;
    case "good":
      color = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      break;
    case "average":
      color = "bg-amber-100 text-amber-800 hover:bg-amber-100";
      break;
    default:
      color = "bg-red-100 text-red-800 hover:bg-red-100";
  }
  
  return (
    <Badge variant="outline" className={color}>
      {rating}
    </Badge>
  );
};

const ATSAnalysisResult: React.FC<ATSAnalysisResultProps> = ({ 
  result,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Analyzing your CV...</CardTitle>
          <CardDescription>Evaluating your CV against South African ATS systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { score, rating, strengths, weaknesses, suggestions, sa_score, sa_relevance, skills, job_match } = result;
  
  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  // Progress color based on value
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-blue-600";
    if (score >= 40) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>CV Analysis Results</CardTitle>
          <RatingBadge rating={rating} />
        </div>
        <CardDescription>Analysis of your CV with South African context</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall score */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Overall ATS Score</h3>
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
          <Progress 
            value={score} 
            className={`h-2 ${getProgressColor(score)}`} 
          />
        </div>

        {/* South African relevance score */}
        {sa_score !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">South African Relevance</h3>
              <div className="flex items-center">
                <span className={`text-lg font-medium ${getScoreColor(sa_score)}`}>{sa_score}%</span>
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {sa_relevance}
                </Badge>
              </div>
            </div>
            <Progress 
              value={sa_score} 
              className={`h-2 ${getProgressColor(sa_score)}`} 
            />
            <p className="text-sm text-muted-foreground mt-1">
              How well your CV is optimized for South African employers
            </p>
          </div>
        )}

        {/* Job match score if available */}
        {job_match && (
          <div className="mb-6 p-3 border rounded-md bg-blue-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Job Match Score</h3>
              <span className={`text-lg font-medium ${getScoreColor(job_match.matchScore)}`}>{job_match.matchScore}%</span>
            </div>
            <Progress 
              value={job_match.matchScore} 
              className={`h-2 ${getProgressColor(job_match.matchScore)}`} 
            />
            <p className="text-sm text-muted-foreground mt-1">
              Job relevance: {job_match.jobRelevance}
            </p>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          {/* Strengths */}
          <AccordionItem value="strengths">
            <AccordionTrigger className="text-green-600">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" /> 
                Strengths
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-6">
                {strengths.map((strength, index) => (
                  <li key={index} className="list-disc text-green-700">
                    {strength}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Areas for improvement */}
          <AccordionItem value="weaknesses">
            <AccordionTrigger className="text-red-600">
              <div className="flex items-center">
                <XCircle className="mr-2 h-4 w-4" />
                Areas for Improvement
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-6">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="list-disc text-red-600">
                    {weakness}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Suggestions */}
          <AccordionItem value="suggestions">
            <AccordionTrigger className="text-amber-600">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Format Suggestions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-6">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="list-disc text-amber-600">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Skills identified */}
        {skills && skills.length > 0 && (
          <div className="mt-6">
            <Separator className="my-2" />
            <h3 className="text-sm font-medium mb-2">Key Skills Identified</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ATSAnalysisResult;