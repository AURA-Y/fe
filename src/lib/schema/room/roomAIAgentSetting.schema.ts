import { z } from "zod";

export const createMeetingSchema = z.object({
  voice: z.enum(["male", "female"], {
    message: "AI 음성을 선택해주세요.",
  }),
  topic: z
    .string()
    .min(1, "회의 주제를 입력해주세요.")
    .max(100, "회의 주제는 100자 이내로 입력해주세요."),
  goal: z
    .string()
    .min(1, "회의 목표를 입력해주세요.")
    .max(500, "회의 목표는 500자 이내로 입력해주세요."),
});

export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;
