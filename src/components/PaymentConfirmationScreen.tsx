import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageCircle, ArrowLeft, Camera, ShieldAlert, Image as ImageIcon, Upload, Trash2, Check } from 'lucide-react';
import { OrderState } from '../types';

interface PaymentConfirmationScreenProps {
  order: OrderState;
  onContinueToWhatsApp: () => void;
  onBackToPayment: () => void;
  onUpdateScreenshot: (dataUrl: string | undefined, file: File | undefined) => void;
}

export const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({
  order,
  onContinueToWhatsApp,
  onBackToPayment,
  onUpdateScreenshot,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { customerName, paymentScreenshot } = order;

  const rawFirstName = customerName ? customerName.trim().split(/\s+/)[0] : '';
  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)
    : 'Friend';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateScreenshot(reader.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    onUpdateScreenshot(undefined, undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          ✅ Payment Step Ready
        </span>
        <h2 className="font-serif font-extrabold text-2xl text-[#2C1810]">
          Ready to Send, {firstName}!
        </h2>
        <p className="text-xs text-[#2C1810]/80 leading-relaxed max-w-sm mx-auto font-medium">
          {paymentScreenshot
            ? 'Your payment screenshot is attached below. Tap the button to launch WhatsApp!'
            : 'Please pick your payment screenshot from gallery so you can send it along on WhatsApp.'}
        </p>
      </div>

      {/* Screenshot Selector / Preview Card */}
      <div className="bg-[#2C1810] text-[#FAF6F0] p-4 rounded-2xl border border-[#543123] text-left space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5A93B]">
            <Camera className="w-4 h-4 text-[#E5A93B]" />
            <span>Payment Proof Screenshot</span>
          </div>
          {paymentScreenshot && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700/50 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="confirm-screenshot-input"
        />

        {paymentScreenshot ? (
          <div className="bg-[#180E0A] p-3 rounded-xl border border-[#3D2218] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-400 bg-black flex-shrink-0 shadow-md">
                <img
                  src={paymentScreenshot}
                  alt="Payment Screenshot Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current text-emerald-400" />
                  <span>Screenshot Ready</span>
                </div>
                <p className="text-[10px] text-[#FAF6F0]/70">
                  Tap button below to share directly via WhatsApp
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="confirm-screenshot-input"
                className="px-2.5 py-1 rounded-lg bg-[#3D2218] hover:bg-[#543123] text-[#E5A93B] font-bold text-[10px] cursor-pointer text-center transition-colors"
              >
                Change
              </label>
              <button
                type="button"
                onClick={handleRemoveScreenshot}
                className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-center transition-colors cursor-pointer flex items-center justify-center"
                title="Remove Screenshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="confirm-screenshot-input"
            className="w-full py-3.5 px-3 rounded-xl border-2 border-dashed border-[#E5A93B]/70 bg-[#180E0A] hover:bg-[#180E0A]/80 transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-[#E5A93B] text-[#180E0A] flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#E5A93B] block">
                Choose Screenshot from Gallery
              </span>
              <span className="text-[10px] text-[#FAF6F0]/70">
                Select payment receipt picture before opening WhatsApp
              </span>
            </div>
          </label>
        )}

        <div className="flex items-start gap-1.5 text-[10px] text-[#FAF6F0]/70 pt-1 border-t border-[#3D2218]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>Orders are confirmed immediately upon receiving the payment screenshot.</span>
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
          <span>📲 Send Order & Screenshot on WhatsApp</span>
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

