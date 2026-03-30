import React from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  FileText, 
  Flame, 
  Mail, 
  Image as ImageIcon, 
  Type,
  Video,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export type ToolId = "social-gen" | "summarizer" | "resume-roaster" | "email-pacifier" | "image-gen" | "grammar-fixer" | "video-analyzer";

interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const tools: Tool[] = [
  {
    id: "social-gen",
    name: "Social Gen AI",
    description: "Generate viral social media posts for LinkedIn, X, and Instagram with AI visuals.",
    icon: Globe,
    color: "bg-blue-500"
  },
  {
    id: "summarizer",
    name: "AI Summarizer",
    description: "Summarize long text, documents, or web pages into clean, actionable key points.",
    icon: FileText,
    color: "bg-indigo-500"
  },
  {
    id: "resume-roaster",
    name: "Resume Roaster",
    description: "Get a brutally honest, witty roast of your resume with actionable improvement tips.",
    icon: Flame,
    color: "bg-orange-500"
  },
  {
    id: "email-pacifier",
    name: "Email Pacifier",
    description: "Transform angry or passive-aggressive emails into calm, professional masterpieces.",
    icon: Mail,
    color: "bg-emerald-500"
  },
  {
    id: "image-gen",
    name: "AI Image Gen",
    description: "Generate stunning images from text or edit existing ones with AI instructions.",
    icon: ImageIcon,
    color: "bg-purple-500"
  },
  {
    id: "grammar-fixer",
    name: "Grammar Fixer",
    description: "Instantly fix grammar, spelling, and flow while keeping your original meaning.",
    icon: Type,
    color: "bg-rose-500"
  },
  {
    id: "video-analyzer",
    name: "Video Analyzer",
    description: "Upload videos to summarize, ask questions, identify actions, and perform complex reasoning.",
    icon: Video,
    color: "bg-cyan-500"
  }
];

interface DashboardProps {
  // onSelectTool removed in favor of Link
}

export const Dashboard: React.FC<DashboardProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
          Unleash the Power of <span className="text-primary italic font-serif">Nexus AI</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl max-w-3xl leading-relaxed">
          The ultimate multi-tool platform for creators and professionals. Generate viral content, 
          summarize complex documents, and analyze media with state-of-the-art Gemini 3.1 Pro intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/tools/${tool.id}`}
              className="group block text-left p-8 rounded-[40px] border transition-all duration-300 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-primary/20"
            >
              <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${tool.color.split('-')[1]}-500/20`}>
                <tool.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {tool.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                Open Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
