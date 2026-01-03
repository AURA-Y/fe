"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar3D } from "@/components/avatar/Avatar3D";

/**
 * Standalone test page for Avatar3D with lip-sync
 * No backend connection required
 */
export default function AvatarTestPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Test with microphone
    const startMicTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const track = stream.getAudioTracks()[0];
            setAudioTrack(track);
            setIsPlaying(true);
        } catch (e) {
            console.error("Microphone access denied:", e);
            alert("마이크 권한이 필요합니다!");
        }
    };

    // Test with audio file
    const startAudioFileTest = async () => {
        if (!audioRef.current) return;

        try {
            audioRef.current.play();

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            const source = audioContextRef.current.createMediaElementSource(audioRef.current);
            const destination = audioContextRef.current.createMediaStreamDestination();
            source.connect(destination);
            source.connect(audioContextRef.current.destination); // Also play through speakers

            const track = destination.stream.getAudioTracks()[0];
            setAudioTrack(track);
            setIsPlaying(true);
        } catch (e) {
            console.error("Audio playback failed:", e);
        }
    };

    // Simulate audio with oscillator
    const startSimulatedTest = () => {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const destination = audioContext.createMediaStreamDestination();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);

            // Modulate volume to simulate speech pattern
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);

            const modulateGain = () => {
                const now = audioContext.currentTime;
                // Random speech-like pattern
                gainNode.gain.setValueAtTime(Math.random() * 0.5, now);
                gainNode.gain.linearRampToValueAtTime(Math.random() * 0.3, now + 0.1);
                setTimeout(modulateGain, 100 + Math.random() * 200);
            };

            oscillator.connect(gainNode);
            gainNode.connect(destination);
            // Don't connect to speakers (too annoying)

            oscillator.start();
            modulateGain();

            const track = destination.stream.getAudioTracks()[0];
            setAudioTrack(track);
            setIsPlaying(true);

            audioContextRef.current = audioContext;
        } catch (e) {
            console.error("Simulated audio failed:", e);
        }
    };

    const stopTest = () => {
        if (audioTrack) {
            audioTrack.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioTrack(null);
        setIsPlaying(false);
    };

    useEffect(() => {
        return () => stopTest();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">🤖 Avatar3D Lip-Sync Test</h1>
                <p className="text-white/60 mb-8">백엔드 연결 없이 아바타 립싱크만 테스트합니다</p>

                {/* Avatar Display */}
                <div className="aspect-video rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 mb-8">
                    <Avatar3D
                        audioTrack={audioTrack}
                        isActive={isPlaying}
                        className="w-full h-full"
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    {!isPlaying ? (
                        <>
                            <button
                                onClick={startMicTest}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                            >
                                🎤 마이크로 테스트
                            </button>
                            <button
                                onClick={startSimulatedTest}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                            >
                                🔊 시뮬레이션 테스트
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={stopTest}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
                        >
                            ⏹️ 정지
                        </button>
                    )}
                </div>

                {/* Status */}
                <div className="mt-8 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isPlaying
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/10 text-white/50 border border-white/10"
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-400 animate-pulse" : "bg-white/30"}`} />
                        {isPlaying ? "오디오 활성화됨" : "대기 중"}
                    </span>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-white font-semibold mb-2">테스트 방법</h3>
                    <ul className="text-white/60 text-sm space-y-1">
                        <li>• <strong>마이크 테스트</strong>: 실제 마이크 입력으로 아바타 표정 테스트</li>
                        <li>• <strong>시뮬레이션</strong>: 가상 오디오로 자동 립싱크 테스트</li>
                        <li>• 말할 때 눈썹이 올라가고, 입이 벌어지고, 볼이 붉어지는지 확인</li>
                    </ul>
                </div>

                {/* Hidden audio element for file playback */}
                <audio ref={audioRef} className="hidden" />
            </div>
        </div>
    );
}
