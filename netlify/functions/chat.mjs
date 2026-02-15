const FREE_MODELS = new Set([
  'upstage/solar-pro-3:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemma-3-4b-it:free',
  'qwen/qwen3-8b:free',
  'deepseek/deepseek-r1-0528:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'microsoft/phi-4-reasoning:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]);

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('POST only', { status: 405 });
  }

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_KEY) {
    return Response.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
  }

  let parsed;
  try {
    parsed = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const model = parsed.model || 'upstage/solar-pro-3:free';
  parsed.model = model;
  if (!model.endsWith(':free') && !FREE_MODELS.has(model)) {
    return Response.json({ error: `Model "${model}" is not free. Only :free models allowed.` }, { status: 403 });
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_KEY,
        'HTTP-Referer': 'https://vibeclaw.dev',
        'X-Title': 'vibeclaw sandbox',
      },
      body: JSON.stringify(parsed),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return Response.json({ error: 'Proxy error: ' + err.message }, { status: 502 });
  }
};

export const config = {
  path: '/api/chat',
};
