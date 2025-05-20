/**
 * Optimized Data Loader for Mobile-First Performance
 * 
 * This service provides optimized data loading and caching strategies
 * to ensure fast performance (<2s load on 3G) and minimal page sizes (<500KB/page)
 */

import { queryClient, apiRequest } from '@/lib/queryClient';

/**
 * Analysis data structure optimized for mobile
 */
interface OptimizedAnalysisResult {
  score: number;
  rating: string;
  skillsScore: number;
  formatScore: number;
  contextScore: number;
  strengths: string[]; // Limited to top 3
  improvements: string[]; // Limited to top 3
  skills: string[]; // Limited to essential skills
  saKeywordsFound: string[]; // South African context keywords
}

/**
 * Optimized data prefetcher
 * 
 * Prefetches critical data in the background to make it available
 * immediately when needed
 */
export async function prefetchAnalysisData(cvId: number): Promise<void> {
  // Only prefetch if not already in cache
  if (!queryClient.getQueryData([`/api/ats-score/${cvId}`])) {
    try {
      await queryClient.prefetchQuery({
        queryKey: [`/api/ats-score/${cvId}`],
        queryFn: async () => {
          const response = await apiRequest('GET', `/api/ats-score/${cvId}`);
          if (!response.ok) throw new Error('Failed to fetch analysis');
          const data = await response.json();
          return optimizeResponseSize(data);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    } catch (error) {
      console.warn('Background prefetch failed:', error);
      // Non-blocking - we'll retry when actually needed
    }
  }
}

/**
 * Optimized CV analysis fetcher
 * 
 * Fetches CV analysis data with progressive loading and compression
 * for mobile-first performance
 * 
 * @param cvId CV ID to analyze
 * @returns Promise with optimized analysis result
 */
export async function loadCVAnalysis(cvId: number): Promise<OptimizedAnalysisResult> {
  try {
    // Try to get from cache first
    const cachedData = queryClient.getQueryData([`/api/ats-score/${cvId}`]);
    if (cachedData) {
      return cachedData as OptimizedAnalysisResult;
    }
    
    // If not in cache, fetch with optimizations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      const response = await apiRequest('GET', `/api/ats-score/${cvId}`, undefined, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'X-Optimize-Response': 'true' // Signal to backend we want optimized response
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch analysis');
      
      const data = await response.json();
      const optimizedData = optimizeResponseSize(data);
      
      // Cache the optimized result
      queryClient.setQueryData([`/api/ats-score/${cvId}`], optimizedData);
      
      return optimizedData;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error loading CV analysis:', error);
    throw error;
  }
}

/**
 * Optimize server response size by trimming unnecessary data
 * 
 * @param data Raw analysis data
 * @returns Optimized data structure
 */
function optimizeResponseSize(data: any): OptimizedAnalysisResult {
  return {
    score: data.score || 0,
    rating: data.rating || 'Not Rated',
    skillsScore: data.skillsScore || 0,
    formatScore: data.formatScore || 0,
    contextScore: data.contextScore || 0,
    strengths: (data.strengths || []).slice(0, 3), // Limit to top 3 strengths
    improvements: (data.improvements || []).slice(0, 3), // Limit to top 3 improvements
    skills: (data.skills || []).slice(0, 10), // Limit to top 10 skills
    saKeywordsFound: (data.saKeywordsFound || []).slice(0, 15) // Limit to 15 SA keywords
  };
}

/**
 * Progressive load CV analysis data in batches
 * 
 * For very detailed reports, load data in stages to improve perceived performance
 * 
 * @param cvId CV ID to analyze
 * @param onProgressUpdate Progress update callback
 * @returns Promise resolving when all data is loaded
 */
export async function progressiveLoadAnalysis(
  cvId: number,
  onProgressUpdate: (progress: number, data: Partial<OptimizedAnalysisResult>) => void
): Promise<OptimizedAnalysisResult> {
  // Start with basic score data (fastest to load)
  onProgressUpdate(20, { score: 0, rating: 'Loading...' });
  
  try {
    // First load core data
    const basicData = await apiRequest('GET', `/api/ats-score/${cvId}/basic`);
    const basicResult = await basicData.json();
    onProgressUpdate(50, {
      score: basicResult.score,
      rating: basicResult.rating,
      skillsScore: basicResult.skillsScore,
      formatScore: basicResult.formatScore,
      contextScore: basicResult.contextScore
    });
    
    // Then load detailed data
    const detailedData = await apiRequest('GET', `/api/ats-score/${cvId}/details`);
    const detailsResult = await detailedData.json();
    onProgressUpdate(80, {
      strengths: detailsResult.strengths?.slice(0, 3),
      improvements: detailsResult.improvements?.slice(0, 3)
    });
    
    // Finally load remaining data
    const fullData = await apiRequest('GET', `/api/ats-score/${cvId}`);
    const fullResult = await fullData.json();
    const optimizedResult = optimizeResponseSize(fullResult);
    
    onProgressUpdate(100, optimizedResult);
    return optimizedResult;
  } catch (error) {
    // Fall back to single request if progressive loading fails
    console.warn('Progressive loading failed, falling back to single request');
    return loadCVAnalysis(cvId);
  }
}

/**
 * Submit CV for optimized analysis
 * 
 * @param cvId CV ID to analyze
 * @param options Analysis options
 * @returns Promise with analysis result
 */
export async function submitForAnalysis(
  cvId: number,
  options?: { jobDescription?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = options || {};
    const response = await apiRequest('POST', `/api/analyze-cv/${cvId}`, payload);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Analysis failed');
    }
    
    const result = await response.json();
    
    // Invalidate the query to force a refresh
    queryClient.invalidateQueries({ queryKey: [`/api/ats-score/${cvId}`] });
    
    return { 
      success: true, 
      message: 'CV analyzed successfully' 
    };
  } catch (error: any) {
    console.error('Analysis submission error:', error);
    return { 
      success: false, 
      message: error.message || 'Analysis submission failed' 
    };
  }
}

// Export optimized data service
export default {
  loadCVAnalysis,
  prefetchAnalysisData,
  progressiveLoadAnalysis,
  submitForAnalysis
};