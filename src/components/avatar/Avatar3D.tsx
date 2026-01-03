"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { LipSyncAnalyzer } from "@/lib/utils/lipsync.utils";

interface Visemes {
    a: number;
    i: number;
    u: number;
    e: number;
    o: number;
    volume: number;
}

/**
 * Simple 3D avatar with viseme-based lip sync and smooth animations
 */
function SimpleAvatar({ visemes }: { visemes: Visemes }) {
    const meshRef = useRef<THREE.Group>(null);
    const mouthRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const leftEyebrowRef = useRef<THREE.Mesh>(null);
    const rightEyebrowRef = useRef<THREE.Mesh>(null);
    const leftBlushRef = useRef<THREE.Mesh>(null);
    const rightBlushRef = useRef<THREE.Mesh>(null);

    // Store current values for smooth interpolation
    const currentValues = useRef({
        mouthScaleX: 1,
        mouthScaleY: 0.3,
        mouthPosY: -0.3,
        eyeScale: 1,
        eyebrowY: 0.5,
        eyebrowRotL: 0.1,
        eyebrowRotR: -0.1,
        blushOpacity: 0.4,
        bodyRotY: 0,
        bodyRotZ: 0,
        bodyPosY: 0,
    });

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const { a, i, u, e, o, volume } = visemes;
        const isSpeaking = volume > 0.05;
        const cv = currentValues.current;

        // Smooth lerp factor - smaller = smoother but slower
        const lerpSpeed = 0.12;
        const fastLerp = 0.18;

        // === MOUTH SHAPE based on visemes ===
        if (mouthRef.current) {
            // A: wide open, tall
            // I: wide, short (smile-like)
            // U: narrow, round (pucker)
            // E: medium wide, medium tall
            // O: round, medium

            const targetScaleX = 1.0 + i * 0.15 + a * 0.1 + e * 0.1 - u * 0.15 - o * 0.05;
            const targetScaleY = 0.4 + a * 0.5 + o * 0.4 + e * 0.3 + u * 0.25 - i * 0.1;
            const targetPosY = -0.3 - a * 0.02 - o * 0.01;

            cv.mouthScaleX += (targetScaleX - cv.mouthScaleX) * fastLerp;
            cv.mouthScaleY += (targetScaleY - cv.mouthScaleY) * fastLerp;
            cv.mouthPosY += (targetPosY - cv.mouthPosY) * lerpSpeed;

            mouthRef.current.scale.x = cv.mouthScaleX;
            mouthRef.current.scale.y = cv.mouthScaleY;
            mouthRef.current.position.y = cv.mouthPosY;
        }

        // === BODY MOVEMENT ===
        if (meshRef.current) {
            const targetRotY = Math.sin(time * 0.6) * (isSpeaking ? 0.12 : 0.06);
            const targetRotZ = isSpeaking ? Math.sin(time * 1.5) * 0.04 : 0;
            const targetPosY = Math.sin(time * 1.2) * (isSpeaking ? 0.06 : 0.025);

            cv.bodyRotY += (targetRotY - cv.bodyRotY) * lerpSpeed;
            cv.bodyRotZ += (targetRotZ - cv.bodyRotZ) * lerpSpeed;
            cv.bodyPosY += (targetPosY - cv.bodyPosY) * lerpSpeed;

            meshRef.current.rotation.y = cv.bodyRotY;
            meshRef.current.rotation.z = cv.bodyRotZ;
            meshRef.current.position.y = cv.bodyPosY;
        }

        // === EYES ===
        if (leftEyeRef.current && rightEyeRef.current) {
            const blinkCycle = Math.sin(time * 2.2);
            const shouldBlink = blinkCycle > 0.97;
            const baseScale = isSpeaking ? 1.1 : 1.0;
            const targetScale = shouldBlink ? 0.1 : baseScale;

            cv.eyeScale += (targetScale - cv.eyeScale) * (shouldBlink ? 0.5 : lerpSpeed);

            leftEyeRef.current.scale.set(cv.eyeScale, cv.eyeScale, 1);
            rightEyeRef.current.scale.set(cv.eyeScale, cv.eyeScale, 1);
        }

        // === EYEBROWS ===
        if (leftEyebrowRef.current && rightEyebrowRef.current) {
            const targetY = isSpeaking ? 0.52 + volume * 0.08 : 0.5;
            const targetRotL = isSpeaking ? 0.15 + volume * 0.1 : 0.1;

            cv.eyebrowY += (targetY - cv.eyebrowY) * lerpSpeed;
            cv.eyebrowRotL += (targetRotL - cv.eyebrowRotL) * lerpSpeed;
            cv.eyebrowRotR += (-targetRotL - cv.eyebrowRotR) * lerpSpeed;

            leftEyebrowRef.current.position.y = cv.eyebrowY;
            rightEyebrowRef.current.position.y = cv.eyebrowY;
            leftEyebrowRef.current.rotation.z = cv.eyebrowRotL;
            rightEyebrowRef.current.rotation.z = cv.eyebrowRotR;
        }

        // === BLUSH ===
        if (leftBlushRef.current && rightBlushRef.current) {
            const targetOpacity = isSpeaking ? 0.5 + volume * 0.25 : 0.35;
            cv.blushOpacity += (targetOpacity - cv.blushOpacity) * lerpSpeed * 0.5;

            (leftBlushRef.current.material as THREE.MeshStandardMaterial).opacity = cv.blushOpacity;
            (rightBlushRef.current.material as THREE.MeshStandardMaterial).opacity = cv.blushOpacity;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Main head */}
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#ffbdb3" />
            </mesh>

            {/* Left eyebrow */}
            <mesh ref={leftEyebrowRef} position={[-0.35, 0.5, 0.88]} rotation={[0, 0, 0.1]}>
                <boxGeometry args={[0.22, 0.045, 0.05]} />
                <meshStandardMaterial color="#5a3825" />
            </mesh>

            {/* Right eyebrow */}
            <mesh ref={rightEyebrowRef} position={[0.35, 0.5, 0.88]} rotation={[0, 0, -0.1]}>
                <boxGeometry args={[0.22, 0.045, 0.05]} />
                <meshStandardMaterial color="#5a3825" />
            </mesh>

            {/* Left eye */}
            <mesh ref={leftEyeRef} position={[-0.35, 0.2, 0.85]}>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
                <mesh position={[0.04, 0.04, 0.09]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </mesh>

            {/* Right eye */}
            <mesh ref={rightEyeRef} position={[0.35, 0.2, 0.85]}>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
                <mesh position={[0.04, 0.04, 0.09]}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </mesh>

            {/* Mouth - shape changes based on viseme */}
            <mesh ref={mouthRef} position={[0, -0.3, 0.9]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#6b2c2c" />
            </mesh>

            {/* Blush - left */}
            <mesh ref={leftBlushRef} position={[-0.58, -0.05, 0.78]}>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshStandardMaterial color="#ff8888" transparent opacity={0.35} />
            </mesh>
            {/* Blush - right */}
            <mesh ref={rightBlushRef} position={[0.58, -0.05, 0.78]}>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshStandardMaterial color="#ff8888" transparent opacity={0.35} />
            </mesh>
        </group>
    );
}

/**
 * GLB Model Avatar with morph target lip sync
 */
function ModelAvatar({ visemes, modelUrl }: { visemes: Visemes; modelUrl: string }) {
    const { scene } = useGLTF(modelUrl);
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        clonedScene.traverse((child) => {
            if (
                (child as THREE.Mesh).isMesh &&
                (child as THREE.Mesh).morphTargetDictionary &&
                (child as THREE.Mesh).morphTargetInfluences
            ) {
                const mesh = child as THREE.Mesh;
                const dict = mesh.morphTargetDictionary!;
                const influences = mesh.morphTargetInfluences!;

                // Map visemes to morph targets
                const mappings: Record<string, string[]> = {
                    a: ["mouthOpen", "jawOpen", "viseme_aa", "A"],
                    i: ["viseme_I", "mouthSmileLeft", "mouthSmileRight", "I"],
                    u: ["viseme_U", "mouthPucker", "U"],
                    e: ["viseme_E", "E"],
                    o: ["viseme_O", "mouthFunnel", "O"],
                };

                for (const [viseme, targets] of Object.entries(mappings)) {
                    for (const target of targets) {
                        if (dict[target] !== undefined) {
                            const idx = dict[target];
                            const current = influences[idx];
                            const val = visemes[viseme as keyof typeof visemes] as number;
                            influences[idx] = current + (val - current) * 0.2;
                        }
                    }
                }
            }
        });
    });

    return <primitive object={clonedScene} scale={2} position={[0, -1.5, 0]} />;
}

