import React from "react";
import { Tone } from "../services/geminiService";
import { cn } from "../lib/utils";

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
  disabled?: boolean;
}

const tones: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Polished, authoritative, and insightful." },
  { value: "witty", label: "Witty", description: "Clever, engaging, and slightly humorous." },
  { value: "urgent", label: "Urgent", description: "Direct, action-oriented, and time-sensitive." },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Tone of Voice</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tones.map((tone) => (
          <button
            key={tone.value}
            disabled={disabled}
            onClick={() => onSelect(tone.value)}
            className={cn(
              "flex flex-col p-4 text-left border rounded-xl transition-all duration-200 relative group",
              selectedTone === tone.value
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-700",
              disabled && "cursor-not-allowed opacity-80"
            )}
          >
            <span className="font-bold text-lg">{tone.label}</span>
            <span className={cn("text-xs mt-1", selectedTone === tone.value ? "text-gray-300" : "text-gray-500 dark:text-slate-400")}>
              {tone.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
