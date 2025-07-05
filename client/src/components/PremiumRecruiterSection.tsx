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
  Bell,
  MapPin
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

          {/* Premium Dashboard Preview - Redesigned */}
          <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 shadow-2xl">
            {/* Dashboard Header */}
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Premium Recruiter Dashboard
                </CardTitle>
                <Badge className="bg-green-400 text-green-900 hover:bg-green-300">
                  3 New Matches
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">6</p>
                  <p className="text-xs text-blue-700">Active Jobs</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">34</p>
                  <p className="text-xs text-green-700">Total Matches</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">12</p>
                  <p className="text-xs text-purple-700">Unlocked</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900">94%</p>
                  <p className="text-xs text-orange-700">Success Rate</p>
                </div>
              </div>

              {/* Premium Match Cards */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Candidate Matches
                </h4>
                
                {/* Enhanced Match Card 1 */}
                <div className="group relative overflow-hidden border-2 border-green-200 rounded-lg p-4 bg-gradient-to-r from-green-50 via-white to-green-50 hover:shadow-lg transition-all duration-300 hover:border-green-300">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">94%</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Senior DevOps Engineer</span>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">Cape Town • 8+ years • B-BBEE Level 1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Eye className="h-4 w-4 mr-1" />
                      R500
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Kubernetes</Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">AWS</Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Docker</Badge>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">+7 more</Badge>
                  </div>
                </div>

                {/* Enhanced Match Card 2 */}
                <div className="group relative overflow-hidden border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-white">91%</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Product Manager</span>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">Johannesburg • 6+ years • B-BBEE Level 2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Eye className="h-4 w-4 mr-1" />
                      R500
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Agile</Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Scrum</Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">Data Analysis</Badge>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">+5 more</Badge>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Users className="h-4 w-4 mr-2" />
                  View All Matches
                </Button>
                <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        

        

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Star Employee?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join leading South African companies using our premium matching service 
            to find quality candidates efficiently and confidentially. Pay only R500 per successful match.
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