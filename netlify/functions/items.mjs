import pg from 'pg';
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}

const VALID_TYPES = ['server','skill','plugin','tool','model','recipe','knowledge'];

async function ensureTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vibeclaw_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      author_id TEXT,
      author_name TEXT DEFAULT 'Anonymous',
      tags TEXT[] DEFAULT '{}',
      spec JSONB NOT NULL DEFAULT '{}',
      files JSONB DEFAULT '[]',
      readme TEXT DEFAULT '',
      visibility TEXT DEFAULT 'public',
      downloads INTEGER DEFAULT 0,
      upvotes INTEGER DEFAULT 0,
      forked_from TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(type, slug)
    )
  `);
  await db.query(`CREATE TABLE IF NOT EXISTS vibeclaw_votes (
    user_id TEXT NOT NULL, item_id TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY (user_id, item_id)
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS vibeclaw_favourites (
    user_id TEXT NOT NULL, item_id TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY (user_id, item_id)
  )`);
}

function cors(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': status === 200 ? 'public, max-age=60' : 'no-cache'
    }
  });
}

// Extract user from Netlify Identity JWT (if present)
function getUser(req) {
  const ctx = req.headers.get('x-nf-client-context');
  if (!ctx) return null;
  try {
    const decoded = JSON.parse(Buffer.from(ctx, 'base64').toString());
    return decoded?.user || null;
  } catch { return null; }
}

export default async (req) => {
  if (req.method === 'OPTIONS') return cors({ ok: true });

  const url = new URL(req.url);
  const params = url.searchParams;
  const path = url.pathname.replace('/api/items', '').replace(/^\//, '');

  const db = getPool();
  await ensureTable(db);

  // POST /api/items/vote
  if (req.method === 'POST' && path === 'vote') {
    const user = getUser(req);
    if (!user) return cors({ error: 'Login required' }, 401);
    const { item_id } = await req.json();
    // Toggle vote
    const existing = await db.query('SELECT 1 FROM vibeclaw_votes WHERE user_id=$1 AND item_id=$2', [user.sub, item_id]);
    if (existing.rows.length) {
      await db.query('DELETE FROM vibeclaw_votes WHERE user_id=$1 AND item_id=$2', [user.sub, item_id]);
      await db.query('UPDATE vibeclaw_items SET upvotes = GREATEST(upvotes - 1, 0) WHERE id=$1', [item_id]);
      return cors({ voted: false });
    } else {
      await db.query('INSERT INTO vibeclaw_votes (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.sub, item_id]);
      await db.query('UPDATE vibeclaw_items SET upvotes = upvotes + 1 WHERE id=$1', [item_id]);
      return cors({ voted: true });
    }
  }

  // POST /api/items/favourite
  if (req.method === 'POST' && path === 'favourite') {
    const user = getUser(req);
    if (!user) return cors({ error: 'Login required' }, 401);
    const { item_id } = await req.json();
    const existing = await db.query('SELECT 1 FROM vibeclaw_favourites WHERE user_id=$1 AND item_id=$2', [user.sub, item_id]);
    if (existing.rows.length) {
      await db.query('DELETE FROM vibeclaw_favourites WHERE user_id=$1 AND item_id=$2', [user.sub, item_id]);
      return cors({ favourited: false });
    } else {
      await db.query('INSERT INTO vibeclaw_favourites (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.sub, item_id]);
      return cors({ favourited: true });
    }
  }

  // POST /api/items/fork
  if (req.method === 'POST' && path === 'fork') {
    const user = getUser(req);
    const { item_id } = await req.json();
    const { rows } = await db.query('SELECT * FROM vibeclaw_items WHERE id=$1', [item_id]);
    if (!rows.length) return cors({ error: 'Not found' }, 404);
    const src = rows[0];
    const newId = `${src.type}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const newSlug = `${src.slug}-fork-${Date.now().toString(36)}`;
    await db.query(`
      INSERT INTO vibeclaw_items (id, type, slug, title, description, author_id, author_name, tags, spec, files, readme, forked_from)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, [newId, src.type, newSlug, `${src.title} (fork)`, src.description, 
        user?.sub || null, user?.user_metadata?.full_name || 'Anonymous',
        src.tags, src.spec, src.files, src.readme, src.id]);
    return cors({ id: newId, slug: newSlug });
  }

  // POST /api/items/download
  if (req.method === 'POST' && path === 'download') {
    const { item_id } = await req.json();
    await db.query('UPDATE vibeclaw_items SET downloads = downloads + 1 WHERE id=$1', [item_id]);
    const { rows } = await db.query('SELECT * FROM vibeclaw_items WHERE id=$1', [item_id]);
    return cors(rows[0] || { error: 'Not found' });
  }

  // GET /api/items/interactions?user=ID
  if (req.method === 'GET' && path === 'interactions') {
    const userId = params.get('user');
    if (!userId) return cors({ votes: [], favourites: [] });
    const [votes, favs] = await Promise.all([
      db.query('SELECT item_id FROM vibeclaw_votes WHERE user_id=$1', [userId]),
      db.query('SELECT item_id FROM vibeclaw_favourites WHERE user_id=$1', [userId])
    ]);
    return cors({
      votes: votes.rows.map(r => r.item_id),
      favourites: favs.rows.map(r => r.item_id)
    });
  }

  // GET /api/items — list/search
  if (req.method === 'GET' && !path) {
    const type = params.get('type');
    const tag = params.get('tag');
    const q = params.get('q');
    const id = params.get('id');
    const slug = params.get('slug');
    const sort = params.get('sort') || 'recent'; // recent|popular|downloads
    const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
    const offset = parseInt(params.get('offset') || '0');

    // Single item by ID
    if (id) {
      const { rows } = await db.query('SELECT * FROM vibeclaw_items WHERE id=$1', [id]);
      return cors(rows[0] || null);
    }

    // Single item by type+slug
    if (type && slug) {
      const { rows } = await db.query('SELECT * FROM vibeclaw_items WHERE type=$1 AND slug=$2', [type, slug]);
      return cors(rows[0] || null);
    }

    // List with filters
    let where = ["visibility = 'public'"];
    let vals = [];
    let idx = 1;

    if (type && VALID_TYPES.includes(type)) {
      where.push(`type = $${idx++}`);
      vals.push(type);
    }
    if (tag) {
      where.push(`$${idx++} = ANY(tags)`);
      vals.push(tag);
    }
    if (q) {
      where.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      vals.push(`%${q}%`);
      idx++;
    }

    const orderBy = sort === 'popular' ? 'upvotes DESC' : sort === 'downloads' ? 'downloads DESC' : 'created_at DESC';
    const sql = `SELECT id, type, slug, title, description, author_name, tags, upvotes, downloads, created_at, updated_at
      FROM vibeclaw_items WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`;
    vals.push(limit, offset);

    const { rows } = await db.query(sql, vals);
    return cors(rows);
  }

  // POST /api/items — create
  if (req.method === 'POST' && !path) {
    const user = getUser(req);
    const body = await req.json();
    const { type, slug, title, description, tags, spec, files, readme, visibility } = body;

    if (!type || !VALID_TYPES.includes(type)) return cors({ error: 'Invalid type' }, 400);
    if (!slug || !title) return cors({ error: 'slug and title required' }, 400);

    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await db.query(`
      INSERT INTO vibeclaw_items (id, type, slug, title, description, author_id, author_name, tags, spec, files, readme, visibility)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, [id, type, slug, title, description || '', 
        user?.sub || null, user?.user_metadata?.full_name || body.author_name || 'Anonymous',
        tags || [], JSON.stringify(spec || {}), JSON.stringify(files || []), readme || '',
        visibility || 'public']);
    return cors({ id, slug }, 201);
  }

  // PUT /api/items — update
  if (req.method === 'PUT' && !path) {
    const user = getUser(req);
    const body = await req.json();
    if (!body.id) return cors({ error: 'id required' }, 400);

    // Check ownership
    const { rows } = await db.query('SELECT author_id FROM vibeclaw_items WHERE id=$1', [body.id]);
    if (!rows.length) return cors({ error: 'Not found' }, 404);
    if (rows[0].author_id && user?.sub !== rows[0].author_id) return cors({ error: 'Not owner' }, 403);

    const updates = [];
    const vals = [];
    let idx = 1;
    for (const field of ['title','description','tags','spec','files','readme','visibility']) {
      if (body[field] !== undefined) {
        const val = ['spec','files'].includes(field) ? JSON.stringify(body[field]) : body[field];
        updates.push(`${field} = $${idx++}`);
        vals.push(val);
      }
    }
    if (!updates.length) return cors({ error: 'Nothing to update' }, 400);
    updates.push(`updated_at = NOW()`);
    vals.push(body.id);
    await db.query(`UPDATE vibeclaw_items SET ${updates.join(', ')} WHERE id = $${idx}`, vals);
    return cors({ ok: true });
  }

  // DELETE /api/items
  if (req.method === 'DELETE' && !path) {
    const user = getUser(req);
    const { id } = await req.json();
    const { rows } = await db.query('SELECT author_id FROM vibeclaw_items WHERE id=$1', [id]);
    if (!rows.length) return cors({ error: 'Not found' }, 404);
    if (rows[0].author_id && user?.sub !== rows[0].author_id) return cors({ error: 'Not owner' }, 403);
    await db.query('DELETE FROM vibeclaw_items WHERE id=$1', [id]);
    return cors({ ok: true });
  }

  return cors({ error: 'Not found' }, 404);
};

export const config = { path: '/api/items/*' };
