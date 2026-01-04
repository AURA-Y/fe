'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  type ChatMessage, 
  type ChatOptions 
} from '@livekit/components-core';
import { 
  useChat, 
  useMaybeLayoutContext, 
  ChatEntry, 
  ChatToggle,
  // 내부 유틸리티를 프로젝트 내 설치된 패키지에서 가져옵니다.
} from '@livekit/components-react';

// LiveKit 내부 유틸리티 함수 (직접 구현 혹은 라이브러리에서 가져오기)
// 라이브러리 깊숙한 곳에 있는 함수이므로 안전하게 아래에 직접 정의하거나 복사해둡니다.
const cloneSingleChild = (children: React.ReactNode, props: any) => {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });
};

// 프로젝트의 유틸리티 함수 가져오기
import { cn } from '@/lib/utils'; 
import { X } from 'lucide-react';

/** @public */
export interface MyCustomChatProps extends React.HTMLAttributes<HTMLDivElement>, ChatOptions {
  messageFormatter?: (message: string) => React.ReactNode;
}

export default function MyCustomChat({
  messageFormatter,
  messageDecoder,
  messageEncoder,
  channelTopic,
  className,
  children,
  ...props
}: MyCustomChatProps) {
    
  const ulRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Framer Motion과의 타입 충돌을 방지하기 위해 HTML 드래그 관련 프로퍼티 제거
  const {
    onDrag, onDragStart, onDragEnd, onAnimationStart, onDragOver, onDragEnter, onDragLeave,
    ...sanitizedProps
  } = props as any;

  const chatOptions: ChatOptions = React.useMemo(() => {
    return { messageDecoder, messageEncoder, channelTopic };
  }, [messageDecoder, messageEncoder, channelTopic]);

  const { chatMessages, send, isSending } = useChat(chatOptions);
  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = React.useRef<ChatMessage['timestamp']>(0);

  // 메시지 전송 로직
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      await send(inputRef.current.value);
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }

  // 새 메시지 수신 시 자동 스크롤
  React.useEffect(() => {
    if (ulRef.current) {
      ulRef.current.scrollTo({ top: ulRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 안 읽은 메시지 상태 동기화
  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) return;

    if (
      layoutContext.widget.state?.showChat &&
      chatMessages.length > 0 &&
      lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
    ) {
      lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp;
      return;
    }

    const unreadMessageCount = chatMessages.filter(
      (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current,
    ).length;

    const { widget } = layoutContext;
    if (unreadMessageCount > 0 && widget.state?.unreadMessages !== unreadMessageCount) {
      widget.dispatch?.({ msg: 'unread_msg', count: unreadMessageCount });
    }
  }, [chatMessages, layoutContext?.widget]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        // Liquid Glass Container 스타일
        "flex flex-col h-full w-full max-w-[420px] overflow-hidden",
        "bg-white/10 backdrop-blur-[40px] backdrop-saturate-[180%]",
        "border border-white/20 rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)]",
        className
      )}
      {...sanitizedProps}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-8 py-5 bg-white/5 border-b border-white/10">
        <h3 className="text-[13px] font-bold text-white/90 tracking-[0.1em] uppercase">
          Live Chat
        </h3>
        {layoutContext && (
          <ChatToggle className="p-2 transition-all rounded-full hover:bg-white/20 active:scale-90 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </ChatToggle>
        )}
      </div>

      {/* Messages List Area */}
      <ul 
        className={cn(
          "flex-1 overflow-y-auto p-6 space-y-4",
          "scrollbar-hide" // 별도의 스크롤바 숨김 처리가 필요할 수 있습니다.
        )} 
        ref={ulRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`ul::-webkit-scrollbar { display: none; }`}</style>
        
        <AnimatePresence initial={false} mode="popLayout">
          {children
            ? chatMessages.map((msg, idx) => (
                <motion.li 
                  key={msg.id ?? idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {cloneSingleChild(children, {
                    entry: msg,
                    key: msg.id ?? idx,
                    messageFormatter,
                  })}
                </motion.li>
              ))
            : chatMessages.map((msg, idx, allMsg) => {
                const hideName = idx >= 1 && allMsg[idx - 1].from === msg.from;
                const hideTimestamp = idx >= 1 && msg.timestamp - allMsg[idx - 1].timestamp < 60_000;

                return (
                  <motion.li 
                    key={msg.id ?? idx}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="list-none"
                  >
                    <ChatEntry
                      hideName={hideName}
                      hideTimestamp={hideName === false ? false : hideTimestamp}
                      entry={msg}
                      messageFormatter={messageFormatter}
                    />
                  </motion.li>
                );
              })}
        </AnimatePresence>
      </ul>

      {/* Input Form Area */}
      <form 
        className="p-6 bg-white/5 border-t border-white/10 flex gap-3 items-center" 
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1 group">
          <input
            className={cn(
              "w-full px-5 py-3 rounded-2xl outline-none transition-all",
              "bg-white/10 border border-white/10 text-white placeholder:text-white/30",
              "group-hover:bg-white/15 focus:bg-white/20 focus:border-white/30 focus:ring-4 ring-white/5",
              "disabled:opacity-50"
            )}
            disabled={isSending}
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            onInput={(ev) => ev.stopPropagation()}
            onKeyDown={(ev) => ev.stopPropagation()}
            onKeyUp={(ev) => ev.stopPropagation()}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSending || !inputRef.current?.value}
          className={cn(
            "h-12 w-20 rounded-2xl font-bold transition-all active:scale-95",
            "bg-white text-black hover:bg-white/90 shadow-xl",
            "disabled:bg-white/20 disabled:text-white/40 disabled:scale-100 disabled:shadow-none"
          )}
        >
          {isSending ? "..." : "Send"}
        </button>
      </form>
    </motion.div>
  );
}