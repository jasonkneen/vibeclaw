import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

const ARTICLES_SECRET = process.env.ARTICLES_SECRET;

// Auto-create table on first request
async function ensureTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vibeclaw_articles (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      tags TEXT[] DEFAULT '{}',
      author TEXT DEFAULT 'VibeClaw',
      image TEXT,
      summary TEXT,
      html TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export default async (req, context) => {
  const url = new URL(req.url);

  // GET /api/articles — public, returns all articles as JSON
  if (req.method === 'GET') {
    try {
      const db = getPool();
      await ensureTable(db);
      const { rows } = await db.query('SELECT slug, title, date, tags, author, image, summary, html FROM vibeclaw_articles ORDER BY date DESC, created_at DESC');
      return new Response(JSON.stringify(rows), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
      });
    } catch (err) {
      // Fallback: return empty array if DB not connected
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }
  }

  // POST /api/articles — protected, add/update article
  if (req.method === 'POST') {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${ARTICLES_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
      const body = await req.json();
      const { slug, title, date, tags, author, image, summary, html } = body;

      if (!slug || !title || !html) {
        return new Response(JSON.stringify({ error: 'Missing required fields: slug, title, html' }), { status: 400 });
      }

      const db = getPool();
      await ensureTable(db);

      await db.query(`
        INSERT INTO vibeclaw_articles (slug, title, date, tags, author, image, summary, html)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title, date = EXCLUDED.date, tags = EXCLUDED.tags,
          author = EXCLUDED.author, image = EXCLUDED.image, summary = EXCLUDED.summary,
          html = EXCLUDED.html
      `, [slug, title, date || new Date().toISOString().slice(0, 10), tags || [], author || 'VibeClaw', image, summary, html]);

      return new Response(JSON.stringify({ ok: true, slug }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // DELETE /api/articles?slug=xxx — protected
  if (req.method === 'DELETE') {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${ARTICLES_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const slug = url.searchParams.get('slug');
    if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });

    try {
      const db = getPool();
      await db.query('DELETE FROM vibeclaw_articles WHERE slug = $1', [slug]);
      return new Response(JSON.stringify({ ok: true, deleted: slug }));
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/articles' };
