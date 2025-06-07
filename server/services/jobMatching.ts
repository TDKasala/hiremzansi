// Job matching services have been removed
// This platform now focuses exclusively on CV optimization and analysis

export class JobMatchingService {
  static getInstance() {
    return new JobMatchingService();
  }

  async analyzeJobMatch() {
    return null;
  }

  async calculateMatchScore() {
    return 0;
  }
}

export const jobMatchingService = JobMatchingService.getInstance();