"use client";

type FaceDetectorHandle = {
  detect: (bitmap: ImageBitmap) => {
    detections?: Array<{ boundingBox?: { width?: number; height?: number } }>;
  };
  close?: () => void;
};

type RefObject<T> = { current: T };

export const createAnalyserFromTrack = (mediaTrack: MediaStreamTrack) => {
  const analysisTrack = mediaTrack.clone();
  analysisTrack.enabled = true;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  const source = ctx.createMediaStreamSource(new MediaStream([analysisTrack]));
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  const dataArray = new Uint8Array(analyser.fftSize);
  return { analyser, ctx, analysisTrack, dataArray };
};

export const computeLevel = (data: ArrayLike<number>) => {
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sumSquares += normalized * normalized;
    peak = Math.max(peak, Math.abs(normalized));
  }
  const rms = Math.sqrt(sumSquares / data.length);
  const level = 0.6 * rms + 0.4 * peak;
  return { level, rms, peak };
};

export const updateNoiseFloor = (prevNoiseFloor: number, level: number) => {
  const next =
    level < prevNoiseFloor * 3
      ? prevNoiseFloor * 0.9 + level * 0.1
      : prevNoiseFloor * 0.98 + level * 0.02;
  return Math.min(next, 0.05);
};

export const loadFaceDetector = async (
  detectorRef: RefObject<FaceDetectorHandle | null>,
  loadingRef: RefObject<Promise<FaceDetectorHandle | null> | null>
): Promise<FaceDetectorHandle | null> => {
  if (detectorRef.current) return detectorRef.current;
  if (loadingRef.current) return loadingRef.current;

  const p = import("@mediapipe/tasks-vision")
    .then(async (vision) => {
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      const detector = await vision.FaceDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/short_range/float16/1/face_detector_short_range.tflite",
        },
        runningMode: "IMAGE",
      });
      return detector as FaceDetectorHandle;
    })
    .then((detector) => {
      detectorRef.current = detector;
      loadingRef.current = null;
      return detector;
    })
    .catch(() => {
      loadingRef.current = null;
      return null;
    });

  loadingRef.current = p;
  return p;
};

export const detectCloseFace = async (
  getVideoTrack: () => MediaStreamTrack | null,
  detectorRef: RefObject<FaceDetectorHandle | null>,
  loadingRef: RefObject<Promise<FaceDetectorHandle | null> | null>,
  minAreaRatio = 0.03
): Promise<boolean | null> => {
  const videoTrack = getVideoTrack();
  if (!videoTrack) return null;
  const detector = await loadFaceDetector(detectorRef, loadingRef);
  if (!detector) return null;
  const ImageCaptureCtor = (window as any).ImageCapture;
  if (!ImageCaptureCtor) return null;

  try {
    const capture = new ImageCaptureCtor(videoTrack);
    const bitmap: ImageBitmap = await capture.grabFrame();
    const { width, height } = bitmap;
    const result = detector.detect(bitmap);
    if (typeof bitmap.close === "function") bitmap.close();

    const detections = result?.detections ?? [];
    if (!detections.length || !width || !height) return false;

    const maxAreaRatio = Math.max(
      ...detections.map((d: any) => {
        const box = d.boundingBox ?? {};
        const area = Math.max(0, box.width ?? 0) * Math.max(0, box.height ?? 0);
        return area / (width * height);
      })
    );
    return maxAreaRatio >= minAreaRatio;
  } catch {
    return null;
  }
};
