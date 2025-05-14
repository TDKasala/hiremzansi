import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Send, MessageSquare, Check, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useMotivation } from '@/hooks/use-motivation';

export function WhatsAppUpload() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { triggerAchievement } = useMotivation();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'success'>('input');
  
  const validatePhoneNumber = (number: string): boolean => {
    // Basic validation for South African phone numbers
    const saPhoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return saPhoneRegex.test(number.trim());
  };
  
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: t('Invalid Phone Number'),
        description: t('Please enter a valid South African phone number'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number to international format if needed
      let formattedPhone = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedPhone = '+27' + phoneNumber.substring(1);
      }
      
      const response = await apiRequest('POST', '/api/whatsapp-verify-request', {
        phoneNumber: formattedPhone
      });
      
      if (response.ok) {
        setVerificationStep('verify');
        toast({
          title: t('Verification Code Sent'),
          description: t('Please check your WhatsApp for the verification code'),
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification code');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('Could not send verification code. Please try again.');
      toast({
        title: t('Verification Failed'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length < 4) {
      toast({
        title: t('Invalid Code'),
        description: t('Please enter the verification code sent to your phone'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/whatsapp-verify-code', {
        phoneNumber: phoneNumber.startsWith('0') ? '+27' + phoneNumber.substring(1) : phoneNumber,
        code: verificationCode
      });
      
      if (response.ok) {
        setIsVerified(true);
        setVerificationStep('success');
        
        // Trigger achievement for setting up WhatsApp
        triggerAchievement('milestone:whatsapp_setup');
        
        toast({
          title: t('WhatsApp Verified'),
          description: t('You can now upload CVs via WhatsApp'),
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('Could not verify code. Please try again.');
      toast({
        title: t('Verification Failed'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetVerification = () => {
    setVerificationStep('input');
    setIsVerified(false);
    setVerificationCode('');
  };
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          {t('WhatsApp CV Upload')}
        </CardTitle>
        <CardDescription>
          {t('Send your CV via WhatsApp for easy scanning')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {verificationStep === 'input' && (
          <form onSubmit={handleSubmitPhone} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">{t('Your WhatsApp Number')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="whatsapp-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  className="flex-1"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Example: 0712345678 or +27712345678')}
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
                  {t('Sending...')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('Send Verification Code')}
                </>
              )}
            </Button>
          </form>
        )}
        
        {verificationStep === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('Verification Code Sent')}</AlertTitle>
              <AlertDescription>
                {t('We sent a verification code to')} <strong>{phoneNumber}</strong>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">{t('Enter Verification Code')}</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="1234"
                className="text-center text-lg font-medium letter-spacing-wide"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={resetVerification}
                disabled={isLoading}
              >
                {t('Back')}
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading || !verificationCode}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
                    {t('Verifying...')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('Verify')}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
        
        {verificationStep === 'success' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('WhatsApp Verified')}</h3>
              <p className="text-center text-muted-foreground">
                {t('Your WhatsApp number has been successfully verified.')}
              </p>
            </div>
            
            <Alert>
              <Phone className="h-4 w-4" />
              <AlertTitle>{t('Upload Instructions')}</AlertTitle>
              <AlertDescription>
                {t('Send your CV as a PDF or Word document to our WhatsApp number:')} <strong>+27 71 584 3693</strong>
              </AlertDescription>
            </Alert>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={resetVerification}
            >
              {t('Change WhatsApp Number')}
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-primary/5 flex flex-col space-y-2 text-sm text-muted-foreground">
        <p className="text-xs">{t('By registering, you agree to receive occasional job-related notifications via WhatsApp.')}</p>
      </CardFooter>
    </Card>
  );
}