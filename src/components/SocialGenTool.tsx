import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Loader2, AlertCircle, ArrowLeft, ChevronRight, LayoutGrid, Type, Image as ImageIcon, Globe, FileText, Flame, Mail, CheckCircle2, Clock, User, LogOut, Settings } from "lucide-react";
import { 
  generateSocialContent, 
  generateImage, 
  regenerateSinglePost,
  editImage,
  Tone, 
  TargetAudience,
  ContentLength,
  ImageSize, 
  AspectRatio,
  GeneratedPost,
  PlatformContent
} from "../services/geminiService";
import { ToneSelector } from "./ToneSelector";
import { TargetAudienceSelector } from "./TargetAudienceSelector";
import { ImageConfigSelector } from "./ImageConfigSelector";
import { PlatformSelector } from "./PlatformSelector";
import { PlatformCard } from "./PlatformCard";
import { saveGenerationHistory } from "../services/historyService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export const SocialGenTool: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  
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

  const handleTogglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!idea.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setPosts([]);

    try {
      const platformContents = await generateSocialContent(
        idea, 
        tone, 
        selectedPlatforms, 
        targetAudience, 
        contentLength, 
        includeEmojis,
        profile?.gemini_api_key
      );
      
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
          const imageUrl = await generateImage(
            pc.imagePrompt, 
            aspectRatio, 
            imageSize, 
            undefined, 
            profile?.gemini_api_key
          );
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

      if (user) {
        await saveGenerationHistory(
          user.id,
          "social-gen",
          idea,
          null,
          { tone, targetAudience, contentLength, platforms: selectedPlatforms },
          JSON.stringify(platformContents),
          "json"
        );
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePost = async (index: number) => {
    const post = posts[index];
    setPosts(prev => {
      const newPosts = [...prev];
      newPosts[index] = { ...newPosts[index], loading: true, error: null };
      return newPosts;
    });

    try {
      const newContent = await regenerateSinglePost(
        idea, 
        tone as Tone, 
        post.platform, 
        targetAudience, 
        contentLength, 
        includeEmojis,
        profile?.gemini_api_key
      );
      const newImageUrl = await generateImage(
        newContent.imagePrompt, 
        aspectRatio, 
        imageSize, 
        undefined, 
        profile?.gemini_api_key
      );
      
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { 
          ...newPosts[index], 
          text: newContent.text, 
          imagePrompt: newContent.imagePrompt,
          imageUrl: newImageUrl, 
          loading: false 
        };
        return newPosts;
      });
    } catch (err: any) {
      setPosts(prev => {
        const newPosts = [...prev];
        newPosts[index] = { ...newPosts[index], loading: false, error: "Regeneration failed." };
        return newPosts;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Helmet>
        <title>Social Gen AI | Nexus AI</title>
        <meta name="description" content="Generate viral social media posts for LinkedIn, X, and Instagram with AI visuals using Nexus AI's Social Gen tool." />
      </Helmet>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Social Gen AI</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate viral social media posts with AI visuals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input & Config */}
        <div className="lg:col-span-5 space-y-10">
          <section className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Your Idea or Topic
            </label>
            <div className="relative group">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., The future of AI in creative industries..."
                className="w-full h-40 p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-lg text-slate-900 dark:text-white shadow-sm group-hover:shadow-md"
              />
              <div className="absolute bottom-6 right-6">
                <Sparkles className="w-6 h-6 text-primary/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Target Platforms
            </label>
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms}
              onToggle={handleTogglePlatform}
            />
          </section>

          <section className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Writing Tone
            </label>
            <ToneSelector selectedTone={tone} onSelect={setTone} />
          </section>

          <section className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Target Audience
            </label>
            <TargetAudienceSelector selectedAudience={targetAudience} onSelect={setTargetAudience} />
          </section>

          <section className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Image Configuration
            </label>
            <ImageConfigSelector 
              selectedSize={imageSize} 
              selectedAspectRatio={aspectRatio}
              onSelectSize={setImageSize}
              onSelectAspectRatio={setAspectRatio}
            />
          </section>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !idea.trim() || selectedPlatforms.length === 0}
            className="w-full py-6 bg-primary hover:bg-primary-dark text-white rounded-[32px] font-bold text-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Generate Posts
              </>
            )}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-12 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Live Preview
              </label>
              {posts.length > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {posts.length} Posts Generated
                </span>
              )}
            </div>

            {posts.length === 0 && !isGenerating ? (
              <div className="h-[600px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm flex items-center justify-center mb-6">
                  <LayoutGrid className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Create?</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                  Enter your idea and select platforms to see your AI-generated content here.
                </p>
              </div>
            ) : (
              <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <PlatformCard 
                      key={`${post.platform}-${index}`}
                      post={post}
                      onRegeneratePost={() => handleRegeneratePost(index)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
