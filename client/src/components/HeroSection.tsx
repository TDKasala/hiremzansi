import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Shield, CheckCircle, Star, LineChart, BarChart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  // Stats for South African context
  const stats = [
    { label: "ATS Success Rate", value: "85%" },
    { label: "Interview Callback", value: "3.2x" },
    { label: "SA Companies", value: "400+" }
  ];
  
  // Animation states for CV elements
  const [isAnimated, setIsAnimated] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState(0);
  
  // Trigger animations when component mounts
  useEffect(() => {
    setIsAnimated(true);
    
    // Cycle through highlighted sections
    const interval = setInterval(() => {
      setHighlightedSection((prev) => (prev + 1) % 4);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section id="home" className="bg-gradient-to-r from-secondary to-neutral-900 text-white py-12 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="relative">
              <Badge className="absolute -top-6 left-0 bg-primary/90 hover:bg-primary">
                South African Focused
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Beat ATS & Land Your <span className="text-primary">Dream Job!</span>
              </h1>
            </div>
            <p className="text-lg md:text-xl mb-6 text-neutral-200">
              Get your CV past Applicant Tracking Systems used by 70% of South African employers. 
              Optimize your resume to stand out in a competitive job market.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 p-3 rounded-lg text-center">
                  <div className="text-xl md:text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-neutral-300">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/upload">
                <Button size="lg" className="bg-primary text-white hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  Get Your Free ATS Score
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  View Premium Features
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-neutral-300 flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2" />
              <span>POPIA Compliant. Your data is secure with us.</span>
            </div>
          </div>
          
          {/* Animated CV showcase */}
          <div className="md:w-1/2 flex justify-center relative">
            {/* CV Document with animated elements */}
            <div className={`relative w-full max-w-md bg-white text-black p-6 rounded-lg shadow-2xl transition-all duration-1000 
                ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              
              {/* CV Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-bold text-center mb-1">Sipho Nkosi</h2>
                <p className="text-gray-600 text-sm text-center">
                  Marketing Specialist | B-BBEE Level 2 | Cape Town
                </p>
              </div>
              
              {/* CV Skills Section - Highlighted when active */}
              <div className={`mb-4 p-3 rounded-lg transition-colors duration-500 ${highlightedSection === 0 ? 'bg-primary/10 border border-primary/30' : ''}`}>
                <div className="flex items-center mb-2">
                  <Star className={`h-4 w-4 mr-2 ${highlightedSection === 0 ? 'text-primary' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">Key Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Digital Marketing</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">SETA Certified</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Analytics</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Project Management</span>
                </div>
              </div>
              
              {/* CV Experience Section */}
              <div className={`mb-4 p-3 rounded-lg transition-colors duration-500 ${highlightedSection === 1 ? 'bg-primary/10 border border-primary/30' : ''}`}>
                <div className="flex items-center mb-2">
                  <Zap className={`h-4 w-4 mr-2 ${highlightedSection === 1 ? 'text-primary' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">Experience</h3>
                </div>
                <div className="text-sm">
                  <div className="mb-2">
                    <div className="font-medium">Marketing Manager</div>
                    <div className="text-gray-600 text-xs">Cape Town Media Group | 2020 - Present</div>
                  </div>
                </div>
              </div>
              
              {/* CV Education Section */}
              <div className={`mb-4 p-3 rounded-lg transition-colors duration-500 ${highlightedSection === 2 ? 'bg-primary/10 border border-primary/30' : ''}`}>
                <div className="flex items-center mb-2">
                  <LineChart className={`h-4 w-4 mr-2 ${highlightedSection === 2 ? 'text-primary' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">Education</h3>
                </div>
                <div className="text-sm">
                  <div className="font-medium">B.Com Marketing (NQF Level 7)</div>
                  <div className="text-gray-600 text-xs">University of Cape Town | 2016 - 2019</div>
                </div>
              </div>
              
              {/* ATS Score Section */}
              <div className={`p-3 rounded-lg transition-colors duration-500 ${highlightedSection === 3 ? 'bg-primary/10 border border-primary/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <BarChart className={`h-4 w-4 mr-2 ${highlightedSection === 3 ? 'text-primary' : 'text-gray-400'}`} />
                      <h3 className="font-semibold">ATS Score</h3>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Optimized for South African market</div>
                  </div>
                  <div 
                    className={`flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 font-bold text-lg
                    ${isAnimated ? 'animate-pulse' : ''}`}
                  >
                    92%
                  </div>
                </div>
                
                {/* Little ATS checks */}
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>B-BBEE info included</span>
                </div>
                <div className="mt-1 flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>NQF levels specified</span>
                </div>
              </div>
              
              {/* Animated scan effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent 
                opacity-0 pointer-events-none rounded-lg
                ${isAnimated ? 'animate-scan' : ''}`}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* The scan and pulse animations are defined in index.css */}
    </section>
  );
}
