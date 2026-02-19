import { readFile, writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

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
        if (!config.agents.defaults) config.agents.defaults = {};
        const target = config.agents.defaults;
        // Primary model
        if (patch.model !== undefined) {
          target.model = target.model || {};
          target.model.primary = patch.model;
          delete patch.model;
        }
        // Fallback models
        if (patch.fallbackModels !== undefined) {
          target.model = target.model || {};
          target.model.fallbacks = patch.fallbackModels;
          delete patch.fallbackModels;
        }
        // Nested objects - merge in place
        for (const key of ['memorySearch', 'compaction', 'subagents']) {
          if (patch[key] !== undefined) {
            target[key] = target[key] || {};
            deepMerge(target[key], patch[key]);
            delete patch[key];
          }
        }
        deepMerge(target, patch);
      } else {
        const target = config.agents.entries[agentId];
        if (patch.model !== undefined) {
          target.model = target.model || {};
          target.model.primary = patch.model;
          delete patch.model;
        }
        if (patch.fallbackModels !== undefined) {
          target.model = target.model || {};
          target.model.fallbacks = patch.fallbackModels;
          delete patch.fallbackModels;
        }
        for (const key of ['memorySearch', 'compaction', 'subagents']) {
          if (patch[key] !== undefined) {
            target[key] = target[key] || {};
            deepMerge(target[key], patch[key]);
            delete patch[key];
          }
        }
        config.agents.entries[agentId] = deepMerge(target, patch);
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

    // ── Channel create ──
    if (body.channelCreate) {
      const { channelId, channel } = body.channelCreate;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.channels) config.channels = {};
      if (config.channels[channelId]) return new Response(JSON.stringify({ ok: false, error: `Channel "${channelId}" already exists` }), { status: 409, headers });
      config.channels[channelId] = { enabled: true, ...channel };
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Channel delete ──
    if (body.channelDelete) {
      const { channelId } = body.channelDelete;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (config.channels?.[channelId]) delete config.channels[channelId];
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Channel account patch ──
    if (body.channelAccountPatch) {
      const { channelId, accountId, patch: accPatch } = body.channelAccountPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.channels) config.channels = {};
      if (!config.channels[channelId]) config.channels[channelId] = {};
      if (!config.channels[channelId].accounts) config.channels[channelId].accounts = {};
      config.channels[channelId].accounts[accountId] = deepMerge(
        config.channels[channelId].accounts[accountId] || {}, accPatch
      );
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Channel account delete ──
    if (body.channelAccountDelete) {
      const { channelId, accountId } = body.channelAccountDelete;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (config.channels?.[channelId]?.accounts?.[accountId]) {
        delete config.channels[channelId].accounts[accountId];
        await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Commands patch ──
    if (body.commandsPatch) {
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      config.commands = deepMerge(config.commands || {}, body.commandsPatch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Web patch ──
    if (body.webPatch) {
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      config.web = deepMerge(config.web || {}, body.webPatch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Skill patch (enabled + apiKey + any config) ──
    if (body.skillPatch) {
      const { skillId, patch: skillPatchData, enabled } = body.skillPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.skills) config.skills = {};
      if (!config.skills.entries) config.skills.entries = {};
      const existing = config.skills.entries[skillId] || {};
      config.skills.entries[skillId] = deepMerge({ ...existing }, skillPatchData || { enabled });
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Gateway config patch ──
    if (body.gatewayPatch) {
      const { patch: gp } = body.gatewayPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.gateway) config.gateway = {};
      if (gp.port !== undefined)   config.gateway.port = Number(gp.port);
      if (gp.mode !== undefined)   config.gateway.mode = gp.mode;
      if (gp.bind !== undefined)   config.gateway.bind = gp.bind;
      if (gp.auth !== undefined)   config.gateway.auth = deepMerge(config.gateway.auth || {}, gp.auth);
      if (gp.tailscale !== undefined) config.gateway.tailscale = deepMerge(config.gateway.tailscale || {}, gp.tailscale);
      if (gp.allowedOrigins !== undefined) {
        config.gateway.controlUi = config.gateway.controlUi || {};
        config.gateway.controlUi.allowedOrigins = gp.allowedOrigins;
      }
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Memory config patch ──
    if (body.memoryPatch) {
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      config.memory = deepMerge(config.memory || {}, body.memoryPatch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Messages / TTS patch ──
    if (body.messagesPatch) {
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      config.messages = deepMerge(config.messages || {}, body.messagesPatch);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Model provider patch ──
    if (body.modelProviderPatch) {
      const { providerId, patch: mp } = body.modelProviderPatch;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.models) config.models = {};
      if (!config.models.providers) config.models.providers = {};
      config.models.providers[providerId] = deepMerge(config.models.providers[providerId] || {}, mp);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Diagnostics / Update / Discovery / Canvas / Plugins / Tools patches ──
    for (const key of ['diagnostics','update','discovery','canvasHost','plugins','tools']) {
      const patchKey = `${key}Patch`;
      if (body[patchKey]) {
        const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
        config[key] = deepMerge(config[key] || {}, body[patchKey]);
        await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
      }
    }

    // ── Cron patch ──
    if (body.cronPatch) {
      const { jobId, patch } = body.cronPatch;
      const cronData = JSON.parse(await readFile(CRON_PATH, 'utf8'));
      cronData.jobs = cronData.jobs.map(j => j.id === jobId ? deepMerge({...j}, patch) : j);
      await writeFile(CRON_PATH, JSON.stringify(cronData, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Create agent ──
    if (body.agentCreate) {
      const { agentId, agent } = body.agentCreate;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.agents) config.agents = {};
      if (!config.agents.entries) config.agents.entries = {};
      config.agents.entries[agentId] = agent;
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Delete agent ──
    if (body.agentDelete) {
      const { agentId } = body.agentDelete;
      if (agentId === 'main') return new Response(JSON.stringify({ ok: false, error: 'Cannot delete main agent' }), { status: 400, headers });
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (config.agents?.entries?.[agentId]) delete config.agents.entries[agentId];
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Create cron job ──
    if (body.cronCreate) {
      const { job } = body.cronCreate;
      const id = job.id || `${randomBytes(4).toString('hex')}-${randomBytes(4).toString('hex')}-${randomBytes(4).toString('hex')}-${randomBytes(4).toString('hex')}`;
      const raw = await readFile(CRON_PATH, 'utf8').catch(() => '{"jobs":[]}');
      const cronData = JSON.parse(raw);
      if (!cronData.jobs) cronData.jobs = [];
      cronData.jobs.push({ ...job, id, enabled: job.enabled !== false });
      await writeFile(CRON_PATH, JSON.stringify(cronData, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers });
    }

    // ── Delete cron job ──
    if (body.cronDelete) {
      const { jobId } = body.cronDelete;
      const cronData = JSON.parse(await readFile(CRON_PATH, 'utf8').catch(() => '{"jobs":[]}'));
      cronData.jobs = (cronData.jobs || []).filter(j => j.id !== jobId);
      await writeFile(CRON_PATH, JSON.stringify(cronData, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Add model to provider ──
    if (body.modelAdd) {
      const { providerId, model } = body.modelAdd;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.models) config.models = {};
      if (!config.models.providers) config.models.providers = {};
      if (!config.models.providers[providerId]) config.models.providers[providerId] = { models: [] };
      if (!config.models.providers[providerId].models) config.models.providers[providerId].models = [];
      const existing = config.models.providers[providerId].models.findIndex(m => m.id === model.id);
      if (existing >= 0) config.models.providers[providerId].models[existing] = model;
      else config.models.providers[providerId].models.push(model);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Remove model from provider ──
    if (body.modelRemove) {
      const { providerId, modelId } = body.modelRemove;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (config.models?.providers?.[providerId]?.models) {
        config.models.providers[providerId].models = config.models.providers[providerId].models.filter(m => m.id !== modelId);
      }
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Add/update model provider ──
    if (body.providerUpsert) {
      const { providerId, provider } = body.providerUpsert;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (!config.models) config.models = {};
      if (!config.models.providers) config.models.providers = {};
      config.models.providers[providerId] = deepMerge(config.models.providers[providerId] || {}, provider);
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Remove provider ──
    if (body.providerRemove) {
      const { providerId } = body.providerRemove;
      const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
      if (config.models?.providers?.[providerId]) delete config.models.providers[providerId];
      await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    // ── Gateway restart ──
    if (body.action === 'restart') {
      try {
        execSync('pkill -USR1 -f "openclaw gateway" || true', { timeout: 3000 });
      } catch {}
      return new Response(JSON.stringify({ ok: true, message: 'Restart signal sent' }), { status: 200, headers });
    }

    // ── Delete session file ──
    if (body.sessionDelete) {
      const { agentId = 'main', sessionId } = body.sessionDelete;
      const sessionPath = join(homedir(), '.openclaw', 'agents', agentId, 'sessions', `${sessionId}.jsonl`);
      await unlink(sessionPath).catch(() => {});
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
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
