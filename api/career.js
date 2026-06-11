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
    const { skills = [], interests = [], education = 'Bachelor Degree', experience = 'Beginner' } = req.body;

    const prompt = `You are a senior career counselor with deep knowledge of the 2024-2025 global job market across ALL fields — tech, medicine, law, business, agriculture, architecture, arts, finance, education.

Student profile:
- Skills: ${skills.join(', ') || 'none specified'}
- Interests: ${interests.join(', ') || 'none specified'}
- Education: ${education}
- Experience: ${experience}

Recommend exactly 3 career paths ranked best to worst fit. Cover ALL fields, not just tech.

Respond ONLY with valid JSON (no markdown):
{
  "careers": [
    {
      "rank": 1,
      "title": "Exact job title",
      "field": "Tech / Medicine / Law / Business / etc",
      "confidence": 88,
      "salary_range": "$X,000 - $Y,000/yr",
      "demand_score": 85,
      "growth_5yr": "+20%",
      "reason": "2-3 sentences referencing THEIR specific skills and interests",
      "skill_gaps": ["Skill1", "Skill2", "Skill3"],
      "time_to_ready": "3-4 months"
    }
  ]
}`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    await supabase.from('profiles').upsert({ user_id: user.userId, career_result: data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.status(200).json(data);
  } catch (e) {
    const msg = e.message === 'QUOTA_EXCEEDED' ? 'AI service busy. Try again later.' : e.message;
    return res.status(500).json({ error: msg });
  }
};
