import z from "zod";

const lobbySchema = z.object({
  room: z.string().trim().min(1, "방 이름을 입력해주세요.").max(50, "50글자 이내로 입력하세요."),
  user: z
    .string()
    .trim()
    .min(1, "닉네임을 입력해주세요.")
    .max(12, "닉네임은 12글자 이내여야 합니다.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "특수문자는 사용할 수 없습니다."),
});

type LobbyFormValues = z.infer<typeof lobbySchema>; // 이거 의미 뭐지?

export { lobbySchema, type LobbyFormValues };
