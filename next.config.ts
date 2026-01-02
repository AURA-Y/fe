import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ECS 배포를 위한 핵심 설정
  output: "standalone",

  // (선택 사항) 이미지 최적화 기능을 Fargate에서 사용하려면
  // sharp 라이브러리가 필요할 수 있습니다.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 실제 서비스 시에는 LiveKit이나 S3 버킷 도메인으로 제한 권장
      },
    ],
  },

  // Backend API 및 LiveKit 프록시 설정 (Mixed Content 해결)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://aura-livekit-backend-alb-2058678622.ap-northeast-2.elb.amazonaws.com/api/:path*",
      },
      {
        source: "/restapi/:path*",
        destination:
          "http://aura-livekit-backend-alb-2058678622.ap-northeast-2.elb.amazonaws.com/restapi/:path*",
      },
      {
        source: "/livekit-ws/:path*",
        destination: "http://43.202.155.191:7880/:path*",
      },
    ];
  },

  // React 19 및 최신 환경 설정 유지
  reactStrictMode: true,
};

export default nextConfig;
