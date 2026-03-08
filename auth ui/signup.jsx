import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import EyeToggle from '../../components/eye';

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSignUp(e) {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }
    // ✅ Success — switch to OTP step
    setLoading(false);
    setStep('verify');
  } catch (err) {
    setError('Network error: ' + err.message);
    setLoading(false);
  }
}

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      // Auto sign in after verification
      await signIn('credentials', { email, password, callbackUrl: '/' });
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Create Account — Brainrot Automation</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Head>

      <div style={s.page}>
        <div style={s.glowBlue} />
        <div style={s.glowViolet} />
        <div style={s.grid} />

        <div style={s.card}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>🧠</div>
            <div>
              <h1 style={s.logoTitle}>Brainrot Automation</h1>
              <p style={s.logoSub}>Create your free account</p>
            </div>
          </div>

          {step === 'form' ? (
            <>
              {/* Google */}
              <button onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/dashboard' }); }} disabled={googleLoading} style={s.googleBtn}>
                {googleLoading ? <span style={s.spinner} /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{googleLoading ? 'Redirecting...' : 'Sign up with Google'}</span>
              </button>

              <div style={s.orRow}>
                <div style={s.orLine} /><span style={s.orText}>or</span><div style={s.orLine} />
              </div>

              {error && (<div style={s.errorBox}>{error}
{error.includes('already exists') && (
      <>
        {' '}
        <Link href="/auth/signin" style={{ color: '#fda4af', fontWeight: 700, textDecoration: 'underline' }}>
          Sign in instead?
        </Link>
      </>
    )}
  </div>
)}

              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required style={s.input}
                    onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={s.input}
                    onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                </div>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 chars, upper, lower, number" required style={{ ...s.input, paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                    <EyeToggle visible={showPass} onToggle={() => setShowPass(!showPass)} />
                  </div>
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                            background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.06)',
                            transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ color: strength.color, fontSize: 11 }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} style={s.submitBtn}>
                  {loading ? <><span style={s.spinner} /> Creating account...</> : 'Create Account →'}
                </button>
              </form>

              <p style={s.footerText}>
                Already have an account?{' '}
                <Link href="/auth/signin" style={s.link}>Sign in</Link>
              </p>
            </>
          ) : (
            /* OTP Verification Step */
            <div>
              <div style={s.verifyIcon}>📬</div>
              <h2 style={s.verifyTitle}>Check your email</h2>
              <p style={s.verifyDesc}>
                We sent a 6-digit code to <strong style={{ color: '#3b82f6' }}>{email}</strong>
              </p>

              {error && <div style={s.errorBox}>{error}</div>}

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Verification code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    style={{ ...s.input, fontSize: 28, letterSpacing: 12, textAlign: 'center',
                      fontFamily: "'JetBrains Mono', monospace" }}
                    onFocus={e => e.target.style.borderColor='#3b82f6'}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                  />
                </div>

                <button type="submit" disabled={loading || otp.length < 6} style={{
                  ...s.submitBtn, opacity: (loading || otp.length < 6) ? 0.5 : 1
                }}>
                  {loading ? <><span style={s.spinner} /> Verifying...</> : 'Verify Email →'}
                </button>
              </form>

              <p style={{ ...s.footerText, marginTop: 20 }}>
                <button onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  ← Back to sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = {
    1: { label: 'Weak', color: '#f43f5e' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Good', color: '#3b82f6' },
    4: { label: 'Strong', color: '#10b981' },
  };
  return { score, ...(map[score] || { label: '', color: '' }) };
}

const s = {
  page: {
    minHeight: '100vh', background: '#080b14',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative', overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  glowBlue: { position: 'fixed', top: -200, left: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  glowViolet: { position: 'fixed', bottom: -200, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 440, background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 36px', position: 'relative', zIndex: 1, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  logoIcon: { width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1d2d50, #1e1b4b)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 20px rgba(99,102,241,0.2)' },
  logoTitle: { fontFamily: "'Syne', sans-serif", color: '#f1f5f9', fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: -0.3 },
  logoSub: { color: '#4b5568', fontSize: 11, margin: '3px 0 0' },
  googleBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#141926', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', color: '#e2e8f0', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 },
  orRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  orLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  orText: { color: '#4b5568', fontSize: 12 },
  errorBox: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 8, padding: '10px 14px', color: '#fda4af', fontSize: 13, marginBottom: 4 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#8892a4', fontSize: 13, fontWeight: 600 },
  input: { background: '#141926', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 },
  submitBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(59,130,246,0.3)', marginTop: 4 },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
  footerText: { color: '#4b5568', fontSize: 13, textAlign: 'center', marginTop: 24 },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: 600 },
  verifyIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  verifyTitle: { fontFamily: "'Syne', sans-serif", color: '#f1f5f9', fontSize: 22, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' },
  verifyDesc: { color: '#8892a4', fontSize: 14, textAlign: 'center', lineHeight: 1.6 },
};
