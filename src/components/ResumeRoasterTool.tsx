import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { FileText, Type, Loader2, AlertCircle, Copy, Check, Flame } from "lucide-react";
import { roastResume, RoastIntensity } from "../services/geminiService";
import { useDropzone } from "react-dropzone";
import { parseFile } from "../lib/fileParser";
import { cn } from "../lib/utils";
import { saveGenerationHistory } from "../services/historyService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const ResumeRoasterTool: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "file">("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [intensity, setIntensity] = useState<RoastIntensity>("spicy");

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    multiple: false
  });

  const handleRoast = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    setError("");
    setRoast("");

    try {
      let contentToRoast = "";

      if (mode === "text") {
        if (!input.trim()) throw new Error("Please enter your resume text to roast.");
        contentToRoast = input;
      } else if (mode === "file") {
        if (!file) throw new Error("Please upload your resume file.");
        
        try {
          contentToRoast = await parseFile(file);
        } catch (err: any) {
          throw new Error(`Failed to parse file: ${err.message}`);
        }
      }

      const result = await roastResume(contentToRoast, intensity, profile?.gemini_api_key);
      setRoast(result);
      
      if (user) {
        await saveGenerationHistory(
          user.id,
          "resume-roaster",
          mode === "text" ? input : file?.name || "File upload",
          null,
          { intensity, mode },
          result,
          "text"
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to roast resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roast);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Helmet>
        <title>Resume Roaster | Nexus AI</title>
        <meta name="description" content="Get honest, brutal feedback on your resume with Nexus AI's Resume Roaster. Improve your job prospects with AI-driven critique." />
      </Helmet>
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "text", icon: Type, label: "Text" },
            { id: "file", icon: FileText, label: "File" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                mode === m.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {mode === "text" && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your resume content here..."
              className="w-full h-64 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all dark:text-white"
            />
          )}

          {mode === "file" && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[40px] p-12 text-center transition-all cursor-pointer ${
                isDragActive
                  ? "border-orange-500 bg-orange-500/5"
                  : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 hover:border-orange-500/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              {file ? (
                <div className="space-y-2">
                  <p className="font-bold text-foreground">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-red-500 font-bold uppercase tracking-widest hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-foreground">Click or drag resume to upload</p>
                  <p className="text-sm text-gray-500">Supports .txt, .pdf, .docx (Max 5MB)</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Roast Intensity</p>
            <div className="flex flex-wrap gap-2">
              {(["mild", "spicy", "nuclear"] as RoastIntensity[]).map((i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold transition-all border",
                    intensity === i
                      ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-orange-500/50"
                  )}
                >
                  {i.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRoast}
            disabled={loading}
            className="w-full py-5 bg-orange-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Roasting...
              </>
            ) : (
              "Roast My Resume"
            )}
          </button>
        </div>
      </div>

      {roast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">The Roast Result</h3>
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
            {roast}
          </div>
        </motion.div>
      )}
    </div>
  );
};
