import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { RemotePeer } from "../../hooks/use-mediasoup";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket | null;
  roomId: string;
  nickname: string;
  peers: Map<string, RemotePeer>;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export function ChatSidebar({
  isOpen,
  onClose,
  socket,
  roomId,
  nickname,
  peers,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "System",
      text: "채팅방에 연결되었습니다.",
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const onMessage = (data: { sender: string; text: string; timestamp?: string }) => {
      if (data.sender === nickname) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          sender: data.sender,
          text: data.text,
          timestamp:
            data.timestamp ||
            new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    };

    socket.on("chat-message", onMessage);

    return () => {
      socket.off("chat-message", onMessage);
    };
  }, [socket, nickname]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    const timestamp = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Emit to server
    if (socket && roomId) {
      socket.emit("chat-message", { roomId, text, sender: nickname });
    }

    // 2. Add locally
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Me",
      text: text,
      timestamp,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`border-l border-white/5 bg-[#12131a] transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0"
      } flex flex-col overflow-hidden`}
    >
      {/* Sidebar Header with Tabs */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0e0f15] px-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              activeTab === "chat" ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            채팅
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              activeTab === "participants" ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Users className="h-4 w-4" />
            참가자 ({peers.size + 1})
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          ×
        </Button>
      </div>

      {/* Content Area */}
      {activeTab === "chat" ? (
        <>
          {/* Chat Area */}
          <div className="custom-scroll flex-1 space-y-4 overflow-y-auto p-4" ref={scrollRef}>
            <div className="flex justify-center py-4">
              <p className="text-xs text-slate-500">오늘</p>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "Me" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    msg.sender === "Me" ? "bg-blue-600" : "bg-indigo-500"
                  }`}
                >
                  {msg.sender[0]}
                </div>
                <div>
                  <div
                    className={`flex items-baseline gap-2 ${msg.sender === "Me" ? "justify-end" : ""}`}
                  >
                    <span className="text-sm font-semibold text-white">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p
                    className={`text-sm ${msg.sender === "Me" ? "text-right text-slate-200" : "text-slate-300"}`}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-[#12131a] p-4">
            <div className="relative rounded-lg bg-[#20222b] px-4 py-2 ring-1 ring-white/5 focus-within:ring-indigo-500/50">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 보내기..."
                className="h-auto border-0 bg-transparent p-0 py-1 text-sm text-white placeholder:text-slate-500 focus-visible:ring-0"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="h-6 w-6 rounded-full bg-indigo-500 hover:bg-indigo-600"
                >
                  <Send className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Participants Area */
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="mb-4 text-xs font-semibold text-slate-500">참가자 목록</h3>
          <div className="space-y-4">
            {/* Me */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {nickname[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{nickname} (나)</p>
                <p className="text-xs text-slate-400">Host</p>
              </div>
            </div>

            {/* Others */}
            {Array.from(peers.values()).map((peer) => (
              <div key={peer.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold text-white">
                  {(peer.displayName || peer.id)[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{peer.displayName || peer.id}</p>
                  <p className="text-xs text-slate-400">Guest</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
