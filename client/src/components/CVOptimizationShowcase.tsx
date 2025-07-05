import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useEffect, useState, useRef } from "react";
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

// Animated counter component for progress values
const AnimatedProgressCounter = ({ 
  endValue, 
  duration = 2000, 
  delay = 0,
  isVisible = false,
  suffix = "" 
}: { 
  endValue: number; 
  duration?: number; 
  delay?: number; 
  isVisible?: boolean;
  suffix?: string;
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Smooth easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = endValue * easeOutCubic;
        
        setCurrentValue(Math.floor(current));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [endValue, duration, delay, isVisible]);

  return (
    <span 
      className={`transition-all duration-300 ${
        isAnimating ? 'text-shadow-glow' : ''
      }`}
      style={{
        textShadow: isAnimating ? '0 0 8px currentColor' : 'none'
      }}
    >
      {currentValue}{suffix}
    </span>
  );
};

// Animated progress bar component
const AnimatedProgress = ({ 
  value, 
  className = "", 
  delay = 0,
  isVisible = false 
}: { 
  value: number; 
  className?: string; 
  delay?: number;
  isVisible?: boolean;
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 2000, 1);
        
        // Smooth easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = value * easeOutCubic;
        
        setCurrentValue(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, isVisible]);

  return <Progress value={currentValue} className={className} />;
};

export function CVOptimizationShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer to trigger animations when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <section ref={sectionRef} className="py-16 bg-white">
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
            <Card className="group relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-green-50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-green-300">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-green-400 to-blue-500 transform scale-110 group-hover:scale-125 transition-transform duration-1000"></div>
              
              {/* Floating particles effect */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40 animation-delay-500"></div>
              <div className="absolute top-12 right-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-50 animation-delay-1000"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 group-hover:gap-4 transition-all duration-300">
                  <div className="relative">
                    <Zap className="h-7 w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  </div>
                  <CardTitle className="text-green-900 group-hover:text-green-800 transition-colors duration-300 text-lg font-bold">
                    Sample Analysis Results
                  </CardTitle>
                  <div className="ml-auto flex items-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live Demo
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Compact CTA Section */}
            <div className="text-center space-y-4">
              {/* Compact Success Stats */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">10k+ analyzed</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FileText className="h-3 w-3 text-green-500" />
                  <span className="font-medium">95% accuracy</span>
                </div>
              </div>
              
              {/* Compact Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/upload">
                  <Button 
                    size="default" 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 px-6 py-2"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    <span className="font-medium">Analyze My CV</span>
                  </Button>
                </Link>
                
                <Link href="/how-it-works">
                  <Button 
                    size="default" 
                    variant="outline" 
                    className="border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-2"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">How It Works</span>
                  </Button>
                </Link>
              </div>
              
              {/* Compact Trust indicator */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Trusted by SA professionals</span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}