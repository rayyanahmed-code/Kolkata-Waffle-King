import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, Copy, Check, Info, ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';
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
  const distanceKm = orderType === 'delivery' ? getOrderDeliveryDistance(location?.latitude, location?.longitude) : null;
  const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee(distanceKm, subtotal) : 0;
  const grandTotal = subtotal + parcelFee + deliveryFee;

  const advanceAmount = Math.ceil(grandTotal * 0.5);
  const remainingAmount = grandTotal - advanceAmount;

  const upiId = restaurantConfig.upi?.upiId || '7003459674@kotakbank';
  const payeeName = restaurantConfig.upi?.payeeName || 'MD SAMIR IQBAL';

  // Standard clean parameters according to NPCI UPI specification
  // Avoid literal %20 in payeeName so GPay doesn't render "MD%20SAMIR%20IQBAL"
  const cleanPayeeName = payeeName;
  const transactionNote = 'Advance';

  // Universal standard UPI URI - clean NPCI parameters
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(cleanPayeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  // Clean QR Code URL using unencoded spaces for payee name for maximum scanner compatibility
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${cleanPayeeName}&am=${advanceAmount}&cu=INR&tn=${transactionNote}`
  )}`;

  // Android Package Specific Intent URLs for direct app launching
  const getAppLink = (appName: string) => {
    const params = `pa=${upiId}&pn=${encodeURIComponent(cleanPayeeName)}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Standard upi:// protocol is natively supported by BHIM, GPay, PhonePe, Paytm on Android & iOS
    if (navigator.userAgent.toLowerCase().includes('android')) {
      switch (appName) {
        case 'gpay':
          return `intent://pay?${params}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
        case 'bhim':
          return `intent://pay?${params}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
        case 'phonepe':
          return `intent://pay?${params}#Intent;scheme=upi;package=com.phonepe.app;end`;
        case 'paytm':
          return `intent://pay?${params}#Intent;scheme=upi;package=net.one97.paytm;end`;
        default:
          return upiUri;
      }
    }
    return upiUri;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppPay = (appName: string, link: string) => {
    // 1. Auto-copy UPI ID so user can paste immediately if bank blocks web intent
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // 2. Open UPI app via intent / scheme
    window.location.href = link;
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

      {/* QR Payment Box Section */}
      <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-5 rounded-3xl shadow-xl text-center space-y-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-[#2C1810] flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#E5A93B]" />
            <span>Scan & Pay ₹{advanceAmount}</span>
          </h3>
          <p className="text-[11px] text-[#2C1810]/70">
            Scan using any UPI app to pay the advance amount
          </p>
        </div>

        {/* Dynamic QR Code Card */}
        <div className="w-56 mx-auto bg-gradient-to-b from-[#180E0A] via-[#2C1810] to-[#801030] p-4 rounded-3xl shadow-2xl border border-[#543123] text-white space-y-3">
          <div className="bg-white p-2.5 rounded-2xl shadow-inner mx-auto w-48 h-48 flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1 text-center">
            <div className="text-xs font-bold tracking-wide text-[#FAF6F0]">{payeeName}</div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#FAF6F0]/80">
              <span className="font-mono bg-black/30 px-2 py-0.5 rounded-md border border-white/10">{upiId}</span>
              <button
                onClick={handleCopyUpi}
                className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Supported UPI Apps List with Direct Pay Links */}
        <div className="pt-3 border-t border-[#E6D7C3]/60 space-y-2.5">
          <p className="text-[11px] font-bold text-[#2C1810]/80">
            Click to Pay ₹{advanceAmount} via UPI App:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            {[
              { id: 'gpay', name: 'Google Pay (GPay)', color: 'border-blue-400 bg-blue-50/50 text-blue-900 hover:bg-blue-100', link: getAppLink('gpay') },
              { id: 'phonepe', name: 'PhonePe', color: 'border-purple-400 bg-purple-50/50 text-purple-900 hover:bg-purple-100', link: getAppLink('phonepe') },
              { id: 'paytm', name: 'Paytm', color: 'border-sky-400 bg-sky-50/50 text-sky-900 hover:bg-sky-100', link: getAppLink('paytm') },
              { id: 'bhim', name: 'BHIM', color: 'border-orange-400 bg-orange-50/50 text-orange-900 hover:bg-orange-100', link: getAppLink('bhim') },
              { id: 'any', name: 'Any UPI App', color: 'border-emerald-400 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100', link: upiUri },
            ].map((app) => (
              <a
                key={app.id}
                href={app.link}
                onClick={(e) => {
                  e.preventDefault();
                  handleAppPay(app.name, app.link);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border ${app.color} shadow-xs transition-all active:scale-95 cursor-pointer font-bold text-[11px]`}
              >
                <span>⚡ {app.name}</span>
              </a>
            ))}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 space-y-1 text-left">
            <div className="font-bold flex items-center justify-between">
              <span>💡 Bank redirect error or limit issue?</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="bg-[#2C1810] text-[#E5A93B] px-2 py-0.5 rounded-md font-mono text-[10px] flex items-center gap-1 active:scale-95"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
              </button>
            </div>
            <p className="text-[10px] leading-tight text-amber-800">
              If your bank displays "This request type is not supported" or a bank limit error, simply copy <strong className="font-mono">{upiId}</strong>, open your GPay or BHIM app, and send ₹{advanceAmount} directly.
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
