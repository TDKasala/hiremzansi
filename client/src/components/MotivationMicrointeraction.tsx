import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Heart, Award, Sparkles, Target, Landmark, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MotivationMicrointeractionProps {
  type?: 'upload' | 'score' | 'daily' | 'milestone';
  trigger?: string | number; // Can be a score value, milestone name, etc.
  className?: string;
}

// Motivational quotes data
const motivationalQuotes = [
  {
    text: "Your CV is your personal marketing tool. Keep refining it!",
    author: "Career Tip",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    text: "Small steps today lead to big opportunities tomorrow.",
    author: "Success Journey",
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
  {
    text: "The South African job market values persistence. Keep going!",
    author: "Local Insight",
    icon: <Landmark className="w-4 h-4" />,
  },
  {
    text: "Your skills are needed. The right employer is looking for you.",
    author: "Market Truth",
    icon: <Target className="w-4 h-4" />,
  },
  {
    text: "Every application is a step closer to your dream job.",
    author: "Job Search Wisdom",
    icon: <Award className="w-4 h-4" />,
  },
  {
    text: "You've got this! Consistency is the key to success.",
    author: "Motivation Guide",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    text: "Focus on progress, not perfection. You're doing great!",
    author: "Growth Mindset",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    text: "Keep learning and adapting. The job market rewards agility.",
    author: "Skills Developer",
    icon: <BookOpen className="w-4 h-4" />,
  },
];

// Score-based motivational messages
const scoreMessages = [
  {
    range: [0, 40],
    message: "Everyone starts somewhere. Let's improve your CV!",
    tone: "encouraging",
  },
  {
    range: [41, 60],
    message: "You're making progress! A few more tweaks will boost your score.",
    tone: "positive",
  },
  {
    range: [61, 80],
    message: "Great job! Your CV is standing out from the crowd.",
    tone: "enthusiastic",
  },
  {
    range: [81, 100],
    message: "Outstanding! Your CV is optimized for success!",
    tone: "celebratory",
  },
];

export function MotivationMicrointeraction({ 
  type = 'daily', 
  trigger,
  className = '',
}: MotivationMicrointeractionProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [message, setMessage] = useState('');
  const [motivationClass, setMotivationClass] = useState('bg-blue-50 border-blue-200 text-blue-800');

  useEffect(() => {
    // Select a random quote for daily motivation
    if (type === 'daily') {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    }

    // Determine motivation message based on score
    if (type === 'score' && typeof trigger === 'number') {
      const score = trigger;
      const scoreMessage = scoreMessages.find(
        (sm) => score >= sm.range[0] && score <= sm.range[1]
      );

      if (scoreMessage) {
        setMessage(scoreMessage.message);
        
        // Set color based on tone
        if (scoreMessage.tone === 'encouraging') {
          setMotivationClass('bg-amber-50 border-amber-200 text-amber-800');
        } else if (scoreMessage.tone === 'positive') {
          setMotivationClass('bg-yellow-50 border-yellow-200 text-yellow-800');
        } else if (scoreMessage.tone === 'enthusiastic') {
          setMotivationClass('bg-green-50 border-green-200 text-green-800');
        } else if (scoreMessage.tone === 'celebratory') {
          setMotivationClass('bg-emerald-50 border-emerald-200 text-emerald-800');
        }
      }
    }

    // Set milestone specific message
    if (type === 'milestone' && typeof trigger === 'string') {
      if (trigger === 'first_upload') {
        setMessage("Congratulations on uploading your first CV! You've taken the first step toward your dream job.");
        setMotivationClass('bg-purple-50 border-purple-200 text-purple-800');
      } else if (trigger === 'score_improvement') {
        setMessage("Your CV score has improved! Keep up the great work.");
        setMotivationClass('bg-green-50 border-green-200 text-green-800');
      } else if (trigger === 'subscription') {
        setMessage("Welcome to Premium! Unlock the full potential of your job search.");
        setMotivationClass('bg-indigo-50 border-indigo-200 text-indigo-800');
      }
    }

    // Show the motivation after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Auto-hide after 8 seconds for non-interactive motivations
    const hideTimer = setTimeout(() => {
      if (type !== 'score') { // Keep score motivations visible until dismissed
        setIsVisible(false);
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [type, trigger]);

  // For daily quotes
  if (type === 'daily') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className={`rounded-lg p-4 border mb-4 shadow-sm ${motivationClass} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{quote.icon}</div>
              <div className="flex-1">
                <p className="font-medium mb-1">{quote.text}</p>
                <p className="text-sm opacity-80">{quote.author}</p>
              </div>
              <button 
                onClick={() => setIsVisible(false)} 
                className="text-sm text-muted p-1 hover:bg-white/20 rounded-full"
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // For score-based or milestone motivation
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={`rounded-lg p-4 border mb-4 shadow-sm ${motivationClass} ${className}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium">{message}</p>
            </div>
            <button 
              onClick={() => setIsVisible(false)} 
              className="text-sm text-muted p-1 hover:bg-white/20 rounded-full"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
          
          {type === 'score' && (
            <div className="mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/40 hover:bg-white/60 mt-2"
                      onClick={() => setIsVisible(false)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      View Tips to Improve
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>See personalized tips to improve your CV score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}