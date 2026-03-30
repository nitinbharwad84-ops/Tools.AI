import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"Nexus AI" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Verification Code: ${otp}`,
    text: `Your verification code for Nexus AI is: ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.025em;">NEXUS AI</h1>
        </div>
        
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700; text-align: center;">Verify your email</h2>
          <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5; color: #64748b; text-align: center;">
            Please use the following verification code to complete your registration. This code will expire in 10 minutes.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          
          <p style="margin-bottom: 0; font-size: 14px; line-height: 1.5; color: #94a3b8; text-align: center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 Nexus AI Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
