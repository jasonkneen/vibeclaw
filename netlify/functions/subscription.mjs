// ============================================
// VibeClaw Subscription API
// GET /api/subscription — check user's sub status
// POST /api/subscription/webhook — Lemon Squeezy webhook
// ============================================

import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
  }
  return pool;
}

// Ensure subscription table exists
async function ensureTable() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS vibeclaw_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      email TEXT,
      ls_customer_id TEXT,
      ls_subscription_id TEXT,
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'inactive',
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// Verify Netlify Identity JWT (basic check)
function getUserFromToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export default async (req) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  // ── GET /api/subscription — check status ──
  if (req.method === 'GET' && path === '/api/subscription') {
    const user = getUserFromToken(req.headers.get('authorization'));
    if (!user) return Response.json({ active: false, plan: 'free' });

    try {
      await ensureTable();
      const db = getPool();
      const { rows } = await db.query(
        'SELECT plan, status, current_period_end FROM vibeclaw_subscriptions WHERE user_id = $1',
        [user.id]
      );

      if (rows.length === 0) {
        return Response.json({ active: false, plan: 'free' });
      }

      const sub = rows[0];
      const active = sub.status === 'active' && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

      return Response.json({
        active,
        plan: active ? sub.plan : 'free',
        expiresAt: sub.current_period_end,
      });
    } catch (err) {
      // DB not available — return free
      return Response.json({ active: false, plan: 'free' });
    }
  }

  // ── POST /api/subscription/webhook — Lemon Squeezy webhook ──
  if (req.method === 'POST' && path.includes('webhook')) {
    // Verify webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (secret) {
      const sig = req.headers.get('x-signature');
      if (!sig) return new Response('Missing signature', { status: 401 });
      
      const body = await req.text();
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
      
      if (hmac !== sig) return new Response('Invalid signature', { status: 401 });
      
      var payload = JSON.parse(body);
    } else {
      // No secret configured — accept but log warning
      var payload = await req.json();
    }

    const event = payload.meta?.event_name;
    const attrs = payload.data?.attributes;
    const email = attrs?.user_email || payload.meta?.custom_data?.email;
    const customUserId = payload.meta?.custom_data?.user_id;

    if (!email && !customUserId) {
      return Response.json({ ok: true, skipped: 'no user identifier' });
    }

    try {
      await ensureTable();
      const db = getPool();

      const userId = customUserId || email; // fallback to email as user ID

      switch (event) {
        case 'subscription_created':
        case 'subscription_updated':
        case 'subscription_resumed': {
          const status = attrs?.status === 'active' ? 'active' : 'inactive';
          const periodEnd = attrs?.renews_at || attrs?.ends_at;
          
          await db.query(`
            INSERT INTO vibeclaw_subscriptions (user_id, email, ls_customer_id, ls_subscription_id, plan, status, current_period_end, updated_at)
            VALUES ($1, $2, $3, $4, 'pro', $5, $6, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
              email = EXCLUDED.email,
              ls_customer_id = EXCLUDED.ls_customer_id,
              ls_subscription_id = EXCLUDED.ls_subscription_id,
              plan = 'pro',
              status = EXCLUDED.status,
              current_period_end = EXCLUDED.current_period_end,
              updated_at = NOW()
          `, [userId, email, attrs?.customer_id?.toString(), attrs?.id?.toString(), status, periodEnd]);
          break;
        }

        case 'subscription_cancelled':
        case 'subscription_expired':
        case 'subscription_paused': {
          await db.query(`
            UPDATE vibeclaw_subscriptions SET status = 'inactive', plan = 'free', updated_at = NOW()
            WHERE user_id = $1 OR email = $2
          `, [userId, email]);
          break;
        }
      }

      return Response.json({ ok: true, event });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: ['/api/subscription', '/api/subscription/webhook'],
};
