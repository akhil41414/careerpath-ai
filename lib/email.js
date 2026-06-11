// lib/email.js
// Resend is a free email API (100 emails/day free tier).
// RESEND_API_KEY comes from Vercel env vars.
// ADMIN_EMAIL is your email — tarunbajolge01@gmail.com set in env vars.
// Called on every signup and login to alert you as admin.

async function sendAdminAlert({ type, name, email, metadata = {} }) {
  // Don't crash the main request if email fails
  try {
    const subject = type === 'signup'
      ? `🎉 New signup: ${name} (${email})`
      : `👋 Login: ${name} (${email})`;

    const html = `
      <div style="font-family:monospace;max-width:480px">
        <h2 style="margin-bottom:8px">${subject}</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;color:#666">Type</td><td><strong>${type}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#666">Name</td><td>${name}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Email</td><td>${email}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Time</td><td>${new Date().toISOString()}</td></tr>
          ${Object.entries(metadata).map(([k,v]) =>
            `<tr><td style="padding:6px 0;color:#666">${k}</td><td>${v}</td></tr>`
          ).join('')}
        </table>
        <p style="margin-top:16px;color:#999;font-size:12px">CareerPath AI — Admin Alert</p>
      </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'CareerPath AI <onboarding@resend.dev>',
        to:   [process.env.ADMIN_EMAIL || 'tarunbajolge01@gmail.com'],
        subject,
        html
      })
    });
  } catch (e) {
    // silent fail — don't block user flow for email issues
    console.error('Email alert failed:', e.message);
  }
}

module.exports = { sendAdminAlert };