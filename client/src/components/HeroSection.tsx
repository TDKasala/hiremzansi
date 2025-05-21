import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Shield, CheckCircle, Star, LineChart, BarChart, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();
  
  // Stats for South African context
  const stats = [
    { label: "SA Unemployment Rate", value: "33.5%" },
    { label: "SA Employers Use ATS", value: "75%" },
    { label: "Applicants Per Job", value: "200+" },
    { label: "To Make First Impression", value: "8s" }
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
                {t('home.southAfricanFocused')}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {t('home.marketReality')}
              </h1>
            </div>
            <p className="text-lg md:text-xl mb-6 text-white">
              {t('home.marketDescription')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 p-3 rounded-lg text-center">
                  <div className={`text-2xl md:text-3xl font-bold text-[#FFCA28] ${isAnimated ? index === 0 ? 'animate-countup' : index === 1 ? 'animate-countup-delay-1' : index === 2 ? 'animate-countup-delay-2' : 'animate-countup-delay-2' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-white font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/upload">
                <Button size="lg" className="bg-primary text-white hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  {t('home.getFreeAtsScore')}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  {t('home.viewPremiumFeatures')}
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-white flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              <span>{t('home.dataSecure')}</span>
            </div>
          </div>
          
          {/* Modern CV showcase with image */}
          <div className="md:w-1/2 flex justify-center relative">
            {/* Modern CV with animations */}
            <div 
              className={`relative w-full max-w-md rounded-lg shadow-2xl transition-all duration-1000 overflow-hidden
                ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Resume image with hover effects */}
              <div 
                className={`${isAnimated ? 'animate-float' : ''}`}
                style={{ 
                  animation: isAnimated ? 'float 6s ease-in-out infinite' : 'none',
                }}
              >
                <div className="bg-white text-black p-6 rounded-lg shadow-lg">
                  <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Kulani Mathebula</h2>
                      <p className="text-gray-600 text-sm">
                        <span>📧 kulani.m@example.co.za</span><br /> 
                        <span>📱 071 234 5678</span><br />
                        <span>📍 Johannesburg, Gauteng</span>
                      </p>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="100" cy="80" r="40" fill="#6B7280" />
                        <rect x="60" y="120" width="80" height="80" fill="#6B7280" />
                        <circle cx="100" cy="100" r="100" fill="none" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="bg-amber-400 text-black px-4 py-2 rounded-md font-bold mb-3">Key Skills</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-sm bg-cyan-200 px-3 py-1 rounded-md">Software Development</span>
                      <span className="text-sm bg-purple-200 px-3 py-1 rounded-md">Data Analysis</span>
                      <span className="text-sm bg-pink-200 px-3 py-1 rounded-md">Team Leadership</span>
                      <span className="text-sm bg-cyan-200 px-3 py-1 rounded-md">Python</span>
                      <span className="text-sm bg-purple-200 px-3 py-1 rounded-md">SQL</span>
                    </div>
                    
                    <div className="bg-cyan-500 text-white px-4 py-2 rounded-md font-bold mb-3">Experience</div>
                    <div className="mb-4">
                      <p className="font-bold">Senior Developer</p>
                      <p className="text-sm">InnovaTech Solutions</p>
                      <p className="text-sm text-gray-600">2022 - Present</p>
                      <ul className="list-disc ml-5 text-sm mt-2">
                        <li>Led development team of 5 engineers</li>
                        <li>Implemented data analytics platform</li>
                        <li>Reduced system downtime by 35%</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-400 text-white px-4 py-2 rounded-md font-bold mb-3">South African Qualifications</div>
                    <ul className="list-disc ml-5 text-sm">
                      <li>BSc Computer Science (NQF Level 7)</li>
                      <li>MICT SETA Python Certification</li>
                      <li>B-BBEE Level 2 Contributor</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Animated highlights that appear one by one */}
              <div 
                className={`absolute top-[15%] left-[11%] w-[78%] h-[6%] bg-amber-200 rounded-full opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-1' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-1 2s forwards 0.5s' : 'none',
                }}
              ></div>
              
              <div 
                className={`absolute top-[36%] left-[15%] w-[70%] h-[20%] bg-amber-200 rounded-lg opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-2' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-2 2s forwards 1.5s' : 'none',
                }}
              ></div>
              
              <div 
                className={`absolute top-[78%] left-[10%] w-[75%] h-[10%] bg-amber-200 rounded-lg opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-3' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-3 2s forwards 2.5s' : 'none',
                }}
              ></div>
              
              {/* Floating 92% score that appears with a bounce effect */}
              <div 
                className={`absolute bottom-5 right-8 w-20 h-20 rounded-full bg-green-400 flex items-center justify-center opacity-0
                  ${isAnimated ? 'animate-score-appear' : ''}`}
                style={{ 
                  animation: isAnimated ? 'score-appear 1s forwards 3s, float 3s ease-in-out infinite 4s' : 'none',
                }}
              >
                <span className="text-3xl font-bold text-white">92%</span>
              </div>
              
              {/* Animated scan effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent 
                opacity-0 pointer-events-none rounded-lg
                ${isAnimated ? 'animate-scan' : ''}`}
              ></div>
              
              {/* Glowing pulsing effect around the entire CV */}
              <div 
                className={`absolute -inset-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 rounded-xl blur-xl opacity-0
                  ${isAnimated ? 'animate-pulse-glow' : ''}`}
                style={{ 
                  animation: isAnimated ? 'pulse-glow 4s ease-in-out infinite alternate' : 'none',
                  zIndex: -1
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* The scan and pulse animations are defined in index.css */}
    </section>
  );
}
