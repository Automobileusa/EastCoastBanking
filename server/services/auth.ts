import { storage } from "../storage";

class AuthService {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyOTP(userId: number, code: string, purpose: string): Promise<boolean> {
    try {
      const otpRecord = await storage.getValidOtpCode(userId, code, purpose);
      if (!otpRecord) {
        return false;
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(otpRecord.id);
      return true;
    } catch (error) {
      console.error("OTP verification error:", error);
      return false;
    }
  }

  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const authService = new AuthService();
