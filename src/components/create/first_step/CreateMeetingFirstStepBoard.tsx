import { Meeting } from "@/mock/mockData";
import { Card } from "@/components/ui/card";
import SingleMeeting from "./SingleMeeting";
import CreateFooterActions from "../CreateFooterActions";

interface CreateMeetingFirstStepBoardProps {
  groupedMeetings: Record<string, Meeting[]>;
  getMeetingState: (meeting: Meeting) => { isAll: boolean; isPartial: boolean; isNone: boolean };
  toggleMeetingAll: (meeting: Meeting) => void;
  setViewingMeeting: (meeting: Meeting) => void;
  totalSelectedCount: number;
  onClick: () => void;
}

const CreateMeetingFirstStepBoard = ({
  groupedMeetings,
  getMeetingState,
  toggleMeetingAll,
  setViewingMeeting,
  totalSelectedCount,
  onClick,
}: CreateMeetingFirstStepBoardProps) => {
  return (
    <Card className="max-h-[800px] border-slate-200 bg-white p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <h2 className="text-lg font-semibold">지난 회의 목록</h2>
      </div>

      <div className="px-6 py-3">
        <div className="space-y-8">
          {Object.entries(groupedMeetings).map(([month, meetings]) => (
            <div key={month} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{month}</h3>
              <div className="space-y-2">
                {meetings.map((meeting) => {
                  const { isAll, isPartial } = getMeetingState(meeting);
                  return (
                    <SingleMeeting
                      key={meeting.id}
                      meeting={meeting}
                      isAll={isAll}
                      isPartial={isPartial}
                      toggleMeetingAll={toggleMeetingAll}
                      setViewingMeeting={setViewingMeeting}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateFooterActions totalSelectedCount={totalSelectedCount} onClick={onClick} />
    </Card>
  );
};

export default CreateMeetingFirstStepBoard;
