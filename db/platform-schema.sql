-- VibeClaw Platform Schema
-- Run against Neon DB (same as existing vibeclaw_ tables)

CREATE TABLE IF NOT EXISTS vibeclaw_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('server','skill','plugin','tool','model','recipe','knowledge')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author_id TEXT,
  author_name TEXT DEFAULT 'Anonymous',
  tags TEXT[] DEFAULT '{}',
  spec JSONB NOT NULL DEFAULT '{}',
  files JSONB DEFAULT '[]',
  readme TEXT DEFAULT '',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public','unlisted','private')),
  downloads INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  forked_from TEXT REFERENCES vibeclaw_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, slug)
);

CREATE INDEX IF NOT EXISTS idx_items_type ON vibeclaw_items(type);
CREATE INDEX IF NOT EXISTS idx_items_slug ON vibeclaw_items(type, slug);
CREATE INDEX IF NOT EXISTS idx_items_author ON vibeclaw_items(author_id);
CREATE INDEX IF NOT EXISTS idx_items_tags ON vibeclaw_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_items_downloads ON vibeclaw_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_items_upvotes ON vibeclaw_items(upvotes DESC);

CREATE TABLE IF NOT EXISTS vibeclaw_votes (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES vibeclaw_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS vibeclaw_favourites (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES vibeclaw_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);
