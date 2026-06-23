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

    const prompt = `Recommend 8 high-quality real courses and video tutorials for learning: ${skills}

Respond ONLY with valid JSON (no markdown):
{
  "courses": [
    {
      "platform": "YouTube",
      "title": "Exact tutorial or course title",
      "instructor": "Instructor or channel name",
      "duration": "X hours",
      "difficulty": "Beginner",
      "price": "Free",
      "skill_covered": "Which skill this covers",
      "url": "https://www.youtube.com/results?search_query=..."
    }
  ]
}

Guidelines:
1. Recommend exactly 8 items.
2. Include direct, clickable URLs ("url") to the resources. 
3. For YouTube resources, prioritize highly rated tutorials (e.g. programming with Mosh, freeCodeCamp, Telusko, etc.). Since specific video IDs might change, provide a robust search query URL like:
   - For Python by Mosh: "https://www.youtube.com/results?search_query=python+tutorial+programming+with+mosh"
   - For Java by Telusko: "https://www.youtube.com/results?search_query=java+tutorial+telusko"
   - For Java by freeCodeCamp: "https://www.youtube.com/results?search_query=java+tutorial+freecodecamp"
4. For platform courses (Coursera, Udemy, edX, etc.), provide their exact URL if known, or a robust platform search URL if the exact deep link is unknown (e.g., "https://www.coursera.org/search?query=machine+learning+stanford").
5. Never use dummy or placeholder URLs like "example.com".
6. Mix free (YouTube, freeCodeCamp) and paid (Udemy, Coursera) platforms. Make sure YouTube represents a solid portion of the recommendations (at least 3-4 items).`;

    const raw  = await callGemini(prompt);
    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

