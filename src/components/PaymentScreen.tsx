import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, Copy, Check, ArrowLeft, QrCode, Sparkles, Image as ImageIcon, Upload, Trash2, Camera, ShieldCheck } from 'lucide-react';
import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance, calculateParcelCharge } from '../utils/delivery';

interface PaymentScreenProps {
  order: OrderState;
  onPaymentCompleted: () => void;
  onBackToSummary: () => void;
  onUpdateScreenshot: (dataUrl: string | undefined, file: File | undefined) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  order,
  onPaymentCompleted,
  onBackToSummary,
  onUpdateScreenshot,
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cart, orderType, location, paymentScreenshot } = order;

  // Calculate bill totals
  const subtotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const parcelFee = calculateParcelCharge(cart);
  const distanceKm = orderType === 'delivery' ? getOrderDeliveryDistance(location) : null;
  const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const grandTotal = subtotal + parcelFee + deliveryFee;

  const advanceAmount = Math.ceil(grandTotal * 0.5);
  const remainingAmount = grandTotal - advanceAmount;

  const upiId = restaurantConfig.upi?.upiId || '7003459674@kotakbank';
  const payeeName = restaurantConfig.upi?.payeeName || 'MD SAMIR IQBAL';
  const cleanPayeeName = payeeName.replace(/%20/g, ' ');

  // Clean QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${cleanPayeeName}&am=${advanceAmount}&cu=INR`
  )}`;

  // Automatically copy owner's UPI ID when customer arrives at payment screen
  useEffect(() => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        const t = setTimeout(() => setCopied(false), 3000);
        return () => clearTimeout(t);
      }
    } catch (e) {
      console.warn('Auto copy error:', e);
    }
  }, [upiId]);

  const handleCopyUpi = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

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

  const handleRemoveScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateScreenshot(undefined, undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4 my-2 text-[#2C1810]"
    >
      {/* Header Banner */}
      <div className="bg-[#2C1810] text-[#FAF6F0] p-4 rounded-3xl border border-[#543123] shadow-xl text-center relative overflow-hidden space-y-1">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToSummary}
            className="p-1.5 rounded-xl bg-[#3D2218] hover:bg-[#543123] text-[#FAF6F0] text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E5A93B]" />
            <span>Back</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-[#E5A93B] text-[#180E0A] px-2.5 py-0.5 rounded-full">
            Step 2 of 2
          </span>
        </div>

        <div className="pt-1">
          <h2 className="font-serif font-bold text-xl text-[#FAF6F0] flex items-center justify-center gap-2">
            <span>🍫</span>
            <span>{restaurantConfig.name}</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E5A93B] mt-1 bg-[#3D2218] px-3 py-1 rounded-full border border-[#543123]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay 50% Advance (₹{advanceAmount})</span>
          </div>
        </div>
      </div>

      {/* Auto-Copied Toast Alert */}
      <div className="bg-emerald-950 text-emerald-200 border border-emerald-700/60 p-3 rounded-2xl flex items-center justify-between shadow-md text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
          <span>
            UPI ID <strong className="font-mono text-white underline">{upiId}</strong> copied automatically!
          </span>
        </div>
        <button
          onClick={handleCopyUpi}
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-mono px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Bill Summary Card */}
      <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-4 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E6D7C3]/60">
          <span className="text-xs font-bold text-[#2C1810]/70 uppercase tracking-wider">Total Order Bill</span>
          <span className="text-sm font-bold text-[#2C1810]">₹{grandTotal}</span>
        </div>

        <div className="bg-[#2C1810] text-[#FAF6F0] p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#E5A93B] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E5A93B] animate-pulse"></span>
              Advance Payment Required (50%)
            </span>
            <span className="text-lg font-extrabold text-[#E5A93B]">₹{advanceAmount}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#FAF6F0]/70 pt-1 border-t border-[#3D2218]">
            <span>Remaining Amount (at {orderType === 'delivery' ? 'Delivery' : 'Pickup'}):</span>
            <span className="font-semibold text-[#FAF6F0]">₹{remainingAmount}</span>
          </div>
        </div>
      </div>

      {/* QR Payment Box Section */}
      <div className="bg-[#FAF6F0] border-2 border-[#E5A93B]/60 p-5 rounded-3xl shadow-xl text-center space-y-4">
        {/* Main Caption Requested by User */}
        <div className="bg-[#2C1810] text-[#E5A93B] p-3 rounded-2xl border border-[#543123] shadow-md space-y-0.5">
          <h3 className="font-serif font-extrabold text-base text-[#FAF6F0] flex items-center justify-center gap-1.5">
            <QrCode className="w-5 h-5 text-[#E5A93B]" />
            <span>Pay here and take a screenshot of the payment</span>
          </h3>
          <p className="text-[11px] text-[#E5A93B] font-medium">
            Scan using any UPI app on your phone to pay ₹{advanceAmount}
          </p>
        </div>

        {/* Clean QR Code Card */}
        <div className="w-full max-w-xs mx-auto bg-gradient-to-b from-[#180E0A] via-[#2C1810] to-[#801030] p-4 rounded-3xl shadow-2xl border-2 border-[#E5A93B]/60 text-white space-y-3">
          <div className="bg-white p-2.5 rounded-2xl shadow-inner mx-auto w-52 h-52 flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code - Pay here and take screenshot"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1.5 text-center">
            <div className="text-xs font-bold tracking-wide text-[#FAF6F0]">{payeeName}</div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="font-mono bg-black/50 px-2.5 py-1 rounded-lg border border-white/20 text-[#E5A93B] font-bold">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHOOSE SCREENSHOT FROM GALLERY SECTION */}
      <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-4 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#E6D7C3]/60 pb-2">
          <label className="text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#E5A93B]" />
            <span>Upload Payment Screenshot</span>
          </label>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Required for Verification
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="payment-screenshot-input"
        />

        {paymentScreenshot ? (
          /* Screenshot Selected Preview Box */
          <div className="bg-[#2C1810] text-[#FAF6F0] p-3.5 rounded-2xl border border-emerald-500/50 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-400 bg-black flex-shrink-0">
                <img
                  src={paymentScreenshot}
                  alt="Selected Payment Screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                  <span>Screenshot Selected!</span>
                </div>
                <p className="text-[10px] text-[#FAF6F0]/70">
                  Ready to send on WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="payment-screenshot-input"
                className="px-2.5 py-1.5 rounded-xl bg-[#3D2218] hover:bg-[#543123] text-[#E5A93B] font-bold text-[10px] cursor-pointer transition-colors"
              >
                Change
              </label>
              <button
                type="button"
                onClick={handleRemoveScreenshot}
                className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                title="Remove Screenshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload Trigger Button */
          <label
            htmlFor="payment-screenshot-input"
            className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#E5A93B] bg-[#2C1810]/5 hover:bg-[#2C1810]/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-[#2C1810] text-[#E5A93B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2C1810] group-hover:text-[#E5A93B] transition-colors flex items-center justify-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#E5A93B]" />
                <span>Choose Payment Screenshot from Gallery</span>
              </span>
              <p className="text-[10px] text-[#2C1810]/70 mt-0.5">
                Tap here to pick your payment receipt image from your phone
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Button: Proceed to WhatsApp Confirmation */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onPaymentCompleted}
        className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
          paymentScreenshot
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30'
            : 'bg-gradient-to-r from-[#2C1810] via-[#3D2218] to-[#543123] hover:brightness-110 shadow-black/20'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 fill-current text-[#E5A93B]" />
        <span>
          {paymentScreenshot
            ? '✅ Proceed to Send Order & Screenshot'
            : 'I Have Paid & Taken Screenshot (Next Step)'}
        </span>
      </motion.button>
    </motion.div>
  );
};


