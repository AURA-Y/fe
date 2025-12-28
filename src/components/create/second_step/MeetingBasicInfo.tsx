import { Input } from "@/components/ui/input";

interface MeetingBasicInfoProps {
  topic: string;
  goal: string;
  maxParticipants: number;
  onChange: (
    field: "roomTitle" | "description" | "maxParticipants",
    value: string | number
  ) => void;
}

const MeetingBasicInfo = ({ topic, goal, maxParticipants, onChange }: MeetingBasicInfoProps) => {
  return (
    <div className="space-y-8">
      {/* Meeting Topic */}
      <div className="space-y-3">
        <label className="text-md block font-medium text-slate-700 dark:text-slate-300">
          회의 주제
        </label>
        <Input
          placeholder="예: 2024년 1분기 마케팅 전략 수립"
          value={topic}
          onChange={(e) => onChange("roomTitle", e.target.value)}
          className="h-12"
        />
      </div>

      {/* Meeting Goal */}
      <div className="space-y-3">
        <label className="text-md block font-medium text-slate-700 dark:text-slate-300">
          회의 목표
        </label>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
          placeholder="AI가 이 회의에서 어떤 역할을 수행해야 하며, 최종적으로 어떤 결론을 도출하고 싶은지 입력해주세요."
          value={goal}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      {/* 최대 참여 인원 (Max Participants) 추가 */}
      <div className="space-y-3">
        <label className="text-md block font-medium text-slate-700 dark:text-slate-300">
          최대 참여 인원 (2~10명)
        </label>
        <Input
          type="number"
          min={2}
          max={10}
          placeholder="인원 수를 입력하세요."
          value={maxParticipants}
          // 숫자로 변환하여 전달
          onChange={(e) => onChange("maxParticipants", Number(e.target.value))}
          className="h-12 w-full sm:w-1/3"
        />
        <p className="text-xs text-slate-500">최소 2명에서 최대 10명까지 설정 가능합니다.</p>
      </div>
    </div>
  );
};

export default MeetingBasicInfo;
