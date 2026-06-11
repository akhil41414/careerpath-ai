const supabase    = require('../lib/supabase');
const { getUser } = require('../lib/auth');
const { setCors, handleOptions } = require('../lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  let user;
  try { user = getUser(req); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.userId).single();
    if (error && error.code !== 'PGRST116')
      return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data || {} });
  }

  if (req.method === 'POST') {
    const b = req.body;
    const { data, error } = await supabase.from('profiles').upsert({
      user_id: user.userId,
      name: b.name, email: b.email, target_role: b.target_role,
      education: b.education, experience: b.experience,
      skills: b.skills || [], interests: b.interests || [],
      career_result: b.career_result || null,
      resume_result: b.resume_result || null,
      job_result: b.job_result || null,
      roadmap_result: b.roadmap_result || null,
      salary_result: b.salary_result || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
