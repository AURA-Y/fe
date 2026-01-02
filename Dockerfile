# 1. Base image 설정
FROM node:20-alpine AS base

# 2. Dependencies 단계: 의존성 설치
FROM base AS deps
# Alpine 리눅스에서 native 모듈 빌드에 필요한 라이브러리 추가
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 의존성 설치를 위해 package 파일들 복사
COPY package.json package-lock.json* ./
# CI 환경에 최적화된 clean install 수행
RUN npm ci

# 3. Builder 단계: 소스 복사 및 Next.js 빌드
FROM base AS builder
WORKDIR /app
# deps 단계에서 설치된 node_modules 가져오기
COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY . .

# Add build-time environment variables
ENV NEXT_PUBLIC_API_URL="https://aura.ai.kr"
ENV NEXT_PUBLIC_LIVEKIT_API_URL="https://aura.ai.kr"
ENV NEXT_PUBLIC_LIVEKIT_URL="wss://aura.ai.kr/livekit-ws"

# Create .env.production file for Next.js to read during build
RUN echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.local && \
    echo "NEXT_PUBLIC_LIVEKIT_API_URL=${NEXT_PUBLIC_LIVEKIT_API_URL}" >> .env.local && \
    echo "NEXT_PUBLIC_LIVEKIT_URL=${NEXT_PUBLIC_LIVEKIT_URL}" >> .env.local && \
    echo "SKIP_ENV_VALIDATION=1" >> .env.local

# Next.js standalone 빌드 수행
RUN npm run build

# 4. Runner 단계: 실제 운영 이미지 구성
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# ECS Fargate에서 외부 트래픽을 허용하기 위해 반드시 0.0.0.0으로 설정
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# 보안을 위해 root가 아닌 별도 사용자 계정 생성 및 사용
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 중 실행에 필요한 파일만 선별적으로 복사
COPY --from=builder /app/public ./public
# standalone 폴더 내부로 static 파일들을 복사해야 정상 작동함
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# standalone 모드에서 생성된 server.js 실행
CMD ["node", "server.js"]