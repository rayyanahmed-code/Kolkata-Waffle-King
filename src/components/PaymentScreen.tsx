import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, Copy, Check, Info, ArrowLeft, ShieldCheck, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance, calculateParcelCharge } from '../utils/delivery';

interface PaymentScreenProps {
  order: OrderState;
  onPaymentCompleted: () => void;
  onBackToSummary: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  order,
  onPaymentCompleted,
  onBackToSummary,
}) => {
  const [copied, setCopied] = useState(false);
  const { cart, orderType, location } = order;

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

  const cleanPayeeName = payeeName;
  const transactionNote = 'Advance';

  // Universal standard UPI URI protocol
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(cleanPayeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  // Clean QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${cleanPayeeName}&am=${advanceAmount}&cu=INR&tn=${transactionNote}`
  )}`;

  // Automatically copy owner's UPI ID as soon as customer opens payment screen
  useEffect(() => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        const t = setTimeout(() => setCopied(false), 3500);
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

  const handleQrTapToPay = () => {
    // 1. Ensure UPI ID is copied to clipboard
    handleCopyUpi();
    
    // 2. Open standard upi:// URI scheme (opens native OS app selector dialog)
    window.location.href = upiUri;
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
            <span>Pay 50% Advance</span>
          </div>
        </div>
      </div>

      {/* Auto-Copied Toast Alert */}
      <div className="bg-emerald-950 text-emerald-200 border border-emerald-700/60 p-3 rounded-2xl flex items-center justify-between shadow-md text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
          <span>
            Owner UPI ID <strong className="font-mono text-white underline">{upiId}</strong> copied automatically!
          </span>
        </div>
        <button
          onClick={handleCopyUpi}
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-mono px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 flex-shrink-0"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* 50% Advance Amount Card */}
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

      {/* Customer Explanation Note */}
      <div className="bg-[#2C1810] text-[#FAF6F0] border-2 border-[#E5A93B]/60 p-4 rounded-2xl text-xs space-y-2.5 shadow-xl">
        <div className="flex items-center gap-2 font-bold text-[#E5A93B] text-sm">
          <Info className="w-4.5 h-4.5 text-[#E5A93B] flex-shrink-0" />
          <span className="font-serif font-extrabold text-[#E5A93B] text-base">Why do we charge 50% advance?</span>
        </div>
        <p className="text-[#FAF6F0] text-xs leading-relaxed font-medium">
          To avoid fake orders, last-minute cancellations, and food wastage, Kolkata Waffle King requires a 50% advance payment before preparing your order.
        </p>
        <p className="text-[#E5A93B] text-[11px] font-bold pt-2 border-t border-[#543123]">
          💡 The remaining 50% amount can be paid during delivery or pickup.
        </p>
      </div>

      {/* Interactive QR Payment Box Section */}
      <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-5 rounded-3xl shadow-xl text-center space-y-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-[#2C1810] flex items-center justify-center gap-1.5">
            <QrCode className="w-4.5 h-4.5 text-[#E5A93B]" />
            <span>Scan or Tap QR to Pay ₹{advanceAmount}</span>
          </h3>
          <p className="text-[11px] text-[#2C1810]/70">
            Scan with any UPI app OR tap the QR code below to choose your app
          </p>
        </div>

        {/* Dynamic Tappable QR Code Card */}
        <button
          type="button"
          onClick={handleQrTapToPay}
          className="w-full max-w-xs mx-auto bg-gradient-to-b from-[#180E0A] via-[#2C1810] to-[#801030] p-4 rounded-3xl shadow-2xl border-2 border-[#E5A93B]/60 text-white space-y-3 block transition-transform active:scale-97 hover:scale-[1.01] cursor-pointer group text-left"
        >
          <div className="bg-white p-2.5 rounded-2xl shadow-inner mx-auto w-48 h-48 flex items-center justify-center relative group-hover:ring-4 ring-[#E5A93B]/50 transition-all">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code - Tap to pay"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-x-2 bottom-2 bg-black/80 text-[#E5A93B] py-1 px-2 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 opacity-90">
              <ExternalLink className="w-3 h-3" />
              <span>Tap QR to Open UPI App</span>
            </div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-xs font-bold tracking-wide text-[#FAF6F0]">{payeeName}</div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#FAF6F0]/80">
              <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md border border-white/10">{upiId}</span>
              <span
                onClick={handleCopyUpi}
                className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              </span>
            </div>
          </div>
        </button>

        {/* Tap QR Button Option */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleQrTapToPay}
            className="w-full py-3 px-4 rounded-xl bg-[#2C1810] hover:bg-[#3D2218] text-[#E5A93B] font-bold text-xs flex items-center justify-center gap-2 border border-[#543123] shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#E5A93B]" />
            <span>Tap to Pay ₹{advanceAmount} via Installed UPI Apps</span>
          </button>
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1.5 text-left">
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>💡 Manual Transfer Guide:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="bg-[#2C1810] text-[#E5A93B] px-2.5 py-1 rounded-md font-mono text-[10px] flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-amber-800">
              The owner's UPI ID <strong className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950">{upiId}</strong> is already copied! Open your GPay, BHIM, PhonePe or Paytm app, select "Pay to UPI ID", paste, and send ₹{advanceAmount}.
            </p>
          </div>
        </div>
      </div>

      {/* Button: I Have Completed the Payment */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onPaymentCompleted}
        className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/30 cursor-pointer active:scale-98"
      >
        <CheckCircle2 className="w-5 h-5 fill-current text-white" />
        <span>I Have Completed the Payment</span>
      </motion.button>
    </motion.div>
  );
};

