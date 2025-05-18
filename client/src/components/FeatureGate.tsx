import React from 'react';
import { usePlanFeatures, type PlanFeatures } from '@/hooks/use-plan-features';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LockIcon, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * FeatureGate component conditionally renders children based on plan access
 * 
 * If the user has access to the feature, children are rendered
 * If not, either the fallback is rendered or a default upgrade prompt
 */
const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  className
}) => {
  const { canAccess, getPlanDisplayName } = usePlanFeatures();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const hasAccess = canAccess(feature);
  
  // If user has access, render the children
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Otherwise render a default upgrade prompt
  const handleUpgradeClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign up or log in to upgrade your plan.",
        variant: "default",
      });
    }
  };
  
  return (
    <div className={cn("bg-amber-50 border border-amber-200 rounded-lg p-4 text-center", className)}>
      <div className="flex flex-col items-center gap-2">
        <div className="bg-amber-100 p-2 rounded-full">
          <LockIcon className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-medium text-lg">Premium Feature</h3>
        <p className="text-gray-600 mb-4">
          This feature is available on higher plans.
          Your current plan: <span className="font-medium">{getPlanDisplayName()}</span>
        </p>
        <Link href="/pricing">
          <Button 
            variant="default" 
            className="bg-amber-500 hover:bg-amber-600"
            onClick={handleUpgradeClick}
          >
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

/**
 * FeatureMessage component displays a small indicator 
 * when a feature is restricted by plan type
 */
export const FeatureMessage: React.FC<{
  feature: keyof PlanFeatures;
  message?: string;
  className?: string;
}> = ({ feature, message, className }) => {
  const { canAccess, getPlanDisplayName } = usePlanFeatures();
  const hasAccess = canAccess(feature);
  
  if (hasAccess) {
    return null;
  }
  
  return (
    <div className={cn("inline-flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded", className)}>
      <AlertCircle className="h-3 w-3" />
      <span>
        {message || `Available on higher plans. Your plan: ${getPlanDisplayName()}`}
      </span>
    </div>
  );
};

export default FeatureGate;