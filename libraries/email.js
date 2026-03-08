// Uses Resend — free 3,000 emails/month → resend.com
// npm install resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'roshanadhikariyt@gmail.com';

export async function sendOTPEmail(email, name, otp) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your verification code — Brainrot Automation',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#080b14;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#080b14;padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#0d1120;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#1d2d50,#1e1b4b);padding:32px;text-align:center;">
                    <span style="font-size:36px;">🧠</span>
                    <h1 style="color:#f1f5f9;font-size:20px;font-weight:800;margin:12px 0 0;">Brainrot Automation</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 36px;">
                    <p style="color:#8892a4;font-size:16px;margin:0 0 8px;">Hi ${name},</p>
                    <p style="color:#f1f5f9;font-size:16px;margin:0 0 32px;">Your verification code is:</p>
                    <div style="background:#141926;border:1px solid rgba(59,130,246,0.3);border-radius:14px;padding:24px;text-align:center;margin-bottom:32px;">
                      <span style="font-family:'Courier New',monospace;font-size:40px;font-weight:800;letter-spacing:12px;color:#3b82f6;">${otp}</span>
                    </div>
                    <p style="color:#4b5568;font-size:13px;margin:0;line-height:1.6;">
                      This code expires in <strong style="color:#8892a4;">10 minutes</strong>.<br>
                      If you didn't create an account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06);">
                    <p style="color:#4b5568;font-size:12px;margin:0;text-align:center;">© Brainrot Automation · Automated YouTube Content Generator</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to send email: ${JSON.stringify(err)}`);
  }
}
