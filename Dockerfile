# 1. 의존성 설치 단계 (Deps Stage)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 빌드 단계 (Builder Stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# [Engineering Point] 빌드 시점에 환경 변수를 전달받아 env.mjs 검증 통과
ARG NEXT_PUBLIC_LIVEKIT_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# env.mjs가 빌드 타임 검증을 하므로, 필요한 환경변수가 있다면 여기서 전달 가능
RUN npm run build

# 3. 실행 단계 (Runner Stage)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# 보안을 위해 비루트(non-root) 사용자 사용 권장
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 폴더의 결과물만 복사 (압도적인 용량 절감)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# standalone 모드에서는 'node server.js'로 실행합니다.
CMD ["node", "server.js"]