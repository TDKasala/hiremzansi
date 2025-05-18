import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Smile, ThumbsUp, Medal, Award, BookOpen } from 'lucide-react';
import { useMotivation } from '@/hooks/use-motivation';
import Confetti from '@/components/ui/confetti';

interface MotivationalProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete?: (step: number) => void;
  showLabels?: boolean;
  animationSpeed?: number;
}

const getMotivationalPhrase = (percent: number): string => {
  if (percent < 25) return "You're starting off strong!";
  if (percent < 50) return "Good progress! Keep going!";
  if (percent < 75) return "You're doing great! Almost there!";
  if (percent < 100) return "So close to the finish line!";
  return "Amazing job! You've completed all steps!";
};

export const MotivationalProgress: React.FC<MotivationalProgressProps> = ({
  currentStep,
  totalSteps,
  onStepComplete,
  showLabels = true,
  animationSpeed = 1000,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { showMotivation, celebrateProgress } = useMotivation();
  
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  // Step milestone messages for celebrations
  const stepMilestones: Record<number, string> = {
    1: "You've started your CV optimization journey!",
    2: "Halfway through - you're making excellent progress!",
    3: "Almost there! Just a few more steps to go!",
    4: "Congratulations! You've completed all steps for an optimized CV!"
  };
  
  // Animated progress effect
  useEffect(() => {
    // Reset animation if going backwards
    if (percentage < animatedValue) {
      setAnimatedValue(0);
      setTimeout(() => {
        setAnimatedValue(percentage);
      }, 50);
      return;
    }
    
    // Animate progress bar
    const animationDuration = animationSpeed; // milliseconds
    const stepSize = 1;
    const steps = (percentage - animatedValue) / stepSize;
    const stepTime = animationDuration / steps;
    
    let currentValue = animatedValue;
    
    const timer = setInterval(() => {
      if (currentValue < percentage) {
        currentValue += stepSize;
        setAnimatedValue(currentValue);
      } else {
        clearInterval(timer);
        
        // Trigger celebration if we hit a milestone
        if (Object.keys(stepMilestones).includes(currentStep.toString())) {
          setShowCelebration(true);
          celebrateProgress(stepMilestones[currentStep]);
          onStepComplete?.(currentStep);
          
          setTimeout(() => {
            setShowCelebration(false);
          }, 3000);
        } else {
          // Show regular motivation on non-milestone steps
          if (currentStep > 0) {
            showMotivation('improvement');
          }
        }
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [percentage, animationSpeed, currentStep, celebrateProgress, showMotivation, onStepComplete]);
  
  // Icon based on progress
  const ProgressIcon = () => {
    if (percentage < 25) return <BookOpen className="h-6 w-6 text-blue-500" />;
    if (percentage < 50) return <Smile className="h-6 w-6 text-amber-500" />;
    if (percentage < 75) return <ThumbsUp className="h-6 w-6 text-green-500" />;
    if (percentage < 100) return <Medal className="h-6 w-6 text-purple-500" />;
    return <Award className="h-6 w-6 text-amber-500" />;
  };
  
  return (
    <div className="space-y-2">
      {/* Progress summary with icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ProgressIcon />
          <span className="font-medium text-gray-700">
            {getMotivationalPhrase(percentage)}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {currentStep} of {totalSteps} steps
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <Progress value={animatedValue} className="h-3 bg-gray-100" />
        
        {/* Step indicators */}
        {showLabels && (
          <div className="absolute top-5 left-0 w-full flex justify-between px-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                    index < currentStep 
                      ? 'bg-amber-500 border-amber-600' 
                      : index === currentStep 
                        ? 'bg-blue-500 border-blue-600 animate-pulse' 
                        : 'bg-gray-200 border-gray-300'
                  }`}
                />
                {totalSteps <= 5 && (
                  <span className="text-xs mt-1 text-gray-600">
                    Step {index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Confetti celebration effect */}
      <Confetti active={showCelebration} duration={3000} />
    </div>
  );
};

export default MotivationalProgress;