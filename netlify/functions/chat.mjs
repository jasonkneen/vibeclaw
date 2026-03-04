import pg from 'pg';
const { Pool } = pg;

const FREE_MODELS = new Set([
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'deepseek/deepseek-r1-0528:free',
  'microsoft/phi-4-reasoning:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]);

const PRO_MODELS = new Set([
  'anthropic/claude-opus-4.6',
  'anthropic/claude-opus-4.5',
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-sonnet-4',
  'openai/gpt-5.2',
  'openai/gpt-5',
  'openai/o3',
  'openai/o4-mini',
  'google/gemini-3-pro-preview',
  'google/gemini-2.5-pro',
]);

let pool;
function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  }
  return pool;
}

// Quick JWT decode (Netlify Identity)
function getUserFromToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(atob(authHeader.slice(7).split('.')[1]));
    return { id: payload.sub, email: payload.email };
  } catch { return null; }
}

// Check if user has active Pro subscription
async function isProUser(userId) {
  const db = getPool();
  if (!db) return false;
  try {
    const { rows } = await db.query(
      'SELECT status, current_period_end FROM vibeclaw_subscriptions WHERE user_id = $1',
      [userId]
    );
    if (rows.length === 0) return false;
    const sub = rows[0];
    return sub.status === 'active' && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  } catch { return false; }
}

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

  const model = parsed.model || 'google/gemma-3-27b-it:free';
  parsed.model = model;

  // Free models — always allowed
  if (model.endsWith(':free') || FREE_MODELS.has(model)) {
    // OK
  }
  // Pro models — require active subscription
  else if (PRO_MODELS.has(model)) {
    const user = getUserFromToken(req.headers.get('authorization'));
    if (!user) {
      return Response.json({ error: 'Sign in and upgrade to Pro to use premium models.' }, { status: 403 });
    }
    const pro = await isProUser(user.id);
    if (!pro) {
      return Response.json({ error: 'Upgrade to Pro to use premium models like ' + model.split('/').pop() }, { status: 403 });
    }
  }
  // Unknown model — reject
  else {
    return Response.json({ error: `Model "${model}" is not available.` }, { status: 403 });
  }

  // Free model fallback chain — if primary fails, try next
  const FREE_FALLBACKS = [
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
  ];

  const callUpstream = async (body) => {
    return fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_KEY,
        'HTTP-Referer': 'https://vibeclaw.dev',
        'X-Title': 'vibeclaw sandbox',
      },
      body: JSON.stringify(body),
    });
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Retry transient errors (429, 500, 502, 503) and provider failures
  const RETRY_STATUSES = new Set([429, 500, 502, 503]);
  const MAX_RETRIES = 2;

  const tryModel = async (modelId) => {
    const body = { ...parsed, model: modelId };
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const upstream = await callUpstream(body);
      if (!RETRY_STATUSES.has(upstream.status)) return upstream; // success or hard error

      await upstream.body?.cancel().catch(() => {});
      if (attempt < MAX_RETRIES) await sleep(1000 * (attempt + 1));
    }
    return null; // exhausted retries
  };

  try {
    let upstream;

    // For free models, walk the fallback chain
    if (model.endsWith(':free') || FREE_MODELS.has(model)) {
      const chain = model === FREE_FALLBACKS[0]
        ? FREE_FALLBACKS
        : [model, ...FREE_FALLBACKS.filter(m => m !== model)];

      for (const fallbackModel of chain) {
        upstream = await tryModel(fallbackModel);
        if (upstream && upstream.ok) break;           // got a good response
        if (upstream) await upstream.body?.cancel().catch(() => {}); // drain error body
        upstream = null;
      }

      if (!upstream) {
        return Response.json({
          error: { message: 'The AI model is temporarily busy. Please try again in a moment.', retryable: true }
        }, { status: 503 });
      }
    } else {
      // Pro / non-free models — single attempt, no fallback
      upstream = await tryModel(model);
      if (!upstream || !upstream.ok) {
        const errBody = await upstream?.json().catch(() => ({}));
        return Response.json({
          error: errBody?.error || { message: `HTTP ${upstream?.status ?? 'unknown'}` }
        }, { status: upstream?.status ?? 502 });
      }
    }

    const lastStatus = upstream.status;

    // If still bad after fallbacks
    if (!upstream.ok) {
      return Response.json({
        error: { message: 'The AI model is temporarily busy. Please try again in a moment.', retryable: true }
      }, { status: lastStatus });
    }

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
