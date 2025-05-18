import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

// Plan feature types
export type PlanFeatures = {
  scanLimit: number | null;
  maxStrengths: number | null;
  maxImprovements: number | null;
  fullRecommendations: boolean;
  beforeAfterComparison: boolean;
  keywordOptimization: boolean;
  unlimitedUploads: boolean;
  bbbeeGuidance: boolean;
  nqfGuidance: boolean;
  interviewPractice: boolean;
  skillGapAnalysis: boolean;
  jobMatching: boolean;
  emailSupport: boolean;
};

// Default free plan features
const FREE_PLAN_FEATURES: PlanFeatures = {
  scanLimit: 1,
  maxStrengths: 2,
  maxImprovements: 1,
  fullRecommendations: false,
  beforeAfterComparison: false,
  keywordOptimization: false,
  unlimitedUploads: false,
  bbbeeGuidance: false,
  nqfGuidance: false,
  interviewPractice: false,
  skillGapAnalysis: false,
  jobMatching: false,
  emailSupport: false,
};

export function usePlanFeatures() {
  const { user } = useAuth();
  
  const { data: planFeatures, isLoading, error } = useQuery({
    queryKey: ['/api/user/plan-features'],
    // Only fetch if user is logged in
    enabled: !!user,
    // Default to free plan features while loading
    placeholderData: FREE_PLAN_FEATURES,
  });
  
  const { data: planName } = useQuery({
    queryKey: ['/api/user/plan-name'],
    enabled: !!user,
    placeholderData: 'Free',
  });
  
  const { data: scansRemaining } = useQuery({
    queryKey: ['/api/user/scans-remaining'],
    enabled: !!user,
    placeholderData: 1, // Default to 1 scan for free users
  });
  
  // Helper function to check if a feature is available
  const canAccess = (feature: keyof PlanFeatures): boolean => {
    if (!planFeatures) return FREE_PLAN_FEATURES[feature] as boolean;
    
    const featureValue = planFeatures[feature];
    
    // For boolean features, simply return the value
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // For numeric features, if it's null it means unlimited
    if (typeof featureValue === 'number' || featureValue === null) {
      if (featureValue === null) {
        return true; // Unlimited
      }
      return featureValue > 0; // Has some limit but greater than 0
    }
    
    return false;
  };
  
  // Get the display name for the current plan
  const getPlanDisplayName = (): string => {
    if (!user) return 'Free';
    return planName || 'Free';
  };
  
  // Check if user has unlimited scans
  const hasUnlimitedScans = (): boolean => {
    if (!planFeatures) return false;
    return planFeatures.scanLimit === null;
  };
  
  // Get the number of scans remaining
  const getScansRemaining = (): number | null => {
    if (!user) return 1; // Free users get 1 scan
    if (hasUnlimitedScans()) return null; // Unlimited scans
    return scansRemaining || 0;
  };
  
  // Check if user can upload more CVs
  const canUploadMoreCVs = (): boolean => {
    if (!user) return false; // Guest users can't upload multiple CVs
    if (!planFeatures) return false;
    
    // Users with unlimited uploads can always upload more
    if (planFeatures.unlimitedUploads) return true;
    
    // Otherwise check if they have any scans remaining
    return getScansRemaining() !== 0;
  };
  
  return {
    features: planFeatures || FREE_PLAN_FEATURES,
    isLoading,
    error,
    canAccess,
    getPlanDisplayName,
    hasUnlimitedScans,
    getScansRemaining,
    canUploadMoreCVs,
  };
}