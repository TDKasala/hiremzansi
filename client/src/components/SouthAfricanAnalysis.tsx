import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Flag, TrendingUp } from 'lucide-react';

interface SouthAfricanAnalysisProps {
  saScore: number;
  saRelevance: string;
  saElements?: string[];
}

const SouthAfricanAnalysis: React.FC<SouthAfricanAnalysisProps> = ({ 
  saScore, 
  saRelevance,
  saElements = []
}) => {
  // Determine color based on SA relevance score
  const getRelevanceColor = () => {
    switch (saRelevance) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'High':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="bg-white shadow-sm border-amber-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Flag className="h-5 w-5 mr-2 text-amber-500" />
              South African Relevance
            </CardTitle>
            <CardDescription>
              Analysis of your CV's relevance to the South African job market
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRelevanceColor()}`}>
            {saRelevance}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">South African Context Score</span>
            <span className="text-sm font-medium">{saScore}%</span>
          </div>
          <div className={`h-2 w-full bg-gray-200 rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${saScore > 70 ? "bg-green-500" : saScore > 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${saScore}%` }}
            ></div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
            South African Elements Detected
          </h4>
          
          {saElements && saElements.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {saElements.map((element, index) => (
                <Badge key={index} variant="outline" className="bg-amber-50 hover:bg-amber-100">
                  {element}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm italic flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
              No South African specific elements detected
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-amber-50 px-6 py-3">
        <div className="text-sm text-gray-700 flex items-start">
          <CheckCircle className="h-4 w-4 mr-2 text-amber-600 mt-0.5 flex-shrink-0" />
          <span>
            Including South African specific elements like B-BBEE status, NQF levels, and local qualifications 
            significantly improves your CV's relevance to local employers.
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SouthAfricanAnalysis;