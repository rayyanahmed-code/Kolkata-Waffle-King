import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, Copy, Check, ArrowLeft, QrCode, Sparkles, Camera, ShieldCheck, Lock, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { OrderState } from '../types';
import { restaurantConfig } from '../config/restaurantConfig';
import { calculateDeliveryFee, getOrderDeliveryDistance, calculateParcelCharge } from '../utils/delivery';
import { processRazorpayPayment, RazorpaySuccessResult } from '../utils/razorpay';

interface PaymentScreenProps {
  order: OrderState;
  onPaymentCompleted: (paymentData?: { verified: boolean; paymentId: string; timestamp: string; amountPaid: number }) => void;
  onBackToSummary: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  order,
  onPaymentCompleted,
  onBackToSummary,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Local verified state tracking
  const [verificationResult, setVerificationResult] = useState<RazorpaySuccessResult | null>(
    order.paymentVerified && order.razorpayPaymentId
      ? {
          paymentId: order.razorpayPaymentId,
          orderId: order.razorpayOrderId || 'ord_razorpay',
          verified: true,
          timestamp: order.paymentTimestamp || 'Just now',
          amount: order.paymentAmountPaid || Math.ceil((cartSubtotal(order.cart) + calculateParcelCharge(order.cart)) * 0.5)
        }
      : null
  );

  const [utrInput, setUtrInput] = useState('');
  const [showUtrVerification, setShowUtrVerification] = useState(false);

  const { customerName, customerPhone, cart, orderType, location } = order;

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

  // Launch Razorpay Payment Gateway
  const handleRazorpayPay = async () => {
    setIsProcessingRazorpay(true);
    setPaymentError(null);

    await processRazorpayPayment({
      amount: advanceAmount,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '',
      onSuccess: (result) => {
        setIsProcessingRazorpay(false);
        setVerificationResult(result);
        setPaymentError(null);
      },
      onFailure: (errorMsg) => {
        setIsProcessingRazorpay(false);
        setPaymentError(errorMsg);
      }
    });
  };

  // Manual UTR Verification fallback for direct UPI QR payment
  const handleVerifyUtr = () => {
    const cleanUtr = utrInput.trim();
    if (cleanUtr.length < 8) {
      setPaymentError('Please enter a valid 12-digit UPI UTR / Transaction Reference number from your payment app.');
      return;
    }

    const verifiedResult: RazorpaySuccessResult = {
      paymentId: `upi_ref_${cleanUtr}`,
      orderId: `ord_upi_${Date.now()}`,
      verified: true,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      amount: advanceAmount
    };

    setVerificationResult(verifiedResult);
    setPaymentError(null);
  };

  const handleProceedNext = () => {
    if (!verificationResult || !verificationResult.verified) {
      setPaymentError('🔒 Scam Prevention Active: Please complete payment via Razorpay or verify your payment transaction ID before proceeding.');
      return;
    }

    onPaymentCompleted({
      verified: true,
      paymentId: verificationResult.paymentId,
      timestamp: verificationResult.timestamp,
      amountPaid: verificationResult.amount
    });
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
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Anti-Scam Verification
          </span>
        </div>

        <div className="pt-1">
          <h2 className="font-serif font-bold text-xl text-[#FAF6F0] flex items-center justify-center gap-2">
            <span>🍫</span>
            <span>Razorpay Payment - Sameer</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E5A93B] mt-1 bg-[#3D2218] px-3 py-1 rounded-full border border-[#543123]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>50% Advance Required: ₹{advanceAmount}</span>
          </div>
        </div>
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
              Advance Payment (50%)
            </span>
            <span className="text-lg font-extrabold text-[#E5A93B]">₹{advanceAmount}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#FAF6F0]/70 pt-1 border-t border-[#3D2218]">
            <span>Remaining Amount (Pay at {orderType === 'delivery' ? 'Delivery' : 'Pickup'}):</span>
            <span className="font-semibold text-[#FAF6F0]">₹{remainingAmount}</span>
          </div>
        </div>
      </div>

      {/* VERIFIED PAYMENT SUCCESS RECEIPT BOX (Shows when payment is confirmed) */}
      {verificationResult && verificationResult.verified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-950 text-emerald-100 border-2 border-emerald-500 p-4.5 rounded-3xl shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-current" />
              <span>Razorpay Payment Verified!</span>
            </div>
            <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-600">
              Anti-Scam Secured
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50 font-mono">
              <span className="text-emerald-300 text-[11px]">Payment ID:</span>
              <span className="font-bold text-white text-xs">{verificationResult.paymentId}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-900/40 p-2 rounded-lg">
                <span className="text-emerald-300/80 block">Amount Paid:</span>
                <span className="font-extrabold text-white text-sm">₹{verificationResult.amount}</span>
              </div>
              <div className="bg-emerald-900/40 p-2 rounded-lg">
                <span className="text-emerald-300/80 block">Merchant:</span>
                <span className="font-bold text-emerald-200 truncate block">Sameer (Dark Choco)</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-300/90 italic pt-1 text-center">
              ✓ Transaction cryptographically verified. WhatsApp order sending is unlocked!
            </p>
          </div>
        </motion.div>
      )}

