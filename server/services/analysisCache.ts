import { AnalysisReport } from '@shared/schema';

// Simple in-memory cache for analysis results
// Key is CV id, value is the analysis report
type CacheEntry = {
  report: AnalysisReport;
  timestamp: number;
  contentHash: string; // Used to detect if CV content has changed
};

class AnalysisCache {
  private cache: Map<number, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Generate a simple hash for CV content to detect changes
  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  // Get cached analysis if available and not expired
  public get(cvId: number, content: string): AnalysisReport | null {
    const cached = this.cache.get(cvId);
    
    if (!cached) {
      return null;
    }

    // Check if cache has expired
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(cvId);
      return null;
    }

    // Check if content has changed
    const currentHash = this.generateContentHash(content);
    if (currentHash !== cached.contentHash) {
      this.cache.delete(cvId);
      return null;
    }

    return cached.report;
  }

  // Store analysis in cache
  public set(cvId: number, content: string, report: AnalysisReport): void {
    this.cache.set(cvId, {
      report,
      timestamp: Date.now(),
      contentHash: this.generateContentHash(content)
    });
  }

  // Clear cache entries older than TTL
  public cleanup(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL_MS) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  // Get cache size
  public size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const analysisCache = new AnalysisCache();