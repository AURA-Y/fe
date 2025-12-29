import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import type { Consumer, Device, Transport, Producer } from "mediasoup-client/lib/types";

// Helper for socket Promise emit
const emitAsync = <T, P = Record<string, unknown>>(socket: Socket, event: string, payload?: P) =>
  new Promise<T>((resolve, reject) => {
    socket.timeout(10000).emit(event, payload ?? {}, (err: any, response: any) => {
      if (err) {
        reject(new Error(`Timeout waiting for ${event} response`));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response as T);
      }
    });
  });

export interface RemotePeer {
  id: string;
  displayName?: string;
  consumers: Map<string, Consumer>;
  stream?: MediaStream; // Combined stream for easier handling
}

interface UseMediasoupProps {
  roomId: string;
  nickname: string;
  signallingUrl: string;
  localStream: MediaStream | null;
  token?: string | null;
}

export function useMediasoup({ roomId, nickname, signallingUrl, localStream }: UseMediasoupProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [peers, setPeers] = useState<Map<string, RemotePeer>>(new Map());

  const socketRef = useRef<Socket | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map()); // kind -> Producer
  const consumersRef = useRef<Map<string, Consumer>>(new Map()); // consumerId -> Consumer

  // Track published tracks to handle stream changes
  const publishedTracksRef = useRef<Set<string>>(new Set());

  const cleanup = useCallback(() => {
    consumersRef.current.forEach((c) => c.close());
    consumersRef.current.clear();
    producersRef.current.forEach((p) => p.close());
    producersRef.current.clear();
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();
    deviceRef.current = null;
    socketRef.current?.disconnect();
    setPeers(new Map());
    setStatus("idle");
  }, []);

  // 1. Initialize Connection
  useEffect(() => {
    if (!roomId || !signallingUrl || !nickname) return;

    let mounted = true;

    const run = async () => {
      try {
        setStatus("connecting");
        // Socket.io handles the protocol upgrade internally, use HTTP/HTTPS URL directly
        const socket = io(signallingUrl, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        // Wait for connect
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Socket timeout")), 10000);
          socket.once("connect", () => {
            clearTimeout(timer);
            console.log("Socket connected successfully");
            resolve();
          });
          socket.once("connect_error", (err) => {
            clearTimeout(timer);
            console.error("Socket connection error:", err);
            reject(err);
          });
        });

        if (!mounted) return;

        console.log("Attempting to join room:", roomId);

        // Wrap join logic in a promise that waits for 'joined-room' event
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off("joined-room", onJoined);
            reject(new Error("Timeout waiting for joined-room event"));
          }, 10000);

          const onJoined = ({ peerId, peers }: any) => {
            clearTimeout(timeout);
            socket.off("joined-room", onJoined); // Clean up temp listener
            console.log("Successfully joined room (event received)", peerId);
            resolve();
          };

          socket.on("joined-room", onJoined);

          // Emit join request (no ack expected from server based on current backend code)
          socket.emit("join-room", { roomId, displayName: nickname });
        });

        // Get RTP Capabilities & Load Device
        console.log("Requesting router RTP capabilities...");
        try {
          const rtpCaps = await emitAsync<{ rtpCapabilities: any }>(
            socket,
            "get-router-rtp-capabilities"
          );
          console.log("Received RTP capabilities response:", rtpCaps);

          if (!rtpCaps || !rtpCaps.rtpCapabilities) {
            throw new Error(
              "Failed to get RTP capabilities. Server might rely on 'error' event instead of callback."
            );
          }

          const device = new mediasoupClient.Device();
          await device.load({ routerRtpCapabilities: rtpCaps.rtpCapabilities });
          deviceRef.current = device;
          console.log("Device loaded successfully");
        } catch (e: any) {
          console.error("Failed to load device:", e);
          throw new Error(`Device load failed: ${e.message}`);
        }

        const device = deviceRef.current;
        if (!device) throw new Error("Device not loaded");

        // Create Send Transport
        console.log("Creating send transport...");
        const sendData = await emitAsync<any>(socket, "create-webrtc-transport");
        console.log("Send transport data:", sendData);
        const sendTransport = device.createSendTransport(sendData);
        sendTransportRef.current = sendTransport;

        sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
          emitAsync(socket, "connect-transport", { transportId: sendTransport.id, dtlsParameters })
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

        // Create Recv Transport
        const recvData = await emitAsync<any>(socket, "create-webrtc-transport");
        const recvTransport = device.createRecvTransport(recvData);
        recvTransportRef.current = recvTransport;

        recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
          emitAsync(socket, "connect-transport", { transportId: recvTransport.id, dtlsParameters })
            .then(() => callback())
            .catch(errback);
        });

        // Handle New Peers / Consumers
        const consumeProducer = async (producerId: string, peerId: string) => {
          const deviceCapabilities = deviceRef.current?.rtpCapabilities;
          if (!deviceCapabilities) return;

          const { id, kind, rtpParameters } = await emitAsync<any>(socket, "consume", {
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

          consumersRef.current.set(consumer.id, consumer);

          // Resume
          await emitAsync(socket, "resume-consumer", { consumerId: consumer.id });

          // Update Peers State
          setPeers((prev) => {
            const newPeers = new Map(prev);
            const peer = newPeers.get(peerId) || {
              id: peerId,
              displayName: `User ${peerId.substr(0, 4)}`, // Fallback
              consumers: new Map(),
              stream: new MediaStream(),
            };

            peer.consumers.set(consumer.id, consumer);
            peer.stream?.addTrack(consumer.track);

            // Keep existing fields like displayName
            newPeers.set(peerId, peer);
            return newPeers;
          });
        };

        socket.on("new-producer", ({ producerId, peerId }) => {
          consumeProducer(producerId, peerId).catch(console.error);
        });

        socket.on("peer-left", ({ peerId }) => {
          setPeers((prev) => {
            const newPeers = new Map(prev);
            const peer = newPeers.get(peerId);
            if (peer) {
              peer.consumers.forEach((c) => {
                c.close();
                consumersRef.current.delete(c.id);
              });
            }
            newPeers.delete(peerId);
            return newPeers;
          });
        });

        // Handle New Peer Joining (Synchronize Name)
        socket.on("new-peer", ({ peer }: { peer: any }) => {
          console.log("New peer joined:", peer);
          setPeers((prev) => {
            const newPeers = new Map(prev);
            if (!newPeers.has(peer.id)) {
              newPeers.set(peer.id, {
                id: peer.id,
                displayName: peer.displayName,
                consumers: new Map(),
                stream: new MediaStream(),
              });
            }
            return newPeers;
          });
        });

        // Handle Joined Room (Initial Peers & Consume Existing Producers)
        socket.on("joined-room", ({ peers }: { peers: any[] }) => {
          console.log("Joined room, existing peers:", peers);

          // 1. Initialize Peer State
          setPeers((prev) => {
            const newPeers = new Map(prev);
            peers.forEach((p: any) => {
              if (!newPeers.has(p.id)) {
                newPeers.set(p.id, {
                  id: p.id,
                  displayName: p.displayName,
                  consumers: new Map(),
                  stream: new MediaStream(),
                });
              }
            });
            return newPeers;
          });

          // 2. Consume All Existing Producers
          peers.forEach((p: any) => {
            if (p.producerIds && Array.isArray(p.producerIds)) {
              p.producerIds.forEach((pid: string) => {
                consumeProducer(pid, p.id).catch(console.error);
              });
            }
          });
        });

        setStatus("connected");
      } catch (err: any) {
        if (!mounted) return;
        console.error("Mediasoup connection error:", err);
        setError(err.message);
        setStatus("error");
      }
    };

    run();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [roomId, nickname, signallingUrl, cleanup]);

  // 2. Publish Local Stream
  useEffect(() => {
    const publish = async () => {
      if (status !== "connected" || !sendTransportRef.current || !localStream) return;

      const tracks = localStream.getTracks();

      for (const track of tracks) {
        if (publishedTracksRef.current.has(track.id)) continue;

        try {
          const producer = await sendTransportRef.current.produce({
            track,
            // Add simple encodings for video
            ...(track.kind === "video"
              ? {
                  encodings: [{ maxBitrate: 500000, scaleResolutionDownBy: 1 }],
                }
              : {}),
          });

          producersRef.current.set(track.kind, producer);
          publishedTracksRef.current.add(track.id);

          producer.on("trackended", () => {
            // Handle track ended (e.g. device unplugged)
          });

          // If the local track is stopped, we should close producer, but 'trackended' might fire.
          // In React, if localStream changes, this effect runs again.
        } catch (e) {
          console.error("Publish error", e);
        }
      }
    };

    publish();
  }, [status, localStream]);

  return { status, error, peers };
}
