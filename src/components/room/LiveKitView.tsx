"use client";

/**
 * [LiveKitView.tsx]
 * LiveKit 화상 회의의 메인 뷰 컴포넌트입니다.
 * Room 연결, 비디오 그리드(VideoGrid), 채팅(Chat), AI 검색 패널(AiSearchPanel),
 * 그리고 자동 음소거(AutoMuteOnSilence)와 같은 핵심 기능을 통합 관리합니다.
 */
import { useEffect, useState, useRef } from "react";
import "@livekit/components-styles";
import { env } from "@/env.mjs";
import {
  LiveKitRoom,
  LayoutContextProvider,
  RoomAudioRenderer,
  ControlBar,
  Chat,
  useLayoutContext,
  useRoomContext,
} from "@livekit/components-react";
import { VideoPresets, RoomOptions, RoomEvent, Track, LocalTrack } from "livekit-client";
import { VideoGrid } from "./VideoGrid";
import { toast } from "sonner";
import {
  computeLevel,
  createAnalyserFromTrack,
  detectCloseFace,
  loadFaceDetector,
  updateNoiseFloor,
} from "@/lib/utils/automute.utils";
import { useIsMaster } from "@/hooks/use-room-master";
import { getRoomInfoFromDB } from "@/lib/api/api.room";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateReportSummary, useDeleteReport } from "@/hooks/use-reports";
import { useDeleteRoomFromDB } from "@/hooks/use-create-meeting";
import { errorHandler } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";


