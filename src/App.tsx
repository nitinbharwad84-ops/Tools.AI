import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Loader2, AlertCircle, ArrowLeft, ChevronRight, LayoutGrid, Type, Image as ImageIcon, Globe, FileText, Flame, Mail, CheckCircle2 } from "lucide-react";
import { 
  generateSocialContent, 
  generateImage, 
  regenerateSinglePost,
  editImage,
  checkApiKey, 
  Tone, 
  TargetAudience,
  ContentLength,
  ImageSize, 
  AspectRatio,
  GeneratedPost,
  PlatformContent
} from "./services/geminiService";
import { ToneSelector } from "./components/ToneSelector";
import { TargetAudienceSelector } from "./components/TargetAudienceSelector";
import { ImageConfigSelector } from "./components/ImageConfigSelector";
import { PlatformSelector } from "./components/PlatformSelector";
import { PlatformCard } from "./components/PlatformCard";
import { LandingPage } from "./components/LandingPage";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { Dashboard, ToolId } from "./components/Dashboard";
import { SummarizerTool } from "./components/SummarizerTool";
import { ResumeRoasterTool } from "./components/ResumeRoasterTool";
import { EmailPacifierTool } from "./components/EmailPacifierTool";
import { ImageGenTool } from "./components/ImageGenTool";
import { GrammarFixerTool } from "./components/GrammarFixerTool";
import { VideoAnalyzerTool } from "./components/VideoAnalyzerTool";
import { cn } from "./lib/utils";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "tool">("landing");
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("general");
  const [contentLength, setContentLength] = useState<ContentLength>("medium");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["LinkedIn", "Twitter/X", "Instagram"]);
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (view !== "landing") {
      checkApiKey();
    }
  }, [view]);

  const handleSelectTool = (id: ToolId) => {
    setActiveTool(id);
    setView("tool");
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setActiveTool(null);
  };

  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!idea.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setPosts([]);

    try {
      const platformContents = await generateSocialContent(idea, tone, selectedPlatforms, targetAudience, contentLength, includeEmojis);
      
      const initialPosts: GeneratedPost[] = platformContents.map(pc => ({
        platform: pc.platform,
        text: pc.text,
        imagePrompt: pc.imagePrompt,
        imageUrl: null,
        loading: true,
        error: null
      }));
      setPosts(initialPosts);

      const imagePromises = platformContents.map(async (pc, index) => {
        try {
          const imageUrl = await generateImage(pc.imagePrompt, aspectRatio, imageSize);
          setPosts(prev => {
            const newPosts = [...prev];
            newPosts[index] = { ...newPosts[index], imageUrl, loading: false };
            return newPosts;
          });
        } catch (err: any) {
          console.error(`Failed to generate image for ${pc.platform}`, err);
          const isPermissionError = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403");
          setPosts(prev => {
            const newPosts = [...prev];
            newPosts[index] = { 
              ...newPosts[index], 
              loading: false, 
              error: isPermissionError 
                ? "Permission denied. This model requires a valid paid API key." 
                : "Image generation failed. Try again?" 
            };
            return newPosts;
          });
        }
      });

      await Promise.all(imagePromises);
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePostText = (index: number, newText: string) => {
    setPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = { ...newPosts[index], text: newText };
      return newPosts;
    });
  };

  const handleRegenerateImage = async (index: number) => {
    const post = posts[index];
    if (!post) return;

    setPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = { ...newPosts[index], loading: true, error: null, imageUrl: null };
      return newPosts;
    });

    try {
      const imageUrl = await generateImage(post.imagePrompt, aspectRatio, imageSize);
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { ...newPosts[index], imageUrl, loading: false };
        return newPosts;
      });
    } catch (err: any) {
      console.error(`Failed to regenerate image for ${post.platform}`, err);
      const isPermissionError = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403");
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { 
          ...newPosts[index], 
          loading: false, 
          error: isPermissionError 
            ? "Permission denied. This model requires a valid paid API key." 
            : "Image generation failed. Try again?" 
        };
        return newPosts;
      });
    }
  };

  const handleRegeneratePost = async (index: number) => {
    const post = posts[index];
    if (!post || isGenerating) return;

    setPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = { ...newPosts[index], loading: true, error: null };
      return newPosts;
    });

    try {
      const newContent = await regenerateSinglePost(idea, tone, post.platform, targetAudience, contentLength, includeEmojis);
      
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { 
          ...newPosts[index], 
          text: newContent.text, 
          imagePrompt: newContent.imagePrompt,
          imageUrl: null,
          loading: true 
        };
        return newPosts;
      });

      const imageUrl = await generateImage(newContent.imagePrompt, aspectRatio, imageSize);
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { ...newPosts[index], imageUrl, loading: false };
        return newPosts;
      });
    } catch (err: any) {
      console.error(`Failed to regenerate post for ${post.platform}`, err);
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { 
          ...newPosts[index], 
          loading: false, 
          error: "Failed to regenerate post. Please try again." 
        };
        return newPosts;
      });
    }
  };

  const handleEditImage = async (index: number, editPrompt: string) => {
    const post = posts[index];
    if (!post || !post.imageUrl || isGenerating) return;

    setPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = { ...newPosts[index], loading: true, error: null };
      return newPosts;
    });

    try {
      const newImageUrl = await editImage(post.imageUrl, editPrompt, aspectRatio);
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { ...newPosts[index], imageUrl: newImageUrl, loading: false };
        return newPosts;
      });
    } catch (err: any) {
      console.error(`Failed to edit image for ${post.platform}`, err);
      const isPermissionError = err.message?.includes("PERMISSION_DENIED") || err.message?.includes("403");
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { 
          ...newPosts[index], 
          loading: false, 
          error: isPermissionError 
            ? "Permission denied. This model requires a valid paid API key." 
            : "Image editing failed. Try again?" 
        };
        return newPosts;
      });
    }
  };

  const renderSocialGen = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
      {/* Left Column: Input & Controls */}
      <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter leading-none text-foreground">
              Campaign <span className="text-primary italic font-serif font-light">Studio</span>
            </h1>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              Refine your idea and let the engine handle the rest.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">01</span>
                The Core Concept
              </div>
              <div className="relative group">
                <textarea
                  value={idea}
                  disabled={isGenerating}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="What's the big idea?"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 text-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all min-h-[200px] shadow-sm group-hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:placeholder-slate-700"
                />
                <div className="absolute bottom-6 right-8 text-[10px] font-mono text-gray-300 dark:text-slate-700 uppercase tracking-widest">
                  {idea.length} chars
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">02</span>
                Target Channels
              </div>
              <PlatformSelector 
                selectedPlatforms={selectedPlatforms} 
                onToggle={handleTogglePlatform} 
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">03</span>
                Target Audience
              </div>
              <TargetAudienceSelector 
                selectedAudience={targetAudience} 
                onSelect={setTargetAudience} 
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">04</span>
                Voice & Personality
              </div>
              <ToneSelector 
                selectedTone={tone} 
                onSelect={setTone} 
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">05</span>
                Content Options
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Length</label>
                  <div className="flex gap-2">
                    {(["short", "medium", "long"] as ContentLength[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setContentLength(l)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                          contentLength === l
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Emojis</label>
                  <button
                    onClick={() => setIncludeEmojis(!includeEmojis)}
                    className={cn(
                      "w-full py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                      includeEmojis
                        ? "bg-primary border-primary text-white"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500"
                    )}
                  >
                    {includeEmojis ? "Included" : "Excluded"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className="w-5 h-5 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[8px]">06</span>
                Visual Fidelity
              </div>
              <ImageConfigSelector 
                selectedSize={imageSize} 
                onSelectSize={setImageSize} 
                selectedAspectRatio={aspectRatio}
                onSelectAspectRatio={setAspectRatio}
                disabled={isGenerating}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim() || selectedPlatforms.length === 0}
              className={cn(
                "w-full py-6 rounded-[32px] font-bold text-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl relative overflow-hidden",
                isGenerating || !idea.trim() || selectedPlatforms.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-primary text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/20"
              )}
            >
              {isGenerating ? (
                <>
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Campaign</span>
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7 space-y-12">
        <AnimatePresence mode="wait">
          {posts.length > 0 ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-slate-800 rounded-xl flex items-center justify-center text-white">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight dark:text-white">Generated Assets</h2>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {posts.length} Platforms Ready
                </div>
              </div>
              <div className="grid grid-cols-1 gap-12">
                {posts.map((post, index) => (
                  <PlatformCard 
                    key={index} 
                    post={post} 
                    onUpdateText={(newText) => handleUpdatePostText(index, newText)}
                    onRegenerateImage={() => handleRegenerateImage(index)}
                    onRegeneratePost={() => handleRegeneratePost(index)}
                    onEditImage={(editPrompt) => handleEditImage(index, editPrompt)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[800px] border border-gray-100 dark:border-slate-800 rounded-[60px] flex flex-col items-center justify-center text-center p-16 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="relative mb-10">
                <div className="w-32 h-32 bg-gray-50 dark:bg-slate-800 rounded-[40px] flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-gray-100 dark:border-slate-800 rounded-[50px] -z-10" 
                />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Your Campaign Awaits</h3>
              <p className="text-gray-400 dark:text-gray-500 max-w-sm leading-relaxed text-lg">
                Define your core concept on the left to generate a cohesive multi-platform strategy.
              </p>
              
              <div className="grid grid-cols-3 gap-8 mt-16 opacity-30">
                <div className="flex flex-col items-center gap-2">
                  <Type className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Text</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Visuals</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ChevronRight className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Optimize</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderTool = () => {
    switch (activeTool) {
      case "social-gen":
        return renderSocialGen();
      case "summarizer":
        return <SummarizerTool />;
      case "resume-roaster":
        return <ResumeRoasterTool />;
      case "email-pacifier":
        return <EmailPacifierTool />;
      case "image-gen":
        return <ImageGenTool />;
      case "grammar-fixer":
        return <GrammarFixerTool />;
      case "video-analyzer":
        return <VideoAnalyzerTool />;
      default:
        return null;
    }
  };

  if (view === "landing") {
    return <LandingPage onStart={() => setView("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {view === "tool" && (
              <button 
                onClick={handleBackToDashboard}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setView("dashboard")}
            >
              <img src="/logo.svg" alt="Nexus AI Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-primary/20 object-cover" />
              <span className="font-bold tracking-tighter hidden sm:block dark:text-white">Nexus AI</span>
            </div>
            {activeTool && (
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Tool:</span>
                <span className="text-xs font-bold text-primary capitalize">{activeTool.replace("-", " ")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <DarkModeToggle />
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Engine Active
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === "dashboard" ? (
          <Dashboard onSelectTool={handleSelectTool} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderTool()}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100 dark:border-slate-800 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Nexus AI Logo" className="w-8 h-8 rounded-lg shadow-lg object-cover" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Nexus AI Platform v1.0</span>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Intelligence</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Gemini 3.1 Pro</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Visuals</span>
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Gemini 2.5 Flash Image</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

