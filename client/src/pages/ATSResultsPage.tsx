import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import CVAnalysisResults from '@/components/CVAnalysisResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download, Share2 } from 'lucide-react';

// Example placeholder data - in a real app this would come from the API
const demoResults = {
  score: 78,
  rating: "Good",
  strengths: [
    "Strong skills section with relevant skills identified",
    "Contains quantifiable achievements with metrics",
    "Good structure with clear sections"
  ],
  weaknesses: [
    "Add more South African industry-specific keywords to improve local relevance",
    "Consider adding NQF levels to your qualifications for South African employer clarity",
    "Ensure each position includes a clear, industry-standard job title"
  ],
  suggestions: [
    "CV length is appropriate for South African employers.",
    "Consider adding your B-BBEE status which is often valuable in South African job applications."
  ],
  skills: [
    "javascript", "react", "node", "typescript", "java", "aws", "certification", "communication"
  ],
  saScore: 65,
  saRelevance: "Medium",
  saElements: ["South Africa", "Johannesburg", "B-BBEE information"]
};

const ATSResultsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [analysisData] = useState(demoResults);
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">ATS Analysis Results</h1>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Premium upsell for better results */}
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Get More Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                Upgrade to Premium for advanced insights, industry-specific recommendations, and personalized improvement suggestions.
              </p>
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setLocation("/pricing")}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Main results display */}
        <CVAnalysisResults {...analysisData} />
        
        {/* South African specific recommendations */}
        <Card className="shadow-sm border-blue-100">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-lg font-medium">South African Job Market Tips</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-sm">
                <strong>Include your B-BBEE status:</strong> Many South African employers require this information for compliance and reporting.
              </p>
              <p className="text-sm">
                <strong>Add NQF levels:</strong> Clearly state the NQF level of your qualifications to help employers understand your education level.
              </p>
              <p className="text-sm">
                <strong>Show language skills:</strong> Mention your proficiency in local languages such as Afrikaans, isiZulu, isiXhosa, etc.
              </p>
              <p className="text-sm">
                <strong>Reference local companies:</strong> If you've worked with well-known South African companies, make sure to highlight those experiences.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center mt-8">
          <Button 
            variant="default" 
            size="lg" 
            onClick={() => setLocation("/upload")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Analyze Another CV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ATSResultsPage;