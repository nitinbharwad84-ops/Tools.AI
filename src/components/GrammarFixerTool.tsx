import React, { useState } from "react";
import { motion } from "motion/react";
import { Type, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { fixGrammar, WritingStyle, Dialect } from "../services/geminiService";
import { cn } from "../lib/utils";
import { saveGenerationHistory } from "../services/historyService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const GrammarFixerTool: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [fixed, setFixed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<WritingStyle>("formal");
  const [dialect, setDialect] = useState<Dialect>("US");

  const handleFix = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!input.trim()) {
      setError("Please enter some text to fix.");
      return;
    }

    setLoading(true);
    setError("");
    setFixed("");

    try {
      const result = await fixGrammar(input, style, dialect, profile?.gemini_api_key);
      setFixed(result);
      
      if (user) {
        await saveGenerationHistory(
          user.id,
          "grammar-fixer",
          input,
          null,
          { style, dialect },
          result,
          "text"
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fix grammar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fixed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">AI Grammar & Style Fixer</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Perfect your writing with instant grammar corrections, spelling fixes, and style enhancements tailored to your audience.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white">
              <Type className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Refine Your Text</h2>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400">
            Paste your text below. We'll fix grammar, spelling, and flow while keeping your original meaning.
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-64 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 text-lg focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all dark:text-white"
          />

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Writing Style</label>
              <div className="flex flex-wrap gap-2">
                {(["formal", "casual", "academic", "creative"] as WritingStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                      style === s
                        ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-rose-500/50"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">English Dialect</label>
              <div className="flex gap-2">
                {(["US", "UK"] as Dialect[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDialect(d)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                      dialect === d
                        ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-rose-500/50"
                    )}
                  >
                    {d === "US" ? "American" : "British"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full py-5 bg-rose-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Fixing...
              </>
            ) : (
              "Fix Grammar"
            )}
          </button>
        </div>
      </div>

      {fixed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Fixed Version</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-500"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed text-base">
            {fixed}
          </div>
        </motion.div>
      )}
    </div>
  );
};
