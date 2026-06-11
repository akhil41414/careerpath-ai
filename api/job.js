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
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription)
      return res.status(400).json({ error: 'Resume and job description required' });

    const prompt = `You are a recruiter comparing a candidate's resume against a job description.

RESUME: ${resumeText.slice(0, 2000)}

JOB DESCRIPTION: ${jobDescription.slice(0, 2000)}

Respond ONLY with valid JSON (no markdown):
{
  "match_score": 68,
  "summary": "One honest sentence about the fit",
  "matching_skills": ["Skill1", "Skill2", "Skill3"],
  "missing_skills": ["Missing1", "Missing2", "Missing3"],
  "recommendations": ["Action 1", "Action 2", "Action 3"]
}`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    await supabase.from('profiles').upsert({ user_id: user.userId, job_result: data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
