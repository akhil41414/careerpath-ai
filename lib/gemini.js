async function callGemini(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Respond with valid JSON only. No markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2000
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
}
module.exports = { callGemini };