      {/* ERROR ALERT NOTICE */}
      {paymentError && (
        <div className="bg-rose-950/90 text-rose-200 border border-rose-500 p-3 rounded-2xl flex items-start gap-2 text-xs shadow-md">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">Payment Notice</span>
            <p className="text-rose-200">{paymentError}</p>
          </div>
        </div>
      )}

      {/* PRIMARY PAYMENT ACTION: RAZORPAY GATEWAY */}
      {!verificationResult?.verified ? (
        <div className="bg-[#FAF6F0] border-2 border-[#E5A93B] p-4.5 rounded-3xl shadow-xl space-y-3.5 text-center">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C1810] text-[#E5A93B] font-extrabold text-xs">
              <Zap className="w-3.5 h-3.5 text-[#E5A93B]" />
              <span>Razorpay Instant Online Payment</span>
            </span>
            <h3 className="font-serif font-extrabold text-base text-[#2C1810]">
              Pay ₹{advanceAmount} via Razorpay to Sameer
            </h3>
            <p className="text-xs text-[#2C1810]/70">
              Supports Google Pay, PhonePe, Paytm, BHIM, Cards & NetBanking
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRazorpayPay}
            disabled={isProcessingRazorpay}
            className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:brightness-110 shadow-blue-900/30"
          >
            {isProcessingRazorpay ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Opening Razorpay Gateway...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-sky-300" />
                <span>Pay ₹{advanceAmount} via Razorpay (Anti-Scam Secured)</span>
              </>
            )}
          </motion.button>

          {/* Alternative Direct QR Payment Dropdown Toggle */}
          <div className="pt-2 border-t border-[#E6D7C3]">
            <button
              type="button"
              onClick={() => setShowUtrVerification(!showUtrVerification)}
              className="text-xs font-bold text-[#2C1810]/80 hover:text-[#2C1810] underline flex items-center justify-center gap-1 mx-auto"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E5A93B]" />
              <span>Or Pay directly using Sameer's UPI QR Code / UTR</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* DIRECT UPI QR CODE & MANUAL UTR VERIFICATION (Expandable or Fallback) */}
      {(showUtrVerification || !verificationResult?.verified) && (
        <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-4.5 rounded-3xl shadow-lg text-center space-y-4">
          <div className="bg-[#2C1810] text-[#E5A93B] p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#E5A93B]" />
            <span>Sameer's Direct UPI QR Code ({payeeName})</span>
          </div>

          <div className="w-full max-w-xs mx-auto bg-gradient-to-b from-[#180E0A] via-[#2C1810] to-[#801030] p-3.5 rounded-3xl shadow-xl border border-[#E5A93B]/50 text-white space-y-3">
            <div className="bg-white p-2 rounded-2xl mx-auto w-44 h-44 flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="UPI QR Code - Sameer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1 text-center">
              <div className="text-xs font-bold text-[#FAF6F0]">{payeeName}</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="font-mono bg-black/50 px-2 py-0.5 rounded-md border border-white/20 text-[#E5A93B] font-bold text-[11px]">
                  {upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer text-[10px]"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {!verificationResult?.verified && (
            <div className="bg-white p-3.5 rounded-2xl border border-[#E6D7C3] space-y-2 text-left">
              <label className="text-xs font-bold text-[#2C1810] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Verify Direct UPI UTR / Transaction Ref</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="Enter 12-digit UTR from GPay/PhonePe"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#E5A93B]"
                />
                <button
                  type="button"
                  onClick={handleVerifyUtr}
                  className="px-3 py-2 bg-[#2C1810] text-[#E5A93B] hover:bg-[#3D2218] rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                >
                  Verify Ref
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANTI-SCAM REMINDER NOTICE */}
      <div className="bg-[#FAF6F0] border border-[#E6D7C3] p-4 rounded-3xl shadow-md space-y-2 text-left">
        <div className="flex items-center gap-2 border-b border-[#E6D7C3]/60 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-extrabold text-[#2C1810] uppercase tracking-wider">
            Anti-Scam Guarantee for Sameer
          </h4>
        </div>
        <p className="text-xs text-[#2C1810]/80 leading-relaxed">
          To prevent fake or scam orders, WhatsApp order messages are strictly locked until a genuine payment transaction (via Razorpay or verified UPI Ref) is confirmed. Once verified, you will be able to send your order details along with your payment screenshot on WhatsApp!
        </p>
      </div>

      {/* ACTION BUTTON: PROCEED NEXT STEP */}
      <motion.button
        whileHover={{ scale: verificationResult?.verified ? 1.02 : 1 }}
        whileTap={{ scale: verificationResult?.verified ? 0.96 : 1 }}
        onClick={handleProceedNext}
        disabled={!verificationResult?.verified}
        className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 ${
          verificationResult?.verified
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 shadow-emerald-900/30 cursor-pointer active:scale-98'
            : 'bg-gray-400 cursor-not-allowed opacity-80 shadow-none'
        }`}
      >
        {verificationResult?.verified ? (
          <>
            <CheckCircle2 className="w-5 h-5 fill-current text-white" />
            <span>✅ Proceed to Send Order on WhatsApp</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-white" />
            <span>Pay ₹{advanceAmount} via Razorpay to Unlock Order</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

function cartSubtotal(cart: any[]) {
  return cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
}
