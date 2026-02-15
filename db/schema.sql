-- ============================================
-- VibeClaw Schema Extension (Neon/Postgres)
-- Shares the same Neon DB as MoltRats
-- ============================================

-- Users — linked to Netlify Identity via external ID
CREATE TABLE IF NOT EXISTS vibeclaw_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  identity_id TEXT UNIQUE NOT NULL,          -- Netlify Identity user ID
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',             -- github, google, email, etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  last_seen BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE INDEX IF NOT EXISTS idx_vc_users_identity ON vibeclaw_users(identity_id);
CREATE INDEX IF NOT EXISTS idx_vc_users_email ON vibeclaw_users(email);

-- Saved server configurations (from forge)
CREATE TABLE IF NOT EXISTS vibeclaw_servers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES vibeclaw_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  spec JSONB NOT NULL,                       -- full server spec (agents, skills, model, etc.)
  template TEXT,                             -- source flavour/template name
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE INDEX IF NOT EXISTS idx_vc_servers_user ON vibeclaw_servers(user_id);

-- Chat sessions
CREATE TABLE IF NOT EXISTS vibeclaw_chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES vibeclaw_users(id) ON DELETE CASCADE,
  name TEXT,
  endpoint TEXT,
  model TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE INDEX IF NOT EXISTS idx_vc_sessions_user ON vibeclaw_chat_sessions(user_id);

-- Link VibeClaw users to MoltRats rats (optional, for mesh integration)
CREATE TABLE IF NOT EXISTS vibeclaw_rat_links (
  user_id TEXT NOT NULL REFERENCES vibeclaw_users(id) ON DELETE CASCADE,
  rat_id TEXT NOT NULL REFERENCES rats(id) ON DELETE CASCADE,
  linked_at BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  PRIMARY KEY (user_id, rat_id)
);
