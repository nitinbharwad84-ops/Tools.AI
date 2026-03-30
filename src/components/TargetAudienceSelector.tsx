import React from "react";
import { TargetAudience } from "../services/geminiService";
import { cn } from "../lib/utils";
import { Users, Cpu, Briefcase, Palette, GraduationCap } from "lucide-react";

interface TargetAudienceSelectorProps {
  selectedAudience: TargetAudience;
  onSelect: (audience: TargetAudience) => void;
  disabled?: boolean;
}

const audiences: { value: TargetAudience; label: string; description: string; icon: any }[] = [
  { value: "general", label: "General", description: "Broad, diverse interests.", icon: Users },
  { value: "tech", label: "Tech Savvy", description: "Developers, early adopters.", icon: Cpu },
  { value: "business", label: "Business", description: "Decision-makers, pros.", icon: Briefcase },
  { value: "creatives", label: "Creatives", description: "Artists, designers, writers.", icon: Palette },
  { value: "students", label: "Students", description: "Learners and educators.", icon: GraduationCap },
];

export const TargetAudienceSelector: React.FC<TargetAudienceSelectorProps> = ({ selectedAudience, onSelect, disabled }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {audiences.map((audience) => (
          <button
            key={audience.value}
            disabled={disabled}
            onClick={() => onSelect(audience.value)}
            className={cn(
              "flex flex-col items-center p-4 text-center border rounded-xl transition-all duration-200 relative group",
              selectedAudience === audience.value
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-700",
              disabled && "cursor-not-allowed opacity-80"
            )}
          >
            <audience.icon className={cn("w-6 h-6 mb-2", selectedAudience === audience.value ? "text-white" : "text-primary")} />
            <span className="font-bold text-sm">{audience.label}</span>
            <span className={cn("text-[10px] mt-1 leading-tight", selectedAudience === audience.value ? "text-gray-300" : "text-gray-500 dark:text-slate-400")}>
              {audience.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
