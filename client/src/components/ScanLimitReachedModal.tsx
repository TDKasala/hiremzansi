import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionOption {
  id: string;
  name: string;
  price: number;
  scanLimit: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface ScanLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanInfo: {
    scansUsed: number;
    scanLimit: number;
  };
  subscriptionOptions: SubscriptionOption[];
}

export function ScanLimitReachedModal({
  isOpen,
  onClose,
  scanInfo,
  subscriptionOptions,
}: ScanLimitReachedModalProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(
    subscriptionOptions.find(option => option.isPopular)?.id || subscriptionOptions[0]?.id || null
  );

  const handleUpgrade = () => {
    // Close the modal
    onClose();
    // Navigate to subscription page with selected plan
    setLocation(`/subscription?plan=${selectedOption}`);
  };

  const formatPrice = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t('Monthly Scan Limit Reached')}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t('You have used')} <span className="font-bold">{scanInfo.scansUsed}</span> {t('of your')} <span className="font-bold">{scanInfo.scanLimit}</span> {t('monthly scans')}. 
            {t('Upgrade your subscription to continue analyzing CVs.')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-medium mb-4">{t('Subscription Options:')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {subscriptionOptions.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all ${
                  selectedOption === option.id 
                    ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">{option.scanLimit} scans / month</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold">{formatPrice(option.price)}</span>
                      {option.isPopular && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full mt-1">
                          Most Popular
                        </span>
                      )}
                      {option.isRecommended && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full mt-1">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {option.isRecommended 
                        ? t('Premium features + more scans') 
                        : option.isPopular 
                          ? t('Most popular choice')
                          : t('Basic plan')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('Maybe Later')}
          </Button>
          <Button onClick={handleUpgrade} disabled={!selectedOption}>
            {t('Upgrade Now')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}