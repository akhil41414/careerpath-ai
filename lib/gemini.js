// lib/gemini.js
// Central Gemini 2.0 Flash caller.
// GEMINI_API_KEY lives in Vercel env vars — never in frontend code.
// All AI routes import this function instead of duplicating fetch logic.

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,       // low = more consistent JSON output
        maxOutputTokens: 2000
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // 429 = quota exceeded, 400 = bad key
    const code = res.status;
    if (code === 429) throw new Error('QUOTA_EXCEEDED');
    if (code === 400) throw new Error('INVALID_KEY');
    throw new Error(err.error?.message || `Gemini error ${code}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip ```json ... ``` markdown fences Gemini sometimes adds
  return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
}

module.exports = { callGemini };
