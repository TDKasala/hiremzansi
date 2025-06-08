import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  FileText, 
  Target, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Globe,
  TrendingUp,
  Users,
  Eye
} from "lucide-react";

export function CVOptimizationShowcase() {
  const optimizationFeatures = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "ATS Score Analysis",
      description: "Get an instant score showing how well your CV passes through Applicant Tracking Systems",
      features: ["Keyword density analysis", "Format compatibility", "Section structure review"]
    },
    {
      icon: <Globe className="h-6 w-6 text-green-600" />,
      title: "SA Context Analysis",
      description: "Specialized analysis for South African job market requirements",
      features: ["B-BBEE considerations", "NQF level alignment", "Local industry standards"]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      title: "Skills Gap Analysis",
      description: "Identify missing skills and get recommendations for improvement",
      features: ["Industry skill mapping", "Competency gaps", "Learning recommendations"]
    },
    {
      icon: <Eye className="h-6 w-6 text-orange-600" />,
      title: "Professional Review",
      description: "AI-powered comprehensive review with actionable feedback",
      features: ["Content quality analysis", "Professional language check", "Impact measurement"]
    }
  ];

  const sampleAnalysis = {
    overallScore: 78,
    atsCompatibility: 85,
    saContext: 72,
    skillsMatch: 80,
    improvements: [
      "Add more industry-specific keywords",
      "Include B-BBEE status if applicable",
      "Quantify achievements with metrics"
    ]
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            CV Optimization Tools
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your CV with AI-Powered Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced AI analyzes your CV across multiple dimensions to ensure it meets 
            South African employer expectations and passes ATS screening.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {optimizationFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3 text-sm">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sample Analysis Results */}
          <div className="space-y-6">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-green-900">Sample Analysis Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-green-600">{sampleAnalysis.overallScore}/100</span>
                  </div>
                  <Progress value={sampleAnalysis.overallScore} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-green-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-700">{sampleAnalysis.atsCompatibility}%</div>
                    <div className="text-xs text-gray-600">ATS Compatible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-700">{sampleAnalysis.saContext}%</div>
                    <div className="text-xs text-gray-600">SA Context</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-700">{sampleAnalysis.skillsMatch}%</div>
                    <div className="text-xs text-gray-600">Skills Match</div>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Key Improvements
                  </h4>
                  <ul className="space-y-1">
                    {sampleAnalysis.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  10,000+ CVs analyzed
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  95% accuracy rate
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/upload">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Analyze My CV Now
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}