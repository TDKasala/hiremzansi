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

// Casino-style slot machine counter component
interface SlotMachineCounterProps {
  endValue: string;
  delay?: number;
  duration?: number;
  className?: string;
}

function SlotMachineCounter({ endValue, delay = 0, duration = 2000, className = "" }: SlotMachineCounterProps) {
  const [currentValue, setCurrentValue] = useState("000");
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Start casino animation when visible
  useEffect(() => {
    if (!isVisible) return;

    const startAnimation = () => {
      setIsAnimating(true);
      
      // Generate random numbers rapidly (slot machine effect)
      intervalRef.current = setInterval(() => {
        const randomNum = Math.floor(Math.random() * (targetNumber * 2));
        const paddedNum = randomNum.toString().padStart(targetNumber.toString().length, '0');
        setCurrentValue(paddedNum + suffix);
      }, 50);

      // Stop at target value after duration
      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Smooth transition to final value
        let current = parseInt(currentValue);
        const step = Math.max(1, Math.floor((Math.abs(targetNumber - current)) / 20));
        
        const finalCountdown = setInterval(() => {
          if (current === targetNumber) {
            clearInterval(finalCountdown);
            setCurrentValue(endValue);
            setIsAnimating(false);
            return;
          }
          
          if (current < targetNumber) {
            current = Math.min(targetNumber, current + step);
          } else {
            current = Math.max(targetNumber, current - step);
          }
          
          const paddedNum = current.toString().padStart(targetNumber.toString().length, '0');
          setCurrentValue(paddedNum + suffix);
        }, 50);
      }, duration - 500);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible, targetNumber, endValue, delay, duration, suffix]);

  return (
    <div ref={elementRef} className={`relative overflow-hidden ${className}`}>
      <div 
        className={`transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
        style={{
          fontFamily: 'monospace',
          textShadow: isAnimating ? '0 0 10px currentColor' : 'none',
          filter: isAnimating ? 'brightness(1.2)' : 'brightness(1)',
        }}
      >
        {currentValue}
      </div>
      
      {/* Casino-style glow effect */}
      {isAnimating && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 opacity-20 blur-sm"></div>
      )}
      
      {/* Spinning border effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-30 animate-spin"></div>
      )}
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

        {/* Stats Section with Casino Animation */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="group text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative mb-4">
              <SlotMachineCounter 
                endValue="500+" 
                delay={0}
                duration={2500}
                className="text-3xl font-bold text-purple-600 mb-2 drop-shadow-lg"
              />
              {/* Floating icons */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
            <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Active Candidates</div>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <div className="group text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative mb-4">
              <SlotMachineCounter 
                endValue="85%" 
                delay={300}
                duration={2800}
                className="text-3xl font-bold text-blue-600 mb-2 drop-shadow-lg"
              />
              {/* Floating icons */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60 group-hover:opacity-100 transition-opacity duration-300 animation-delay-500"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
            <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Average Match Accuracy</div>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <div className="group text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative mb-4">
              <SlotMachineCounter 
                endValue="24h" 
                delay={600}
                duration={3100}
                className="text-3xl font-bold text-green-600 mb-2 drop-shadow-lg"
              />
              {/* Floating icons */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-bounce opacity-60 group-hover:opacity-100 transition-opacity duration-300 animation-delay-1000"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
            <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Average Response Time</div>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 mx-auto mt-2 rounded-full"></div>
          </div>
          
          <div className="group text-center p-6 rounded-lg hover:bg-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative mb-4">
              <SlotMachineCounter 
                endValue="95%" 
                delay={900}
                duration={3400}
                className="text-3xl font-bold text-orange-600 mb-2 drop-shadow-lg"
              />
              {/* Floating icons */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full animate-bounce opacity-60 group-hover:opacity-100 transition-opacity duration-300 animation-delay-1500"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-300 rounded-full animate-pulse opacity-40 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
            <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Recruiter Satisfaction</div>
            <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 mx-auto mt-2 rounded-full"></div>
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