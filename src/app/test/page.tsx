'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { Device } from 'mediasoup-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function TestPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [roomId, setRoomId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const deviceRef = useRef<Device | null>(null);
  const producerTransportRef = useRef<any>(null);
  const consumerTransportRef = useRef<any>(null);
  const producersRef = useRef<Map<string, any>>(new Map());
  const consumersRef = useRef<Map<string, any>>(new Map());

  // Socket.IO 연결
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('joined-room', async ({ peerId, peers: existingPeers }) => {
      console.log('🎉 Joined room as:', peerId);
      console.log('👥 Existing peers:', existingPeers);
      setPeers(existingPeers);
      setJoined(true);

      // Device 로드 및 미디어 전송 시작
      try {
        console.log('📱 Starting loadDevice...');
        const loadedDevice = await loadDevice(newSocket);
        console.log('✅ Device loaded successfully');

        console.log('🎥 Starting startProducing...');
        await startProducing(newSocket, loadedDevice);
        console.log('✅ Producing started successfully');

        // 기존 참가자들의 미디어 수신
        for (const peer of existingPeers) {
          for (const producerId of peer.producerIds) {
            console.log('📺 Consuming from peer:', peer.id, 'producer:', producerId);
            await consumeMedia(newSocket, producerId, peer.id, loadedDevice);
          }
        }
      } catch (error) {
        console.error('❌ Error in joined-room handler:', error);
        alert('Error: ' + error);
      }
    });

    newSocket.on('new-peer', ({ peer }) => {
      console.log('New peer joined:', peer);
      setPeers((prev) => [...prev, peer]);
    });

    newSocket.on('peer-left', ({ peerId }) => {
      console.log('Peer left:', peerId);
      setPeers((prev) => prev.filter((p) => p.id !== peerId));

      // 해당 peer의 consumer 정리
      consumersRef.current.forEach((consumer, consumerId) => {
        if (consumer.appData?.peerId === peerId) {
          consumer.close();
          consumersRef.current.delete(consumerId);
        }
      });
    });

    newSocket.on('new-producer', async ({ peerId, producerId }) => {
      console.log('🔔 NEW-PRODUCER event received!');
      console.log('  - Producer ID:', producerId);
      console.log('  - Peer ID:', peerId);
      console.log('  - Current device ref:', deviceRef.current);

      // Device가 준비될 때까지 대기
      const currentDevice = deviceRef.current || await new Promise<Device>((resolve, reject) => {
        console.log('⏳ Waiting for device to be ready...');
        const checkDevice = setInterval(() => {
          if (deviceRef.current) {
            console.log('✅ Device is now ready!');
            clearInterval(checkDevice);
            resolve(deviceRef.current);
          }
        }, 100);
        // 10초 타임아웃
        setTimeout(() => {
          clearInterval(checkDevice);
          console.log('❌ Device wait timeout after 10 seconds');
          reject(new Error('Device timeout'));
        }, 10000);
      });

      if (currentDevice) {
        console.log('📺 Calling consumeMedia for new producer...');
        await consumeMedia(newSocket, producerId, peerId, currentDevice);
        console.log('✅ consumeMedia completed for producer:', producerId);
      } else {
        console.error('❌ No device available to consume media');
      }
    });

    newSocket.on('error', ({ message }) => {
      console.error('Error from server:', message);
      alert(`Error: ${message}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Device 로드
  const loadDevice = async (sock: Socket): Promise<Device> => {
    return new Promise<Device>((resolve, reject) => {
      sock.emit('get-router-rtp-capabilities', async (response: any) => {
        try {
          if (!response) {
            throw new Error('No response from server');
          }
          const { rtpCapabilities } = response;
          const newDevice = new mediasoupClient.Device();
          await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
          setDevice(newDevice);
          deviceRef.current = newDevice; // Store in ref as well
          console.log('Device loaded', rtpCapabilities);
          resolve(newDevice);
        } catch (error) {
          console.error('Error loading device:', error);
          reject(error);
        }
      });
    });
  };

  // 방 참가
  const joinRoom = async () => {
    if (!socket || !roomId || !displayName) {
      alert('Please enter room ID and display name');
      return;
    }

    socket.emit('join-room', { roomId, displayName });
  };

  // Producer Transport 생성
  const createProducerTransport = async (sock: Socket, dev: Device) => {
    return new Promise<any>((resolve, reject) => {
      sock.emit('create-webrtc-transport', { producing: true }, async (params: any) => {
        try {
          if (!params) {
            throw new Error('No transport params received');
          }

          console.log('Creating send transport with params:', params);
          const transport = dev.createSendTransport(params);

          transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
              sock.emit('connect-transport', {
                transportId: transport.id,
                dtlsParameters,
              }, (response: any) => {
                if (response && response.connected) {
                  callback();
                } else {
                  errback(new Error('Transport connection failed'));
                }
              });
            } catch (error) {
              errback(error);
            }
          });

          transport.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
            try {
              sock.emit('produce', {
                transportId: transport.id,
                kind,
                rtpParameters,
              }, (response: any) => {
                if (response && response.id) {
                  callback({ id: response.id });
                } else {
                  errback(new Error('Produce failed'));
                }
              });
            } catch (error) {
              errback(error);
            }
          });

          producerTransportRef.current = transport;
          resolve(transport);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  // Consumer Transport 생성
  const createConsumerTransport = async (sock: Socket, dev: Device) => {
    return new Promise<any>((resolve, reject) => {
      sock.emit('create-webrtc-transport', { producing: false }, async (params: any) => {
        try {
          if (!params) {
            throw new Error('No transport params received');
          }

          console.log('Creating recv transport with params:', params);
          const transport = dev.createRecvTransport(params);

          transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
              sock.emit('connect-transport', {
                transportId: transport.id,
                dtlsParameters,
              }, (response: any) => {
                if (response && response.connected) {
                  callback();
                } else {
                  errback(new Error('Transport connection failed'));
                }
              });
            } catch (error) {
              errback(error);
            }
          });

          consumerTransportRef.current = transport;
          resolve(transport);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  // 미디어 전송 시작
  const startProducing = async (sock: Socket, currentDevice: Device) => {
    try {
      console.log('📹 Requesting camera/microphone access...');
      // 로컬 미디어 스트림 가져오기 (고품질 오디오 설정)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,      // 에코 제거
          noiseSuppression: true,       // 노이즈 억제
          autoGainControl: true,        // 자동 게인 컨트롤
          sampleRate: 48000,            // 샘플레이트 48kHz
          channelCount: 2,              // 스테레오
        },
      });
      console.log('✅ Got media stream:', stream);

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Device ready:', currentDevice);

      console.log('🚀 Creating producer transport...');
      // Producer Transport 생성
      const transport = await createProducerTransport(sock, currentDevice);
      if (!transport) {
        console.error('❌ Failed to create transport');
        return;
      }
      console.log('✅ Producer transport created:', transport.id);

      console.log('📹 Creating video producer...');
      // Video Producer 생성
      const videoTrack = stream.getVideoTracks()[0];
      const videoProducer = await transport.produce({ track: videoTrack });
      producersRef.current.set(videoProducer.id, videoProducer);
      console.log('✅ Video producer created:', videoProducer.id);

      console.log('🎤 Creating audio producer...');
      // Audio Producer 생성
      const audioTrack = stream.getAudioTracks()[0];
      const audioProducer = await transport.produce({ track: audioTrack });
      producersRef.current.set(audioProducer.id, audioProducer);
      console.log('✅ Audio producer created:', audioProducer.id);
    } catch (error) {
      console.error('❌ Error starting producing:', error);
      alert('Failed to access camera/microphone: ' + error);
    }
  };

  // 미디어 수신
  const consumeMedia = async (sock: Socket, producerId: string, peerId: string, currentDevice: Device) => {
    try {
      console.log('🎬 consumeMedia called');
      console.log('  - Producer ID:', producerId);
      console.log('  - Peer ID:', peerId);
      console.log('  - Device:', currentDevice);
      console.log('  - Current consumerTransport:', consumerTransportRef.current);

      // Consumer Transport가 없으면 생성
      if (!consumerTransportRef.current) {
        console.log('🚀 Creating consumer transport...');
        await createConsumerTransport(sock, currentDevice);
        console.log('✅ Consumer transport created:', consumerTransportRef.current?.id);
      } else {
        console.log('✅ Using existing consumer transport:', consumerTransportRef.current.id);
      }

      const transport = consumerTransportRef.current;
      if (!transport) {
        console.error('❌ No consumer transport available');
        return;
      }

      console.log('📤 Emitting consume event to server...');
      sock.emit('consume', {
        transportId: transport.id,
        producerId,
        rtpCapabilities: currentDevice.rtpCapabilities,
      }, async (params: any) => {
        console.log('📥 Consume response received:', params);
        try {
          if (!params || !params.id) {
            console.error('Invalid consume response:', params);
            return;
          }

          console.log('Consuming with params:', params);
          const consumer = await transport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
          });

          consumer.appData = { peerId };
          consumersRef.current.set(consumer.id, consumer);

          // Consumer 재개
          sock.emit('resume-consumer', { consumerId: consumer.id }, (response: any) => {
            console.log('Consumer resumed:', consumer.id);
          });

          // Video element에 스트림 추가
          const stream = new MediaStream([consumer.track]);

          // peer별 video element 찾기 또는 생성
          setTimeout(() => {
            const videoElement = document.getElementById(`remote-video-${peerId}`) as HTMLVideoElement;
            if (videoElement) {
              if (!videoElement.srcObject) {
                videoElement.srcObject = stream;
              } else {
                (videoElement.srcObject as MediaStream).addTrack(consumer.track);
              }
              console.log('Stream added to video element for peer:', peerId);
            } else {
              console.warn('Video element not found for peer:', peerId);
            }
          }, 100);

          console.log('Consumer created:', consumer.id, 'for producer:', producerId);
        } catch (error) {
          console.error('Error consuming:', error);
        }
      });
    } catch (error) {
      console.error('Error in consumeMedia:', error);
    }
  };

  // 마이크 토글
  const toggleAudio = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
  };

  // 카메라 토글
  const toggleVideo = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">
          WebRTC Video Conference Test
        </h1>

        {!joined ? (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Room ID
                </label>
                <Input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
              <Button onClick={joinRoom} className="w-full">
                Join Room
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={toggleAudio}>Toggle Mic</Button>
              <Button onClick={toggleVideo}>Toggle Camera</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 로컬 비디오 */}
              <Card className="p-4">
                <div className="mb-2 text-sm font-medium text-white">
                  You ({displayName})
                </div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full rounded-lg bg-gray-800"
                />
              </Card>

              {/* 원격 참가자 비디오 */}
              {peers.map((peer) => (
                <Card key={peer.id} className="p-4">
                  <div className="mb-2 text-sm font-medium text-white">
                    {peer.displayName}
                  </div>
                  <video
                    id={`remote-video-${peer.id}`}
                    autoPlay
                    playsInline
                    className="aspect-video w-full rounded-lg bg-gray-800"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
