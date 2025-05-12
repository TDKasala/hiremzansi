import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumber?: string;
  verified: boolean;
}

interface UpdateWhatsAppSettingsInput {
  enabled: boolean;
  phoneNumber?: string;
}

export function useWhatsApp() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const { 
    data: settings, 
    isLoading,
    error
  } = useQuery<WhatsAppSettings>({
    queryKey: ['/api/whatsapp-settings'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (input: UpdateWhatsAppSettingsInput) => {
      const res = await apiRequest('POST', '/api/whatsapp-settings', input);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-settings'] });
      
      toast({
        title: "Settings updated",
        description: "Your WhatsApp notification settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const sendVerificationMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      setIsVerifying(true);
      const res = await apiRequest('POST', '/api/whatsapp-verify', { phoneNumber });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification sent",
        description: "A verification message has been sent to your WhatsApp number.",
      });
      setIsVerifying(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      setIsVerifying(false);
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutate,
    isPendingUpdate: updateSettingsMutation.isPending,
    sendVerification: sendVerificationMutation.mutate,
    isVerifying: isVerifying || sendVerificationMutation.isPending,
  };
}