import React from 'react';
import { motion } from 'motion/react';
import { Send, MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  onClick,
  label = 'Confirm Order via WhatsApp',
  disabled = false,
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-between gap-3 ${
        disabled
          ? 'bg-gray-600 opacity-50 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30 cursor-pointer active:scale-98'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
          <MessageCircle className="w-5 h-5 fill-current" />
        </div>
        <div className="text-left leading-tight">
          <div className="text-sm font-bold">{label}</div>
          <div className="text-[10px] text-emerald-100 font-normal">
            Redirects to official WhatsApp chat
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl text-xs">
        <span>SEND</span>
        <Send className="w-3.5 h-3.5" />
      </div>
    </motion.button>
  );
};
