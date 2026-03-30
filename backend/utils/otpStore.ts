interface OtpEntry {
  email: string;
  otp: string;
  expiresAt: number;
  lastSentAt: number;
}

const store = new Map<string, OtpEntry>();

export const otpStore = {
  get: (email: string) => store.get(email),
  set: (email: string, entry: OtpEntry) => store.set(email, entry),
  delete: (email: string) => store.delete(email),
  generateOtp: () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
  },
};
