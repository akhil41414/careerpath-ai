const { callGemini } = require('../lib/gemini');
const supabase       = require('../lib/supabase');
const { getUser }    = require('../lib/auth');
const { setCors, handleOptions } = require('../lib/cors');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let user;
  try { user = getUser(req); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }

  try {
    const { goal, currentSkills = '' } = req.body;
    if (!goal) return res.status(400).json({ error: 'Career goal required' });

    const prompt = `You are a senior educator building a personalized learning roadmap.

Goal: ${goal}
Current skills: ${currentSkills || 'beginner'}

Design a 6-stage roadmap. Respond ONLY with valid JSON (no markdown):
{
  "stages": [
    {
      "number": 1,
      "title": "Stage name",
      "duration": "3 weeks",
      "objective": "What student can do after this stage",
      "topics": ["Topic1", "Topic2", "Topic3"],
      "courses": ["Platform: Course name", "Platform: Course name"],
      "project": "Specific concrete project to build"
    }
  ]
}`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    await supabase.from('profiles').upsert({ user_id: user.userId, roadmap_result: data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
