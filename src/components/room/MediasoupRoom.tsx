"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import type { Consumer, Device, Transport } from "mediasoup-client/lib/types";

interface MediasoupRoomProps {
  roomId: string;
  nickname: string;
  signallingUrl: string;
  onLeave: () => void;
}

type Awaitable<T> = T | Promise<T>;

// Socket.io emit을 Promise 기반으로 감싸는 헬퍼
const emitAsync = <T, P = Record<string, unknown>>(socket: Socket, event: string, payload?: P) =>
  new Promise<T>((resolve, reject) => {
    socket.timeout(5000).emit(event, payload ?? {}, (response: any) => {
      if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response as T);
      }
    });
  });

const toWebSocketUrl = (url: string) => {
  if (url.startsWith("ws://") || url.startsWith("wss://")) return url;
  if (url.startsWith("https://")) return url.replace("https://", "wss://");
  if (url.startsWith("http://")) return url.replace("http://", "ws://");
  return `ws://${url}`;
};

const MediasoupRoom = ({ roomId, nickname, signallingUrl, onLeave }: MediasoupRoomProps) => {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const consumersRef = useRef<Map<string, Consumer>>(new Map()); // key: producerId
  const peerConsumersRef = useRef<Map<string, Set<string>>>(new Map()); // peerId -> producerIds

  // cleanup helper
  const cleanAll = useMemo(
    () => () => {
      consumersRef.current.forEach((c) => c.close());
      consumersRef.current.clear();
      sendTransportRef.current?.close();
      recvTransportRef.current?.close();
      deviceRef.current = null;
      socketRef.current?.disconnect();
    },
    []
  );

  useEffect(() => {
    const run = async () => {
      try {
        // 1) 소켓 연결 및 방 조인
        const socket = io(signallingUrl, {
          transports: ["websocket", "polling"], // polling fallback
          upgrade: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        socketRef.current = socket;

        // 연결 완료까지 대기 (최대 10초)
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Socket 연결 시간 초과")), 10000);
          socket.once("connect", () => {
            clearTimeout(timer);
            resolve();
          });
          socket.once("connect_error", (err) => {
            clearTimeout(timer);
            reject(err);
          });
        });

        // 조인
        socket.emit("join-room", { roomId, displayName: nickname });

        socket.on("peer-left", ({ peerId }) => {
          const producerIds = peerConsumersRef.current.get(peerId);
          producerIds?.forEach((pid) => {
            consumersRef.current.get(pid)?.close();
            consumersRef.current.delete(pid);
            document.getElementById(`remote-${pid}`)?.remove();
          });
          peerConsumersRef.current.delete(peerId);
        });

        // 2) Mediasoup Device 준비
        if (!socket.connected) {
          throw new Error("소켓 연결이 완료되지 않았습니다.");
        }

        const rtpCaps = await emitAsync<{ rtpCapabilities: any }>(
          socket,
          "get-router-rtp-capabilities"
        );
        if (!rtpCaps?.rtpCapabilities) {
          throw new Error("Router RTP Capabilities를 가져오지 못했습니다.");
        }
        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCaps.rtpCapabilities });
        deviceRef.current = device;

        // 3) 송신 Transport 생성
        const sendData = await emitAsync<any>(socket, "create-webrtc-transport");
        const sendTransport = device.createSendTransport(sendData);
        sendTransportRef.current = sendTransport;

        sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
          emitAsync(socket, "connect-transport", {
            transportId: sendTransport.id,
            dtlsParameters,
          })
            .then(() => callback())
            .catch(errback);
        });

        sendTransport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
          emitAsync<{ id: string }>(socket, "produce", {
            transportId: sendTransport.id,
            kind,
            rtpParameters,
          })
            .then(({ id }) => callback({ id }))
            .catch(errback);
        });

        // 4) 수신 Transport 생성
        const recvData = await emitAsync<any>(socket, "create-webrtc-transport");
        const recvTransport = device.createRecvTransport(recvData);
        recvTransportRef.current = recvTransport;

        recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
          emitAsync(socket, "connect-transport", {
            transportId: recvTransport.id,
            dtlsParameters,
          })
            .then(() => callback())
            .catch(errback);
        });

        // 5) 로컬 미디어 수집 후 송신
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 640, height: 360 },
        });

        const localVideo = localVideoRef.current;
        if (localVideo) {
          localVideo.srcObject = stream;
          localVideo.muted = true;
          await localVideo.play().catch(() => undefined);
        }

        for (const track of stream.getTracks()) {
          await sendTransport.produce({ track });
        }

        // 6) 신규 Producer 알림 수신 시 소비
        const consumeProducer = async (producerId: string, peerId?: string) => {
          const deviceCapabilities = deviceRef.current?.rtpCapabilities;
          if (!deviceCapabilities) return;

          const { id, kind, rtpParameters } = await emitAsync<{
            id: string;
            producerId: string;
            kind: any;
            rtpParameters: any;
          }>(socket, "consume", {
            transportId: recvTransport.id,
            producerId,
            rtpCapabilities: deviceCapabilities,
          });

          const consumer = await recvTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });

          const mediaStream = new MediaStream([consumer.track]);
          const video = document.createElement("video");
          video.id = `remote-${producerId}`;
          video.autoplay = true;
          video.playsInline = true;
          video.srcObject = mediaStream;
          video.className = "h-40 w-64 rounded border border-slate-200 bg-black object-cover";
          remoteContainerRef.current?.appendChild(video);

          consumersRef.current.set(producerId, consumer);
          if (peerId) {
            const set = peerConsumersRef.current.get(peerId) ?? new Set<string>();
            set.add(producerId);
            peerConsumersRef.current.set(peerId, set);
          }

          await emitAsync(socket, "resume-consumer", { consumerId: consumer.id });
        };

        socket.on("new-producer", ({ producerId, peerId }) => {
          consumeProducer(producerId, peerId).catch((err) => {
            console.error("consume failed", err);
            setError("원격 영상을 수신하는 데 실패했습니다.");
          });
        });

        setStatus("connected");
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Mediasoup 연결에 실패했습니다.");
        setStatus("error");
      }
    };

    run();

    return () => {
      cleanAll();
    };
  }, [roomId, nickname, signallingUrl, cleanAll]);

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-sm text-slate-300">
            {status === "connected" ? "Connected" : "Connecting..."}
          </p>
          <p className="text-lg font-semibold">{roomId}</p>
        </div>
        <button
          onClick={() => {
            cleanAll();
            onLeave();
          }}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
        >
          나가기
        </button>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center text-red-400">{error}</div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400">내 화면</span>
            <video
              ref={localVideoRef}
              className="h-40 w-64 rounded border border-slate-700 bg-slate-900 object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
          <div className="col-span-2">
            <span className="text-xs text-slate-400">원격 참가자</span>
            <div ref={remoteContainerRef} className="flex flex-wrap gap-3"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediasoupRoom;