interface Avatar3DProps {
    audioTrack?: MediaStreamTrack | null;
    isActive?: boolean;
    className?: string;
    modelUrl?: string;
}

export function Avatar3D({ audioTrack, className = "", modelUrl }: Avatar3DProps) {
    const [visemes, setVisemes] = useState<Visemes>({ a: 0, i: 0, u: 0, e: 0, o: 0, volume: 0 });
    const analyzerRef = useRef<LipSyncAnalyzer | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!audioTrack) {
            setVisemes({ a: 0, i: 0, u: 0, e: 0, o: 0, volume: 0 });
            return;
        }

        const analyzer = new LipSyncAnalyzer();
        try {
            analyzer.init(new MediaStream([audioTrack]));
            analyzerRef.current = analyzer;
        } catch (e) {
            console.error("Failed to init lip-sync analyzer", e);
            return;
        }

        const updateVisemes = () => {
            if (analyzerRef.current) {
                const v = analyzerRef.current.getVisemes();
                setVisemes(v);
            }
            animationFrameRef.current = requestAnimationFrame(updateVisemes);
        };

        updateVisemes();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (analyzerRef.current) analyzerRef.current.cleanup();
        };
    }, [audioTrack]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 40 }}
                style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2a2a40 100%)" }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <pointLight position={[-5, 2, 2]} intensity={0.5} color="#ff6b6b" />

                {modelUrl ? (
                    <ModelAvatar visemes={visemes} modelUrl={modelUrl} />
                ) : (
                    <SimpleAvatar visemes={visemes} />
                )}

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.8}
                    rotateSpeed={0.5}
                />
            </Canvas>

            {/* AI Bot Overlay UI */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/40 pl-2 pr-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-lg">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${visemes.volume > 0.05 ? 'bg-gradient-to-tr from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/10'}`}>
                    <span className="text-[10px]">🤖</span>
                </div>
                <span>AI Assistant</span>
                {visemes.volume > 0.1 && (
                    <div className="flex gap-0.5 items-end h-3 ml-1">
                        <span className="w-0.5 bg-green-400 rounded-full transition-all duration-150" style={{ height: `${8 + visemes.a * 8}px` }} />
                        <span className="w-0.5 bg-green-400 rounded-full transition-all duration-150" style={{ height: `${6 + visemes.i * 10}px` }} />
                        <span className="w-0.5 bg-green-400 rounded-full transition-all duration-150" style={{ height: `${4 + visemes.o * 8}px` }} />
                    </div>
                )}
            </div>
        </div>
    );
}
