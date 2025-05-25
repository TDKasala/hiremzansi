import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useContext as useReactContext } from 'react';
import { AuthContext } from '../context/AuthContext';

type MotivationType = 'general' | 'upload' | 'analysis' | 'improvement' | 'application';

interface MotivationContextType {
  showMotivation: (type: MotivationType) => void;
  celebrateProgress: (achievement: string) => void;
  motivationEnabled: boolean;
  setMotivationEnabled: (enabled: boolean) => void;
  shouldShowMotivation: (type: string, trigger?: string | number) => boolean;
  triggerMotivation: (type: string, trigger?: string | number) => void;
  motivationState: {
    lastShown: Record<string, number>;
    milestones: string[];
  };
}

const MotivationContext = createContext<MotivationContextType | undefined>(undefined);

// Motivational messages by category
const MOTIVATIONAL_MESSAGES = {
  general: [
    "Keep going! Every step brings you closer to your dream job.",
    "Your efforts today are building your success tomorrow.",
    "You've got this! Your dedication will pay off.",
    "Small progress is still progress. Keep going!",
    "Believe in yourself as much as we believe in you!"
  ],
  upload: [
    "Great job uploading your CV! First step complete.",
    "CV uploaded successfully! Let's optimize it together.",
    "Your CV is now ready for analysis. You're on the right track!",
    "That's a solid first step. Your CV is now in our system."
  ],
  analysis: [
    "Taking time to analyze your CV shows real commitment to your career.",
    "By analyzing your CV, you're already ahead of many job seekers.",
    "Understanding your CV's strengths and weaknesses is key to success.",
    "Knowledge is power! This analysis will help you stand out."
  ],
  improvement: [
    "Each improvement to your CV increases your chances of success.",
    "Small changes can make a big difference. Keep refining!",
    "You're making your CV stronger with every edit.",
    "Fantastic work on improving your CV! It's looking better already."
  ],
  application: [
    "Your optimized CV is ready to impress employers!",
    "You've put in the work - now go confidently to your applications.",
    "With your improved CV, you're setting yourself up for success.",
    "Your dedication to perfecting your CV will be noticed by employers."
  ]
};

// South African specific motivational messages
const SA_MOTIVATIONAL_MESSAGES = [
  "Including your B-BBEE status makes your CV more relevant for South African employers.",
  "Adding NQF levels to your qualifications helps South African recruiters understand your education.",
  "Mentioning experience with local regulations shows your value to South African companies.",
  "Your knowledge of South African business culture is a valuable asset - make sure it shows in your CV.",
  "Don't forget to highlight experience with South African software systems when relevant."
];

