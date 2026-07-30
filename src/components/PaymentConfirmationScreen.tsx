import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageCircle, ArrowLeft, Camera, ShieldAlert } from 'lucide-react';
import { OrderState } from '../types';

interface PaymentConfirmationScreenProps {
  order: OrderState;
  onContinueToWhatsApp: () => void;
  onBackToPayment: () => void;
}

export const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  order,
  onContinueToWhatsApp,
  onBackToPayment,
}) => {
  const { customerName } = order;

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
      {/* Icon Badge */}
      <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 flex items-center justify-center shadow-xl shadow-emerald-600/30">
        <div className="w-full h-full bg-[#2C1810] rounded-full flex items-center justify-center text-white">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 fill-emerald-950" />
        </div>
      </div>

      {/* Title & Headers */}
      <div className="space-y-1.5">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider">
          ✅ Order Summary Ready
        </span>
        <h2 className="font-serif font-extrabold text-2xl text-[#2C1810]">
          Ready to Send, {firstName}!
        </h2>
        <p className="text-xs text-[#2C1810]/80 leading-relaxed max-w-sm mx-auto font-medium">
          Your order details are formatted and ready. Tap the button below to launch WhatsApp and send your order.
        </p>
      </div>

      {/* Verified Razorpay Payment Badge */}
      {order.paymentVerified && (
        <div className="bg-[#2C1810] text-[#FAF6F0] p-4.5 rounded-2xl border border-emerald-500/60 text-left space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#3D2218] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-current" />
              <span>Verified Razorpay Receipt</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-700">
              Anti-Scam Verified
            </span>
          </div>
          <div className="font-mono text-xs text-[#FAF6F0] bg-[#180E0A] p-2.5 rounded-xl border border-[#3D2218] flex items-center justify-between">
            <span className="text-[10px] text-[#FAF6F0]/70">Payment ID:</span>
            <span className="font-bold text-emerald-300">{order.razorpayPaymentId}</span>
          </div>
        </div>
      )}

      {/* Screenshot Instructions & Reminders Box */}
      <div className="bg-[#2C1810] text-[#FAF6F0] p-4.5 rounded-2xl border border-[#543123] text-left space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E5A93B]">
          <Camera className="w-4 h-4 text-[#E5A93B]" />
          <span>Important Payment Screenshot Reminder</span>
        </div>

        <div className="space-y-2 text-xs text-[#FAF6F0]/90">
          <p className="leading-relaxed bg-[#180E0A] p-3 rounded-xl border border-[#3D2218]">
            📸 <strong>Attach Screenshot in WhatsApp:</strong> When WhatsApp opens, tap the <strong>attachment / camera icon (📎)</strong> at the bottom of the chat to attach your payment screenshot before hitting Send.
          </p>
          <p className="text-[11px] text-[#E5A93B] font-medium leading-tight px-1">
            ⚡ <em>Tip: Orders are verified immediately upon receiving your payment proof!</em>
          </p>
        </div>

        <div className="flex items-start gap-1.5 text-[10px] text-[#FAF6F0]/70 pt-2 border-t border-[#3D2218]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>Orders without payment proof may not be confirmed.</span>
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
          <span>📲 Send Order Details on WhatsApp</span>
        </motion.button>

        {/* Secondary Button: Back */}
        <button
          onClick={onBackToPayment}
          className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-[#E6D7C3] text-[#2C1810] font-semibold text-xs hover:bg-[#E6D7C3]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#2C1810]" />
          <span>Back to Payment Page</span>
        </button>
      </div>
    </motion.div>
  );
};

