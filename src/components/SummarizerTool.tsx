import React, { useState } from "react";
import { motion } from "motion/react";
import { FileText, Link as LinkIcon, Type, Loader2, AlertCircle, Copy, Check, Download } from "lucide-react";
import { summarizeContent, ContentLength, SummaryFocus, WritingStyle } from "../services/geminiService";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { parseFile } from "../lib/fileParser";
import { cn } from "../lib/utils";
import { saveGenerationHistory } from "../services/historyService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const SummarizerTool: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "file" | "url">("text");
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [length, setLength] = useState<ContentLength>("medium");
  const [focus, setFocus] = useState<SummaryFocus>("key-takeaways");
  const [tone, setTone] = useState<WritingStyle>("formal");

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        setUploadStatus("error");
        return;
      }

      setError("");
      setUploadStatus("uploading");
      setUploadProgress(0);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFile(selectedFile);
          setUploadStatus("success");
          setUploadProgress(100);
        } else {
          setUploadProgress(progress);
        }
      }, 200);
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

  const handleSummarize = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");

    try {
      let contentToSummarize = "";

      if (mode === "text") {
        if (!input.trim()) throw new Error("Please enter some text to summarize.");
        contentToSummarize = input;
      } else if (mode === "url") {
        if (!url.trim()) throw new Error("Please enter a valid URL.");
        try {
          const response = await axios.post("/api/fetch-url", { url });
          contentToSummarize = response.data.text;
        } catch (err: any) {
          const backendError = err.response?.data?.error;
          throw new Error(backendError || "Failed to fetch content from the provided URL.");
        }
      } else if (mode === "file") {
        if (!file) throw new Error("Please upload a file.");
        
        try {
          contentToSummarize = await parseFile(file);
        } catch (err: any) {
          throw new Error(`Failed to parse file: ${err.message}`);
        }
      }

      const result = await summarizeContent(
        contentToSummarize, 
        mode, 
        length, 
        focus, 
        tone,
        profile?.gemini_api_key
      );
      setSummary(result);
      
      if (user) {
        await saveGenerationHistory(
          user.id,
          "summarizer",
          mode === "text" ? input : mode === "url" ? url : file?.name || "File upload",
          null,
          { mode, length, focus, tone },
          result,
          "text"
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to summarize content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">AI Content Summarizer</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Condense long articles, documents, or raw text into clear, actionable summaries using state-of-the-art AI.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "text", icon: Type, label: "Text" },
            { id: "file", icon: FileText, label: "File" },
            { id: "url", icon: LinkIcon, label: "URL" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                mode === m.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
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
              placeholder="Paste your text here..."
              className="w-full h-64 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 text-lg focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all dark:text-white"
            />
          )}

          {mode === "url" && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter web URL (e.g., https://example.com/article)"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all dark:text-white"
            />
          )}

          {mode === "file" && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[40px] p-12 text-center transition-all cursor-pointer ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className={`w-8 h-8 ${uploadStatus === "success" ? "text-green-500" : "text-primary"}`} />
              </div>
              {uploadStatus === "uploading" ? (
                <div className="space-y-4 max-w-xs mx-auto">
                  <p className="font-bold text-foreground">Uploading file...</p>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-primary h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% Complete</p>
                </div>
              ) : file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Complete</span>
                  </div>
                  <p className="font-bold text-foreground">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFile(null); 
                      setUploadStatus("idle");
                      setUploadProgress(0);
                    }}
                    className="text-xs text-red-500 font-bold uppercase tracking-widest hover:underline mt-4"
                  >
                    Remove & Replace
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-foreground">Click or drag file to upload</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Length</label>
              <div className="flex gap-2">
                {(["short", "medium", "long"] as ContentLength[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                      length === l
                        ? "bg-primary border-primary text-white"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Focus Area</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value as SummaryFocus)}
                className="w-full py-2 px-3 text-[10px] font-bold uppercase rounded-lg border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="key-takeaways">Key Takeaways</option>
                <option value="action-items">Action Items</option>
                <option value="executive-summary">Executive Summary</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tone</label>
              <div className="flex gap-2">
                {(["formal", "casual", "academic"] as WritingStyle[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                      tone === t
                        ? "bg-primary border-primary text-white"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Summarizing...
              </>
            ) : (
              "Generate Summary"
            )}
          </button>
        </div>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Summary Result</h3>
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
            {summary}
          </div>
        </motion.div>
      )}
    </div>
  );
};
