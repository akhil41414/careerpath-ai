const { setCors, handleOptions } = require('../lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  try {
    const apiKey = process.env.RESEND_API_KEY 
      ? `Present (starts with "${process.env.RESEND_API_KEY.slice(0, 5)}...")` 
      : 'Missing';
    const adminEmail = process.env.ADMIN_EMAIL || 'tarunbajolge01@gmail.com';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'CareerPath AI <onboarding@resend.dev>',
        to:   [adminEmail],
        subject: '🧪 Test Email Alert',
        html: `<p>If you see this, your email alert works! Sent to: ${adminEmail}</p>`
      })
    });

    const status = response.status;
    const body = await response.json().catch(() => ({}));

    return res.status(200).json({
      success: response.ok,
      status,
      resendResponse: body,
      configUsed: {
        apiKeyStatus: apiKey,
        adminEmailSentTo: adminEmail
      }
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
