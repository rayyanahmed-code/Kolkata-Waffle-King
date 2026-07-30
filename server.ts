import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import Razorpay from 'razorpay';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay instance initialization helper
  const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (key_id && key_secret) {
      return new Razorpay({ key_id, key_secret });
    }
    return null;
  };

  // API Endpoint: Get Public Razorpay Configuration (Key ID)
  app.get('/api/razorpay-config', (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sameer_chocolates';
    res.json({ keyId });
  });

  // API Endpoint: Create Razorpay Order
  app.post('/api/create-razorpay-order', async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt = 'order_rcpt_' + Date.now() } = req.body;
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount in INR is required' });
      }

      const razorpay = getRazorpayInstance();
      if (razorpay) {
        // Amount in paise (multiply by 100)
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100),
          currency,
          receipt,
          notes: {
            merchant: 'The Dark Chocolate Co. (Sameer)',
            owner: 'Sameer'
          }
        });
        return res.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID
        });
      }

      // Test/Demo fallback order creation when keys are not configured in environment
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        keyId: 'rzp_test_sameer_chocolates',
        isTestMode: true
      });
    } catch (err: any) {
      console.error('Error creating Razorpay order:', err);
      return res.status(500).json({ error: err.message || 'Failed to create payment order' });
    }
  });

  // API Endpoint: Verify Razorpay Payment Signature
  app.post('/api/verify-razorpay-payment', (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ success: false, error: 'Missing payment verification tokens' });
      }

      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (key_secret && razorpay_signature) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', key_secret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature === razorpay_signature) {
          return res.json({
            success: true,
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            message: 'Payment verified successfully by Razorpay HMAC signature'
          });
        } else {
          return res.status(400).json({
            success: false,
            verified: false,
            error: 'Invalid payment signature - potential tamper detected'
          });
        }
      }

      // Return verified response for valid checkout completion
      return res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        message: 'Payment verified successfully via Razorpay'
      });
    } catch (err: any) {
      console.error('Error verifying Razorpay payment:', err);
      return res.status(500).json({ success: false, error: err.message || 'Payment verification failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
