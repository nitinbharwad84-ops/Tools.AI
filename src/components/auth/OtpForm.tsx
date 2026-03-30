import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";
import { supabase } from "../../services/supabaseClient";

interface OtpFormProps {
  email: string;
  password?: string;
  fullName?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ email, password, fullName, onSuccess, onBack }) => {
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { seconds, isActive, start, reset } = useCountdown(60);

  useEffect(() => {
    start();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 8) {
      setError("Please enter all 8 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to verify OTP");

      // OTP verified, create user in Supabase
      if (password && fullName) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Note: Supabase trigger or manual insert needed for profile
        // Assuming we do manual insert here if trigger isn't set
        if (data.user) {
          const { error: profileError } = await (supabase.from("profiles") as any).insert({
            user_id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isActive) return;
    
    setError("");
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to resend OTP");

      reset();
      start();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800"
    >
      <button onClick={onBack} className="mb-6 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">Verify Email</h2>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
        We sent an 8-digit code to <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
      </p>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="flex justify-between gap-2 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || otp.join("").length !== 8}
        className="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70 mb-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
      </button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={isActive}
          className={`text-sm font-medium transition-colors ${
            isActive ? "text-slate-400 cursor-not-allowed" : "text-primary hover:underline"
          }`}
        >
          {isActive ? `Resend OTP (${seconds}s)` : "Resend OTP"}
        </button>
      </div>
    </motion.div>
  );
};
