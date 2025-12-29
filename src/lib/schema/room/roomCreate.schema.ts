import z from "zod";

const commonUserSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력해주세요.")
  .max(20, "닉네임은 20글자 이내여야 합니다.")
  .regex(/^[a-zA-Z0-9가-힣_-]+$/, "'-'와 '_'외의 특수문자는 사용할 수 없습니다.");

const joinRoomSchema = z.object({
  room: z.string().trim().min(1, "방 이름을 입력해주세요."),
  user: commonUserSchema,
});

// CreateRoomFormValues : 클라이언트가 방 생성 시, 검사 zod 부분
const createRoomSchema = z.object({
  userName: commonUserSchema,
  roomTitle: z.string().trim().max(30, "방 제목을 30자 이내로 입력해주세요.").optional(),
  description: z.string().trim().max(100, "설명은 100자 이내로 입력하세요.").optional(),
  maxParticipants: z
    .number()
    .int()
    .min(2, "최소 2명 이상이여야 합니다.")
    .max(10, "최대 10명까지 가능합니다.")
    .default(10)
    .optional(),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export { joinRoomSchema, createRoomSchema };

export type { JoinRoomFormValues, CreateRoomFormValues };
