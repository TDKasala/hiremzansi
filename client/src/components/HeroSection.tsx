import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Shield, CheckCircle, Star, LineChart, BarChart, Zap, ArrowRight, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

// Casino-style animated counter component
const AnimatedCounter = ({ 
  endValue, 
  duration = 2000, 
  delay = 0,
  isVisible = false 
}: { 
  endValue: string; 
  duration?: number; 
  delay?: number; 
  isVisible?: boolean;
}) => {
  const [currentValue, setCurrentValue] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      // Extract number from string (remove non-digit characters except decimal points)
      const numericValue = parseFloat(endValue.replace(/[^\d.]/g, '')) || 0;
      const isPercentage = endValue.includes('%');
      const hasK = endValue.includes('K') || endValue.includes('k');
      const hasPlus = endValue.includes('+');
      const hasS = endValue.includes('s');
      
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth deceleration with bounce
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = numericValue * easeOut;
        
        let displayValue = '';
        
        if (hasK) {
          displayValue = (current / 1000).toFixed(1) + 'K';
        } else if (numericValue >= 100) {
          displayValue = Math.floor(current).toString();
        } else {
          displayValue = current.toFixed(1);
        }
        
        if (isPercentage) displayValue += '%';
        if (hasPlus) displayValue += '+';
        if (hasS) displayValue += 's';
        
        setCurrentValue(displayValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [endValue, duration, delay, isVisible]);

  return (
    <div className="relative overflow-hidden">
      <div 
        className={`text-2xl md:text-3xl font-bold text-brand-orange transition-all duration-500 ${
          isAnimating ? 'animate-pulse' : ''
        }`}
        style={{
          filter: isAnimating ? 'drop-shadow(0 0 12px rgba(255, 107, 0, 0.8))' : 'none',
          textShadow: isAnimating ? '0 0 15px rgba(255, 107, 0, 0.9), 0 0 25px rgba(255, 107, 0, 0.6)' : 'none',
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        {currentValue}
      </div>
      {isAnimating && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent animate-shine"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 via-brand-orange/30 to-brand-orange/20 rounded-lg blur-sm animate-pulse"></div>
        </>
      )}
    </div>
  );
};

export default function HeroSection() {
  const { t } = useTranslation();
  

  
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
          <div className="md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center text-center">
            <div className="relative w-full">
              <Badge className="bg-primary/90 hover:bg-primary font-bold mb-4">
                {t('home.southAfricanFocused')}
              </Badge>
              
            </div>
            
            

            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/upload">
                <Button size="default" className="bg-primary text-white hover:bg-opacity-90 transition-colors w-full sm:w-auto text-sm sm:text-base h-12 sm:h-11">
                  {t('home.getFreeAtsScore')}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="default" variant="outline" className="bg-white text-secondary hover:bg-opacity-90 transition-colors w-full sm:w-auto text-sm sm:text-base h-12 sm:h-11">
                  {t('home.viewPremiumFeatures')}
                </Button>
              </Link>
            </div>
            <div className="mt-4 sm:mt-6 text-white flex items-center justify-center md:justify-start text-xs sm:text-sm">
              <Shield className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
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
                <div className="bg-white text-black p-4 rounded-lg shadow-lg text-[16px] ml-[20px] mr-[20px] pt-[20px] pb-[20px] pl-[21px] pr-[21px]">
                  <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
                    <div>
                      <div className="overflow-hidden">
                        <h2 
                          className={`text-lg font-bold mb-1 transform ${isAnimated ? 'animate-name-slide-in' : ''}`}
                          style={{ 
                            animation: isAnimated ? 'name-slide-in 1.2s ease-out forwards' : 'none',
                            opacity: 0,
                            transform: 'translateY(100%)'
                          }}
                        >
                          Kulani Mathebula
                        </h2>
                      </div>
                      <div className="overflow-hidden">
                        <h3 
                          className={`text-brand-orange font-semibold text-sm mb-2 ${isAnimated ? 'animate-position-fade-in' : ''}`}
                          style={{ 
                            animation: isAnimated ? 'position-fade-in 1.5s ease-out forwards 0.6s' : 'none',
                            opacity: 0
                          }}
                        >
                          Senior Software Developer
                        </h3>
                      </div>
                      <div 
                        className={`text-gray-600 text-sm ${isAnimated ? 'animate-contact-fade-in' : ''}`}
                        style={{ 
                          animation: isAnimated ? 'contact-fade-in 1.8s ease-out forwards 1s' : 'none',
                          opacity: 0
                        }}
                      >
                        <span>📧 kulani.m@example.co.za</span><br /> 
                        <span>📱 071 234 5678</span><br />
                        <span>📍 Johannesburg, Gauteng</span>
                      </div>
                    </div>
                    <div 
                      className={`w-16 h-16 rounded-full bg-gray-200 overflow-hidden ${isAnimated ? 'animate-photo-pop' : ''}`}
                      style={{ 
                        animation: isAnimated ? 'photo-pop 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s' : 'none',
                        opacity: 0,
                        transform: 'scale(0.8)'
                      }}
                    >
                      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="100" cy="80" r="40" fill="#6B7280" />
                        <rect x="60" y="120" width="80" height="80" fill="#6B7280" />
                        <circle cx="100" cy="100" r="100" fill="none" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="bg-brand-orange text-white px-3 py-1 rounded-md font-bold mb-2 text-sm">Key Skills</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-xs bg-brand-blue-light text-brand-blue px-2 py-1 rounded-md">Software Development</span>
                      <span className="text-xs bg-brand-green-light text-brand-green px-2 py-1 rounded-md">Data Analysis</span>
                      <span className="text-xs bg-brand-orange-light text-brand-orange px-2 py-1 rounded-md">Team Leadership</span>
                      <span className="text-xs bg-brand-blue-light text-brand-blue px-2 py-1 rounded-md">Python</span>
                      <span className="text-xs bg-brand-green-light text-brand-green px-2 py-1 rounded-md">SQL</span>
                    </div>
                    
                    <div className="bg-brand-blue text-white px-3 py-1 rounded-md font-bold mb-2 text-sm">Experience</div>
                    <div className="mb-3">
                      <p className="font-bold text-sm">Senior Developer</p>
                      <p className="text-xs">InnovaTech Solutions</p>
                      <p className="text-xs text-gray-600">2022 - Present</p>
                      <ul className="list-disc ml-4 text-xs mt-1">
                        <li>Led development team of 5 engineers</li>
                        <li>Implemented data analytics platform</li>
                        <li>Reduced system downtime by 35%</li>
                      </ul>
                    </div>
                    
                    <div className="bg-brand-green text-white px-3 py-1 rounded-md font-bold mb-2 text-sm">SA Qualifications</div>
                    <ul className="list-disc ml-4 text-xs">
                      <li>BSc Computer Science (NQF Level 7)</li>
                      <li>MICT SETA Python Certification</li>
                      <li>B-BBEE Level 2 Contributor</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Animated highlights that appear one by one */}
              <div 
                className={`absolute top-[15%] left-[11%] w-[78%] h-[6%] bg-brand-orange-light rounded-full opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-1' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-1 2s forwards 0.5s' : 'none',
                }}
              ></div>
              
              <div 
                className={`absolute top-[36%] left-[15%] w-[70%] h-[20%] bg-brand-blue-light rounded-lg opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-2' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-2 2s forwards 1.5s' : 'none',
                }}
              ></div>
              
              <div 
                className={`absolute top-[78%] left-[10%] w-[75%] h-[10%] bg-brand-green-light rounded-lg opacity-0 pointer-events-none
                  ${isAnimated ? 'animate-highlight-3' : ''}`}
                style={{ 
                  animation: isAnimated ? 'highlight-3 2s forwards 2.5s' : 'none',
                }}
              ></div>
              
              {/* Floating 92% score that appears with a bounce effect */}
              <div 
                className={`absolute bottom-3 right-6 w-16 h-16 rounded-full bg-green-400 flex items-center justify-center opacity-0
                  ${isAnimated ? 'animate-score-appear' : ''}`}
                style={{ 
                  animation: isAnimated ? 'score-appear 1s forwards 3s, float 3s ease-in-out infinite 4s' : 'none',
                }}
              >
                <span className="text-2xl font-bold text-white">92%</span>
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
