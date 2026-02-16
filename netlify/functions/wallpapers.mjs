import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}

const SECRET = process.env.ARTICLES_SECRET;

async function ensureTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vibeclaw_wallpapers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      prompt TEXT,
      date TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      variants JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export default async (req) => {
  if (req.method === 'GET') {
    try {
      const db = getPool();
      await ensureTable(db);
      const { rows } = await db.query('SELECT * FROM vibeclaw_wallpapers ORDER BY date DESC, created_at DESC');
      return new Response(JSON.stringify(rows), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
      });
    } catch {
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (req.method === 'POST') {
    if (req.headers.get('authorization') !== `Bearer ${SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    try {
      const { id, title, prompt, date, tags, variants } = await req.json();
      if (!id || !title || !variants) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
      const db = getPool();
      await ensureTable(db);
      await db.query(`
        INSERT INTO vibeclaw_wallpapers (id, title, prompt, date, tags, variants)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, prompt=EXCLUDED.prompt, tags=EXCLUDED.tags, variants=EXCLUDED.variants
      `, [id, title, prompt || '', date || new Date().toISOString().slice(0,10), tags || [], JSON.stringify(variants)]);
      return new Response(JSON.stringify({ ok: true, id }));
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/wallpapers' };
