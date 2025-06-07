import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'wouter';

// Launch discount configuration
const LAUNCH_DISCOUNT = 0.5;
const isLaunchDiscountActive = true;

// Subscription plans
const plans = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    price: 0,
    interval: 'week',
    features: [
      '1 Free CV Analysis',
      'Basic ATS Score',
      'CV Upload Tool',
      'Basic Optimization Tips',
      'Valid for 7 Days',
    ],
    scanLimit: 1,
    popular: false,
    highlighted: false,
  },
  {
    id: 'essential-pack',
    name: 'Essential Pack',
    price: isLaunchDiscountActive ? 2500 : 4900, // ZAR 25.00 or 49.00 in cents
    originalPrice: 4900,
    interval: 'one-time',
    features: [
      '5 Complete CV Analyses',
      'Advanced ATS Scoring',
      'Detailed PDF Reports',
      'SA-Specific Recommendations',
      'B-BBEE Optimization',
      '30-Day Access',
    ],
    scanLimit: 5,
    popular: true,
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: isLaunchDiscountActive ? 5000 : 9900, // ZAR 50.00 or 99.00 in cents
    originalPrice: 9900,
    interval: 'month',
    features: [
      '15 CV Analyses/Month',
      'Real-time CV Editor',
      'Priority Support',
      'Template Library Access',
      'Industry Benchmarking',
      'Export Multiple Formats',
    ],
    scanLimit: 15,
    popular: false,
    highlighted: true,
  },
  {
    id: 'business-annual',
    name: 'Business Annual',
    price: isLaunchDiscountActive ? 50000 : 99900, // ZAR 500.00 or 999.00 in cents
    originalPrice: 99900,
    interval: 'year',
    features: [
      '20 CV Analyses/Month',
      'All Professional Features',
      'Bulk Analysis Tools',
      'API Access',
      'Dedicated Account Manager',
      '15% Annual Savings',
    ],
    scanLimit: 20,
    popular: false,
    highlighted: false,
  },
];

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id); // Default to Premium
  const [isLoading, setIsLoading] = useState(false);

  // If not logged in, redirect to auth page
  if (!user) {
    // Ensure this is after hook calls to avoid violating rules of hooks
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="mb-6">You need to login to subscribe to a plan.</p>
        <Link href="/auth">
          <Button>Login / Register</Button>
        </Link>
      </div>
    );
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // For free plans, just set the user to this plan
      if (plan.price === 0) {
        // Handle free plan subscription logic
        await apiRequest('POST', '/api/subscribe', { planId: plan.id });
        
        toast({
          title: 'Subscription Updated',
          description: `You are now on the ${plan.name} plan.`,
        });
        
        setLocation('/dashboard');
        return;
      }

      // For paid plans, redirect to payment
      const response = await apiRequest('POST', '/api/create-payfast-subscription', {
        planId: plan.id,
      });
      
      const result = await response.json();
      
      if (result.redirectUrl) {
        // Redirect to payment URL
        window.location.href = result.redirectUrl;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: 'There was a problem setting up your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    return `R${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="container max-w-6xl px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t('Choose Your Plan')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('Select the plan that best fits your needs. Upgrade or downgrade anytime.')}
        </p>
      </div>

      <div className="mb-8">
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${
                plan.highlighted 
                  ? 'border-primary shadow-lg' 
                  : plan.popular 
                    ? 'border-green-500 shadow-md' 
                    : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {plan.scanLimit} scans per month
                    </CardDescription>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Most Popular
                    </Badge>
                  )}
                  {plan.highlighted && (
                    <Badge className="bg-primary hover:bg-primary/90">
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mt-1 mb-4">
                  {isLaunchDiscountActive && plan.originalPrice && plan.price !== plan.originalPrice ? (
                    <div className="space-y-1">
                      <div className="text-lg text-gray-500 line-through">
                        {formatPrice(plan.originalPrice)}
                        {plan.originalPrice > 0 && (
                          <span className="text-muted-foreground ml-1">/{plan.interval}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-green-600">{formatPrice(plan.price)}</span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground">/{plan.interval}</span>
                        )}
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">50% OFF</Badge>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground ml-1">/{plan.interval}</span>
                      )}
                    </div>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button 
          onClick={handleSubscribe} 
          disabled={isLoading} 
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Processing...' : `Subscribe to ${plans.find(p => p.id === selectedPlan)?.name}`}
          {!isLoading && <Zap className="ml-2 h-4 w-4" />}
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          You can cancel or change your subscription at any time.
        </p>
      </div>
    </div>
  );
}