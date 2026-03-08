import clientPromise from '../../../lib/mongodb';
import { sanitizeInput } from '../../../lib/sanitize';
import { rateLimit } from '../../../lib/ratelimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const limited = await rateLimit(`verify:${ip}`, 10, 3600);
  if (limited) return res.status(429).json({ error: 'Too many attempts.' });

  const email = sanitizeInput(req.body?.email)?.toLowerCase().trim();
  const otp = sanitizeInput(req.body?.otp)?.trim();

  if (!email || !otp) return res.status(400).json({ error: 'Email and code are required' });
  if (!/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Invalid code format' });

  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or code' });
    if (user.verified) return res.status(400).json({ error: 'Invalid email or code' });
    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid email or code' });
    if (new Date() > new Date(user.otpExpiry)) return res.status(400).json({ error: 'Code expired. Please sign up again.' });

    await db.collection('users').updateOne(
      { email },
      { $set: { verified: true }, $unset: { otp: '', otpExpiry: '' } }
    );

    return res.json({ message: 'Email verified successfully. You can now sign in.' });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
