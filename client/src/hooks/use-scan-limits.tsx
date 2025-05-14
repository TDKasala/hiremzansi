import { useState } from 'react';
import { ScanLimitReachedModal } from '@/components/ScanLimitReachedModal';

interface ScanInfo {
  scansUsed: number;
  scanLimit: number;
}

interface SubscriptionOption {
  id: string;
  name: string;
  price: number;
  scanLimit: number;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export function useScanLimits() {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [scanInfo, setScanInfo] = useState<ScanInfo>({ scansUsed: 0, scanLimit: 0 });
  const [subscriptionOptions, setSubscriptionOptions] = useState<SubscriptionOption[]>([
    {
      id: 'premium',
      name: 'Premium',
      price: 10000, // ZAR 100.00 in cents
      scanLimit: 50,
      isPopular: true,
    },
    {
      id: 'premium-plus',
      name: 'Premium Plus',
      price: 20000, // ZAR 200.00 in cents
      scanLimit: 100,
      isRecommended: true,
    },
  ]);

  const openLimitModal = (info: ScanInfo, options?: SubscriptionOption[]) => {
    setScanInfo(info);
    if (options && options.length > 0) {
      setSubscriptionOptions(options);
    }
    setIsLimitModalOpen(true);
  };

  const closeLimitModal = () => {
    setIsLimitModalOpen(false);
  };

  type APIResponseResult = 
    | { scanLimitReached: true; data: any }
    | { scanLimitReached: false; response: Response };

  const handleAPIResponse = async (response: Response): Promise<APIResponseResult> => {
    // Check if the response status indicates a scan limit issue (402 Payment Required)
    if (response.status === 402) {
      const data = await response.json();
      
      if (data.scanLimitReached) {
        // Open scan limit modal with data from the API
        openLimitModal(
          data.scanInfo || { scansUsed: 0, scanLimit: 0 },
          data.subscriptionOptions || undefined
        );
        return { scanLimitReached: true, data };
      }
      
      return { scanLimitReached: false, response };
    }
    
    // For other responses, just return the response for normal processing
    return { scanLimitReached: false, response };
  };

  // Component to render the modal
  const ScanLimitModal = () => (
    <ScanLimitReachedModal
      isOpen={isLimitModalOpen}
      onClose={closeLimitModal}
      scanInfo={scanInfo}
      subscriptionOptions={subscriptionOptions}
    />
  );

  return {
    openLimitModal,
    closeLimitModal,
    handleAPIResponse,
    ScanLimitModal,
    isLimitModalOpen,
  };
}