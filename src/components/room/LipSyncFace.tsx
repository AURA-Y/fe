"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLottie } from "lottie-react";
import { computeLevel, createAnalyserFromTrack } from "@/lib/utils/automute.utils";

interface LipSyncFaceProps {
  name: string;
  track: MediaStreamTrack | null | undefined;
}

const useMouthOpen = (track: MediaStreamTrack | null | undefined) => {
  const [mouthOpen, setMouthOpen] = useState(0);

  useEffect(() => {
    if (!track) {
      setMouthOpen(0);
      return;
    }

    const { analyser, ctx, analysisTrack, dataArray } = createAnalyserFromTrack(track);
    let rafId: number | null = null;

    const loop = () => {
      analyser.getByteTimeDomainData(dataArray);
      const { level, peak } = computeLevel(dataArray);
      setMouthOpen(Math.min(1, Math.max(0, (level + peak) * 5.5)));
      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      analysisTrack.stop();
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    };
  }, [track]);

  return mouthOpen;
};

export const LipSyncFace = ({ name, track }: LipSyncFaceProps) => {
  const mouthOpen = useMouthOpen(track);
  const glow = useMemo(() => 12 + mouthOpen * 10, [mouthOpen]);
  const [animationData, setAnimationData] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const speakingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 말소리 여부를 히스테리시스로 판단해 불필요한 재생/정지를 줄임
  const speaking = useMemo(() => {
    const thresholdOn = 0.16;
    const thresholdOff = 0.08;
    let active = (window as any).__lkSpeakingState ?? false;
    if (mouthOpen > thresholdOn) active = true;
    if (mouthOpen < thresholdOff) active = false;
    (window as any).__lkSpeakingState = active;
    return active;
  }, [mouthOpen]);
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  // unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/Live%20chatbot.json");
        if (!res.ok) throw new Error("failed to load lottie");
        const json = await res.json();
        if (!cancelled) setAnimationData(json);
      } catch (e) {
        console.error("lottie load failed", e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { View, animationItem } = useLottie(
    {
      animationData: animationData || undefined,
      loop: false,
      autoplay: false,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    },
    {
      width: 416,
      height: 416,
      className: "drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
    },
  );

  // 초기 정지 상태로 설정
  useEffect(() => {
    if (!animationData || !animationItem) return;
    const start = animationData.ip ?? 0;
    animationItem.stop?.();
    animationItem.goToAndStop?.(start, true);
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, [animationData, animationItem]);

  // 말하기 동안 계속 재생, 말 끝나면 현재 사이클 끝나고 정지 (타이머 기반)
  useEffect(() => {
    if (!animationData || !animationItem) return;
    const start = animationData.ip ?? 0;
    const end = animationData.op ?? 100;
    const fr = animationData.fr ?? 60;
    const durationMs = Math.max(0, ((end - start) / fr) * 1000);

    const playCycle = () => {
      if (!animationItem) return;
      isPlayingRef.current = true;
      setIsPlaying(true);
      animationItem.setSpeed?.(1);
      animationItem.playSegments?.([start, end], true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (speakingRef.current) {
          playCycle();
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          animationItem.stop?.();
          animationItem.goToAndStop?.(start, true);
          timerRef.current = null;
        }
      }, durationMs);
    };

    if (speaking && !isPlayingRef.current) {
      playCycle();
    }

    // speaking이 false로 내려가도 타이머는 유지(사이클 마무리)
  }, [animationData, animationItem, speaking]);

  const waveHeights = useMemo(
    () =>
      [0.35, 0.7, 1, 0.7, 0.45].map((n) => {
        const base = isPlayingRef.current ? Math.max(0.3, mouthOpen) : 0;
        return 12 + base * (20 * n);
      }),
    [mouthOpen],
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-r from-[#1da8e9] via-[#1b82d3] to-[#0e4f9c] text-white">
      <div
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 48%, rgba(90,208,255,0.22), transparent 44%)",
        }}
      />

      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="relative h-[26rem] w-[26rem]">
            <div
              className="absolute inset-0 -m-10 rounded-full bg-sky-200/10 blur-2xl"
              style={{ boxShadow: `0 0 ${22 + glow}px rgba(90,208,255,0.55)` }}
            />
            {View}
          </div>
        </div>

        <div className="absolute left-[calc(50%+180px)] top-1/2 flex -translate-y-1/2 items-end gap-2">
          {waveHeights.map((h, idx) => (
            <div
              key={idx}
              className="w-2.5 rounded-full bg-gradient-to-b from-sky-200 to-cyan-400 shadow-[0_0_14px_rgba(90,208,255,0.5)] transition-all duration-150"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
        <span className="text-sm font-semibold text-white">{name}</span>
        <span className="text-xs text-slate-300">AI Lip-sync</span>
      </div>
    </div>
  );
};

export default LipSyncFace;
