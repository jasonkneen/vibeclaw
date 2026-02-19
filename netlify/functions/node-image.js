export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response('', { status: 200, headers });

  const url = new URL(req.url);
  const label    = url.searchParams.get('label')    || 'node';
  const category = url.searchParams.get('category') || 'agent';

  const PROMPTS = {
    agent:   `cinematic square portrait for an AI agent called "${label}", glowing purple neural circuits, dark background, dramatic lighting`,
    model:   `cinematic square visualization for an AI model called "${label}", amber glowing data streams, dark background, dramatic lighting`,
    skill:   `cinematic square image for a tool called "${label}", emerald green light, dark background, sharp macro detail`,
    channel: `cinematic square abstract for a communication channel called "${label}", cyan radio waves, dark background, dramatic lighting`,
    cron:    `cinematic square image for a scheduled job called "${label}", purple glowing clock gears, dark background`,
    node:    `cinematic square image for a server gateway called "${label}", red server rack hardware, dark background, dramatic lighting`,
  };

  const prompt = PROMPTS[category] || `cinematic square abstract background for "${label}", dark background, dramatic lighting`;

  const key = process.env.GEMINI_API_KEY;
  if (!key) return new Response(JSON.stringify({ ok:false, error:'No Gemini API key' }), { status:500, headers });

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      }
    );

    const data = await resp.json();
    const part = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part) return new Response(JSON.stringify({ ok:false, error:'No image in response', raw: data }), { status:500, headers });

    return new Response(JSON.stringify({
      ok: true,
      dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
    }), { status:200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error: err.message }), { status:500, headers });
  }
};

export const config = { path: '/api/node-image' };
