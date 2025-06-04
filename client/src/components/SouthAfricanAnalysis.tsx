import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flag, CheckCircle, XCircle, AlertTriangle, Award, Lightbulb } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SAAnalysisProps {
  saScore: number;
  saRelevance: string;
  saElements: string[];
  showComparison?: boolean;
  comparisonScore?: number;
  recommendations?: string[];
}

/**
 * South African Analysis Component
 * 
 * Displays CV analysis results with a focus on South African job market relevance
 */
export default function SouthAfricanAnalysis({
  saScore,
  saRelevance,
  saElements,
  showComparison = false,
  comparisonScore = 0,
  recommendations = []
}: SAAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get the color scheme based on the South African relevance score
  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'High': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get the color for the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-gray-600";
  };

  // South African job market recommendations
  const marketRecommendations = [
    "Always include your B-BBEE status when applying to transformation-focused companies",
    "Specify NQF levels for all qualifications to align with South African standards",
    "Include proficiency in South African languages relevant to the job location",
    "Mention experience with South African regulations specific to your industry",
    "Use South African currency (ZAR/Rand) when discussing budgets or salary history"
  ];

  // Use provided recommendations or defaults
  const displayRecommendations = recommendations.length > 0 ? recommendations : marketRecommendations;

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-white">
        <CardTitle className="flex items-center">
          <Flag className="h-5 w-5 mr-2 text-amber-500" />
          South African Relevance
        </CardTitle>
        <CardDescription>
          Analysis of CV's contextual relevance to the South African job market
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Context Score</h3>
          <Badge variant="outline" className={getRelevanceColor(saRelevance)}>
            {saRelevance} ({saScore}%)
          </Badge>
        </div>
        
        <Progress 
          value={saScore} 
          className="h-2 mb-4"
        />
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">South African Elements Detected:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {saElements.length > 0 ? (
                  saElements.map((element, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-50">
                      {element}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No South African specific elements detected</p>
                )}
              </div>
            </div>
            
            {showComparison && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium flex items-center text-blue-800 mb-2">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  SA Context Comparison
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-1 bg-green-100 rounded">
                    <div className="text-xs text-gray-600">With SA Context</div>
                    <div className={`font-bold text-lg ${getScoreColor(saScore)}`}>{saScore}%</div>
                  </div>
                  <div className="text-center p-1 bg-gray-100 rounded">
                    <div className="text-xs text-gray-600">Without SA Context</div>
                    <div className={`font-bold text-lg ${getScoreColor(comparisonScore)}`}>{comparisonScore}%</div>
                  </div>
                </div>
                <p className="text-xs mt-2 text-blue-700 font-medium">
                  South African context elements improved the score by {saScore - comparisonScore}%
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                South African Job Market Tips
              </h4>
              
              <ul className="space-y-2">
                {displayRecommendations.map((recommendation, i) => (
                  <li key={i} className="flex items-start p-2 bg-amber-50 rounded-md">
                    {saScore >= 60 ? (
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  <h4 className="text-sm font-medium">Why SA Context Matters</h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Including South African-specific elements in your CV can significantly 
                  increase your chances of success in the local job market, especially 
                  with employers focused on local experience and transformation requirements.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-amber-50 text-sm text-gray-600 italic border-t border-amber-100">
        Powered by Hire Mzansi's South African Context Analysis
      </CardFooter>
    </Card>
  );
}