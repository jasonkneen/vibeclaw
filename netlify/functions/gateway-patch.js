import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const CONFIG_PATH = join(homedir(), '.openclaw', 'openclaw.json');
const CRON_PATH = join(homedir(), '.openclaw', 'cron', 'jobs.json');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') return new Response('', { status: 200, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'POST only' }), { status: 405, headers });

  try {
    const body = await req.json();

    // ── Agent patch ──
    // main agent lives in agents.defaults; named agents in agents.entries[id]
    if (body.agentPatch) {
      const { agentId, patch } = body.agentPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.agents) config.agents = {};

      if (agentId === 'main' || !config.agents.entries?.[agentId]) {
        // Write to defaults
        if (!config.agents.defaults) config.agents.defaults = {};
        if (patch.model) {
          config.agents.defaults.model = config.agents.defaults.model || {};
          config.agents.defaults.model.primary = patch.model;
          delete patch.model;
        }
        deepMerge(config.agents.defaults, patch);
      } else {
        config.agents.entries[agentId] = deepMerge(config.agents.entries[agentId] || {}, patch);
      }

      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Channel patch ──
    if (body.channelPatch) {
      const { channelId, patch } = body.channelPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.channels) config.channels = {};
      config.channels[channelId] = deepMerge(config.channels[channelId] || {}, patch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Skill toggle ──
    if (body.skillPatch) {
      const { skillId, enabled } = body.skillPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.skills) config.skills = {};
      if (!config.skills.entries) config.skills.entries = {};
      config.skills.entries[skillId] = { ...config.skills.entries[skillId], enabled };
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Cron patch ──
    if (body.cronPatch) {
      const { jobId, patch } = body.cronPatch;
      const cronData = JSON.parse(await readFile(CRON_PATH, 'utf8'));
      cronData.jobs = cronData.jobs.map(j => j.id === jobId ? deepMerge({...j}, patch) : j);
      await writeFile(CRON_PATH, JSON.stringify(cronData, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Gateway restart ──
    if (body.action === 'restart') {
      try {
        execSync('pkill -USR1 -f "openclaw gateway" || true', { timeout: 3000 });
      } catch {}
      return new Response(JSON.stringify({ ok: true, message: 'Restart signal sent' }), { status: 200, headers });
    }

    // ── Generic config patch ──
    if (body.patch) {
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      deepMerge(config, body.patch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ ok: false, error: 'No valid patch provided' }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
  }
};

export const config = { path: '/api/gateway-patch' };
