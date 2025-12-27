import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// --- Checkbox Component (Custom) ---
interface CheckboxProps {
  checked: boolean;
  partial?: boolean;
  onChange: () => void;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const MeetingReportCheckBox = ({
  checked,
  partial,
  onChange,
  className,
  onClick,
}: CheckboxProps) => {
  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
        onChange();
      }}
      className={cn(
        "flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors",
        checked || partial
          ? "border-blue-500 bg-blue-500"
          : "border-slate-400 bg-transparent hover:border-blue-400",
        className
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" />}
      {!checked && partial && <div className="h-0.5 w-3 bg-white/80" />}
    </div>
  );
};

export default MeetingReportCheckBox;
