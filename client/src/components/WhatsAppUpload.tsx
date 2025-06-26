import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Check, ArrowRight, Smartphone, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const WhatsAppUpload: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'success'>('input');
  const [isLoading, setIsLoading] = useState(false);

  // Format the phone number to South African format
  const formatPhoneNumber = (number: string) => {
    // Remove non-digit characters
    let digitsOnly = number.replace(/\D/g, '');
    
    // Add country code if it's missing (assuming South African number)
    if (digitsOnly.startsWith('0')) {
      digitsOnly = `27${digitsOnly.substring(1)}`;
    } else if (!digitsOnly.startsWith('27') && !digitsOnly.startsWith('+27')) {
      digitsOnly = `27${digitsOnly}`;
    } else if (digitsOnly.startsWith('+')) {
      digitsOnly = digitsOnly.substring(1);
    }
    
    return digitsOnly;
  };

  const handleSendVerification = async () => {
    if (!whatsappNumber) {
      toast({
        title: t('Error'),
        description: t('Please enter your WhatsApp number'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedNumber = formatPhoneNumber(whatsappNumber);
      
      const response = await apiRequest('POST', '/api/whatsapp/verify', {
        phoneNumber: formattedNumber
      });
      
      if (response.ok) {
        setVerificationStep('verify');
        toast({
          title: t('Success'),
          description: t('Verification code sent to your WhatsApp'),
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || t('Failed to send verification code'));
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: (error as Error).message || t('Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: t('Error'),
        description: t('Please enter the verification code'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedNumber = formatPhoneNumber(whatsappNumber);
      
      const response = await apiRequest('POST', '/api/whatsapp/confirm', {
        code: verificationCode,
        phoneNumber: formattedNumber
      });
      
      if (response.ok) {
        setVerificationStep('success');
        toast({
          title: t('Success'),
          description: t('Your WhatsApp number has been verified'),
        });
        
        // Send upload instructions
        await apiRequest('POST', '/api/whatsapp/send-instructions', {
          phoneNumber: formattedNumber
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || t('Invalid verification code'));
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: (error as Error).message || t('Something went wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetVerification = () => {
    setVerificationStep('input');
    setVerificationCode('');
  };

  return (
    <div className="space-y-6">
      

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">
            {t('Get Started')}
          </CardTitle>
          <CardDescription>
            {t('Enter your WhatsApp number to receive upload instructions')}
          </CardDescription>
        </CardHeader>
      
        <CardContent className="space-y-4">
          {verificationStep === 'input' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('Enter Your WhatsApp Number')}</h3>
                <p className="text-center text-muted-foreground">
                  {t('We\'ll send you a verification code on WhatsApp')}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {t('WhatsApp Number')} (South African format)
                </label>
                <Input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 071 234 5678"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {t('Enter your number in South African format (e.g. 071 234 5678)')}
                </p>
              </div>
              
              <Button 
                onClick={handleSendVerification}
                disabled={isLoading || !whatsappNumber}
                className="w-full"
              >
                {isLoading ? t('Sending...') : t('Send Verification Code')}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {verificationStep === 'verify' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="font-bold text-xl text-primary">6</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('Enter Verification Code')}</h3>
                <p className="text-center text-muted-foreground">
                  {t('We\'ve sent a 6-digit code to your WhatsApp')}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {t('Verification Code')}
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-widest"
                />
              </div>
              
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full"
              >
                {isLoading ? t('Verifying...') : t('Verify Code')}
                {!isLoading && <Check className="ml-2 h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetVerification}
                className="w-full"
              >
                {t('Change WhatsApp Number')}
              </Button>
            </div>
          )}
          
          {verificationStep === 'success' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-700">{t('Success!')}</h3>
                <p className="text-center text-muted-foreground">
                  {t('Upload instructions have been sent to your WhatsApp')}
                </p>
              </div>
              
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertTitle>{t('Next Steps')}</AlertTitle>
                <AlertDescription>
                  {t('Check your WhatsApp for a message with CV upload instructions. Simply reply to the message with your CV file to get instant analysis.')}
                </AlertDescription>
              </Alert>
              
              <Button 
                variant="outline" 
                onClick={resetVerification}
                className="w-full"
              >
                {t('Change WhatsApp Number')}
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-primary/5 p-4 sm:p-6 flex flex-col space-y-2 text-xs sm:text-sm text-muted-foreground">
          <p className="text-xs">{t('By registering, you agree to receive occasional job-related notifications via WhatsApp.')}</p>
          <p className="text-xs">{t('Standard messaging rates may apply. You can opt out at any time.')}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhatsAppUpload;