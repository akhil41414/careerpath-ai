const supabase           = require('../lib/supabase');
const { createToken }    = require('../lib/auth');
const { sendAdminAlert } = require('../lib/email');
const { setCors, handleOptions } = require('../lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { credential, nameOverride } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    // 1. Verify token with Google's public tokeninfo API
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) {
      return res.status(400).json({ error: 'Invalid Google credential' });
    }
    const payload = await googleRes.json();
    const email = payload.email;
    let name = nameOverride || payload.name || 'Google User';

    if (!email) return res.status(400).json({ error: 'Email not provided by Google' });

    // 2. Check if user exists in custom users table
    let { data: user, error } = await supabase
      .from('users').select('id, name, email').eq('email', email.toLowerCase()).maybeSingle();

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    if (error) throw error;

    if (!user) {
      // User doesn't exist yet. If they haven't sent a name override, ask them to confirm/edit their name.
      if (!nameOverride) {
        return res.status(200).json({ isNew: true, email, name: payload.name || '', picture: payload.picture || '' });
      }

      // Create new user (insert a dummy hash for Google accounts to satisfy not-null constraint)
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({ 
          name, 
          email: email.toLowerCase(), 
          password_hash: 'google-auth-only', 
          created_at: new Date().toISOString() 
        })
        .select('id, name, email')
        .single();

      if (createErr) throw createErr;
      user = newUser;

      // Send signup alert email (await to ensure it sends in Vercel before container freeze)
      await sendAdminAlert({ 
        type: 'signup (Google)', 
        name: user.name, 
        email: user.email,
        metadata: { IP: ip, Device: device }
      });
    } else {
      // User already exists, log them in!
      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
      
      // Send login alert email
      await sendAdminAlert({ 
        type: 'login (Google)', 
        name: user.name, 
        email: user.email,
        metadata: { IP: ip, Device: device }
      });
    }

    const token = createToken({ userId: user.id, email: user.email, name: user.name });
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, picture: payload.picture } });
  } catch (e) {
    console.error('Google auth error:', e);
    return res.status(500).json({ error: e.message });
  }
};