// VP9 최고 화질 설정
const roomOptions: RoomOptions = {
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

// 적응형 스트림 비활성화 - 항상 최고 화질 수신
interface LiveKitViewProps {
  roomId: string;
  token: string;
  onDisconnected: () => void;
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
  address?: string;
  roadAddress?: string;
}

interface RouteInfo {
  origin: { lng: string; lat: string };
  destination: { lng: string; lat: string; name: string };
  distance: number;
  durationMs: number;
  directionUrl?: string;
}

interface AiMessage {
  id: string;
  text: string;
  results?: SearchResult[];
  route?: RouteInfo;
}

const AiSearchPanel = ({
  height,
  onOpenMap,
  onShareMap,
}: {
  height: number;
  onOpenMap?: (url?: string) => void;
  onShareMap?: (url?: string) => void;
}) => {
  const room = useRoomContext();
  const [messages, setMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    if (!room) return;

    const onData = (payload: Uint8Array) => {
      let parsed: any = null;
      try {
        const text = new TextDecoder().decode(payload);
        console.log('[AI Search Panel] Raw data received:', text);
        parsed = JSON.parse(text);
        console.log('[AI Search Panel] Parsed data:', parsed);
      } catch (e) {
        console.error('[AI Search Panel] Failed to parse data:', e);
        return;
      }

      if (parsed?.type !== "search_answer") {
        console.log('[AI Search Panel] Ignoring non-search data, type:', parsed?.type);
        return;
      }

      if (!parsed?.text) {
        console.log('[AI Search Panel] No text in search answer');
        return;
      }

      console.log('[AI Search Panel] Adding message with results:', parsed.results);
      console.log('[AI Search Panel] Route data:', parsed.route);

      const newMessage = {
        id: Date.now().toString() + Math.random(),
        text: parsed.text,
        results: Array.isArray(parsed.results) ? parsed.results : [],
        route: parsed.route || undefined,
      };

      setMessages((prev) => [...prev, newMessage]);

    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  return (
    <div
      className="overflow-y-auto border-b border-[#222] p-4 text-sm text-slate-200"
      style={{ height }}
    >
      <p className="mb-2 text-xs font-semibold text-slate-400">AI 검색 결과</p>
      {messages.length === 0 ? (
        <p className="text-xs text-slate-400">AI 검색 결과가 여기에 표시됩니다.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] p-3">
                <p className="whitespace-pre-wrap text-sm text-slate-100">{msg.text}</p>
              </div>
              {msg.results && msg.results.length > 0 && (
                <div className="space-y-2">
                  {msg.results.map((result, idx) => (
                    <a
                      key={`${msg.id}-${idx}`}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md bg-[#151515] border border-[#252525] p-3 hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-400 mb-1 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {result.content}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {msg.route?.directionUrl && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenMap?.(msg.route?.directionUrl)}
                    className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs text-slate-200 hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                  >
                    지도 열기
                  </button>
                  <button
                    type="button"
                    onClick={() => onShareMap?.(msg.route?.directionUrl)}
                    className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs text-slate-200 hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                  >
                    지도 탭 공유
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RoomContent = ({
  roomId,
  onDisconnected,
}: {
  roomId: string;
  onDisconnected: () => void;
}) => {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext?.widget.state?.showChat;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [panelHeight, setPanelHeight] = useState(160);
  const room = useRoomContext();
  const activeShareRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const minHeight = 80;
      const maxHeight = Math.max(120, rect.height - 160);
      const nextHeight = Math.min(maxHeight, Math.max(minHeight, e.clientY - rect.top));
      setPanelHeight(nextHeight);
    };

    const handleUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  const normalizeDirectionsUrl = (url: string) => {
    if (url.includes("/p/directions/")) {
      return url.replace("/p/directions/", "/v5/directions/");
    }
    return url;
  };

  const handleOpenMap = (url?: string) => {
    if (!url) return;
    window.open(normalizeDirectionsUrl(url), "_blank", "noopener,noreferrer");
  };

  const handleShareMap = async (url?: string) => {
    if (!room) return;
    if (!url) return;

    try {
      // 새 탭 열기 (사용자 제스처 내)
      const normalizedUrl = normalizeDirectionsUrl(url);
      window.open(normalizedUrl, "_blank", "noopener,noreferrer");

      // 브라우저 탭 공유 시작
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      activeShareRef.current = videoTrack;
      await room.localParticipant.publishTrack(videoTrack, {
        source: Track.Source.ScreenShare,
        name: "navigation-map-tab",
        simulcast: false,
      });

      videoTrack.addEventListener("ended", async () => {
        const pub = room.localParticipant.getTrackPublications().find(
          (p) => p.trackSid === videoTrack.id || p.track?.mediaStreamTrack === videoTrack
        );
        if (pub?.track) {
          await room.localParticipant.unpublishTrack(pub.track as LocalTrack);
        }
        activeShareRef.current = null;
      });
    } catch (error) {
      console.error("[Navigation Share] Tab share failed:", error);
    }
  };

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid />
        <div
          className={`h-full w-[320px] border-l border-[#333] bg-[#0e0e0e] ${
            showChat ? "block" : "hidden"
          }`}
        >
          <div className="flex h-full flex-col" ref={sidebarRef}>
            <AiSearchPanel
              height={panelHeight}
              onOpenMap={handleOpenMap}
              onShareMap={handleShareMap}
            />
            <div
              className="h-2 cursor-row-resize bg-[#111] hover:bg-[#1a1a1a]"
              onMouseDown={() => {
                isDraggingRef.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
              title="드래그하여 높이 조절"
            />
            <div className="min-h-0 flex-1">
              <Chat style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center [&_.lk-control-bar]:border-t-0">
        <div className="flex items-center">
          <ControlBar controls={{ chat: true, leave: false }} />
          <CustomLeaveButton roomId={roomId} onDisconnected={onDisconnected} />
        </div>
      </div>
      <RoomAudioRenderer />

    </>
  );
};

// Local 마이크 무음 10초 지속 시 자동 음소거 (500ms interval, fftSize 256)
const AutoMuteOnSilence = () => {
  const room = useRoomContext();
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoMuteToastRef = useRef(false);
  const speakingWhileMutedToastRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const prevMicEnabledRef = useRef<boolean | null>(null);
  const noiseFloorRef = useRef(0.002); // 현재 환경의 무음 노이즈 바닥값을 추정
  const meterCtxRef = useRef<AudioContext | null>(null);
  const meterAnalyserRef = useRef<AnalyserNode | null>(null);
  const meterStreamRef = useRef<MediaStream | null>(null);
  const meterDataRef = useRef<Uint8Array | null>(null);
  const meterDeviceIdRef = useRef<string | null>(null);
  const ensureMeterRef = useRef<(() => Promise<void>) | null>(null);
  const lastMutedSpeechRef = useRef<number | null>(null);
  const mutedSpeakingToastCountRef = useRef(0);
  const faceDetectorRef = useRef<any | null>(null);
  const faceDetectorLoadingRef = useRef<Promise<any | null> | null>(null);
  const faceDetectionInFlightRef = useRef<Promise<void> | null>(null);
  const analysisTrackRef = useRef<MediaStreamTrack | null>(null);
  const faceDetectionFailCountRef = useRef(0);
  const mutedSpeakingToastId = "mic-muted-speaking";

  const resolveActiveMicDeviceId = () => {
    return (
      room?.getActiveDevice("audioinput") ||
      meterDeviceIdRef.current ||
      trackRef.current?.getSettings().deviceId ||
      null
    );
  };

  const getLocalCameraTrack = () => {
    const cameraPub = room?.localParticipant.getTrackPublication(Track.Source.Camera);
    const mediaTrack = cameraPub?.track?.mediaStreamTrack as MediaStreamTrack | undefined;
    return mediaTrack ?? null;
  };

  const stopMeter = () => {
    if (meterStreamRef.current) {
      meterStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    meterStreamRef.current = null;
    meterAnalyserRef.current = null;
    if (meterCtxRef.current && meterCtxRef.current.state !== "closed") {
      meterCtxRef.current.close();
    }
    meterCtxRef.current = null;
    meterDataRef.current = null;
  };

  const stopAnalysisTrack = () => {
    if (analysisTrackRef.current) {
      analysisTrackRef.current.stop();
    }
    analysisTrackRef.current = null;
  };
  const debugSnapshotRef = useRef({
    level: 0,
    peak: 0,
    smoothed: 0,
    dynamicThreshold: 0,
    mutedSpeakingGate: 0,
    noiseFloor: 0,
    micEnabled: true,
    lkSpeaking: false,
    silenceStart: null as number | null,
    hasTrack: false,
    publicationStates: [] as any[],
  });

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = undefined;
    analyserRef.current = null;
    trackRef.current = null;
    stopAnalysisTrack();
    silenceStartRef.current = null;
    prevMicEnabledRef.current = null;
    noiseFloorRef.current = 0.002;
    autoMuteToastRef.current = false;
    speakingWhileMutedToastRef.current = false;
    lastMutedSpeechRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
  };

  const startAnalyser = (mediaTrack: MediaStreamTrack) => {
    if (trackRef.current?.id === mediaTrack.id) return;
    cleanup();
    trackRef.current = mediaTrack;
    const deviceId =
      mediaTrack.getSettings().deviceId || room?.getActiveDevice("audioinput") || null;
    meterDeviceIdRef.current = deviceId;
    if (!deviceId) {
      stopMeter(); // deviceId를 알 수 없으면 보조 모니터를 열지 않음
    }
    prevMicEnabledRef.current = null;

    stopAnalysisTrack();
    const { analyser, ctx, analysisTrack, dataArray } = createAnalyserFromTrack(mediaTrack);
    ctx.resume().catch(() => {});
    audioCtxRef.current = ctx;
    analysisTrackRef.current = analysisTrack;
    analyserRef.current = analyser;
    const intervalMs = 300;
    const baseThreshold = 0.0005; // 더 낮춰 작은 음성도 발성으로 인식
    const maxSilenceMs = 10_000;
    let smoothed = 0; // 지수평활로 노이즈 완화
    silenceStartRef.current = null;

    timerRef.current = setInterval(() => {
      const publications = Array.from(room?.localParticipant.audioTrackPublications.values() ?? []);
      const publicationStates = publications.map((p) => ({
        trackSid: p.trackSid,
        source: p.source,
        muted: p.isMuted,
      }));
      const micEnabled =
        room?.localParticipant.isMicrophoneEnabled ?? trackRef.current?.enabled ?? false;

      // 디바이스가 바뀌었으면 보조 모니터를 현재 트랙의 deviceId로 재설정
      const currentTrackDeviceId = trackRef.current?.getSettings().deviceId || null;
      if (currentTrackDeviceId !== meterDeviceIdRef.current) {
        meterDeviceIdRef.current = currentTrackDeviceId;
        stopMeter();
        if (!currentTrackDeviceId) {
          // 어떤 디바이스도 알 수 없으면 보조 모니터를 열지 않는다
          return;
        }
      }

      // mic이 켜져 있으면 보조 모니터 스트림을 중지해 크롬에 추가 마이크로 표시되지 않도록 함
      if (micEnabled && meterStreamRef.current) {
        stopMeter();
      }

      // 우선 순위: 발행 중인 트랙 분석 -> 보조 모니터(별도 getUserMedia) 분석
      let activeAnalyser: AnalyserNode | null = analyserRef.current;
      let activeArray: Uint8Array | null = dataArray;

      if (micEnabled === false) {
        // 음소거 상태에서도 기존 트랙의 analyser만 사용해 추가 getUserMedia로 기본 장치를 열지 않는다
        activeAnalyser = analyserRef.current;
        activeArray = dataArray;
      }

      if (!activeAnalyser || !activeArray) return;

      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (meterCtxRef.current?.state === "suspended") {
        meterCtxRef.current.resume().catch(() => {});
      }

      activeAnalyser.getByteTimeDomainData(activeArray as any);
      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < activeArray.length; i++) {
        const normalized = (activeArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
        peak = Math.max(peak, Math.abs(normalized));
      }
      const { level, rms } = computeLevel(activeArray as any);

      // 음소거/해제 전환 시 카운터와 스무딩을 초기화해 재시작 시 바로 10초를 보장
      if (prevMicEnabledRef.current !== micEnabled) {
        silenceStartRef.current = null;
        smoothed = 0;
        autoMuteToastRef.current = false;
        speakingWhileMutedToastRef.current = false;
        mutedSpeakingToastCountRef.current = 0;
        faceDetectionFailCountRef.current = 0;
      }
      prevMicEnabledRef.current = micEnabled;

      // 주변 노이즈 바닥값을 추정해 동적으로 임계값을 조정
      const noiseFloor = updateNoiseFloor(noiseFloorRef.current, level);
      noiseFloorRef.current = noiseFloor;
      const dynamicThreshold = Math.max(baseThreshold, noiseFloorRef.current * 2 + 0.0005);

      // LiveKit이 판단한 발성 상태도 함께 고려
      const lkSpeaking = room?.localParticipant.isSpeaking ?? false;

      // 지수평활로 순간 노이즈 완화 + 하이퍼센시티브 발성 검출
      smoothed = 0.5 * level + 0.5 * smoothed;
      const isSpeaking = lkSpeaking || smoothed > dynamicThreshold || peak > dynamicThreshold * 3;
      const mutedLevel = Math.max(level, smoothed, peak);
      // 음소거 시 노이즈로 인한 오검출을 방지: 최소 0.02 이상 + 동적 임계치 1.5배 (너무 높지 않게)
      const mutedSpeakingGate = Math.max(dynamicThreshold * 1.5, 0.02);
      const speakingWhileMutedDetected = !micEnabled && mutedLevel > mutedSpeakingGate;

      debugSnapshotRef.current = {
        level,
        peak,
        smoothed,
        dynamicThreshold,
        mutedSpeakingGate,
        noiseFloor: noiseFloorRef.current,
        micEnabled,
        lkSpeaking,
        silenceStart: silenceStartRef.current,
        hasTrack: !!trackRef.current,
        publicationStates,
      };

      const now = Date.now();

      if (isSpeaking) {
        silenceStartRef.current = null;
        if (
          speakingWhileMutedDetected &&
          mutedSpeakingToastCountRef.current < 3 &&
          (!speakingWhileMutedToastRef.current ||
            !lastMutedSpeechRef.current ||
            now - lastMutedSpeechRef.current > 5000)
        ) {
          toast.warning("마이크가 꺼진 상태입니다.", {
            description: "다시 말하려면 마이크를 켜주세요.",
            id: mutedSpeakingToastId,
            duration: 4000,
          });
          speakingWhileMutedToastRef.current = true;
          lastMutedSpeechRef.current = now;
          mutedSpeakingToastCountRef.current += 1;
        }
      } else if (micEnabled) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current > maxSilenceMs) {
          if (!faceDetectionInFlightRef.current) {
            faceDetectionInFlightRef.current = (async () => {
              const hasCloseFace = await detectCloseFace(
                getLocalCameraTrack,
                faceDetectorRef,
                faceDetectorLoadingRef
              );
              if (hasCloseFace === true) {
                silenceStartRef.current = Date.now();
                autoMuteToastRef.current = false;
                speakingWhileMutedToastRef.current = false;
                faceDetectionFailCountRef.current = 0;
                return;
              }
              if (hasCloseFace === false) {
                toast.warning("10초 이상 말이 없어 마이크를 자동으로 껐습니다.", {
                  description: "다시 말하려면 마이크를 켜주세요.",
                });
                autoMuteToastRef.current = true;
                speakingWhileMutedToastRef.current = false; // 이후 발성 시 안내를 다시 줄 수 있게 초기화
                room?.localParticipant.setMicrophoneEnabled(false);
                silenceStartRef.current = null;
                faceDetectionFailCountRef.current = 0;
              }
              if (hasCloseFace === null) {
                faceDetectionFailCountRef.current += 1;
                if (faceDetectionFailCountRef.current >= 3) {
                  toast.warning("10초 이상 말이 없어 마이크를 자동으로 껐습니다.", {
                    description: "다시 말하려면 마이크를 켜주세요.",
                  });
                  autoMuteToastRef.current = true;
                  speakingWhileMutedToastRef.current = false;
                  room?.localParticipant.setMicrophoneEnabled(false);
                  silenceStartRef.current = null;
                  faceDetectionFailCountRef.current = 0;
                } else {
                  // 감지 불가 시 보수적으로 음소거를 보류하고 타이머를 다시 시작
                  silenceStartRef.current = Date.now();
                  autoMuteToastRef.current = false;
                  speakingWhileMutedToastRef.current = false;
                }
              }
            })().finally(() => {
              faceDetectionInFlightRef.current = null;
            });
          }
          return;
        }
      } else {
        silenceStartRef.current = null;
        speakingWhileMutedToastRef.current = false;
        lastMutedSpeechRef.current = null;
      }

      if (micEnabled) {
        autoMuteToastRef.current = false;
        speakingWhileMutedToastRef.current = false;
        lastMutedSpeechRef.current = null;
      }
    }, intervalMs);
  };

  useEffect(() => {
    let cancelled = false;

    const initMeter = async () => {
      try {
        const desiredDeviceId = resolveActiveMicDeviceId();
        if (!desiredDeviceId) return; // 장치가 없으면 보조 스트림을 열지 않음
        const currentDeviceId = meterStreamRef.current?.getAudioTracks()[0]?.getSettings().deviceId;
        if (meterStreamRef.current && desiredDeviceId === currentDeviceId) return;

        stopMeter();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: desiredDeviceId } },
          video: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        meterCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        meterStreamRef.current = stream;
        meterAnalyserRef.current = analyser;
        meterDataRef.current = new Uint8Array(analyser.fftSize);
        const resolvedDeviceId = stream.getAudioTracks()[0]?.getSettings().deviceId;
        if (resolvedDeviceId) {
          meterDeviceIdRef.current = resolvedDeviceId;
        }
      } catch (e) {
        console.error("fallback meter init failed", e);
      }
    };

    ensureMeterRef.current = initMeter;

    if (!room) return;

    (window as any).__lkMuteDebug = () => ({
      identity: room?.localParticipant.identity,
      audioTracks: Array.from(room?.localParticipant.audioTrackPublications.values()).map((p) => ({
        source: p.source,
        muted: p.isMuted,
        subscribed: p.isSubscribed,
        trackSid: p.trackSid,
      })),
      ...debugSnapshotRef.current,
    });

    const findTrackAndStart = () => {
      const publications = Array.from(room.localParticipant.audioTrackPublications.values());
      const mediaTrack = publications.find((p) => p.track?.mediaStreamTrack)?.track
        ?.mediaStreamTrack as MediaStreamTrack | undefined;
      if (mediaTrack) startAnalyser(mediaTrack);
    };

    findTrackAndStart();

    const onPublished = () => findTrackAndStart();
    const onUnpublished = () => cleanup();
    const onActiveDeviceChanged = (deviceKind: MediaDeviceKind, deviceId: string) => {
      if (deviceKind !== "audioinput") return;
      meterDeviceIdRef.current = deviceId || resolveActiveMicDeviceId();
      stopMeter();
      findTrackAndStart();
    };

    room.on(RoomEvent.LocalTrackPublished, onPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onUnpublished);
    room.on(RoomEvent.ActiveDeviceChanged, onActiveDeviceChanged);

    return () => {
      room.off(RoomEvent.LocalTrackPublished, onPublished);
      room.off(RoomEvent.LocalTrackUnpublished, onUnpublished);
      room.off(RoomEvent.ActiveDeviceChanged, onActiveDeviceChanged);
      cancelled = true;
      cleanup();
      delete (window as any).__lkMuteDebug;
      stopMeter();
      ensureMeterRef.current = null;
    };
  }, [room]);

  return null;
};

const CustomLeaveButton = ({
  roomId,
  onDisconnected,
}: {
  roomId: string;
  onDisconnected: () => void;
}) => {
  const { isMaster, isLoading } = useIsMaster(roomId);
  const room = useRoomContext();
  const [modalStep, setModalStep] = useState<null | "summary" | "confirm">(null);
  const queryClient = useQueryClient();
  const updateSummaryMutation = useUpdateReportSummary();
  const deleteReportMutation = useDeleteReport();
  const deleteRoomMutation = useDeleteRoomFromDB();

  const handleSummary = async () => {
    try {
      // roomId로 reportId 조회
      const roomInfo = await getRoomInfoFromDB(roomId);
      if (!roomInfo.reportId) {
        toast.error("회의록 정보를 찾을 수 없습니다.");
        return;
      }

      // 회의록 요약 저장 + roomId 전달하여 attendees 닉네임 변환
      await updateSummaryMutation.mutateAsync({
        reportId: roomInfo.reportId,
        summary: "(구현 예정) 회의록 요약을 여기에 넣을것입니다.",
        roomId, // roomId 추가: userId -> 닉네임 변환에 사용
      });

      // 회의방 삭제
      await deleteRoomMutation.mutateAsync(roomId);

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });

      // 회의방에서 나가기
      room?.disconnect();
      onDisconnected();
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleEndMeeting = async () => {
    try {
      // roomId로 reportId 조회
      const roomInfo = await getRoomInfoFromDB(roomId);

      // reportId가 있으면 삭제 (실패해도 계속 진행)
      if (roomInfo.reportId) {
        try {
          await deleteReportMutation.mutateAsync(roomInfo.reportId);
        } catch (reportError) {
          // 회의록 삭제 실패해도 계속 진행
        }
      }

      // 회의방 삭제
      await deleteRoomMutation.mutateAsync(roomId);

      // React Query 캐시 무효화 - 홈페이지에서 최신 데이터 로드하도록
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });

      room?.disconnect();
      onDisconnected();
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleLeaveMeeting = () => {
    room?.disconnect();
    onDisconnected();
  };

  const handleLeaveClick = () => {
    if (isMaster) {
      setModalStep("summary");
    } else {
      handleLeaveMeeting();
    }
  };

  return (
    <>
      {/* 요약 모달 */}
      <ConfirmDialog
        isOpen={modalStep === "summary"}
        onOpenChange={(open) => !open && setModalStep(null)}
        title="회의록 요약"
        description="회의록을 요약하시겠습니까?"
        buttons={[
          {
            label: "요약",
            onClick: handleSummary,
            className: "flex items-center justify-center rounded-full bg-blue-600 px-6 font-bold text-white hover:bg-blue-700",
          },
          {
            label: "회의 나가기",
            onClick: () => setModalStep("confirm"),
            variant: "outline",
            className: "flex items-center justify-center rounded-full px-6 font-bold",
          },
        ]}
      />

      {/* 회의 종료 확인 모달 */}
      <ConfirmDialog
        isOpen={modalStep === "confirm"}
        onOpenChange={(open) => !open && setModalStep(null)}
        title="회의 종료"
        description="회의를 종료하시겠습니까?"
        buttons={[
          {
            label: "회의 종료",
            onClick: handleEndMeeting,
            className: "flex items-center justify-center rounded-full bg-red-600 px-6 font-bold text-white hover:bg-red-700",
          },
          {
            label: "회의 나가기",
            onClick: handleLeaveMeeting,
            variant: "outline",
            className: "flex items-center justify-center rounded-full px-6 font-bold",
          },
        ]}
      />

      {/* 나가기 버튼 */}
      <button
        onClick={handleLeaveClick}
        className="lk-button !border !border-red-600 font-bold !text-red-600"
        disabled={isLoading}
      >
        Leave
      </button>
    </>
  );
};

/**
 * [메인 컴포넌트: LiveKitView]
 * LiveKit의 LiveKitRoom 컨텍스트를 제공하는 최상위 래퍼입니다.
 * - 토큰(token)과 서버 URL(serverUrl)을 사용하여 Room에 연결합니다.
 * - 연결 상태에 따라 하위 컴포넌트(RoomContent, AutoMuteOnSilence 등)를 렌더링합니다.
 */
const LiveKitView = ({ roomId, token, onDisconnected }: LiveKitViewProps) => {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={env.NEXT_PUBLIC_LIVEKIT_URL}
      options={roomOptions}
      onDisconnected={onDisconnected}
      onError={(e) => console.error(e)}
      data-lk-theme="default"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AutoMuteOnSilence />
      <LayoutContextProvider>
        <RoomContent roomId={roomId} onDisconnected={onDisconnected} />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
};

export default LiveKitView;
