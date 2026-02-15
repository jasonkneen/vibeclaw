// ============================================
// VibeClaw API — Netlify Function
// Handles user sync, server CRUD, chat sync
// Connects to Neon Postgres via DATABASE_URL
// ============================================

import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

// Verify Netlify Identity JWT and extract user info
function parseUser(event) {
  const ctx = event.context?.clientContext;
  if (!ctx?.user) return null;
  return {
    id: ctx.user.sub,
    email: ctx.user.email,
    name: ctx.user.user_metadata?.full_name || ctx.user.user_metadata?.name || null,
    avatar: ctx.user.user_metadata?.avatar_url || null,
    provider: ctx.user.app_metadata?.provider || 'email',
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// Ensure user exists in DB, return internal user ID
async function ensureUser(pool, identity) {
  const now = Date.now();
  const result = await pool.query(
    `INSERT INTO vibeclaw_users (identity_id, email, name, avatar_url, provider, last_seen)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (identity_id) DO UPDATE SET
       email = $2, name = COALESCE($3, vibeclaw_users.name),
       avatar_url = COALESCE($4, vibeclaw_users.avatar_url),
       provider = $5, last_seen = $6
     RETURNING id`,
    [identity.id, identity.email, identity.name, identity.avatar, identity.provider, now]
  );
  return result.rows[0].id;
}

// ── Route handlers ──

async function getServers(pool, userId) {
  const result = await pool.query(
    `SELECT id, name, spec, template, created_at, updated_at
     FROM vibeclaw_servers WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows.map(r => ({
    id: r.id,
    name: r.name,
    spec: r.spec,
    template: r.template,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  }));
}

async function saveServer(pool, userId, data) {
  const now = Date.now();
  if (data.id) {
    // Update existing
    const result = await pool.query(
      `UPDATE vibeclaw_servers SET name = $1, spec = $2, template = $3, updated_at = $4
       WHERE id = $5 AND user_id = $6 RETURNING id`,
      [data.name, JSON.stringify(data.spec), data.template || null, now, data.id, userId]
    );
    if (result.rows.length === 0) return null;
    return { id: data.id, updatedAt: now };
  } else {
    // Create new
    const result = await pool.query(
      `INSERT INTO vibeclaw_servers (user_id, name, spec, template, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING id`,
      [userId, data.name, JSON.stringify(data.spec), data.template || null, now]
    );
    return { id: result.rows[0].id, createdAt: now, updatedAt: now };
  }
}

async function deleteServer(pool, userId, serverId) {
  const result = await pool.query(
    `DELETE FROM vibeclaw_servers WHERE id = $1 AND user_id = $2`,
    [serverId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

async function getProfile(pool, userId) {
  const result = await pool.query(
    `SELECT id, email, name, avatar_url, provider, metadata, created_at
     FROM vibeclaw_users WHERE id = $1`,
    [userId]
  );
  if (!result.rows[0]) return null;
  const r = result.rows[0];
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    avatarUrl: r.avatar_url,
    provider: r.provider,
    metadata: r.metadata,
    createdAt: Number(r.created_at),
    serverCount: Number((await pool.query(
      `SELECT COUNT(*) FROM vibeclaw_servers WHERE user_id = $1`, [userId]
    )).rows[0].count),
  };
}

// ── Main handler ──

export async function handler(event) {
  const identity = parseUser(event);
  if (!identity) {
    return json(401, { error: 'Not authenticated' });
  }

  const pool = getPool();
  const userId = await ensureUser(pool, identity);
  const method = event.httpMethod;
  const path = event.path.replace(/^\/\.netlify\/functions\/api\/?/, '').replace(/^api\/?/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    // GET /api/profile
    if (method === 'GET' && segments[0] === 'profile') {
      const profile = await getProfile(pool, userId);
      return json(200, profile);
    }

    // GET /api/servers
    if (method === 'GET' && segments[0] === 'servers' && !segments[1]) {
      const servers = await getServers(pool, userId);
      return json(200, { servers });
    }

    // POST /api/servers
    if (method === 'POST' && segments[0] === 'servers') {
      const data = JSON.parse(event.body);
      const result = await saveServer(pool, userId, data);
      if (!result) return json(404, { error: 'Server not found' });
      return json(200, result);
    }

    // DELETE /api/servers/:id
    if (method === 'DELETE' && segments[0] === 'servers' && segments[1]) {
      const ok = await deleteServer(pool, userId, segments[1]);
      return json(ok ? 200 : 404, { ok });
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('API error:', err);
    return json(500, { error: 'Internal error' });
  }
}
