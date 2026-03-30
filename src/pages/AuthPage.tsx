import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { SignUpForm } from "../components/auth/SignUpForm";
import { SignInForm } from "../components/auth/SignInForm";
import { OtpForm } from "../components/auth/OtpForm";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<"signin" | "signup" | "otp">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleSignUpSuccess = (e: string, p: string, f: string) => {
    setEmail(e);
    setPassword(p);
    setFullName(f);
    setView("otp");
  };

  const handleSignInSuccess = () => {
    navigate("/");
  };

  const handleOtpSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <AnimatePresence mode="wait">
        {view === "signin" && (
          <SignInForm
            key="signin"
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setView("signup")}
          />
        )}
        {view === "signup" && (
          <SignUpForm
            key="signup"
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={() => setView("signin")}
          />
        )}
        {view === "otp" && (
          <OtpForm
            key="otp"
            email={email}
            password={password}
            fullName={fullName}
            onSuccess={handleOtpSuccess}
            onBack={() => setView("signup")}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
