import React from "react";
import { ImageSize, AspectRatio } from "../services/geminiService";
import { cn } from "../lib/utils";

interface ImageConfigSelectorProps {
  selectedSize: ImageSize;
  onSelectSize: (size: ImageSize) => void;
  selectedAspectRatio: AspectRatio;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

const sizes: { value: ImageSize; label: string; description: string }[] = [
  { value: "1K", label: "1K", description: "Standard quality, fast generation." },
  { value: "2K", label: "2K", description: "High quality, more detail." },
  { value: "4K", label: "4K", description: "Studio quality, maximum detail." },
];

const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "2:3", label: "2:3" },
  { value: "3:2", label: "3:2" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
  { value: "21:9", label: "21:9" },
];

export const ImageConfigSelector: React.FC<ImageConfigSelectorProps> = ({ 
  selectedSize, 
  onSelectSize, 
  selectedAspectRatio,
  onSelectAspectRatio,
  disabled 
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Image Quality</label>
        <div className="flex gap-4">
          {sizes.map((size) => (
            <button
              key={size.value}
              disabled={disabled}
              onClick={() => onSelectSize(size.value)}
              className={cn(
                "flex-1 flex flex-col p-3 text-center border rounded-xl transition-all duration-200 relative group",
                selectedSize === size.value
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/10"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-700",
                disabled && "cursor-not-allowed opacity-80"
              )}
            >
              <span className="font-bold text-lg">{size.label}</span>
              <span className={cn("text-[10px] mt-1", selectedSize === size.value ? "text-gray-300" : "text-gray-500 dark:text-slate-400")}>
                {size.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Aspect Ratio</label>
        <div className="flex gap-4">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              disabled={disabled}
              onClick={() => onSelectAspectRatio(ratio.value)}
              className={cn(
                "flex-1 p-3 text-center border rounded-xl transition-all duration-200 font-bold relative group",
                selectedAspectRatio === ratio.value
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/10"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-700",
                disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
