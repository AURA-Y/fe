import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false, // WebSocket 연결 안정성을 위해 비활성화
  output: "standalone", // 핵심: 빌드 결과물을 최소화하여 standalone 폴더에 생성
};

export default nextConfig;
