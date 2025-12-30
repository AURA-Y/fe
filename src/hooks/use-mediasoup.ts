import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { types } from "mediasoup-client";

// Helper for socket Promise emit
const emitAsync = <T, P = Record<string, unknown>>(
  socket: Socket,
  event: string,
  payload?: P,
  timeout: number = 10000
) =>
  new Promise<T>((resolve, reject) => {
    socket.timeout(timeout).emit(event, payload ?? {}, (err: any, response: any) => {
      if (err) {
        reject(new Error(`Timeout waiting for ${event} response (${timeout}ms)`));
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
  consumers: Map<string, types.Consumer>;
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
  const deviceRef = useRef<types.Device | null>(null);
  const sendTransportRef = useRef<types.Transport | null>(null);
  const recvTransportRef = useRef<types.Transport | null>(null);
  const producersRef = useRef<Map<string, types.Producer>>(new Map()); // kind -> Producer
  const consumersRef = useRef<Map<string, types.Consumer>>(new Map()); // consumerId -> Consumer

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

        // Step 1: Register event handlers FIRST (but we need to define consumeProducer later)
        let consumeProducerFn: ((producerId: string, peerId: string) => Promise<void>) | null = null;
        let myPeerIdRef: string | null = null;

        // Handle new producer from existing peer
        socket.on("new-producer", ({ producerId, peerId }) => {
          console.log(`[new-producer event] Received from peer ${peerId}, producerId: ${producerId}`);
          // Ignore our own producers
          if (myPeerIdRef && peerId === myPeerIdRef) {
            console.log(`  -> Ignoring own producer`);
            return;
          }
          if (consumeProducerFn) {
            consumeProducerFn(producerId, peerId).catch(console.error);
          }
        });

        // Handle peer leaving
        socket.on("peer-left", ({ peerId }) => {
          console.log(`[peer-left event] Peer ${peerId} left`);
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

        // Handle new peer joining (after us)
        socket.on("new-peer", ({ peer }: { peer: any }) => {
          console.log(`[new-peer event] New peer joined:`, peer);
          // Ignore ourselves
          if (myPeerIdRef && peer.id === myPeerIdRef) {
            console.log(`  -> Ignoring own join event`);
            return;
          }
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

        // Step 2: Emit join-room and wait for response
        const joinedData = await new Promise<{ peerId: string; peers: any[] }>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off("joined-room", onJoined);
            reject(new Error("Timeout waiting for joined-room event"));
          }, 10000);

          const onJoined = (data: { peerId: string; peers: any[] }) => {
            clearTimeout(timeout);
            socket.off("joined-room", onJoined);
            console.log(`[joined-room event] Successfully joined. My peerId: ${data.peerId}, Existing peers:`, data.peers);
            resolve(data);
          };

          socket.on("joined-room", onJoined);
          console.log("Emitting join-room...");
          socket.emit("join-room", { roomId, displayName: nickname });
        });

        const myPeerId = joinedData.peerId;
        myPeerIdRef = myPeerId; // Store in ref for event handlers to access

        // Step 3: Now we're in the room, get RTP Capabilities & Load Device
        console.log("Requesting router RTP capabilities...");
        const rtpCaps = await emitAsync<{ rtpCapabilities: any }>(
          socket,
          "get-router-rtp-capabilities"
        );
        console.log("Received RTP capabilities response:", rtpCaps);

        if (!rtpCaps || !rtpCaps.rtpCapabilities) {
          throw new Error("Failed to get RTP capabilities");
        }

        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCaps.rtpCapabilities });
        deviceRef.current = device;
        console.log("Device loaded successfully");

        // Step 4: Create Send Transport
        console.log("Creating send transport...");
        const sendData = await emitAsync<any>(socket, "create-webrtc-transport");
        const sendTransport = device.createSendTransport({
          ...sendData,
          iceCandidates: sendData.iceCandidates.map((c: any) => ({
            ...c,
            address: c.ip,
          })),
        } as any);
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

        // Step 5: Create Recv Transport
        const recvData = await emitAsync<any>(socket, "create-webrtc-transport");
        const recvTransport = device.createRecvTransport({
          ...recvData,
          iceCandidates: recvData.iceCandidates.map((c: any) => ({
            ...c,
            address: c.ip,
          })),
        } as any);
        recvTransportRef.current = recvTransport;

        recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
          emitAsync(socket, "connect-transport", { transportId: recvTransport.id, dtlsParameters })
            .then(() => callback())
            .catch(errback);
        });

        // Step 6: Define and assign consume function
        const consumeProducer = async (producerId: string, peerId: string) => {
          try {
            console.log(`[consumeProducer] Starting consume for producer ${producerId} from peer ${peerId}`);

            const deviceCapabilities = deviceRef.current?.rtpCapabilities;
            if (!deviceCapabilities) {
              console.error(`[consumeProducer] No device capabilities available`);
              return;
            }

            console.log(`[consumeProducer] Requesting consume from server...`);
            const { id, kind, rtpParameters } = await emitAsync<any>(socket, "consume", {
              transportId: recvTransport.id,
              producerId,
              rtpCapabilities: deviceCapabilities,
            });
            console.log(`[consumeProducer] Server responded: consumerId=${id}, kind=${kind}`);

            console.log(`[consumeProducer] Creating consumer on transport...`);
            const consumer = await recvTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
            });
            console.log(`[consumeProducer] Consumer created, track:`, consumer.track);

            consumersRef.current.set(consumer.id, consumer);

            // Resume
            console.log(`[consumeProducer] Resuming consumer ${consumer.id}...`);
            try {
              await emitAsync(socket, "resume-consumer", { consumerId: consumer.id }, 30000);
              console.log(`[consumeProducer] Consumer resumed successfully`);
            } catch (resumeError: any) {
              console.error(`[consumeProducer] Failed to resume consumer:`, resumeError);
              // Continue anyway - the consumer might still work
            }

            // Update Peers State
            setPeers((prev) => {
              const newPeers = new Map(prev);
              const existingPeer = newPeers.get(peerId);

              // Get existing tracks or create empty array
              const existingTracks = existingPeer?.stream?.getTracks() || [];

              // Create NEW MediaStream with all tracks (existing + new)
              const newStream = new MediaStream([...existingTracks, consumer.track]);

              const peer = {
                id: peerId,
                displayName: existingPeer?.displayName || `User ${peerId.substr(0, 4)}`,
                consumers: existingPeer?.consumers || new Map(),
                stream: newStream,  // New stream object triggers React re-render
              };

              peer.consumers.set(consumer.id, consumer);

              console.log(`[consumeProducer] Added ${kind} track to peer ${peerId}, stream now has ${newStream.getTracks().length} tracks:`, newStream.getTracks().map(t => `${t.kind}(enabled:${t.enabled},muted:${t.muted})`));

              newPeers.set(peerId, peer);
              return newPeers;
            });

            console.log(`[consumeProducer] ✓ Successfully consumed ${kind} from peer ${peerId}`);
          } catch (error) {
            console.error(`[consumeProducer] ERROR consuming producer ${producerId} from peer ${peerId}:`, error);
          }
        };

        // Assign to the variable used by event handlers
        consumeProducerFn = consumeProducer;

        // Step 7: Process existing peers from joined-room response
        if (joinedData.peers && joinedData.peers.length > 0) {
          setPeers((prev) => {
            const newPeers = new Map(prev);
            joinedData.peers.forEach((p: any) => {
              console.log(`  - Adding existing peer ${p.id} (${p.displayName}), producers:`, p.producerIds);
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

          // Consume all existing producers
          for (const p of joinedData.peers) {
            if (p.producerIds && Array.isArray(p.producerIds)) {
              for (const pid of p.producerIds) {
                console.log(`  - Consuming existing producer ${pid} from peer ${p.id}`);
                await consumeProducer(pid, p.id).catch(console.error);
              }
            }
          }
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, nickname, signallingUrl]);

  // 2. Publish Local Stream
  useEffect(() => {
    const publish = async () => {
      console.log("[useMediasoup] Checking publish conditions:", {
        status,
        hasSendTransport: !!sendTransportRef.current,
        hasLocalStream: !!localStream,
        tracks: localStream?.getTracks().map((t) => t.kind),
      });

      if (status !== "connected" || !sendTransportRef.current || !localStream) {
        console.log("[useMediasoup] Skipping publish (conditions not met)");
        return;
      }

      console.log("[useMediasoup] Starting to publish tracks...");
      const tracks = localStream.getTracks();

      for (const track of tracks) {
        if (publishedTracksRef.current.has(track.id)) {
          console.log(`[useMediasoup] Track ${track.id} (${track.kind}) already published`);
          continue;
        }

        try {
          console.log(`[useMediasoup] Producing ${track.kind} track...`);
          const producer = await sendTransportRef.current.produce({
            track,
            // Add simple encodings for video
            ...(track.kind === "video"
              ? {
                  encodings: [{ maxBitrate: 500000, scaleResolutionDownBy: 1 }],
                }
              : {}),
          });

          console.log(`[useMediasoup] Successfully produced ${track.kind} (id: ${producer.id})`);

          producersRef.current.set(track.kind, producer);
          publishedTracksRef.current.add(track.id);

          producer.on("trackended", () => {
            console.log(`[useMediasoup] Track ended: ${track.kind}`);
            // Handle track ended (e.g. device unplugged)
          });

          // If the local track is stopped, we should close producer, but 'trackended' might fire.
          // In React, if localStream changes, this effect runs again.
        } catch (e) {
          console.error(`[useMediasoup] Publish error for ${track.kind}:`, e);
        }
      }
    };

    publish();
  }, [status, localStream]);

  return { status, error, peers, socket: socketRef.current };
}
