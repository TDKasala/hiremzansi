import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MotivationMicrointeraction } from '@/components/MotivationMicrointeraction';
import { useMotivation } from '@/hooks/use-motivation';
import { useAuth } from '@/hooks/use-auth';

interface MotivationalBannerProps {
  location: 'dashboard' | 'upload' | 'cv-details' | 'profile';
  cvScore?: number;
  cvCount?: number;
}

export function MotivationalBanner({ 
  location, 
  cvScore, 
  cvCount = 0 
}: MotivationalBannerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    showMotivation: triggerMotivation,
    celebrateProgress
  } = useMotivation();
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationType, setMotivationType] = useState<'daily' | 'score' | 'milestone' | 'upload'>('daily');
  const [motivationTrigger, setMotivationTrigger] = useState<string | number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Dashboard experiences
    if (location === 'dashboard') {
      // Check for daily motivation
      const shouldShowDaily = Math.random() > 0.7; // 30% chance to show daily motivation
      if (shouldShowDaily) {
        setMotivationType('daily');
        setShowMotivation(true);
        triggerMotivation('general');
        return;
      }

      // First CV upload milestone
      if (cvCount === 1) {
        setMotivationType('milestone');
        setMotivationTrigger('first_upload');
        setShowMotivation(true);
        celebrateProgress("You've uploaded your first CV! Great start!");
        return;
      }
      
      // Multiple CVs milestone
      if (cvCount === 3) {
        setMotivationType('milestone');
        setMotivationTrigger('multiple_cvs');
        setShowMotivation(true);
        celebrateProgress("You've created multiple CV versions - perfect for targeting different jobs!");
        return;
      }
    }

    // CV Details page experiences
    if (location === 'cv-details' && cvScore !== undefined) {
      // Show score-based motivation
      const shouldShowScore = Math.random() > 0.5; // 50% chance to show score motivation
      if (shouldShowScore) {
        setMotivationType('score');
        setMotivationTrigger(cvScore);
        setShowMotivation(true);
        triggerMotivation('improvement');
        return;
      }
      
      // Score improvement milestone
      const previousScoreKey = 'previous_cv_score';
      const previousScore = localStorage.getItem(previousScoreKey);
      if (previousScore && Number(previousScore) < cvScore) {
        setMotivationType('milestone');
        setMotivationTrigger('score_improvement');
        setShowMotivation(true);
        celebrateProgress(`Your CV score improved from ${previousScore}% to ${cvScore}%!`);
      }
      localStorage.setItem(previousScoreKey, String(cvScore));
    }

    // Upload page experiences
    if (location === 'upload') {
      if (cvCount === 0) {
        setMotivationType('upload');
        setMotivationTrigger('first_time');
        setShowMotivation(true);
        triggerMotivation('upload');
      }
    }
  }, [location, user, cvScore, cvCount]);

  if (!showMotivation) return null;

  return (
    <MotivationMicrointeraction
      type={motivationType}
      trigger={motivationTrigger}
      className="max-w-4xl mx-auto mb-6"
    />
  );
}