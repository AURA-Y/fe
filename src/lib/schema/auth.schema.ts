import z from "zod";

const commonUserSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력해주세요.")
  .max(12, "닉네임은 12글자 이내여야 합니다.")
  .regex(/^[a-zA-Z0-9가-힣]+$/, "특수문자는 사용할 수 없습니다.");

const joinRoomSchema = z.object({
  room: z.string().trim().min(1, "방 이름을 입력해주세요."),
  user: commonUserSchema,
});

const createRoomSchema = z.object({
  user: commonUserSchema,
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export { joinRoomSchema, createRoomSchema };

export type { JoinRoomFormValues, CreateRoomFormValues };
