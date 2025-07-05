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
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center py-8 xs:py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <Badge className="mb-3 xs:mb-4 bg-blue-100 text-blue-700 text-xs xs:text-sm">
            CV Optimization Tools
          </Badge>
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 xs:mb-4 leading-tight px-2 xs:px-4">
            Transform Your CV with AI-Powered Analysis
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed px-2 xs:px-4">
            Our advanced AI analyzes your CV across multiple dimensions to ensure it meets 
            South African employer expectations and passes ATS screening.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
            {optimizationFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4 sm:p-6">
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="text-blue-500 text-lg xs:text-xl sm:text-2xl">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-sm xs:text-base sm:text-lg leading-tight">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 xs:p-4 sm:p-6 pt-0">
                  <p className="text-gray-600 mb-2 xs:mb-3 text-xs xs:text-sm leading-relaxed">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-gray-500">
                        <CheckCircle className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-500 flex-shrink-0" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sample Analysis Results */}
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            

            {/* Compact CTA Section */}
            <div className="text-center space-y-3 xs:space-y-4">
              {/* Compact Success Stats */}
              <div className="flex items-center justify-center gap-4 xs:gap-5 sm:gap-6 text-xs xs:text-sm">
                <div className="flex items-center gap-1 xs:gap-1.5 text-gray-600">
                  <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-blue-500" />
                  <span className="font-medium">10k+ analyzed</span>
                </div>
                <div className="w-px h-3 xs:h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1 xs:gap-1.5 text-gray-600">
                  <FileText className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-500" />
                  <span className="font-medium">95% accuracy</span>
                </div>
              </div>
              
              {/* Compact Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 justify-center px-2 xs:px-0">
                <Link href="/upload">
                  <Button 
                    size="sm"
                    className="w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 px-4 xs:px-6 py-2 text-xs xs:text-sm"
                  >
                    <Zap className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                    <span className="font-medium">Analyze My CV</span>
                  </Button>
                </Link>
                
                <Link href="/how-it-works">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="w-full xs:w-auto border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-300 px-4 xs:px-6 py-2 text-xs xs:text-sm"
                  >
                    <FileText className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                    <span className="font-medium">How It Works</span>
                  </Button>
                </Link>
              </div>
              
              {/* Compact Trust indicator */}
              <div className="flex items-center justify-center gap-1 xs:gap-1.5 text-xs text-gray-500">
                <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 bg-green-500 rounded-full"></div>
                <span>Trusted by SA professionals</span>
                <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}