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

// 로그인 스키마
const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});
// 회원가입 스키마
const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
    nickname: z.string().min(2, "닉네임은 최소 2자 이상이어야 합니다"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });
// TypeScript 타입 추출
type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;
type CreateRoomFormValues = z.infer<typeof createRoomSchema>;
export { loginSchema, signupSchema, joinRoomSchema, createRoomSchema };

export type { LoginFormValues, SignupFormValues, JoinRoomFormValues, CreateRoomFormValues };
