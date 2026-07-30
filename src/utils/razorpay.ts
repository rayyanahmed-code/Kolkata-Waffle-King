import { restaurantConfig } from '../config/restaurantConfig';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpaySuccessResult {
  paymentId: string;
  orderId: string;
  verified: boolean;
  timestamp: string;
  amount: number;
}

export async function processRazorpayPayment(params: {
  amount: number;
  customerName: string;
  customerPhone: string;
  onSuccess: (result: RazorpaySuccessResult) => void;
  onFailure: (errorMsg: string) => void;
}): Promise<void> {
  const { amount, customerName, customerPhone, onSuccess, onFailure } = params;

  try {
    // 1. Request real order creation from Vercel Serverless API
    const res = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `rcpt_sameer_${Date.now()}`
      })
    });

    const orderData = await res.json();

    if (!res.ok || !orderData.success || !orderData.orderId || !orderData.keyId) {
      const errorMsg = orderData.error || `Failed to create Razorpay order (HTTP ${res.status})`;
      onFailure(errorMsg);
      return;
    }

    const { orderId, keyId, amount: orderAmountInPaise } = orderData;

    // 2. Ensure Razorpay SDK script is loaded in window
    if (typeof window.Razorpay !== 'function') {
      onFailure('Razorpay SDK script is not loaded in browser. Please reload the page or disable ad-blockers.');
      return;
    }

    // 3. Open official Razorpay modal for payment
    const options = {
      key: keyId,
      amount: orderAmountInPaise || Math.round(amount * 100),
      currency: 'INR',
      name: `${restaurantConfig.name} (Sameer)`,
      description: `Advance Order Payment - ₹${amount}`,
      order_id: orderId,
      prefill: {
        name: customerName || 'Valued Customer',
        contact: customerPhone || ''
      },
      theme: {
        color: '#2C1810'
      },
      modal: {
        ondismiss: function () {
          onFailure('Payment cancelled: You closed the Razorpay payment window without completing payment.');
        }
      },
      handler: async function (response: any) {
        try {
          // Cryptographically verify payment signature on backend
          const verifyRes = await fetch('/api/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success && verifyData.verified) {
            onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || orderId,
              verified: true,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
              amount
            });
          } else {
            onFailure(verifyData.error || 'Payment verification failed: Invalid cryptographic signature!');
          }
        } catch (err: any) {
          onFailure(`Verification error: ${err.message || 'Server check failed'}`);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      onFailure(response.error?.description || 'Payment transaction failed or declined by bank.');
    });
    rzp.open();

  } catch (err: any) {
    console.error('Razorpay process error:', err);
    onFailure(err.message || 'Could not launch Razorpay payment gateway');
  }
}
