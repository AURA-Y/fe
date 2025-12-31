import "@livekit/components-styles";
import { env } from "@/env.mjs";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  Chat,
  LayoutContextProvider,
  useLayoutContext,
  useRoomContext,
} from "@livekit/components-react";
import { VideoPresets, RoomOptions, RoomEvent } from "livekit-client";
import { VideoGrid } from "./VideoGrid";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

// 부하 완화: 720p / 24fps, 단일 계층
const roomOptions: RoomOptions = {
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
    facingMode: "user",
    frameRate: 24,
  },
  publishDefaults: {
    videoCodec: "vp9",
    simulcast: false,
  },
  adaptiveStream: false,
  dynacast: false,
};

interface LiveKitViewProps {
  token: string;
  onDisconnected: () => void;
}

const RoomContent = () => {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext?.widget.state?.showChat;

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid />
        <div
          className={`h-full w-[320px] border-l border-[#333] bg-[#0e0e0e] ${
            showChat ? "block" : "hidden"
          }`}
        >
          <Chat style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
      <ControlBar controls={{ chat: true }} />
      <RoomAudioRenderer />
    </>
  );
};

// Local 마이크 무음 10초 지속 시 자동 음소거 (500ms interval, fftSize 256)
const AutoMuteOnSilence = () => {
  const room = useRoomContext();
  const timerRef = useRef<NodeJS.Timeout>();
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
  const mutedSpeakingToastId = "mic-muted-speaking";

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
  const debugSnapshotRef = useRef({
    level: 0,
    peak: 0,
    smoothed: 0,
    dynamicThreshold: 0,
    noiseFloor: 0,
    micEnabled: true,
    lkSpeaking: false,
    silenceStart: null as number | null,
    hasTrack: false,
  });

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = undefined;
    analyserRef.current = null;
    trackRef.current = null;
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
    const deviceId = mediaTrack.getSettings().deviceId || null;
    meterDeviceIdRef.current = deviceId;
    if (!deviceId) {
      stopMeter(); // deviceId를 알 수 없으면 보조 모니터를 열지 않음
    }
    prevMicEnabledRef.current = null;

    const stream = new MediaStream([mediaTrack]);
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    ctx.resume().catch(() => {});
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256; // 가볍게
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.fftSize);
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
      const micEnabled = room?.localParticipant.isMicrophoneEnabled ?? trackRef.current?.enabled ?? false;
      let willAutoMute = false;

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
        // 선택된 deviceId가 없으면 기본 디바이스를 열지 않아 다른 마이크를 건드리지 않음
        if (!meterDeviceIdRef.current) {
          return;
        }
        if (!meterAnalyserRef.current || !meterDataRef.current) {
          ensureMeterRef.current?.();
          return;
        } else {
          activeAnalyser = meterAnalyserRef.current;
          activeArray = meterDataRef.current;
        }
      }

      if (!activeAnalyser || !activeArray) return;

      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (meterCtxRef.current?.state === "suspended") {
        meterCtxRef.current.resume().catch(() => {});
      }

      activeAnalyser.getByteTimeDomainData(activeArray);
      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < activeArray.length; i++) {
        const normalized = (activeArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
        peak = Math.max(peak, Math.abs(normalized));
      }
      const rms = Math.sqrt(sumSquares / activeArray.length);
      const level = 0.6 * rms + 0.4 * peak;

      // 음소거/해제 전환 시 카운터와 스무딩을 초기화해 재시작 시 바로 10초를 보장
      if (prevMicEnabledRef.current !== micEnabled) {
        silenceStartRef.current = null;
        smoothed = 0;
        autoMuteToastRef.current = false;
        speakingWhileMutedToastRef.current = false;
      }
      prevMicEnabledRef.current = micEnabled;

      // 주변 노이즈 바닥값을 추정해 동적으로 임계값을 조정
      const noiseFloor = noiseFloorRef.current;
      const updatedNoiseFloor =
        level < noiseFloor * 3 ? noiseFloor * 0.9 + level * 0.1 : noiseFloor * 0.98 + level * 0.02;
      noiseFloorRef.current = Math.min(updatedNoiseFloor, 0.05);
      const dynamicThreshold = Math.max(baseThreshold, noiseFloorRef.current * 2 + 0.0005);

      // LiveKit이 판단한 발성 상태도 함께 고려
      const lkSpeaking = room?.localParticipant.isSpeaking ?? false;

      // 지수평활로 순간 노이즈 완화 + 하이퍼센시티브 발성 검출
      smoothed = 0.5 * level + 0.5 * smoothed;
      const isSpeaking = lkSpeaking || smoothed > dynamicThreshold || peak > dynamicThreshold * 3;
      const mutedLevel = Math.max(level, smoothed, peak);
      // 음소거 시 노이즈로 인한 오검출을 방지: 최소 0.05 이상 + 동적 임계치 2배
      const mutedSpeakingGate = Math.max(dynamicThreshold * 2, 0.05);
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
        }
      } else if (micEnabled) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current > maxSilenceMs) {
          if (!autoMuteToastRef.current) {
            toast.warning("10초 이상 말이 없어 마이크를 자동으로 껐습니다.", {
              description: "다시 말하려면 마이크를 켜주세요.",
            });
            autoMuteToastRef.current = true;
            speakingWhileMutedToastRef.current = false; // 이후 발성 시 안내를 다시 줄 수 있게 초기화
          }
          willAutoMute = true;
          room?.localParticipant.setMicrophoneEnabled(false);
          silenceStartRef.current = null;
        }
      } else {
        silenceStartRef.current = null;
        speakingWhileMutedToastRef.current = false;
        lastMutedSpeechRef.current = null;
      }

      if (micEnabled && !willAutoMute) {
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
        // 보조 모니터 스트림은 한번만 만들고 유지한다.
        const desiredDeviceId = meterDeviceIdRef.current;
        if (!desiredDeviceId) return; // 선택된 디바이스가 없으면 기본 디바이스를 열지 않음
        const currentDeviceId = meterStreamRef.current?.getAudioTracks()[0]?.getSettings().deviceId;
        if (meterStreamRef.current && desiredDeviceId === currentDeviceId) return;

        stopMeter();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: desiredDeviceId ? { deviceId: { exact: desiredDeviceId } } : true,
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
      } catch (e) {
        console.error("fallback meter init failed", e);
      }
    };

    ensureMeterRef.current = initMeter;
    initMeter();

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

    room.on(RoomEvent.LocalTrackPublished, onPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onUnpublished);

    return () => {
      room.off(RoomEvent.LocalTrackPublished, onPublished);
      room.off(RoomEvent.LocalTrackUnpublished, onUnpublished);
      cleanup();
      delete (window as any).__lkMuteDebug;
      stopMeter();
      ensureMeterRef.current = null;
    };
  }, [room]);

  return null;
};

const LiveKitView = ({ token, onDisconnected }: LiveKitViewProps) => {
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
        <RoomContent />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
};

export default LiveKitView;
