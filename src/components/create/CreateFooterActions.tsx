import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface CreateFooterActionsProps {
  totalSelectedCount: number;
  onClick: () => void;
}

const CreateFooterActions = ({ totalSelectedCount, onClick }: CreateFooterActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-4 p-4">
      <div className="text-sm text-slate-500">
        총 <span className="font-bold text-blue-600 dark:text-blue-400">{totalSelectedCount}</span>
        개의 회의 데이터 선택됨
      </div>
      <Button
        size="lg"
        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
        disabled={totalSelectedCount === 0}
        onClick={onClick}
      >
        다음 단계 <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default CreateFooterActions;
