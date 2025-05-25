import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../shared/supabase';

export function useAuth() {
  const authContext = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  if (authContext === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Create a logout mutation using TanStack Query
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await supabase.auth.signOut();
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
  
  return {
    ...authContext,
    logoutMutation
  };
}