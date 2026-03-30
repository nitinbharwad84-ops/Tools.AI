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
    from: `"AI Platform" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "Your Verification Code",
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
