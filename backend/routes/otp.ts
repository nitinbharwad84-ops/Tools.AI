import { Router } from "express";
import { otpStore } from "../utils/otpStore.js";
import { sendOtpEmail } from "../utils/mailer.js";

const router = Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const existing = otpStore.get(email);
  if (existing && Date.now() - existing.lastSentAt < OTP_COOLDOWN_MS) {
    return res.status(429).json({ error: "Please wait before requesting a new OTP." });
  }

  const otp = otpStore.generateOtp();
  otpStore.set(email, {
    email,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    lastSentAt: Date.now(),
  });

  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const entry = otpStore.get(email);
  if (!entry) return res.status(400).json({ error: "No OTP found for this email" });

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (entry.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // OTP is valid
  otpStore.delete(email);
  res.json({ success: true, message: "OTP verified successfully" });
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const existing = otpStore.get(email);
  if (existing && Date.now() - existing.lastSentAt < OTP_COOLDOWN_MS) {
    return res.status(429).json({ error: "Please wait before requesting a new OTP." });
  }

  // Invalidate existing
  otpStore.delete(email);

  const otp = otpStore.generateOtp();
  otpStore.set(email, {
    email,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    lastSentAt: Date.now(),
  });

  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ error: "Failed to resend OTP email" });
  }
});

export default router;
