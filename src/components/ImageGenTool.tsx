import React, { useState } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, Loader2, AlertCircle, Download, Upload, Type, Sparkles } from "lucide-react";
import { generateImage, editImage, AspectRatio, ImageSize, ImageStyle, enhanceImagePrompt } from "../services/geminiService";
import { useDropzone } from "react-dropzone";
import { cn } from "../lib/utils";
import { saveGenerationHistory } from "../services/historyService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className="absolute bottom-full mb-2 flex flex-col items-center invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100 z-50 translate-y-1 group-hover:translate-y-0">
      <div className="relative z-10 p-2 text-[10px] font-bold uppercase tracking-widest leading-none text-white whitespace-nowrap bg-slate-900 rounded-lg shadow-xl">
        {text}
      </div>
      <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />
    </div>
  </div>
);

export const ImageGenTool: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [style, setStyle] = useState<ImageStyle>("photorealistic");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isEnhancingEditPrompt, setIsEnhancingEditPrompt] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setResultImage(null);

    try {
      const result = await generateImage(prompt, aspectRatio, "1K", style);
      setResultImage(result);
      
      if (user) {
        await saveGenerationHistory(
          user.id,
          "image-gen",
          originalPrompt || prompt,
          originalPrompt ? prompt : null,
          { aspectRatio, style, mode: "generate" },
          result,
          "image"
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!baseImage) {
      setError("Please upload a base image.");
      return;
    }
    if (!editPrompt.trim()) {
      setError("Please enter edit instructions.");
      return;
    }

    setLoading(true);
    setError("");
    setResultImage(null);

    try {
      const result = await editImage(baseImage, editPrompt, aspectRatio);
      setResultImage(result);
      
      if (user) {
        await saveGenerationHistory(
          user.id,
          "image-gen",
          originalPrompt || editPrompt,
          originalPrompt ? editPrompt : null,
          { aspectRatio, mode: "edit" },
          result,
          "image"
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to edit image.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceMainPrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancingPrompt(true);
    setOriginalPrompt(prompt);
    try {
      const enhanced = await enhanceImagePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
      console.error("Failed to enhance prompt", err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleEnhanceEditPrompt = async () => {
    if (!editPrompt.trim()) return;
    setIsEnhancingEditPrompt(true);
    setOriginalPrompt(editPrompt);
    try {
      const enhanced = await enhanceImagePrompt(editPrompt);
      setEditPrompt(enhanced);
    } catch (err) {
      console.error("Failed to enhance prompt", err);
    } finally {
      setIsEnhancingEditPrompt(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `nexus_ai_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "generate", icon: Type, label: "Text to Image" },
            { id: "edit", icon: ImageIcon, label: "Image Edit" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                mode === m.id
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {mode === "generate" ? (
            <div className="space-y-4 relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full h-32 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 pr-14 text-lg focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all dark:text-white resize-none"
              />
              <div className="absolute bottom-4 right-4">
                <Tooltip text="Enhance Prompt">
                  <button
                    onClick={handleEnhanceMainPrompt}
                    disabled={isEnhancingPrompt || !prompt.trim()}
                    className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnhancingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-[40px] p-8 text-center transition-all cursor-pointer ${
                  isDragActive
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 hover:border-purple-500/50"
                }`}
              >
                <input {...getInputProps()} />
                {baseImage ? (
                  <div className="relative w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden shadow-lg group">
                    <img src={baseImage} alt="Base" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <Upload className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="font-bold text-foreground">Upload base image</p>
                    <p className="text-xs text-gray-500">Click or drag to upload</p>
                  </div>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe how you want to edit the image (e.g., 'Make it more vibrant', 'Add a cat')..."
                  className="w-full h-32 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 pr-14 text-lg focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all dark:text-white resize-none"
                />
                <div className="absolute bottom-4 right-4">
                  <Tooltip text="Enhance Prompt">
                    <button
                      onClick={handleEnhanceEditPrompt}
                      disabled={isEnhancingEditPrompt || !editPrompt.trim()}
                      className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnhancingEditPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Aspect Ratio</p>
              <div className="flex flex-wrap gap-2">
                {(["1:1", "4:3", "16:9", "9:16"] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                        : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Art Style</p>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as ImageStyle)}
                className="w-full py-2 px-3 text-xs font-bold uppercase rounded-xl border bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="photorealistic">Photorealistic</option>
                <option value="digital-art">Digital Art</option>
                <option value="oil-painting">Oil Painting</option>
                <option value="sketch">Sketch</option>
                <option value="3d-render">3D Render</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={mode === "generate" ? handleGenerate : handleEdit}
            disabled={loading}
            className="w-full py-5 bg-purple-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {mode === "generate" ? "Generating..." : "Editing..."}
              </>
            ) : (
              mode === "generate" ? "Generate Image" : "Edit Image"
            )}
          </button>
        </div>
      </div>

      {resultImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 p-8 shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Result</h3>
            <Tooltip text="Download this image">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </Tooltip>
          </div>
          <div className="relative aspect-auto max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 group">
            <img src={resultImage} alt="Result" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Tooltip text="Download Image">
                 <button
                   onClick={handleDownload}
                   className="p-4 bg-white rounded-full text-slate-900 shadow-2xl hover:scale-110 transition-transform"
                 >
                   <Download className="w-6 h-6" />
                 </button>
               </Tooltip>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
