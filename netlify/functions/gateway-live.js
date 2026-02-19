import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const OC = join(homedir(), '.openclaw');
const CONFIG_PATH = join(OC, 'openclaw.json');
const SKILLS_PATH = join(homedir(), '.nvm', 'versions', 'node', 'v22.14.0', 'lib', 'node_modules', 'openclaw', 'skills');
const AGENT_SKILLS_PATH = join(homedir(), '.agents', 'skills');

async function readJSON(p, fallback = null) {
  try { return JSON.parse(await readFile(p, 'utf8')); } catch { return fallback; }
}

async function getSkillMeta(base, name) {
  const skillMd = join(base, name, 'SKILL.md');
  try {
    const content = await readFile(skillMd, 'utf8');
    const titleMatch = content.match(/^#\s*(.+)/m);
    const descMatch = content.match(/^#[^\n]*\n+([^\n]+)/);
    return {
      title: titleMatch?.[1]?.trim() || name,
      description: descMatch?.[1]?.trim() || '',
    };
  } catch { return { title: name, description: '' }; }
}

async function getInstalledSkills() {
  const skills = [];
  for (const base of [SKILLS_PATH, AGENT_SKILLS_PATH]) {
    if (!existsSync(base)) continue;
    try {
      const dirs = await readdir(base, { withFileTypes: true });
      for (const d of dirs) {
        if (!d.isDirectory()) continue;
        const meta = await getSkillMeta(base, d.name);
        skills.push({ id: d.name, ...meta });
      }
    } catch {}
  }
  return skills;
}

// Pull last user message and message count from a session JSONL
async function getSessionSummary(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    let messageCount = 0;
    let lastUserMessage = '';
    let lastAssistantMessage = '';
    let model = '';
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'message') {
          messageCount++;
          if (entry.message?.role === 'user') {
            const text = entry.message.content?.find?.(c => c.type === 'text')?.text || '';
            if (text && !text.startsWith('[System')) lastUserMessage = text.slice(0, 120);
          }
          if (entry.message?.role === 'assistant') {
            const text = entry.message.content?.find?.(c => c.type === 'text')?.text || '';
            if (text) lastAssistantMessage = text.slice(0, 120);
          }
          if (entry.message?.model) model = entry.message.model;
        }
      } catch {}
    }
    return { messageCount, lastUserMessage, lastAssistantMessage, model };
  } catch { return { messageCount: 0, lastUserMessage: '', lastAssistantMessage: '', model: '' }; }
}

async function getRecentSessions(agentId = 'main', limit = 12) {
  const dir = join(OC, 'agents', agentId, 'sessions');
  if (!existsSync(dir)) return [];
  try {
    const files = await readdir(dir);
    const withStats = await Promise.all(
      files.filter(f => f.endsWith('.jsonl')).map(async f => {
        const s = await stat(join(dir, f)).catch(() => null);
        return { id: f.replace('.jsonl',''), mtime: s?.mtime, size: s?.size, path: join(dir, f) };
      })
    );
    const sorted = withStats.filter(s => s.mtime).sort((a,b) => b.mtime - a.mtime).slice(0, limit);
    return Promise.all(sorted.map(async s => {
      const summary = await getSessionSummary(s.path);
      return {
        id: s.id,
        lastActive: s.mtime?.toISOString(),
        sizeKb: Math.round(s.size / 1024),
        ...summary,
      };
    }));
  } catch { return []; }
}

async function getCronJobs() {
  const data = await readJSON(join(OC, 'cron', 'jobs.json'), { jobs: [] });
  return (data.jobs || []).map(j => ({
    id: j.id,
    name: j.name || j.id,
    enabled: j.enabled !== false,
    schedule: j.schedule,
    lastStatus: j.state?.lastStatus,
    lastRunAt: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
    nextRunAt: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
    lastDurationMs: j.state?.lastDurationMs,
    consecutiveErrors: j.state?.consecutiveErrors || 0,
    totalRuns: j.state?.totalRuns || 0,
    sessionTarget: j.sessionTarget,
    agentId: j.agentId,
    payloadKind: j.payload?.kind,
    payloadMessage: j.payload?.message?.slice?.(0, 200) || j.payload?.text?.slice?.(0, 200) || '',
    deliveryMode: j.delivery?.mode,
  }));
}

async function getPairedNodes() {
  const data = await readJSON(join(OC, 'nodes', 'paired.json'), {});
  return Object.values(data).map(n => ({
    id: n.nodeId,
    name: n.displayName || n.nodeId,
    platform: n.platform,
    version: n.version,
    deviceFamily: n.deviceFamily,
    modelIdentifier: n.modelIdentifier,
    caps: n.caps || [],
    pairedAt: n.pairedAt,
    lastSeen: n.lastSeen,
  }));
}

