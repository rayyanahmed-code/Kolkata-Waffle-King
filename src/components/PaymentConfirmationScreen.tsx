import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageCircle, ArrowLeft, Camera, ShieldAlert } from 'lucide-react';
import { restaurantConfig } from '../config/restaurantConfig';

interface PaymentConfirmationScreenProps {
  onContinueToWhatsApp: () => void;
  onBackToPayment: () => void;
  customerName: string;
}

export const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  onContinueToWhatsApp,
  onBackToPayment,
  customerName,
}) => {
  const rawFirstName = customerName ? customerName.trim().split(/\s+/)[0] : '';
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)
    : 'Friend';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-[#FAF6F0] rounded-3xl border border-[#E6D7C3] p-6 text-center shadow-2xl space-y-5 my-4 text-[#2C1810]"
    >
      {/* Large Green Tick Icon Badge */}
      <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-bounce-short">
        <div className="w-full h-full bg-[#2C1810] rounded-full flex items-center justify-center text-white">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 fill-emerald-950" />
        </div>
      </div>

      {/* Title & Headers */}
      <div className="space-y-1.5">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider">
          ✅ Payment Step Completed
        </span>
        <h2 className="font-serif font-extrabold text-2xl text-[#2C1810]">
          One Final Step, {firstName}!
        </h2>
        <p className="text-xs text-[#2C1810]/80 leading-relaxed max-w-sm mx-auto font-medium">
          Please remember to attach your payment screenshot in WhatsApp after sending the order message.
        </p>
      </div>

      {/* Highlighted Payment Screenshot Reminder Box */}
      <div className="bg-[#2C1810] text-[#FAF6F0] p-4 rounded-2xl border border-[#543123] text-left space-y-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E5A93B]">
          <Camera className="w-4 h-4 text-[#E5A93B]" />
          <span>📸 Payment Screenshot Reminder</span>
        </div>
        <div className="text-[11px] text-[#FAF6F0]/90 space-y-1.5 leading-relaxed bg-[#180E0A] p-2.5 rounded-xl border border-[#3D2218]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#E5A93B] text-[#180E0A] font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
            <span>Open WhatsApp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#E5A93B] text-[#180E0A] font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
            <span>Send Order Message</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#E5A93B] text-[#180E0A] font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
            <span>Attach Payment Screenshot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#E5A93B] text-[#180E0A] font-bold text-[10px] flex items-center justify-center flex-shrink-0">4</span>
            <span>Press Send</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-[10px] text-[#FAF6F0]/70 pt-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>Your order will only be confirmed after payment verification. Orders without payment proof may not be confirmed.</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Primary Button: Continue to WhatsApp */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onContinueToWhatsApp}
          className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30 cursor-pointer active:scale-98"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>📲 Continue to WhatsApp</span>
        </motion.button>

        {/* Secondary Button: Back */}
        <button
          onClick={onBackToPayment}
          className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-[#E6D7C3] text-[#2C1810] font-semibold text-xs hover:bg-[#E6D7C3]/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#2C1810]" />
          <span>Back to Payment Page</span>
        </button>
      </div>
    </motion.div>
  );
};
