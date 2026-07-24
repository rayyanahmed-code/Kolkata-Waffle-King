import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageCircle, Phone, RefreshCw, Sparkles, ShoppingBag } from 'lucide-react';
import { restaurantConfig } from '../config/restaurantConfig';

interface CompletionModalProps {
  onReopenWhatsApp: () => void;
  onNewOrder: () => void;
  customerName: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  onReopenWhatsApp,
  onNewOrder,
  customerName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-[#FAF6F0] rounded-3xl border border-[#E6D7C3] p-6 text-center shadow-2xl space-y-5 my-4 text-[#2C1810]"
    >
      {/* Icon Badge */}
      <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#E5A93B] to-[#C78D24] p-1 flex items-center justify-center shadow-lg shadow-[#E5A93B]/30">
        <div className="w-full h-full bg-[#2C1810] rounded-full flex items-center justify-center text-3xl">
          🎉
        </div>
        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
          <CheckCircle2 className="w-5 h-5" />
        </span>
      </div>

      {/* Title & Message */}
      <div className="space-y-2">
        <h2 className="font-serif font-extrabold text-2xl text-[#2C1810]">
          Almost Done, {customerName || 'Friend'}! 🎉
        </h2>
        <p className="text-sm font-semibold text-[#2C1810]/80 leading-relaxed max-w-sm mx-auto">
          Your order details are ready.
        </p>
        <p className="text-xs text-[#2C1810]/70 leading-relaxed bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
          👉 <strong>Tap SEND in WhatsApp</strong> to complete your request.
          The restaurant will contact you shortly for confirmation.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onReopenWhatsApp}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Open WhatsApp Again</span>
        </button>

        <a
          href={`tel:${restaurantConfig.whatsappNumber}`}
          className="w-full py-3 px-4 rounded-xl bg-[#2C1810] hover:bg-[#3D2218] text-[#FAF6F0] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-3.5 h-3.5 text-[#E5A93B]" />
          <span>Call Restaurant Directly</span>
        </a>

        <button
          onClick={onNewOrder}
          className="w-full py-2.5 px-4 text-xs font-semibold text-[#2C1810]/70 hover:text-[#2C1810] flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Start a New Order</span>
        </button>
      </div>
    </motion.div>
  );
};
