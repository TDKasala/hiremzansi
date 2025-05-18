import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Award, CircleCheck } from 'lucide-react';
import SouthAfricanAnalysis from './SouthAfricanAnalysis';

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
    <div className="space-y-6 pb-6">
      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">ATS Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Your ATS Score</h3>
                <p className="text-gray-500 text-sm">How well your CV performs with ATS systems</p>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(score)} flex items-center gap-2`}>
                {score}%
                <span className="text-base font-medium bg-gray-100 px-2 py-1 rounded">{rating}</span>
              </div>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="strengths">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="weaknesses">Areas to Improve</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>
                <TabsContent value="strengths" className="pt-4">
                  <ul className="space-y-2">
                    {strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="weaknesses" className="pt-4">
                  <ul className="space-y-2">
                    {weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="suggestions" className="pt-4">
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Skills identified */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-500" />
              Skills Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* South African analysis */}
      <SouthAfricanAnalysis 
        saScore={saScore} 
        saRelevance={saRelevance} 
        saElements={saElements} 
      />
      
      {/* Tips section */}
      <Card className="shadow-sm border-green-100">
        <CardHeader className="pb-2 bg-green-50">
          <CardTitle className="text-lg font-medium flex items-center">
            <CircleCheck className="h-5 w-5 mr-2 text-green-600" />
            Tips for Improving Your CV
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <p className="text-sm">
              <strong>Add quantifiable achievements:</strong> Include metrics and numbers to demonstrate your impact.
            </p>
            <p className="text-sm">
              <strong>Use industry keywords:</strong> Research job descriptions in your field and include relevant terms.
            </p>
            <p className="text-sm">
              <strong>Include South African elements:</strong> Add B-BBEE status, NQF levels, and other local qualifications.
            </p>
            <p className="text-sm">
              <strong>Use proper formatting:</strong> Clear headings, bullet points, and consistent spacing help ATS readability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVAnalysisResults;