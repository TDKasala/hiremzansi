import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Improved lazy loading implementation
const LazyLoadedSection = ({ children, visible }: { children: React.ReactNode; visible: boolean }) => {
  const [isRendered, setIsRendered] = useState(false);
  
  useEffect(() => {
    if (visible && !isRendered) {
      // Wait until component is in viewport before rendering
      const timer = setTimeout(() => setIsRendered(true), 100);
      return () => clearTimeout(timer);
    }
  }, [visible, isRendered]);
  
  if (!visible) return null;
  if (!isRendered) return <Skeleton className="w-full h-40" />;
  
  return <>{children}</>;
};

// Optimized for mobile-first performance (<2s load on 3G, <500KB/page)
const MobileOptimizedCVAnalysis = ({ cvId }: { cvId: number }) => {
  const [visibleSections, setVisibleSections] = useState({ skills: false, improvements: false, context: false });
  
  // Progressive loading state tracking
  const [loadedPercentage, setLoadedPercentage] = useState(0);
  
  useEffect(() => {
    // Simulate progressive loading
    const interval = setInterval(() => {
      setLoadedPercentage(prev => {
        if (prev < 100) return prev + 5;
        clearInterval(interval);
        return 100;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
          }
        });
      },
      { rootMargin: '100px' }
    );
    
    const sections = document.querySelectorAll('.lazy-section');
    sections.forEach(section => observer.observe(section));
    
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);
  
  // Optimized analysis query
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: [`/api/ats-score/${cvId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ats-score/${cvId}`);
      if (!response.ok) throw new Error('Failed to load analysis');
      return response.json();
    },
    retry: 1 // Limit retries for faster failure
  });
  
  // Retry analysis if needed
  const reanalyzeCV = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/analyze-cv/${cvId}`, {});
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/ats-score/${cvId}`], data);
    }
  });
  
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Analyzing your CV...</p>
          </div>
          <Progress value={loadedPercentage} className="h-1.5 w-full" />
        </Card>
      </div>
    );
  }
  
  if (error || !analysis) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium">Analysis failed</p>
            <p className="text-xs text-muted-foreground mt-1">
              We couldn't complete the analysis of your CV
            </p>
          </div>
          <Button 
            onClick={() => reanalyzeCV.mutate()}
            disabled={reanalyzeCV.isPending} 
            className="w-full mt-2"
          >
            {reanalyzeCV.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : 'Try Again'}
          </Button>
        </Card>
      </div>
    );
  }
  
  // Derive color from score for visual feedback
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 65) return 'text-amber-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-4 sm:p-6 overflow-hidden">
        {/* Score overview - always loaded first */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-2">
            <svg className="w-32 h-32">
              <circle
                className="text-gray-200"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
              <circle
                className="text-primary"
                strokeWidth="6"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
                strokeDasharray={365}
                strokeDashoffset={365 - (365 * analysis.score) / 100}
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </p>
                <p className="text-sm mt-1 font-medium">{analysis.rating || 'Rating'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Score breakdown - lightweight rendering */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Skills</p>
            <p className="text-lg font-semibold">{analysis.skillsScore}/40</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Format</p>
            <p className="text-lg font-semibold">{analysis.formatScore}/40</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">SA Context</p>
            <p className="text-lg font-semibold">{analysis.contextScore}/20</p>
          </div>
        </div>
        
        {/* Key strengths - minimal initial render */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Strengths</h3>
          <ul className="space-y-1">
            {(analysis.strengths || []).slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Accordion sections for lazy loading */}
        <Accordion type="single" collapsible className="w-full">
          {/* Skills section */}
          <AccordionItem value="skills">
            <AccordionTrigger 
              className="text-sm py-2"
              onClick={() => setVisibleSections(prev => ({ ...prev, skills: true }))}
            >
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Key Skills
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div id="skills" className="lazy-section">
                <LazyLoadedSection visible={visibleSections.skills}>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.skills || []).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="whitespace-nowrap text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </LazyLoadedSection>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Improvements section */}
          <AccordionItem value="improvements">
            <AccordionTrigger 
              className="text-sm py-2"
              onClick={() => setVisibleSections(prev => ({ ...prev, improvements: true }))}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Suggested Improvements
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div id="improvements" className="lazy-section">
                <LazyLoadedSection visible={visibleSections.improvements}>
                  <ul className="space-y-1">
                    {(analysis.improvements || []).map((improvement, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </LazyLoadedSection>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* South African context section */}
          <AccordionItem value="sa-context">
            <AccordionTrigger 
              className="text-sm py-2"
              onClick={() => setVisibleSections(prev => ({ ...prev, context: true }))}
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6l9 4 9-4M3 12l9 4 9-4M3 18l9 4 9-4"></path>
                </svg>
                South African Context
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div id="context" className="lazy-section">
                <LazyLoadedSection visible={visibleSections.context}>
                  <div className="space-y-2">
                    {analysis.saKeywordsFound && analysis.saKeywordsFound.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.saKeywordsFound.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="whitespace-nowrap text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No South African context markers detected. Adding B-BBEE status, NQF levels,
                        and local regulations can improve your score.
                      </p>
                    )}
                  </div>
                </LazyLoadedSection>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default MobileOptimizedCVAnalysis;