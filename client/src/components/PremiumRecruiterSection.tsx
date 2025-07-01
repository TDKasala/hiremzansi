import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  CreditCard,
  Search,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Building2,
  Eye,
  Bell
} from 'lucide-react';

// Elegant animated counter component
interface ElegantCounterProps {
  endValue: string;
  delay?: number;
  duration?: number;
  className?: string;
}

function ElegantCounter({ endValue, delay = 0, duration = 2000, className = "" }: ElegantCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Extract numeric value and suffix from endValue (e.g., "500+" -> {value: 500, suffix: "+"})
  const parseValue = (value: string) => {
    const match = value.match(/^(\d+)(.*)$/);
    if (match) {
      return { value: parseInt(match[1]), suffix: match[2] };
    }
    return { value: parseInt(value) || 0, suffix: "" };
  };

  const { value: targetNumber, suffix } = parseValue(endValue);

  // Intersection Observer to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Start elegant animation when visible
  useEffect(() => {
    if (!isVisible) return;

    const startAnimation = () => {
      let startTime: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easeOutCubic for smooth, elegant animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentNumber = Math.floor(easeOutCubic * targetNumber);
        
        setDisplayValue(currentNumber + suffix);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, [isVisible, targetNumber, endValue, delay, duration, suffix]);

  return (
    <div ref={elementRef} className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`}>
      <div className="relative">
        {displayValue}
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 blur-sm animate-pulse"></div>
      </div>
    </div>
  );
}

export function PremiumRecruiterSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800 px-4 py-2">
            For Recruiters
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Candidate Matching
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access pre-screened, AI-matched candidates for your job postings. 
            Pay only when you find the perfect match for your organization.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Post Private Jobs</h3>
              <p className="text-gray-600">
                Create confidential job postings that remain hidden from public view. 
                Our AI analyzes requirements against existing candidate CVs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Smart Matches</h3>
              <p className="text-gray-600">
                Receive instant notifications when candidates match your criteria. 
                View detailed compatibility scores and skill breakdowns.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pay Per Contact</h3>
              <p className="text-gray-600">
                Only pay R200-250 when you decide to unlock a candidate's 
                full contact details and professional profile.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Features List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose Our Premium Matching?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">South African Context</h4>
                  <p className="text-gray-600">B-BBEE compliance, NQF levels, and local industry experience matching</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Confidential Hiring</h4>
                  <p className="text-gray-600">Private job postings invisible to public job boards and competitors</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Instant Matching</h4>
                  <p className="text-gray-600">AI analyzes CVs in real-time against your job requirements</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Scoring</h4>
                  <p className="text-gray-600">Detailed match percentages for skills, experience, and location preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Dashboard Preview */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Your Matches Dashboard</h4>
              <Badge className="bg-green-100 text-green-800">2 New</Badge>
            </div>
            
            {/* Sample Match Cards */}
            <div className="space-y-3">
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">92%</span>
                      </div>
                      <span className="font-medium text-gray-900">Senior Project Manager</span>
                    </div>
                    <p className="text-sm text-gray-600">Johannesburg • 8+ years • B-BBEE Level 1</p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Eye className="h-4 w-4 mr-1" />
                    R250
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">Project Management</Badge>
                  <Badge variant="secondary" className="text-xs">Agile</Badge>
                  <Badge variant="secondary" className="text-xs">SAP</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">87%</span>
                      </div>
                      <span className="font-medium text-gray-900">Full Stack Developer</span>
                    </div>
                    <p className="text-sm text-gray-600">Cape Town • 5+ years • B-BBEE Level 2</p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Eye className="h-4 w-4 mr-1" />
                    R200
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">React</Badge>
                  <Badge variant="secondary" className="text-xs">Node.js</Badge>
                  <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                View All Matches
              </Button>
            </div>
          </div>
        </div>

        

        

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Star Employee?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join leading South African companies using our premium matching service 
            to find quality candidates efficiently and confidentially.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruiter/matches">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Building2 className="h-5 w-5 mr-2" />
                Start Recruiting Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/recruiter/matches">
              <Button size="lg" variant="outline">
                <Search className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No setup fees • Pay per successful match • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}