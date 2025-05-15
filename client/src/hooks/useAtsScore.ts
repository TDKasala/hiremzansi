import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type AtsAnalysis = {
  score: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
};

export function useAtsScore() {
  const [cvId, setCvId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the latest CV ID when the component mounts
  useEffect(() => {
    const fetchLatestCv = async () => {
      try {
        const response = await fetch('/api/latest-cv');
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            setCvId(data.id);
          }
        }
      } catch (error) {
        console.error('Error fetching latest CV:', error);
      }
    };

    fetchLatestCv();
  }, []);

  // Query to fetch ATS score once we have a CV ID
  const {
    data: analysis,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/ats-score', cvId],
    queryFn: async () => {
      if (!cvId) return null;
      
      const response = await fetch(`/api/ats-score/${cvId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ATS score');
      }
      
      return response.json() as Promise<AtsAnalysis>;
    },
    // Don't run the query until we have a CV ID
    enabled: !!cvId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show error toast if request fails
  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while analyzing your CV',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  // Update CV ID for a new file
  const updateCvId = (newCvId: number) => {
    setCvId(newCvId);
    // Invalidate any existing queries for this CV
    queryClient.invalidateQueries({ queryKey: ['/api/ats-score', newCvId] });
  };

  // Function to analyze a CV after upload
  const analyzeCv = async (cvId: number) => {
    try {
      const response = await fetch(`/api/analyze-cv/${cvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze CV');
      }
      
      const data = await response.json();
      
      // Update the query cache with the new results
      queryClient.setQueryData(['/api/ats-score', cvId], data);
      
      // Set the CV ID to trigger the query
      updateCvId(cvId);
      
      return data;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      throw error;
    }
  };

  return {
    score: analysis?.score || null,
    analysis,
    isLoading,
    isError,
    error,
    refetch,
    updateCvId,
    analyzeCv,
  };
}
