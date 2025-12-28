import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";

interface AiVoiceOptionProps {
  selectedVoice: "male" | "female";
  onVoiceChange: (voice: "male" | "female") => void;
}

const AiVoiceOption = ({ selectedVoice, onVoiceChange }: AiVoiceOptionProps) => {
  return (
    <div className="space-y-3">
      <label className="text-md block font-medium text-slate-700 dark:text-slate-300">
        AI 음성 선택
      </label>
      <div className="grid grid-cols-2 gap-4">
        {/* Female Option */}
        <button
          onClick={() => onVoiceChange("female")}
          className={cn(
            "relative flex items-center justify-center gap-2 rounded-xl border p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
            selectedVoice === "female"
              ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mic className="h-4 w-4" />
            </div>
            <span className="font-medium">여성 (Siri 스타일)</span>
          </div>
          {selectedVoice === "female" && (
            <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400"></div>
          )}
        </button>

        {/* Male Option */}
        <button
          onClick={() => onVoiceChange("male")}
          className={cn(
            "relative flex items-center justify-center gap-2 rounded-xl border p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
            selectedVoice === "male"
              ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mic className="h-4 w-4" />
            </div>
            <span className="font-medium">남성 (Jarvis 스타일)</span>
          </div>
          {selectedVoice === "male" && (
            <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AiVoiceOption;
