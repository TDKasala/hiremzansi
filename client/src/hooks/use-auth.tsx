import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Login data type
type LoginData = {
  username: string;
  password: string;
};

// Registration schema with validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Registration data type
type RegisterData = z.infer<typeof registerSchema>;

// Auth context type
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // Get the stored session cookie
        const sessionCookie = localStorage.getItem('session_active');
        console.log("Checking authentication status...", sessionCookie ? "Session token found" : "No session token");
        
        const res = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log("User not authenticated");
            localStorage.removeItem('session_active');
            return null;
          }
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        // User is authenticated
        console.log("User authenticated successfully");
        localStorage.setItem('session_active', 'true');
        return await res.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem('session_active');
          return null;
        }
        throw error;
      }
    },
    refetchInterval: 300000, // Refresh auth status every 5 minutes
    staleTime: 60000 // Consider data stale after 1 minute
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Use the browser fetch API directly with proper credentials
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      
      return await response.json();
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, storing session");
      // Mark session as active in localStorage
      localStorage.setItem('session_active', 'true');
      
      // Set the user data in the query cache
      queryClient.setQueryData(["/api/user"], user);
      
      // Immediately verify the session worked
      refetchUser();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name || user.username}!`,
      });
      
      // Force a page reload to ensure session is properly established
      window.location.href = '/dashboard';
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = credentials;
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}