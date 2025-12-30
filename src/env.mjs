import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * 서버 측 환경 변수 스키마
   * 서버에서만 사용 가능하며 클라이언트(브라우저)에는 노출되지 않습니다.
   */
  server: {
    // 예: LIVEKIT_API_SECRET: z.string().min(1),
  },

  /**
   * 클라이언트 측 환경 변수 스키마
   * 'NEXT_PUBLIC_' 접두사가 붙어야 하며 브라우저에서도 접근 가능합니다.
   */
  client: {
    // API 서버
    NEXT_PUBLIC_API_URL: z.string().url(),
    // LiveKit WebSocket 엔드포인트 (ws:// 또는 wss://)
    NEXT_PUBLIC_LIVEKIT_API_URL: z.string().refine(
      (url) => url.startsWith("ws://") || url.startsWith("wss://"),
      { message: "LiveKit URL must start with ws:// or wss://" }
    ),
  },

  /**
   * 런타임 환경 변수 매핑
   * Next.js 13+ App Router의 정적 분석을 위해 process.env를 명시적으로 매핑해야 합니다.
   */
  runtimeEnv: {
    NEXT_PUBLIC_LIVEKIT_API_URL: process.env.NEXT_PUBLIC_LIVEKIT_API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  /**
   * 'NEXT_PUBLIC_' 접두사가 없는 변수가 client에 있으면 에러를 발생시킵니다.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
