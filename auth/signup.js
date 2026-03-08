import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTPEmail } from '../../../lib/email';
import { rateLimit } from '../../../lib/ratelimit';
import { sanitizeInput, isValidEmail } from '../../../lib/sanitize';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const limited = await rateLimit(`signup:${ip}`, 4, 3600);
  if (limited) return res.status(429).json({ error: 'Too many attempts. Please try again in an hour.' });

  try {
    const { name, email, password } = req.body;

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email)?.toLowerCase().trim();
    const cleanPassword = String(password || '');

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (cleanName.length < 2 || cleanName.length > 50) {
      return res.status(400).json({ error: 'Name must be 2–50 characters' });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (cleanPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(cleanPassword)) {
      return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number' });
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection('users').findOne({ email: cleanEmail });
    if (existing) {
      if (existing.verified) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      } else {
        // Unverified old attempt — delete and let them retry
        await db.collection('users').deleteOne({ email: cleanEmail });
      }
    }

    const hashed = await bcrypt.hash(cleanPassword, 12);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection('users').insertOne({
      name: cleanName,
      email: cleanEmail,
      password: hashed,
      verified: false,
      otp,
      otpExpiry,
      createdAt: new Date(),
      apis: {},
      config: {
        videosPerDay: 5,
        uploadEnabled: true,
        contentTypes: ['storytelling', 'dance', 'top5'],
        preferredTime: '19:00',
        voiceId: 'Rachel',
      },
    });

    await sendOTPEmail(cleanEmail, cleanName, otp);

    return res.status(201).json({ message: 'Account created. Check your email for the verification code.' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}