import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';

// Types for the motivation context
type MotivationType = 'upload' | 'score' | 'daily' | 'milestone';

interface MotivationState {
  latestType: MotivationType | null;
  latestTrigger: string | number | null;
  seenMotivations: Record<string, boolean>;
  activityStreak: number;
  lastActivityDate: string | null;
  activeAchievement: string | null;
}

interface MotivationContextType {
  motivationState: MotivationState;
  triggerMotivation: (type: MotivationType, trigger?: string | number) => void;
  dismissMotivation: (type: MotivationType, trigger?: string | number) => void;
  shouldShowMotivation: (type: MotivationType, trigger?: string | number) => boolean;
  triggerAchievement: (achievementId: string) => void;
  dismissAchievement: () => void;
}

// Create the context
export const MotivationContext = createContext<MotivationContextType | null>(null);

// Initial state for the motivation
const initialState: MotivationState = {
  latestType: null,
  latestTrigger: null,
  seenMotivations: {},
  activityStreak: 0,
  lastActivityDate: null,
  activeAchievement: null,
};

// Key for local storage
const MOTIVATION_STORAGE_KEY = 'atsboost_motivation_state';

// Provider component
export function MotivationProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [motivationState, setMotivationState] = useState<MotivationState>(initialState);

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem(`${MOTIVATION_STORAGE_KEY}_${user.id}`);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setMotivationState(parsedState);
          
          // Check for daily activity streak
          checkActivityStreak(parsedState);
        } catch (e) {
          console.error('Error parsing motivation state', e);
        }
      } else {
        // First time user, show first-time motivation later
        setMotivationState({
          ...initialState,
          lastActivityDate: new Date().toISOString().split('T')[0],
          activityStreak: 1,
        });
      }
    } else {
      // Reset for logged out users
      setMotivationState(initialState);
    }
  }, [user]);

  // Track user activity streaks
  const checkActivityStreak = (state: MotivationState) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (state.lastActivityDate) {
      const lastActivity = new Date(state.lastActivityDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      if (state.lastActivityDate === today) {
        // Already logged in today, do nothing
        return;
      } else if (state.lastActivityDate === yesterdayString) {
        // Consecutive day, increment streak
        setMotivationState(prev => ({
          ...prev,
          activityStreak: prev.activityStreak + 1,
          lastActivityDate: today
        }));
        
        // If streak is a milestone (7, 14, 30 days), trigger a milestone motivation
        if ((state.activityStreak + 1) === 7 || 
            (state.activityStreak + 1) === 14 || 
            (state.activityStreak + 1) === 30) {
          triggerMotivation('milestone', `streak_${state.activityStreak + 1}`);
        }
      } else {
        // Streak broken, reset to 1
        setMotivationState(prev => ({
          ...prev,
          activityStreak: 1,
          lastActivityDate: today
        }));
      }
    } else {
      // First activity
      setMotivationState(prev => ({
        ...prev,
        activityStreak: 1,
        lastActivityDate: today
      }));
    }
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (user && motivationState !== initialState) {
      localStorage.setItem(
        `${MOTIVATION_STORAGE_KEY}_${user.id}`, 
        JSON.stringify(motivationState)
      );
    }
  }, [motivationState, user]);

  // Function to trigger a new motivation
  const triggerMotivation = (type: MotivationType, trigger?: string | number) => {
    const triggerValue = trigger || 'default';
    const motivationKey = `${type}_${triggerValue}`;
    
    // Update the state
    setMotivationState(prev => ({
      ...prev,
      latestType: type,
      latestTrigger: trigger || null,
      // Mark this motivation as seen
      seenMotivations: {
        ...prev.seenMotivations,
        [motivationKey]: true
      }
    }));
  };

  // Function to dismiss a motivation
  const dismissMotivation = (type: MotivationType, trigger?: string | number) => {
    setMotivationState(prev => {
      // Only clear if this is the currently displayed motivation
      if (prev.latestType === type && 
          (trigger === undefined || prev.latestTrigger === trigger)) {
        return {
          ...prev,
          latestType: null,
          latestTrigger: null
        };
      }
      return prev;
    });
  };

  // Function to check if a motivation should be shown
  const shouldShowMotivation = (type: MotivationType, trigger?: string | number): boolean => {
    // Don't show if user is not logged in
    if (!user) return false;
    
    const triggerValue = trigger || 'default';
    const motivationKey = `${type}_${triggerValue}`;
    
    // For daily motivations, check if we already showed one today
    if (type === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const dailyKey = `daily_${today}`;
      return !motivationState.seenMotivations[dailyKey];
    }
    
    // For other types, check if this specific motivation has been seen
    return !motivationState.seenMotivations[motivationKey];
  };
  
  // Function to trigger an achievement popup
  const triggerAchievement = (achievementId: string) => {
    setMotivationState(prev => ({
      ...prev,
      activeAchievement: achievementId
    }));
  };
  
  // Function to dismiss the achievement popup
  const dismissAchievement = () => {
    setMotivationState(prev => ({
      ...prev,
      activeAchievement: null
    }));
  };

  return (
    <MotivationContext.Provider
      value={{
        motivationState,
        triggerMotivation,
        dismissMotivation,
        shouldShowMotivation,
        triggerAchievement,
        dismissAchievement
      }}
    >
      {children}
    </MotivationContext.Provider>
  );
}

// Hook to use the motivation context
export function useMotivation() {
  const context = useContext(MotivationContext);
  if (!context) {
    throw new Error('useMotivation must be used within a MotivationProvider');
  }
  return context;
}