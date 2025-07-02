import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface CVAnalysisResultsProps {
  score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skills: string[];
  saScore: number;
  saRelevance: string;
  saElements?: string[];
}

const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({
  score,
  rating,
  strengths,
  weaknesses,
  suggestions,
  skills,
  saScore,
  saRelevance,
  saElements
}) => {
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Get background color for score
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-amber-50";
    if (score >= 40) return "bg-orange-50";
    return "bg-red-50";
  };

  return (
    <div className="space-y-4">
      {/* Simple Score Display */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">ATS Compatibility Score</h2>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className={`text-lg font-medium px-4 py-2 rounded-full inline-block ${getScoreBgColor(score)}`}>
              {rating}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings in Simple List Format */}
      <div className="space-y-4">
        {/* What's Working */}
        {strengths.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                What's Working Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.slice(0, 4).map((strength, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas to Improve */}
        {weaknesses.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-amber-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {weaknesses.slice(0, 4).map((weakness, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-amber-500 mr-2 mt-1">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        {suggestions.length > 0 && (
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Tips to Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="text-sm">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Skills Found */}
        {skills.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 12).map((skill, index) => (
                  <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CVAnalysisResults;