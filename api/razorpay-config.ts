import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sameer_chocolates';
  return res.status(200).json({ keyId, configured: Boolean(process.env.RAZORPAY_KEY_ID) });
}
