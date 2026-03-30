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
    if (value.length > 1) {
      // Handle paste or multi-character input
      const pastedData = value.slice(0, 8).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 8 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 7);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return;
    
    const digits = data.slice(0, 8).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 8) newOtp[i] = digit;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(digits.length, 7)]?.focus();
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
      setOtp(Array(8).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Verify Identity</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We've sent a secure code to <br />
          <span className="font-semibold text-primary dark:text-primary-light">{email}</span>
        </p>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-medium"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6 mb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1 sm:gap-3">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onPaste={handlePaste}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-8 h-12 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white shadow-sm"
              />
            ))}
            <div className="w-1.5 sm:w-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-0.5 sm:mx-1" />
            {[4, 5, 6, 7].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onPaste={handlePaste}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-8 h-12 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all dark:text-white shadow-sm"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 8}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify & Continue"
          )}
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={isActive}
            className={`font-bold transition-colors ${
              isActive ? "text-slate-400 cursor-not-allowed" : "text-primary hover:text-primary/80"
            }`}
          >
            {isActive ? `Resend in ${seconds}s` : "Resend Now"}
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
          Secure Verification by Nexus AI
        </p>
      </div>
    </motion.div>
  );
};
