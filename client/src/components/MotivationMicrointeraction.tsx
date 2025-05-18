import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Gift, Star, TrendingUp, Upload, Award } from 'lucide-react';
import Confetti from '@/components/ui/confetti';

interface MotivationMicrointeractionProps {
  type: 'daily' | 'score' | 'milestone' | 'upload';
  trigger?: string | number;
  className?: string;
  onClose?: () => void;
}

export const MotivationMicrointeraction: React.FC<MotivationMicrointeractionProps> = ({
  type,
  trigger,
  className = '',
  onClose
}) => {
  const [showConfetti, setShowConfetti] = React.useState(type === 'milestone');
  
  // Close confetti after 3 seconds
  React.useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);
  
  // Get the appropriate icon based on the type
  const getIcon = () => {
    switch (type) {
      case 'daily':
        return <Gift className="h-6 w-6 text-amber-500" />;
      case 'score':
        return <Star className="h-6 w-6 text-amber-500" />;
      case 'milestone':
        return <Award className="h-6 w-6 text-amber-500" />;
      case 'upload':
        return <Upload className="h-6 w-6 text-amber-500" />;
      default:
        return <TrendingUp className="h-6 w-6 text-amber-500" />;
    }
  };
  
  // Get the appropriate message based on the type and trigger
  const getMessage = () => {
    switch (type) {
      case 'daily':
        return {
          title: "Daily Motivation",
          message: "Stay consistent with your job search - small daily efforts lead to big results!"
        };
      case 'score':
        const score = typeof trigger === 'number' ? trigger : 0;
        if (score >= 80) {
          return {
            title: "Excellent Score!",
            message: "Your CV is in great shape! You're well-positioned for job success in the South African market."
          };
        } else if (score >= 60) {
          return {
            title: "Good Progress!",
            message: "Your CV is looking good. A few more tweaks and it will be ready to impress South African employers."
          };
        } else {
          return {
            title: "Keep Improving!",
            message: "We've identified areas to improve your CV. Adding South African-specific elements will boost your chances."
          };
        }
      case 'milestone':
        if (trigger === 'first_upload') {
          return {
            title: "First CV Uploaded!",
            message: "You've taken the first step towards an optimized CV for the South African job market!"
          };
        } else if (trigger === 'multiple_cvs') {
          return {
            title: "Multiple CVs Milestone!",
            message: "Having multiple versions of your CV helps you target different South African industries more effectively."
          };
        } else if (trigger === 'score_improvement') {
          return {
            title: "Score Improved!",
            message: "Great job improving your CV score! Your CV is now more appealing to South African employers."
          };
        }
        return {
          title: "Achievement Unlocked!",
          message: "You've reached an important milestone in your job search journey!"
        };
      case 'upload':
        return {
          title: "Ready to Analyze",
          message: "Your CV is ready for analysis! We'll evaluate it for South African job market compatibility."
        };
      default:
        return {
          title: "Keep Going!",
          message: "Your dedication to improving your CV will pay off in your South African job search."
        };
    }
  };
  
  const content = getMessage();
  
  return (
    <>
      {showConfetti && <Confetti active={showConfetti} />}
      
      <Card className={`bg-gradient-to-r from-amber-50 to-white border-amber-200 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex space-x-3">
              <div className="bg-white rounded-full p-2 shadow-sm">
                {getIcon()}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-amber-700">{content.title}</h3>
                <p className="text-gray-700">{content.message}</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MotivationMicrointeraction;