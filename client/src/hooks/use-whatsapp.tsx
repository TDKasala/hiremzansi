import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumber?: string;
  verified?: boolean;
}

export function useWhatsApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WhatsApp settings
  const { 
    data: settings, 
    isLoading,
    error 
  } = useQuery<WhatsAppSettings>({
    queryKey: ["/api/whatsapp-settings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/whatsapp-settings");
        return await res.json();
      } catch (error) {
        // Default settings if API fails
        return { enabled: false };
      }
    }
  });

  // Update WhatsApp settings
  const { mutate: updateSettings, isPending: isPendingUpdate } = useMutation({
    mutationFn: async (updatedSettings: WhatsAppSettings) => {
      const res = await apiRequest("POST", "/api/whatsapp-settings", updatedSettings);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/whatsapp-settings"], data);
      toast({
        title: "Settings updated",
        description: "Your WhatsApp notification settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update WhatsApp settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send verification code
  const { mutate: sendVerification, isPending: isVerifying } = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/whatsapp/verify", { phoneNumber });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification sent",
        description: "Please check your WhatsApp for a verification code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to send verification. Please check your number and try again.",
        variant: "destructive",
      });
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    isPendingUpdate,
    sendVerification,
    isVerifying
  };
}