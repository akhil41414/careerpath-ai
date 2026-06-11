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
    const { resumeText, targetRole = '' } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text required' });

    const prompt = `You are an expert recruiter and resume reviewer with 10+ years at top companies.

Analyze this resume${targetRole ? ` for the role: ${targetRole}` : ''}:
---
${resumeText.slice(0, 3500)}
---

Respond ONLY with valid JSON (no markdown):
{
  "score": 72,
  "summary": "One direct sentence: biggest strength and biggest weakness",
  "strengths": ["Strength 1", "Strength 2"],
  "missing_skills": ["Skill1", "Skill2", "Skill3"],
  "weak_areas": [{"area": "Area name", "issue": "Specific problem"}],
  "suggestions": [
    {"type": "improve", "text": "Specific actionable improvement"},
    {"type": "gap", "text": "Missing skill and why it matters"},
    {"type": "improve", "text": "Another improvement"}
  ]
}

Score 0-100. Most first resumes score 45-70. Be honest. Never inflate.`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    await supabase.from('profiles').upsert({ user_id: user.userId, resume_result: data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
