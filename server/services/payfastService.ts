/**
 * PayFast Payment Gateway Integration for Hire Mzansi
 * 
 * This service handles payments and subscriptions through the South African 
 * payment processor PayFast.
 */
import crypto from 'crypto';
import { URL } from 'url';

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  testMode: boolean;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PaymentRequest {
  merchantReference: string;
  amount: number; // in ZAR (e.g., 30.00)
  itemName: string;
  itemDescription: string;
  firstName?: string;
  lastName?: string;
  email: string;
  paymentMethod?: string;
  subscription?: boolean;
  frequency?: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  cycles?: number; 
}

export class PayfastService {
  private config: PayfastConfig;
  private readonly API_BASE_URL = 'https://www.payfast.co.za';
  private readonly SANDBOX_URL = 'https://sandbox.payfast.co.za';
  
  constructor() {
    this.config = {
      merchantId: process.env.PAYFAST_MERCHANT_ID || '',
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
      passphrase: process.env.PAYFAST_PASSPHRASE,
      testMode: process.env.NODE_ENV !== 'production',
      returnUrl: process.env.APP_URL ? `${process.env.APP_URL}/payment/success` : 'https://atsboost.co.za/payment/success',
      cancelUrl: process.env.APP_URL ? `${process.env.APP_URL}/payment/cancel` : 'https://atsboost.co.za/payment/cancel',
      notifyUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/payfast-notify` : 'https://atsboost.co.za/api/payfast-notify'
    };
    
    // Validate configuration
    if (!this.config.merchantId || !this.config.merchantKey) {
      console.warn('PayFast integration is not fully configured - payments will be disabled');
    }
  }
  
  /**
   * Create a PayFast payment form URL for a one-time payment
   */
  public createPaymentUrl(paymentRequest: PaymentRequest): string {
    const formFields = this.buildPaymentFormFields(paymentRequest);
    const baseUrl = this.config.testMode ? this.SANDBOX_URL : this.API_BASE_URL;
    const url = new URL('/eng/process', baseUrl);
    
    // Add parameters to URL
    Object.entries(formFields).forEach(([key, value]) => {
      url.searchParams.append(key, value as string);
    });
    
    return url.toString();
  }
  
  /**
   * Create a PayFast payment form URL for a subscription
   */
  public createSubscriptionUrl(paymentRequest: PaymentRequest): string {
    // Ensure this is a subscription request
    const subscriptionRequest = {
      ...paymentRequest,
      subscription: true,
      frequency: paymentRequest.frequency || 'monthly',
      // Auto-billing cycles (0 = indefinite)
      cycles: paymentRequest.cycles || 0
    };
    
    return this.createPaymentUrl(subscriptionRequest);
  }
  
  /**
   * Verify a PayFast payment notification (ITN)
   */
  public async verifyPaymentNotification(
    requestBody: Record<string, string>, 
    signature: string
  ): Promise<boolean> {
    // Step 1: Verify signature
    if (!this.verifySignature(requestBody, signature)) {
      return false;
    }
    
    // Step 2: Verify data hasn't been tampered with
    const validData = await this.validatePaymentData(requestBody);
    if (!validData) {
      return false;
    }
    
    // Step 3: Check payment status
    return requestBody.payment_status === 'COMPLETE';
  }
  
  /**
   * Build the form fields required for a PayFast payment
   */
  private buildPaymentFormFields(paymentRequest: PaymentRequest): Record<string, string | number> {
    // Format amount to 2 decimal places
    const amount = Number(paymentRequest.amount).toFixed(2);
    
    const formFields: Record<string, string | number> = {
      // Merchant details
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      
      // Payment details
      m_payment_id: paymentRequest.merchantReference,
      amount,
      item_name: paymentRequest.itemName,
      item_description: paymentRequest.itemDescription || '',
      email_address: paymentRequest.email,
      
      // Test mode
      ...(this.config.testMode && { test_mode: 1 })
    };
    
    // Optional fields
    if (paymentRequest.firstName) {
      formFields.first_name = paymentRequest.firstName;
    }
    
    if (paymentRequest.lastName) {
      formFields.last_name = paymentRequest.lastName;
    }
    
    // Subscription fields
    if (paymentRequest.subscription) {
      formFields.subscription_type = 1;
      formFields.billing_date = new Date().getDate(); // Bill same day each month
      formFields.recurring_amount = amount;
      formFields.frequency = this.mapFrequency(paymentRequest.frequency || 'monthly');
      formFields.cycles = paymentRequest.cycles || 0;
    }
    
    // Add signature
    formFields.signature = this.generateSignature(formFields);
    
    return formFields;
  }
  
  /**
   * Generate a signature for the payment form fields
   */
  private generateSignature(data: Record<string, string | number>): string {
    // Sort alphabetically
    const orderedData: Record<string, string | number> = {};
    Object.keys(data).sort().forEach(key => {
      orderedData[key] = data[key];
    });
    
    // Convert to query string (excluding signature field)
    const queryString = Object.entries(orderedData)
      .filter(([key]) => key !== 'signature')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    // Create signature using MD5
    let signature = crypto.createHash('md5').update(queryString).digest('hex');
    
    // If passphrase is set, create signature using passphrase
    if (this.config.passphrase) {
      signature = crypto
        .createHash('md5')
        .update(`${queryString}&passphrase=${encodeURIComponent(this.config.passphrase)}`)
        .digest('hex');
    }
    
    return signature;
  }
  
  /**
   * Verify a signature from a PayFast notification
   */
  private verifySignature(data: Record<string, string>, signature: string): boolean {
    const calculatedSignature = this.generateSignature(data);
    return calculatedSignature === signature;
  }
  
  /**
   * Validate payment data by sending it back to PayFast for verification
   */
  private async validatePaymentData(data: Record<string, string>): Promise<boolean> {
    try {
      const baseUrl = this.config.testMode ? this.SANDBOX_URL : this.API_BASE_URL;
      const validateUrl = `${baseUrl}/eng/query/validate`;
      
      const params = new URLSearchParams(data);
      
      const response = await fetch(validateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Hire Mzansi/1.0'
        },
        body: params.toString()
      });
      
      const responseText = await response.text();
      return responseText.trim() === 'VALID';
    } catch (error) {
      console.error('Error validating PayFast payment data', error);
      return false;
    }
  }
  
  /**
   * Map frequency string to PayFast frequency value
   */
  private mapFrequency(frequency: string): number {
    switch (frequency) {
      case 'monthly': return 3;
      case 'quarterly': return 4;
      case 'biannual': return 5;
      case 'annual': return 6;
      default: return 3; // Default to monthly
    }
  }
}

// Export singleton instance
export const payfastService = new PayfastService();