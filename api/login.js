const bcrypt             = require('bcryptjs');
const supabase           = require('../lib/supabase');
const { createToken }    = require('../lib/auth');
const { sendAdminAlert } = require('../lib/email');
const { setCors, handleOptions } = require('../lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabase
      .from('users').select('id, name, email, password_hash').eq('email', email.toLowerCase()).single();
    if (error || !user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const token = createToken({ userId: user.id, email: user.email, name: user.name });
    await sendAdminAlert({ 
      type: 'login', 
      name: user.name, 
      email: user.email,
      metadata: { IP: ip, Device: device }
    });

    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: e.message });
  }
};
