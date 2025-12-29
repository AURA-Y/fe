import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  MessageSquare,
  Users,
  Plus,
  Minus,
} from "lucide-react";

interface ControlBarProps {
  isVisible: boolean;
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  participantCount: number;
  onMicToggle: () => void;
  onCamToggle: () => void;
  onScreenShareToggle: () => void;
  onChatToggle: () => void;
  onLeave: () => void;
  onAddParticipant: () => void;
  onRemoveParticipant: () => void;
}

export function ControlBar({
  isVisible,
  isMicOn,
  isCamOn,
  isScreenSharing,
  isChatOpen,
  participantCount,
  onMicToggle,
  onCamToggle,
  onScreenShareToggle,
  onChatToggle,
  onLeave,
  onAddParticipant,
  onRemoveParticipant,
}: ControlBarProps) {
  return (
    <div
      className={`absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-3 rounded-2xl border border-white/10 bg-[#171821]/90 px-4 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        className={`h-12 w-12 rounded-xl transition-all ${
          isMicOn
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        onClick={onMicToggle}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-12 w-12 rounded-xl transition-all ${
          isCamOn
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        onClick={onCamToggle}
      >
        {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {/* Screen Share Button - Now BLUE when active */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-12 w-12 rounded-xl transition-all ${
          isScreenSharing
            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-700"
            : "bg-white/10 text-slate-300 hover:bg-white/20"
        }`}
        onClick={onScreenShareToggle}
      >
        <ScreenShare className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`relative h-12 w-12 rounded-xl transition-all ${
          isChatOpen
            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:bg-blue-700"
            : "bg-white/10 text-slate-300 hover:bg-white/20"
        }`}
        onClick={onChatToggle}
      >
        <MessageSquare className="h-5 w-5" />
        {/* Unread indicator mockup */}
        {!isChatOpen && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />}
      </Button>

      <div className="mx-2 h-8 w-px bg-white/10"></div>

      {/* Grid Test Controls */}
      <div className="flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1">
        <Users className="h-4 w-4 text-slate-400" />
        <span className="mx-1 min-w-[12px] text-center text-sm font-medium text-slate-300">
          {participantCount}
        </span>
        <div className="flex flex-col gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-6 rounded hover:bg-white/10"
            onClick={onAddParticipant}
          >
            <Plus className="h-3 w-3 text-slate-400" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-4 w-6 rounded hover:bg-white/10"
            onClick={onRemoveParticipant}
          >
            <Minus className="h-3 w-3 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="mx-2 h-8 w-px bg-white/10"></div>

      <Button
        className="h-12 gap-2 rounded-xl bg-red-600 px-6 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-600/20"
        onClick={onLeave}
      >
        <PhoneOff className="h-5 w-5" />
        <span className="hidden sm:inline">나가기</span>
      </Button>
    </div>
  );
}
