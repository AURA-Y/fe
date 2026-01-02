import { api } from "@/lib/utils";
import { CreateMeetingSchema } from "@/lib/schema/room/roomAIAgentSetting.schema";

export const createMeeting = async (formData: CreateMeetingSchema, files: File[]) => {
  const data = new FormData();
  data.append("voice", formData.voice);
  data.append("topic", formData.topic);
  data.append("goal", formData.goal);

  files.forEach((file) => {
    data.append("files", file);
  });

  // Note: Adjust the endpoint path as per your backend requirements
  const response = await api.post("/restapi/meeting/create", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
