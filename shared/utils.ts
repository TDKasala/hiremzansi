/**
 * Generate a unique referral code for a user
 * @param userId The user's ID
 * @returns A unique referral code
 */
export function generateReferralCode(userId: number): string {
  const timestamp = Date.now().toString(36);
  const userIdBase36 = userId.toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  
  return `REF${userIdBase36}${timestamp}${random}`.toUpperCase();
}

/**
 * Validate if a string is a valid referral code format
 * @param code The referral code to validate
 * @returns True if valid format
 */
export function isValidReferralCode(code: string): boolean {
  return /^REF[A-Z0-9]{8,20}$/.test(code);
}

/**
 * Generate a random string for various purposes
 * @param length The length of the random string
 * @returns A random alphanumeric string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}