export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response('', { status: 200, headers });

  try {
    const config = await readJSON(CONFIG_PATH, {});
    const installedSkills = await getInstalledSkills();
    const skillEntries = config.skills?.entries ?? {};
    const agentDefs = config.agents?.entries ?? {};
    const agentDefaults = config.agents?.defaults ?? {};
    const defaultModel = agentDefaults.model?.primary || 'unknown';
    const defaultFallbacks = agentDefaults.model?.fallbacks || agentDefaults.model?.fallback || [];

    const agents = [
      {
        id: 'main', name: 'main',
        model: defaultModel,
        fallbackModels: defaultFallbacks,
        systemPrompt: agentDefaults.systemPrompt || '',
        workspace: agentDefaults.workspace || '',
        thinking: agentDefaults.thinking,
        enabled: true,
        // Full defaults for editing
        maxConcurrent: agentDefaults.maxConcurrent ?? 4,
        compaction: agentDefaults.compaction || { mode: 'safeguard' },
        memorySearch: agentDefaults.memorySearch || { enabled: false },
        subagents: agentDefaults.subagents || { maxConcurrent: 4, model: defaultModel },
      },
      ...Object.entries(agentDefs).map(([id, ag]) => ({
        id, name: ag.name || id,
        model: ag.model?.primary || defaultModel,
        fallbackModels: ag.model?.fallbacks || ag.model?.fallback || defaultFallbacks,
        systemPrompt: ag.systemPrompt || '',
        workspace: ag.workspace || agentDefaults.workspace || '',
        thinking: ag.thinking,
        enabled: ag.enabled !== false,
        maxConcurrent: ag.maxConcurrent ?? agentDefaults.maxConcurrent ?? 4,
        compaction: ag.compaction || agentDefaults.compaction || { mode: 'safeguard' },
        memorySearch: ag.memorySearch || agentDefaults.memorySearch || { enabled: false },
        subagents: ag.subagents || agentDefaults.subagents || { maxConcurrent: 4, model: defaultModel },
      })),
    ];

    const skills = installedSkills.map(s => ({
      ...s,
      enabled: skillEntries[s.id] ? skillEntries[s.id].enabled !== false : true,
      // Include any skill-level config (apiKey, etc) — local admin tool so keys are ok
      config: skillEntries[s.id] ? { ...skillEntries[s.id] } : {},
    }));

    const channels = Object.entries(config.channels ?? {}).map(([id, ch]) => ({
      id, type: id, enabled: ch.enabled !== false, ...ch,
    }));

    const models = [];
    const modelProviders = [];
    for (const [provider, pc] of Object.entries(config.models?.providers ?? {})) {
      for (const m of (pc.models ?? [])) {
        models.push({ id: m.id, provider, name: m.name || m.id, contextWindow: m.contextWindow, reasoning: m.reasoning });
      }
      modelProviders.push({ id: provider, baseUrl: pc.baseUrl, apiKey: pc.apiKey, api: pc.api, models: pc.models || [] });
    }

    const [sessions, cronJobs, nodes] = await Promise.all([
      getRecentSessions('main', 12),
      getCronJobs(),
      getPairedNodes(),
    ]);

    const gw = config.gateway || {};
    const gatewayConfig = {
      port:    gw.port    || 18789,
      mode:    gw.mode    || 'local',
      bind:    gw.bind    || 'loopback',
      version: config.meta?.lastTouchedVersion,
      wsUrl:   `ws://127.0.0.1:${gw.port || 18789}`,
      auth: {
        mode:  gw.auth?.mode  || 'token',
        token: gw.auth?.token || '',
        allowTailscale: gw.auth?.allowTailscale !== false,
      },
      tailscale: { mode: gw.tailscale?.mode || 'off' },
      allowedOrigins: gw.controlUi?.allowedOrigins || [],
    };

    const memoryConfig   = config.memory      || {};
    const messagesConfig = config.messages    || {};
    const diagConfig     = config.diagnostics || {};
    const updateConfig   = config.update      || {};
    const toolsConfig    = config.tools       || {};
    const discoveryConfig= config.discovery   || {};
    const canvasConfig   = config.canvasHost  || {};
    const pluginsConfig  = config.plugins     || {};
    const talkConfig     = config.talk        || {};
    const commandsConfig = config.commands    || {};
    const webConfig      = config.web         || {};

    return new Response(JSON.stringify({
      ok: true,
      gateway: gatewayConfig,
      agents, skills, channels, models, modelProviders,
      sessions, cronJobs, nodes, defaultModel,
      config: {
        memory: memoryConfig,
        messages: messagesConfig,
        diagnostics: diagConfig,
        update: updateConfig,
        tools: toolsConfig,
        discovery: discoveryConfig,
        canvas: canvasConfig,
        plugins: pluginsConfig,
        talk: talkConfig,
        commands: commandsConfig,
        web: webConfig,
      },
    }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
};

export const config = { path: '/api/gateway-live' };
