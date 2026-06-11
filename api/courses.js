const { callGemini } = require('../lib/gemini');
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
    const { skills } = req.body;
    if (!skills) return res.status(400).json({ error: 'Skills required' });

    const prompt = `Recommend 6 real courses for learning: ${skills}

Respond ONLY with valid JSON (no markdown):
{
  "courses": [
    {
      "platform": "Coursera",
      "title": "Exact course title",
      "instructor": "Instructor name",
      "duration": "X hours",
      "difficulty": "Beginner",
      "price": "Free",
      "skill_covered": "Which skill this covers"
    }
  ]
}

Mix free (YouTube, freeCodeCamp) and paid (Udemy, Coursera). Only REAL courses.`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
