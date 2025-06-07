// Matching payment services have been removed
// This platform now focuses exclusively on CV optimization and analysis

export class MatchingPaymentService {
  static getInstance() {
    return new MatchingPaymentService();
  }

  async processPayment() {
    return null;
  }

  async refundPayment() {
    return null;
  }
}

export const matchingPaymentService = MatchingPaymentService.getInstance();