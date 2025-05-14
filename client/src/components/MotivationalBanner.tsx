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
    motivationState, 
    triggerMotivation, 
    shouldShowMotivation 
  } = useMotivation();
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationType, setMotivationType] = useState<'daily' | 'score' | 'milestone' | 'upload'>('daily');
  const [motivationTrigger, setMotivationTrigger] = useState<string | number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Dashboard experiences
    if (location === 'dashboard') {
      // Check for daily motivation
      if (shouldShowMotivation('daily')) {
        setMotivationType('daily');
        setShowMotivation(true);
        triggerMotivation('daily');
        return;
      }

      // First CV upload milestone
      if (cvCount === 1 && shouldShowMotivation('milestone', 'first_upload')) {
        setMotivationType('milestone');
        setMotivationTrigger('first_upload');
        setShowMotivation(true);
        triggerMotivation('milestone', 'first_upload');
        return;
      }
      
      // Multiple CVs milestone
      if (cvCount === 3 && shouldShowMotivation('milestone', 'multiple_cvs')) {
        setMotivationType('milestone');
        setMotivationTrigger('multiple_cvs');
        setShowMotivation(true);
        triggerMotivation('milestone', 'multiple_cvs');
        return;
      }
    }

    // CV Details page experiences
    if (location === 'cv-details' && cvScore !== undefined) {
      // Show score-based motivation
      if (shouldShowMotivation('score', cvScore)) {
        setMotivationType('score');
        setMotivationTrigger(cvScore);
        setShowMotivation(true);
        triggerMotivation('score', cvScore);
        return;
      }
      
      // Score improvement milestone
      const previousScoreKey = 'previous_cv_score';
      const previousScore = localStorage.getItem(previousScoreKey);
      if (previousScore && Number(previousScore) < cvScore) {
        if (shouldShowMotivation('milestone', 'score_improvement')) {
          setMotivationType('milestone');
          setMotivationTrigger('score_improvement');
          setShowMotivation(true);
          triggerMotivation('milestone', 'score_improvement');
        }
      }
      localStorage.setItem(previousScoreKey, String(cvScore));
    }

    // Upload page experiences
    if (location === 'upload') {
      if (cvCount === 0 && shouldShowMotivation('upload', 'first_time')) {
        setMotivationType('upload');
        setMotivationTrigger('first_time');
        setShowMotivation(true);
        triggerMotivation('upload', 'first_time');
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