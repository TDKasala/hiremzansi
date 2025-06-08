import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Globe, 
  BarChart3, 
  FileCheck, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Flag
} from "lucide-react";

export function CVAnalysisFeatures() {
  const analysisTypes = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "ATS Compatibility",
      score: 92,
      color: "blue",
      features: [
        "Applicant Tracking System formatting",
        "Keyword density optimization", 
        "Section structure validation",
        "File format compatibility"
      ]
    },
    {
      icon: <Flag className="h-8 w-8 text-green-600" />,
      title: "South African Context",
      score: 78,
      color: "green", 
      features: [
        "B-BBEE status optimization",
        "NQF qualification alignment",
        "Local industry standards",
        "Provincial job market fit"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Skills Analysis",
      score: 85,
      color: "purple",
      features: [
        "Industry skill mapping",
        "Competency gap identification", 
        "Skill level assessment",
        "Trending skills recommendation"
      ]
    },
    {
      icon: <FileCheck className="h-8 w-8 text-orange-600" />,
      title: "Professional Quality",
      score: 88,
      color: "orange",
      features: [
        "Language and grammar check",
        "Professional tone analysis",
        "Achievement quantification",
        "Impact statement review"
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50", 
      purple: "border-purple-200 bg-purple-50",
      orange: "border-orange-200 bg-orange-50"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            Comprehensive Analysis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Four-Dimensional CV Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyzes your CV across four critical dimensions to ensure maximum 
            success in the South African job market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {analysisTypes.map((analysis, index) => (
            <Card key={index} className={`${getColorClasses(analysis.color)} border-2 hover:shadow-lg transition-shadow`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {analysis.icon}
                </div>
                <CardTitle className="text-lg font-bold">{analysis.title}</CardTitle>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {analysis.score}%
                </div>
                <Progress 
                  value={analysis.score} 
                  className="h-2 mb-3"
                />
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* South African Specific Features */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl">South African Job Market Expertise</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Specialized
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  B-BBEE Optimization
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• B-BBEE status highlighting</li>
                  <li>• Employment equity considerations</li>
                  <li>• Skills development initiatives</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Local Market Intelligence
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Provincial job market trends</li>
                  <li>• Industry-specific requirements</li>
                  <li>• Salary benchmarking (ZAR)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  Cultural Context
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ubuntu values integration</li>
                  <li>• Multilingual capabilities</li>
                  <li>• Local business practices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Analysis Preview */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <CardTitle>Instant Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Strengths Identified
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    Strong technical skills alignment with job requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    Excellent ATS-friendly formatting structure
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    Clear career progression demonstrated
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Improvement Opportunities
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    Add quantified achievements with specific metrics
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    Include industry-specific keywords for better matching
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    Consider adding B-BBEE status if applicable
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}