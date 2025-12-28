import { useMutation } from "@tanstack/react-query";
import { createMeeting } from "@/lib/api/meeting/api.meeting";
import { CreateMeetingSchema } from "@/lib/schema/createMeeting.schema";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: ({ data, files }: { data: CreateMeetingSchema; files: File[] }) =>
      createMeeting(data, files),
  });
};
