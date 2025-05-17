import { useToast } from "@/hooks/use-toast";

/**
 * Helper functions for showing toast notifications
 */

export const showToast = {
  success: (title: string, description?: string) => {
    const { toast } = useToast();
    toast({
      title,
      description,
      variant: "default",
    });
  },
  
  error: (title: string, description?: string) => {
    const { toast } = useToast();
    toast({
      title,
      description,
      variant: "destructive",
    });
  },
  
  info: (title: string, description?: string) => {
    const { toast } = useToast();
    toast({
      title,
      description,
    });
  }
};