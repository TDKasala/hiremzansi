import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useScanLimits } from '@/hooks/use-scan-limits';
import { useTranslation } from 'react-i18next';
import { FileSearch } from 'lucide-react';

interface CVAnalysisButtonProps {
  cvId: number;
  onAnalysisComplete?: (reportId: number) => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
  text?: string;
}

export function CVAnalysisButton({ 
  cvId, 
  onAnalysisComplete, 
  variant = 'default',
  size = 'default',
  fullWidth = false,
  text = 'Deep Analyze'
}: CVAnalysisButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { ScanLimitModal, handleAPIResponse } = useScanLimits();

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/deep-analysis', { cvId });
      
      // Check if scan limit was reached
      const result = await handleAPIResponse(response);
      
      if (result.scanLimitReached) {
        // The modal will be shown by the hook
        setIsLoading(false);
        return;
      }
      
      // If not scan limited, process the response normally
      const responseData = result.response ? await result.response.json() : result.data;
      
      toast({
        title: t('Analysis Started'),
        description: t('Your CV is being analyzed. This may take a moment.'),
      });
      
      if (responseData && responseData.id && onAnalysisComplete) {
        onAnalysisComplete(responseData.id);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: t('Analysis Failed'),
        description: t('There was a problem analyzing your CV. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAnalyze}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={fullWidth ? 'w-full' : ''}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('Analyzing...')}
          </span>
        ) : (
          <span className="flex items-center">
            <FileSearch className="mr-2 h-4 w-4" />
            {t(text)}
          </span>
        )}
      </Button>
      
      {/* Render the scan limit modal */}
      <ScanLimitModal />
    </>
  );
}