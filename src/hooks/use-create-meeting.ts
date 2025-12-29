import { useMutation } from "@tanstack/react-query";
import { createMeeting } from "@/lib/api/api.meeting";
import { CreateMeetingSchema } from "@/lib/schema/room/roomAIAgentSetting.schema";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: ({ data, files }: { data: CreateMeetingSchema; files: File[] }) =>
      createMeeting(data, files),
  });
};