export const MotivationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [motivationEnabled, setMotivationEnabled] = useState<boolean>(true);
  const authContext = useReactContext(AuthContext);
  const user = authContext?.user || null;
  
  // Track motivation state
  const [motivationState, setMotivationState] = useState<{
    lastShown: Record<string, number>;
    milestones: string[];
  }>({
    lastShown: {},
    milestones: []
  });
  
  // Track user's last motivation time to prevent too frequent messages
  const [lastMotivationTime, setLastMotivationTime] = useState<Date | null>(null);
  
  // Helper to get a random message from an array
  const getRandomMessage = (messages: string[]): string => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };
  
  // Add South African specific messaging occasionally
  const shouldAddSASpecific = (): boolean => {
    return Math.random() > 0.7; // 30% chance to add SA specific message
  };
  
  // Show a motivational toast with optional animation
  const showMotivation = (type: MotivationType) => {
    if (!motivationEnabled) return;
    
    // Don't show too many motivational messages (max one per minute)
    const now = new Date();
    if (lastMotivationTime && now.getTime() - lastMotivationTime.getTime() < 60000) {
      return;
    }
    
    // Get message for the specific action type
    let message = getRandomMessage(MOTIVATIONAL_MESSAGES[type]);
    
    // Occasionally add South African specific motivation
    if (shouldAddSASpecific()) {
      message = getRandomMessage(SA_MOTIVATIONAL_MESSAGES);
    }
    
    // Personalize with name if available
    if (user?.name) {
      const personalizedIntros = ["Great job, ", "Keep it up, ", "Excellent work, ", "You're doing great, "];
      const intro = getRandomMessage(personalizedIntros);
      message = `${intro}${user.name}! ${message}`;
    }
    
    toast({
      title: "Motivation Boost",
      description: message,
      variant: "default",
      className: "motivation-toast",
      duration: 5000,
    });
    
    setLastMotivationTime(now);
  };
  
  // Celebration for major achievements
  const celebrateProgress = (achievement: string) => {
    if (!motivationEnabled) return;
    
    toast({
      title: "Achievement Unlocked!",
      description: achievement,
      variant: "default",
      className: "celebration-toast",
      duration: 6000,
    });
    
    // Here we could trigger confetti or other celebration animations
    // This would be connected to a confetti library in a real implementation
  };
  
  // Load user preferences for motivation
  useEffect(() => {
    const savedPreference = localStorage.getItem('motivationEnabled');
    if (savedPreference !== null) {
      setMotivationEnabled(savedPreference === 'true');
    }
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('motivationEnabled', motivationEnabled.toString());
  }, [motivationEnabled]);
  
  // Function to determine if we should show a particular type of motivation
  const shouldShowMotivation = (type: string, trigger?: string | number): boolean => {
    if (!motivationEnabled) return false;
    
    const now = Date.now();
    const key = trigger ? `${type}_${trigger}` : type;
    
    // Don't show milestones more than once
    if (type === 'milestone' && motivationState.milestones.includes(String(trigger))) {
      return false;
    }
    
    // Define cooldown periods for different types (in milliseconds)
    const cooldowns: Record<string, number> = {
      daily: 24 * 60 * 60 * 1000, // Once per day
      score: 6 * 60 * 60 * 1000,  // Every 6 hours
      milestone: 0,               // Always show milestones (but only once)
      upload: 30 * 60 * 1000,     // Every 30 minutes
      general: 2 * 60 * 60 * 1000 // Every 2 hours
    };
    
    const lastShown = motivationState.lastShown[key] || 0;
    const cooldown = cooldowns[type] || cooldowns.general;
    
    return now - lastShown > cooldown;
  };
  
  // Function to record that we've shown a motivation and update state
  const triggerMotivation = (type: string, trigger?: string | number) => {
    const now = Date.now();
    const key = trigger ? `${type}_${trigger}` : type;
    
    setMotivationState(prev => {
      const updatedLastShown = { ...prev.lastShown, [key]: now };
      let updatedMilestones = [...prev.milestones];
      
      // For milestones, record that we've shown it
      if (type === 'milestone' && trigger && !prev.milestones.includes(String(trigger))) {
        updatedMilestones = [...updatedMilestones, String(trigger)];
      }
      
      return {
        lastShown: updatedLastShown,
        milestones: updatedMilestones
      };
    });
    
    // For milestone triggers, also show a celebration
    if (type === 'milestone' && trigger) {
      const milestoneMessages: Record<string, string> = {
        first_upload: "You've uploaded your first CV!",
        multiple_cvs: "You've created multiple CV versions - great for targeting different jobs!",
        score_improvement: "Your CV score has improved! Great progress!"
      };
      
      const message = milestoneMessages[String(trigger)] || "You've reached a milestone!";
      celebrateProgress(message);
    }
  };
  
  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('motivationState');
      if (savedState) {
        setMotivationState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Error loading motivation state:", error);
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('motivationState', JSON.stringify(motivationState));
  }, [motivationState]);

  return (
    <MotivationContext.Provider value={{ 
      showMotivation, 
      celebrateProgress,
      motivationEnabled,
      setMotivationEnabled,
      shouldShowMotivation,
      triggerMotivation,
      motivationState
    }}>
      {children}
    </MotivationContext.Provider>
  );
};

export const useMotivation = () => {
  const context = useContext(MotivationContext);
  if (context === undefined) {
    throw new Error('useMotivation must be used within a MotivationProvider');
  }
  return context;
};