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
    const updateObj = {
      user_id: user.userId,
      updated_at: new Date().toISOString()
    };

    if (b.name !== undefined) updateObj.name = b.name;
    if (b.email !== undefined) updateObj.email = b.email;
    if (b.target_role !== undefined) updateObj.target_role = b.target_role;
    if (b.education !== undefined) updateObj.education = b.education;
    if (b.experience !== undefined) updateObj.experience = b.experience;
    if (b.skills !== undefined) updateObj.skills = b.skills;
    if (b.interests !== undefined) updateObj.interests = b.interests;
    if (b.career_result !== undefined) updateObj.career_result = b.career_result;
    if (b.resume_result !== undefined) updateObj.resume_result = b.resume_result;
    if (b.job_result !== undefined) updateObj.job_result = b.job_result;
    if (b.roadmap_result !== undefined) updateObj.roadmap_result = b.roadmap_result;
    if (b.salary_result !== undefined) updateObj.salary_result = b.salary_result;

    const { data, error } = await supabase.from('profiles').upsert(updateObj, { onConflict: 'user_id' }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
