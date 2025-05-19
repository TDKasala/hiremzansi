import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface EmailPreferenceProps {
  initialValue?: boolean;
}

const EmailPreferences: React.FC<EmailPreferenceProps> = ({ initialValue = true }) => {
  const { user } = useAuth();
  const [receiveEmailDigest, setReceiveEmailDigest] = useState(
    user?.receiveEmailDigest !== undefined ? user.receiveEmailDigest : initialValue
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEmailPreferencesMutation = useMutation({
    mutationFn: async (value: boolean) => {
      const res = await apiRequest('POST', '/api/email-preferences', { receiveEmailDigest: value });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Preferences Updated',
        description: data.message || 'Your email preferences have been updated successfully',
        variant: 'default',
      });
      
      // Update the user data in the cache
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update preferences',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      // Reset switch to previous state
      setReceiveEmailDigest(!receiveEmailDigest);
    },
  });

  const handleToggleEmailDigest = () => {
    const newValue = !receiveEmailDigest;
    setReceiveEmailDigest(newValue);
    updateEmailPreferencesMutation.mutate(newValue);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">Email Preferences</CardTitle>
        <CardDescription>
          Manage how you receive communications from ATSBoost
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Career Recommendation Digest</h3>
            <p className="text-sm text-gray-500">
              Receive personalized career recommendations, job matches, and skill development tips based on your CV
            </p>
          </div>
          <Switch 
            checked={receiveEmailDigest}
            onCheckedChange={handleToggleEmailDigest}
            disabled={updateEmailPreferencesMutation.isPending}
          />
        </div>

        {updateEmailPreferencesMutation.isPending && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-2 text-sm text-gray-500">Updating preferences...</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50 px-6 py-3 text-xs text-gray-500 rounded-b-lg">
        <p>
          We respect your privacy and you can change these preferences at any time.
          For more information, see our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmailPreferences;