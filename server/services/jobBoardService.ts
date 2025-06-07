// Job board services have been removed
// This platform now focuses exclusively on CV optimization and analysis

export class JobBoardService {
  static getInstance() {
    return new JobBoardService();
  }

  async searchJobs() {
    return [];
  }

  async getJobDetails() {
    return null;
  }
}

export const jobBoardService = JobBoardService.getInstance();