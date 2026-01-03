
import { VideoPresets, RoomOptions } from "livekit-client";

// VP9 최고 화질 설정
/**
 * [설정값: roomOptions]
 * LiveKit Room 연결 시 사용할 초기 옵션입니다.
 * - 코덱: VP9 (고효율 압축)
 * - 해상도: 1080p, 30fps
 * - 비트레이트: 최대 5Mbps (고화질)
 * - Simulcast: 비활성화 (항상 원본 화질 전송)
 */
export const roomOptions: RoomOptions = {
  videoCaptureDefaults: {
    resolution: VideoPresets.h1080.resolution,
    facingMode: "user",
    frameRate: 30,
  },
  publishDefaults: {
    videoCodec: "vp9",
    // 시뮬캐스트 비활성화 - 항상 최고 화질 전송
    simulcast: false,
    // VP9 최고 화질 비트레이트 설정 (최대 5Mbps)
    videoEncoding: {
      maxBitrate: 5_000_000,
      maxFramerate: 30,
      priority: "high",
    },
    // VP9 SVC (Scalable Video Coding) - 더 효율적인 고화질
    scalabilityMode: "L1T3",
    // 화질 저하 방지
    degradationPreference: "maintain-resolution",
  },
  adaptiveStream: false,
  dynacast: false,
};
