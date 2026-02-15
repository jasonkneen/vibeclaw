import pg from 'pg';
const { Pool } = pg;

const FREE_MODELS = new Set([
  'upstage/solar-pro-3:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemma-3-4b-it:free',
  'qwen/qwen3-8b:free',
  'deepseek/deepseek-r1-0528:free',
  'microsoft/phi-4-reasoning:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]);

const PRO_MODELS = new Set([
  'anthropic/claude-sonnet-4',
  'anthropic/claude-opus-4',
  'openai/gpt-4o',
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

  const model = parsed.model || 'upstage/solar-pro-3:free';
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
