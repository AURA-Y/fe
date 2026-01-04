"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { Track, LocalTrack } from "livekit-client";
import { env } from "@/env.mjs";

interface RouteInfo {
  origin: { lng: string; lat: string };
  destination: { lng: string; lat: string; name: string };
  distance: number;
  durationMs: number;
  directionUrl?: string;
}

interface NavigationMapShareProps {
  route: RouteInfo;
  onClose?: () => void;
}

export const NavigationMapShare = ({ route, onClose }: NavigationMapShareProps) => {
  const room = useRoomContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const isStartingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const startScreenShare = async () => {
      if (!room || !canvasRef.current) return;
      if (isStartingRef.current || isSharing) return;
      isStartingRef.current = true;

      try {
        setIsSharing(true);
        console.log('[Navigation Share] Starting screen share for route:', route);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[Navigation Share] Failed to get canvas context');
          return;
        }

        // Canvas 크기 설정 (HD 해상도)
        canvas.width = 1280;
        canvas.height = 720;

        // Naver Directions URL 생성
        const rawDirectionsUrl = route.directionUrl ||
          `https://map.naver.com/v5/directions/${route.origin.lat},${route.origin.lng}/%ED%98%84%EC%9E%AC%EC%9C%84%EC%B9%98/${route.destination.lat},${route.destination.lng}/${encodeURIComponent(route.destination.name)}`;
        const directionsUrl = rawDirectionsUrl.includes('/p/directions/')
          ? rawDirectionsUrl.replace('/p/directions/', '/v5/directions/')
          : rawDirectionsUrl;

        console.log('[Navigation Share] Directions URL:', directionsUrl);

        const mapFrame = {
          x: 52,
          y: 472,
          width: canvas.width - 104,
          height: 196,
        };

        const loadMapImage = async () => {
          try {
            const mapUrl = new URL(`${env.NEXT_PUBLIC_API_URL}/map/static`);
            mapUrl.searchParams.set('originLng', route.origin.lng);
            mapUrl.searchParams.set('originLat', route.origin.lat);
            mapUrl.searchParams.set('destLng', route.destination.lng);
            mapUrl.searchParams.set('destLat', route.destination.lat);
            mapUrl.searchParams.set('width', String(mapFrame.width));
            mapUrl.searchParams.set('height', String(mapFrame.height));

            const response = await fetch(mapUrl.toString());
            if (!response.ok) {
              console.warn('[Navigation Share] Static map fetch failed:', response.status);
              return;
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              mapImageRef.current = img;
              URL.revokeObjectURL(objectUrl);
            };
            img.src = objectUrl;
          } catch (error) {
            console.warn('[Navigation Share] Static map fetch error:', error);
          }
        };

        void loadMapImage();

        // Canvas에 배경 및 정보 그리기
        const drawInfo = () => {
          // 배경
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 제목
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🗺️ 길찾기', canvas.width / 2, 80);

          // 목적지
          ctx.font = '36px Arial';
          ctx.fillStyle = '#60a5fa';
          ctx.fillText(route.destination.name, canvas.width / 2, 150);

          // 거리 및 시간
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.ceil(route.durationMs / 60000);

          ctx.font = '32px Arial';
          ctx.fillStyle = '#a3a3a3';
          ctx.fillText(`거리: ${distanceKm}km`, canvas.width / 2, 220);
          ctx.fillText(`예상 시간: ${durationMin}분`, canvas.width / 2, 270);

          // 안내 메시지
          ctx.font = '24px Arial';
          ctx.fillStyle = '#71717a';
          ctx.fillText('채팅 창에 보이는 링크로 경로를 확인하세요', canvas.width / 2, 350);
        };

        const drawLoop = () => {
          drawInfo();
          animationRef.current = window.requestAnimationFrame(drawLoop);
        };
        drawLoop();

        // 첫 프레임이 그려진 뒤 캡처 시작
        await new Promise(resolve => window.requestAnimationFrame(() => resolve(null)));

        if (trackRef.current && streamRef.current) {
          console.log('[Navigation Share] Reusing existing screen share track');
          return;
        }

        // Canvas 스트림 생성 (30fps)
        const stream = canvas.captureStream(30);
        const videoTrack = stream.getVideoTracks()[0];

        if (!videoTrack) {
          console.error('[Navigation Share] No video track in stream');
          return;
        }

        // 트랙 설정 확인
        const settings = videoTrack.getSettings();
        console.log('[Navigation Share] Track settings:', settings);

        streamRef.current = stream;
        trackRef.current = videoTrack;

        console.log('[Navigation Share] Publishing track to LiveKit...');

        // LiveKit으로 화면 공유 트랙 발행 (명시적 크기 지정)
        await room.localParticipant.publishTrack(videoTrack, {
          source: Track.Source.ScreenShare,
          name: 'navigation-map',
          videoEncoding: {
            maxBitrate: 3_000_000,
            maxFramerate: 30,
          },
          simulcast: false,

        });

        console.log('[Navigation Share] Screen share track published successfully');

      } catch (error) {
        console.error('[Navigation Share] Failed to start screen share:', error);
        setIsSharing(false);
      } finally {
        isStartingRef.current = false;
      }
    };

    const stopScreenShare = async () => {
      if (!room) return;

      try {
        console.log('[Navigation Share] Stopping screen share...');

        // 트랙 정지
        if (trackRef.current) {
          trackRef.current.stop();
          trackRef.current = null;
        }

        if (animationRef.current !== null) {
          window.cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        mapImageRef.current = null;

        // 스트림 정지
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // LiveKit 트랙 언퍼블리시
        const screenShareTrack = room.localParticipant.getTrackPublications().find(
          pub => pub.source === Track.Source.ScreenShare
        );

        if (screenShareTrack) {
          await room.localParticipant.unpublishTrack(screenShareTrack.track! as LocalTrack);
          console.log('[Navigation Share] Screen share track unpublished');
        }

        setIsSharing(false);
        onClose?.();
      } catch (error) {
        console.error('[Navigation Share] Failed to stop screen share:', error);
      }
    };

    startScreenShare();

    // Cleanup: 화면 공유는 유지하고, 페이지 언마운트 시 외부에서 처리
    return () => {};
  }, [room, route, onClose]);

  return (
    <div className="pointer-events-none fixed left-2 top-2 h-[1px] w-[1px] opacity-[0.01]">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
      />
    </div>
  );
};
