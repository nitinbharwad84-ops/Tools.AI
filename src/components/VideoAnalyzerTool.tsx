import React, { useState } from "react";
import { motion } from "motion/react";
import { Video, Loader2, AlertCircle, Copy, Check, Upload, FileVideo, PlayCircle, MessageSquare, Clock, BrainCircuit } from "lucide-react";
import { analyzeVideo } from "../services/geminiService";
import { useDropzone } from "react-dropzone";
import { cn } from "../lib/utils";

type Tab = "summarization" | "qna" | "action" | "reasoning";

export const VideoAnalyzerTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("summarization");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Customization options
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryFocus, setSummaryFocus] = useState("general");
  const [qnaDetail, setQnaDetail] = useState("detailed");
  const [actionGranularity, setActionGranularity] = useState("high-level");
  const [reasoningDepth, setReasoningDepth] = useState("standard");

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError("File is too large for browser processing. Please upload a smaller video (under 100MB).");
        return;
      }
      setVideoFile(file);
      setMimeType(file.type);
      setError("");
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setVideoBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!videoBase64) {
      setError("Please upload a video first.");
      return;
    }

    if ((activeTab === "qna" || activeTab === "reasoning") && !prompt.trim()) {
      setError("Please enter a prompt or question.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    const options = {
      length: summaryLength,
      focus: summaryFocus,
      detailLevel: qnaDetail,
      granularity: actionGranularity,
      depth: reasoningDepth
    };

    try {
      const res = await analyzeVideo(videoBase64, mimeType, activeTab, prompt, options);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze video.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "summarization", label: "Summarization", icon: FileVideo },
    { id: "qna", label: "Content Q&A", icon: MessageSquare },
    { id: "action", label: "Action Recognition", icon: Clock },
    { id: "reasoning", label: "Multimodal Reasoning", icon: BrainCircuit }
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Video Analyzer</h3>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400">
            Upload a video (up to 1 hour for gemini-2.5-flash-lite) and extract insights, ask questions, or perform complex reasoning.
          </p>

          <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setResult("");
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === t.id
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-[32px] p-8 text-center transition-all cursor-pointer",
              isDragActive
                ? "border-cyan-500 bg-cyan-500/5"
                : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 hover:border-cyan-500/50"
            )}
          >
            <input {...getInputProps()} />
            {videoFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 text-cyan-600 dark:text-cyan-400">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <p className="font-bold text-foreground">{videoFile.name}</p>
                <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p className="text-xs text-cyan-500 font-medium mt-2">Click or drag to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Upload className="w-6 h-6 text-cyan-500" />
                </div>
                <p className="font-bold text-foreground">Upload video footage</p>
                <p className="text-xs text-gray-500">Click or drag video file here (MP4, WebM, etc.)</p>
              </div>
            )}
          </div>

          {/* Customization Options based on active tab */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-6">
            {activeTab === "summarization" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Summary Length</label>
                  <div className="flex gap-2">
                    {["short", "medium", "detailed"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSummaryLength(l)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                          summaryLength === l
                            ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-cyan-500/50"
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
                    value={summaryFocus}
                    onChange={(e) => setSummaryFocus(e.target.value)}
                    className="w-full py-2 px-3 text-xs font-bold uppercase rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="general">General Summary</option>
                    <option value="key-events">Key Events</option>
                    <option value="dialogue">Dialogue & Speech</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "qna" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your Question</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., What color is the car that drives by at the beginning?"
                    className="w-full h-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Detail Level</label>
                  <div className="flex gap-2">
                    {["concise", "detailed"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setQnaDetail(l)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                          qnaDetail === l
                            ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-cyan-500/50"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "action" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Granularity</label>
                  <div className="flex gap-2">
                    {["high-level", "detailed timestamps"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setActionGranularity(l)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                          actionGranularity === l
                            ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-cyan-500/50"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reasoning" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reasoning Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Analyze the body language of the speakers and deduce their relationship."
                    className="w-full h-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reasoning Depth</label>
                  <div className="flex gap-2">
                    {["standard", "deep"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setReasoningDepth(l)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all",
                          reasoningDepth === l
                            ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 hover:border-cyan-500/50"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !videoBase64}
            className="w-full py-5 bg-cyan-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Video...
              </>
            ) : (
              "Analyze Video"
            )}
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Analysis Result</h3>
            <button
              onClick={handleCopy}
              className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-500"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <div className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed text-base">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
};
