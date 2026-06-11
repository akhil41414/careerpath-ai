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
    const { role, country = 'India' } = req.body;
    if (!role) return res.status(400).json({ error: 'Role required' });

    const prompt = `You are a compensation analyst for global tech salaries.

Role: ${role}, Market: ${country}

Respond ONLY with valid JSON (no markdown):
{
  "role": "Job title",
  "market": "${country}",
  "currency_symbol": "₹",
  "is_inr": true,
  "levels": [
    {"level": "Junior (0-2 yrs)", "min": 400000, "max": 800000, "median": 600000},
    {"level": "Mid-level (2-5 yrs)", "min": 800000, "max": 1500000, "median": 1100000},
    {"level": "Senior (5+ yrs)", "min": 1500000, "max": 3000000, "median": 2200000}
  ],
  "demand_score": 82,
  "growth_5yr": "+18%",
  "key_skills_for_pay": ["Skill1", "Skill2", "Skill3"],
  "market_note": "One sentence on current market"
}

For India: INR numbers, is_inr=true. For US: USD, is_inr=false. Use real 2024 data.`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    await supabase.from('profiles').upsert({ user_id: user.userId, salary_result: data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
