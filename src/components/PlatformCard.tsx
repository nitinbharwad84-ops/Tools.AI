import React from "react";
import { GeneratedPost } from "../services/geminiService";
import { motion } from "motion/react";
import { Loader2, AlertCircle, Copy, Check, Linkedin, Twitter, Instagram, Download, Share2, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

interface PlatformCardProps {
  post: GeneratedPost;
  onUpdateText?: (text: string) => void;
  onRegenerateImage?: () => void;
  onRegeneratePost?: () => void;
  onEditImage?: (editPrompt: string) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconProps = { className: "w-4 h-4" };
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin {...iconProps} className={cn(iconProps.className, "text-[#0077B5]")} />;
    case "twitter/x":
    case "twitter":
    case "x":
      return <Twitter {...iconProps} className={cn(iconProps.className, "text-black")} />;
    case "instagram":
      return <Instagram {...iconProps} className={cn(iconProps.className, "text-[#E4405F]")} />;
    default:
      return null;
  }
};

const Tooltip = ({ children, text, position = "top" }: { children: React.ReactNode; text: string; position?: "top" | "bottom" }) => (
  <div className="group relative flex flex-col items-center">
    {children}
    <div className={cn(
      "absolute mb-2 flex flex-col items-center invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100 z-50",
      position === "top" ? "bottom-full translate-y-1 group-hover:translate-y-0" : "top-full mt-2 -translate-y-1 group-hover:translate-y-0"
    )}>
      {position === "bottom" && <div className="w-2 h-2 -mb-1 rotate-45 bg-slate-900 z-0" />}
      <div className="relative z-10 p-2 text-[10px] font-bold uppercase tracking-widest leading-none text-white whitespace-nowrap bg-slate-900 rounded-lg shadow-xl">
        {text}
      </div>
      {position === "top" && <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900" />}
    </div>
  </div>
);

export const PlatformCard: React.FC<PlatformCardProps> = ({ post, onUpdateText, onRegenerateImage, onRegeneratePost, onEditImage }) => {
  const [copied, setCopied] = React.useState(false);
  const [editPrompt, setEditPrompt] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!post.imageUrl) return;
    const link = document.createElement("a");
    link.href = post.imageUrl;
    link.download = `${post.platform.replace("/", "_")}_post_image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.platform} Post`,
          text: post.text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
      alert("Text copied to clipboard! You can now paste it into your social media profile.");
    }
  };

  const handleEditImage = async () => {
    if (!editPrompt.trim() || !onEditImage) return;
    setIsEditing(true);
    try {
      await onEditImage(editPrompt);
      setEditPrompt("");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full relative"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={post.platform} />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">{post.platform}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip text="Regenerate Entire Post">
              <button
                onClick={onRegeneratePost}
                disabled={post.loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4 text-gray-400 dark:text-slate-500", post.loading && "animate-spin")} />
              </button>
            </Tooltip>
            <Tooltip text={copied ? "Copied!" : "Copy Text"}>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 dark:text-slate-500" />}
              </button>
            </Tooltip>
            <Tooltip text="Share Post">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="mb-6 flex-1">
          {post.loading && !post.text ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-4/6 animate-pulse" />
            </div>
          ) : (
            <textarea
              value={post.text}
              onChange={(e) => onUpdateText?.(e.target.value)}
              className="w-full h-full min-h-[150px] text-gray-800 dark:text-gray-200 text-sm leading-relaxed bg-transparent border-none focus:ring-0 resize-none p-0 scrollbar-hide"
              placeholder="Edit your post content here..."
            />
          )}
        </div>

        <div className="relative aspect-square sm:aspect-video bg-gray-50 dark:bg-slate-800 rounded-2xl overflow-hidden group">
          {post.loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-slate-800 via-gray-100 dark:via-slate-700 to-gray-50 dark:to-slate-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <Loader2 className="w-8 h-8 animate-spin relative z-10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 text-gray-300 dark:text-slate-600">Rendering Visual...</span>
            </div>
          ) : post.error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 p-4 text-center">
              <AlertCircle className="w-8 h-8" />
              <span className="text-xs font-medium uppercase tracking-widest">{post.error}</span>
              <Tooltip text="Attempt to regenerate image">
                <button 
                  onClick={onRegenerateImage}
                  className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </Tooltip>
            </div>
          ) : post.imageUrl ? (
            <>
              <img
                src={post.imageUrl}
                alt={`${post.platform} generated visual`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <Tooltip text="Download Image" position="bottom">
                  <button
                    onClick={handleDownload}
                    className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </Tooltip>
                <Tooltip text="Regenerate Image Only" position="bottom">
                  <button
                    onClick={onRegenerateImage}
                    className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 italic text-sm">
              Visual will appear here
            </div>
          )}
        </div>

        {post.imageUrl && !post.loading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              <RefreshCw className="w-3 h-3" /> Edit Visual with AI
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe the image edit... e.g., Make it more vibrant"
                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white dark:placeholder-slate-600"
                onKeyDown={(e) => e.key === "Enter" && handleEditImage()}
              />
              <button
                onClick={handleEditImage}
                disabled={isEditing || !editPrompt.trim()}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEditing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Edit"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Tooltip text={copied ? "Success!" : "Copy full post text"}>
            <button
              onClick={handleCopy}
              disabled={post.loading || !post.text}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                copied 
                  ? "bg-green-500 text-white shadow-lg shadow-green-100" 
                  : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Post</span>
                </>
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};
