import React from "react";
import { cn } from "../lib/utils";
import { Linkedin, Twitter, Instagram, Check } from "lucide-react";

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
  disabled?: boolean;
}

const platforms = [
  { id: "LinkedIn", icon: Linkedin, color: "text-[#0077B5]" },
  { id: "Twitter/X", icon: Twitter, color: "text-black" },
  { id: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
];

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatforms, onToggle, disabled }) => {
  return (
    <div className="flex flex-col gap-4">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Target Platforms</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              disabled={disabled}
              onClick={() => onToggle(platform.id)}
              className={cn(
                "flex items-center gap-3 p-4 border rounded-2xl transition-all duration-300 text-left relative overflow-hidden group",
                isSelected 
                  ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" 
                  : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-slate-700",
                disabled && "cursor-not-allowed opacity-80"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isSelected ? "bg-white/10" : "bg-gray-50 dark:bg-slate-800"
              )}>
                <platform.icon className={cn("w-5 h-5", isSelected ? "text-white" : platform.color)} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{platform.id}</span>
                <span className={cn("text-[10px] uppercase tracking-wider font-medium", isSelected ? "text-primary-foreground/60" : "text-gray-400 dark:text-slate-500")}>
                  {isSelected ? "Selected" : "Include"}
                </span>
              </div>
              
              {isSelected && !disabled && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
