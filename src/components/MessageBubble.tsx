import React from 'react';
import { motion } from 'motion/react';
import { User, Bot, Sparkles } from 'lucide-react';
import { restaurantConfig } from '../config/restaurantConfig';

interface MessageBubbleProps {
  sender: 'assistant' | 'user';
  text: string;
  isTyping?: boolean;
  timestamp?: string;
  avatarIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  text,
  isTyping = false,
  timestamp,
  avatarIcon,
  children,
}) => {
  const isAssistant = sender === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-2.5 my-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E5A93B] to-[#C78D24] p-0.5 flex-shrink-0 shadow-md shadow-[#E5A93B]/20 mt-0.5">
          <div className="w-full h-full bg-[#2C1810] rounded-full flex items-center justify-center text-sm">
            🍫
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-md text-sm leading-relaxed ${
            isAssistant
              ? 'bg-[#FAF6F0] text-[#2C1810] rounded-tl-sm border border-[#E6D7C3]'
              : 'bg-gradient-to-r from-[#E5A93B] to-[#F3BF59] text-[#180E0A] rounded-tr-sm font-medium shadow-amber-900/10'
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <span className="w-2 h-2 rounded-full bg-[#2C1810] typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-[#2C1810] typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-[#2C1810] typing-dot"></span>
            </div>
          ) : (
            <div className="whitespace-pre-line font-sans">
              {text}
            </div>
          )}

          {/* Embedded Custom Action UI or Form Cards */}
          {children && (
            <div className="mt-3 pt-2 border-t border-[#3D2218]/10 w-full">
              {children}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !isTyping && (
          <span className="text-[10px] text-[#FAF6F0]/50 mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-[#3D2218] border border-[#543123] flex items-center justify-center text-xs text-[#E5A93B] flex-shrink-0 mt-0.5 shadow">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};
