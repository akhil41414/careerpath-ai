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
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email: email.toLowerCase(), password_hash: passwordHash, created_at: new Date().toISOString() })
      .select('id, name, email, created_at')
      .single();
    if (error) throw error;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const device = req.headers['user-agent'] || 'unknown';

    const token = createToken({ userId: user.id, email: user.email, name: user.name });
    sendAdminAlert({ 
      type: 'signup', 
      name: user.name, 
      email: user.email,
      metadata: { IP: ip, Device: device }
    });

    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('Signup error:', e);
    return res.status(500).json({ error: e.message });
  }
};
