import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Award, Star, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMotivation } from '@/hooks/use-motivation';

// Special achievements that will trigger the popup
export type AchievementType = 
  | 'milestone:first_upload' 
  | 'milestone:score_improvement' 
  | 'milestone:subscription' 
  | 'milestone:streak_7' 
  | 'milestone:streak_14' 
  | 'milestone:streak_30'
  | 'score:excellent'
  | 'activity:login_streak';

interface MilestoneData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Milestone data with titles, descriptions and visuals
const milestoneData: Record<AchievementType, MilestoneData> = {
  'milestone:first_upload': {
    title: 'First CV Uploaded!',
    description: 'You\'ve taken the first step towards your dream job. Keep going!',
    icon: <Target className="w-8 h-8" />,
    color: 'bg-blue-500'
  },
  'milestone:score_improvement': {
    title: 'CV Score Improved!',
    description: 'Your hard work is paying off. Your CV is getting stronger!',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'bg-green-500'
  },
  'milestone:subscription': {
    title: 'Premium Activated!',
    description: 'You now have access to all premium tools. Your job search just leveled up!',
    icon: <Star className="w-8 h-8" />,
    color: 'bg-purple-500'
  },
  'milestone:streak_7': {
    title: '7-Day Streak!',
    description: 'You\'ve been active for 7 consecutive days. Consistency is key to success!',
    icon: <Award className="w-8 h-8" />,
    color: 'bg-amber-500'
  },
  'milestone:streak_14': {
    title: '2-Week Streak!',
    description: 'Two weeks of consistent effort! You\'re building great habits.',
    icon: <Award className="w-8 h-8" />,
    color: 'bg-amber-600'
  },
  'milestone:streak_30': {
    title: '30-Day Streak!',
    description: 'A full month of dedication! Your persistence is truly impressive.',
    icon: <Award className="w-8 h-8" />,
    color: 'bg-amber-700'
  },
  'score:excellent': {
    title: 'Excellent Score!',
    description: 'Your CV has achieved an excellent ATS score. You\'re ready to impress employers!',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'bg-green-600'
  },
  'activity:login_streak': {
    title: 'Welcome Back!',
    description: 'Regular engagement with your job search improves your chances of success.',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-red-500'
  }
};

// Confetti animation for celebrations
const Confetti = () => {
  return (
    <div className="confetti-container pointer-events-none">
      {[...Array(20)].map((_, i) => {
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 0.5 + Math.random() * 1.5;
        const randomSize = 0.5 + Math.random() * 1;
        
        return (
          <div 
            key={i}
            className="fixed z-50 w-2 h-2 bg-yellow-300 rounded-full shadow-sm"
            style={{
              left: `${randomLeft}%`,
              top: '-10px',
              animation: `fall ${randomDuration}s ease-out ${randomDelay}s forwards`,
              transformOrigin: 'center center',
              opacity: 0.8,
              transform: `scale(${randomSize})`,
              boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
            }}
          />
        );
      })}
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

interface MotivationPopupProps {
  achievement?: AchievementType;
}

export function MotivationPopup({ achievement }: MotivationPopupProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementType | undefined>(achievement);
  const { motivationState, dismissMotivation } = useMotivation();

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setCurrentAchievement(achievement);

      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  if (!currentAchievement || !isVisible) return null;

  const milestoneInfo = milestoneData[currentAchievement];
  
  const handleClose = () => {
    setIsVisible(false);
    
    // Extract type and trigger from the achievement string
    const [type, trigger] = currentAchievement.split(':') as [string, string];
    dismissMotivation(type as any, trigger);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <Confetti />
          
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`absolute top-0 left-0 right-0 h-2 ${milestoneInfo.color}`}></div>
            
            <button 
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 p-2"
              aria-label="Close"
            >
              &times;
            </button>
            
            <div className="p-8 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white ${milestoneInfo.color}`}>
                {milestoneInfo.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{milestoneInfo.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {milestoneInfo.description}
              </p>
              
              <Button onClick={handleClose} className="w-full">
                Continue My Journey
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}