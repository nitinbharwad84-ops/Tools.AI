import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { pacifyEmail, EmailTone, ContentLength } from "../services/geminiService";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";

export const EmailPacifierTool: React.FC = () => {
  const [input, setInput] = useState("");
  const [pacified, setPacified] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<EmailTone>("polite");
  const [length, setLength] = useState<ContentLength>("medium");

  const handlePacify = async () => {
    if (!input.trim()) {
      setError("Please enter the angry email text.");
      return;
    }

    setLoading(true);
    setError("");
    setPacified("");

    try {
      const result = await pacifyEmail(input, tone, length);
      setPacified(result);
    } catch (err: any) {
      setError(err.message || "Failed to pacify email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pacified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Email Pacifier</h3>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400">
            Paste that angry or passive-aggressive email below. We'll rewrite it to be perfectly professional.
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the rude email here..."
            className="w-full h-64 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 text-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all dark:text-white"
          />

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Desired Tone</label>
              <div className="flex flex-wrap gap-2">
                {(["polite", "assertive", "friendly", "formal"] as EmailTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                      tone === t
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-emerald-500/50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Length</label>
              <div className="flex gap-2">
                {(["short", "medium", "long"] as ContentLength[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                      length === l
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-emerald-500/50"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handlePacify}
            disabled={loading}
            className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Polishing...
              </>
            ) : (
              "Pacify Email"
            )}
          </button>
        </div>
      </div>

      {pacified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Polished Version</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-500"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            <Markdown>{pacified}</Markdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};
