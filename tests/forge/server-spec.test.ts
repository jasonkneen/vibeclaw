import { describe, it, expect } from 'vitest';
import {
  buildSpec,
  generateOpenClawConfig,
  generateSetupScript,
  generateReadme,
  specToSlug,
  buildPackage,
  specToFlavour,
  type ForgeState,
  type ServerSpec,
} from '../../src/forge/server-spec.js';

// ── Helpers ──

function makeState(overrides: Partial<ForgeState> = {}): ForgeState {
  return {
    emoji: '🦀',
    name: 'Test Server',
    runtime: 'single',
    agents: [{ emoji: '🦀', name: 'Claw', desc: 'Test assistant' }],
    skills: new Set(['chat', 'filesystem', 'execute']),
    systemPrompt: 'You are a test agent.',
    files: {
      'AGENTS.md': '# Agents',
      'SOUL.md': '# Soul',
    },
    model: 'deepseek/deepseek-chat-v3-0324:free',
    ...overrides,
  };
}

function makeSpec(overrides: Partial<ServerSpec> = {}): ServerSpec {
  return {
    specVersion: '1.0',
    id: 'srv_test123',
    name: 'Test Server',
    emoji: '🦀',
    runtime: {
      type: 'single',
      model: { provider: 'deepseek', model: 'deepseek/deepseek-chat-v3-0324:free' },
    },
    agents: [
      { id: 'main', name: 'Claw', emoji: '🦀', role: 'lead', description: 'Test assistant', systemPrompt: 'You are a test agent.' },
    ],
    skills: [
      { source: 'builtin:chat' },
      { source: 'builtin:filesystem' },
      { source: 'builtin:execute' },
    ],
    workspace: { 'AGENTS.md': '# Agents', 'SOUL.md': '# Soul' },
    ...overrides,
  };
}

// ── buildSpec ──

describe('buildSpec', () => {
  it('produces a valid spec from state', () => {
    const spec = buildSpec(makeState());
    expect(spec.specVersion).toBe('1.0');
    expect(spec.name).toBe('Test Server');
    expect(spec.emoji).toBe('🦀');
    expect(spec.id).toMatch(/^srv_[a-z0-9]+$/);
  });

  it('sets first agent as lead with id "main"', () => {
    const spec = buildSpec(makeState());
    expect(spec.agents[0].id).toBe('main');
    expect(spec.agents[0].role).toBe('lead');
  });

  it('attaches systemPrompt to first agent only', () => {
    const state = makeState({
      agents: [
        { emoji: '🦀', name: 'Lead', desc: 'Leader' },
        { emoji: '🔍', name: 'Scout', desc: 'Helper' },
      ],
      systemPrompt: 'Be helpful.',
    });
    const spec = buildSpec(state);
    expect(spec.agents[0].systemPrompt).toBe('Be helpful.');
    expect(spec.agents[1].systemPrompt).toBeUndefined();
  });

  it('generates agent IDs from names', () => {
    const state = makeState({
      agents: [
        { emoji: '🦀', name: 'Lead', desc: '' },
        { emoji: '🔍', name: 'Code Bot', desc: '' },
        { emoji: '✍️', name: 'Mr. Writer!', desc: '' },
      ],
    });
    const spec = buildSpec(state);
    expect(spec.agents[0].id).toBe('main');
    expect(spec.agents[1].id).toBe('codebot');
    expect(spec.agents[2].id).toBe('mrwriter');
  });

  it('falls back to agentN for empty names', () => {
    const state = makeState({
      agents: [
        { emoji: '🦀', name: 'Lead', desc: '' },
        { emoji: '🔍', name: '', desc: '' },
      ],
    });
    const spec = buildSpec(state);
    expect(spec.agents[1].id).toBe('agent1');
  });

  it('converts skills set to builtin sources', () => {
    const spec = buildSpec(makeState({ skills: new Set(['chat', 'github']) }));
    expect(spec.skills).toEqual([
      { source: 'builtin:chat' },
      { source: 'builtin:github' },
    ]);
  });

  it('copies workspace files', () => {
    const spec = buildSpec(makeState({
      files: { 'SOUL.md': '# My Soul', 'TOOLS.md': '# Tools' },
    }));
    expect(spec.workspace).toEqual({ 'SOUL.md': '# My Soul', 'TOOLS.md': '# Tools' });
  });

  it('extracts provider from model string', () => {
    const spec = buildSpec(makeState({ model: 'anthropic/claude-sonnet-4' }));
    expect(spec.runtime.model.provider).toBe('anthropic');
    expect(spec.runtime.model.model).toBe('anthropic/claude-sonnet-4');
  });

  it('defaults provider to openrouter for bare model names', () => {
    const spec = buildSpec(makeState({ model: 'some-model' }));
    expect(spec.runtime.model.provider).toBe('openrouter');
  });

  it('handles multi-agent runtime', () => {
    const spec = buildSpec(makeState({ runtime: 'multi' }));
    expect(spec.runtime.type).toBe('multi');
  });

  it('handles minimal runtime', () => {
    const spec = buildSpec(makeState({ runtime: 'minimal' }));
    expect(spec.runtime.type).toBe('minimal');
  });

  it('handles empty skills set', () => {
    const spec = buildSpec(makeState({ skills: new Set() }));
    expect(spec.skills).toEqual([]);
  });

  it('handles empty workspace', () => {
    const spec = buildSpec(makeState({ files: {} }));
    expect(spec.workspace).toEqual({});
  });

  it('omits systemPrompt when empty', () => {
    const spec = buildSpec(makeState({ systemPrompt: '' }));
    expect(spec.agents[0].systemPrompt).toBeUndefined();
  });
});

// ── generateOpenClawConfig ──

describe('generateOpenClawConfig', () => {
  it('produces valid JSON', () => {
    const config = generateOpenClawConfig(makeSpec());
    expect(() => JSON.parse(config)).not.toThrow();
  });

  it('sets the correct model', () => {
    const config = JSON.parse(generateOpenClawConfig(makeSpec()));
    expect(config.agents.defaults.model.primary).toBe('deepseek/deepseek-chat-v3-0324:free');
    expect(config.sessions.defaults.model).toBe('deepseek/deepseek-chat-v3-0324:free');
  });

  it('uses default model when none specified', () => {
    const spec = makeSpec();
    spec.runtime.model.model = '';
    const config = JSON.parse(generateOpenClawConfig(spec));
    expect(config.agents.defaults.model.primary).toBe('google/gemma-3-4b-it:free');
  });

  it('sets workspace path', () => {
    const config = JSON.parse(generateOpenClawConfig(makeSpec()));
    expect(config.agents.defaults.workspace).toBe('./workspace');
  });

  it('matches OpenClaw config structure', () => {
    const config = JSON.parse(generateOpenClawConfig(makeSpec()));
    // These are the required top-level keys for OpenClaw
    expect(config).toHaveProperty('agents');
    expect(config).toHaveProperty('agents.defaults');
    expect(config).toHaveProperty('agents.defaults.model');
    expect(config).toHaveProperty('sessions');
    expect(config).toHaveProperty('sessions.defaults');
  });
});

// ── generateSetupScript ──

describe('generateSetupScript', () => {
  it('includes server name', () => {
    const script = generateSetupScript(makeSpec({ name: 'My Cool Server' }));
    expect(script).toContain('My Cool Server');
  });

  it('starts with shebang', () => {
    const script = generateSetupScript(makeSpec());
    expect(script.startsWith('#!/bin/bash')).toBe(true);
  });

  it('uses set -e for fail-fast', () => {
    const script = generateSetupScript(makeSpec());
    expect(script).toContain('set -e');
  });

  it('installs OpenClaw via official installer', () => {
    const script = generateSetupScript(makeSpec());
    expect(script).toContain('openclaw.ai/install.sh');
  });

  it('copies openclaw.json to ~/.openclaw/', () => {
    const script = generateSetupScript(makeSpec());
    expect(script).toContain('cp openclaw.json ~/.openclaw/openclaw.json');
  });

  it('creates workspace directory', () => {
    const script = generateSetupScript(makeSpec());
    expect(script).toContain('mkdir -p workspace');
  });

  it('tells user to run gateway start', () => {
    const script = generateSetupScript(makeSpec());
    expect(script).toContain('openclaw gateway start');
  });
});

// ── generateReadme ──

describe('generateReadme', () => {
  it('includes server name as heading', () => {
    const readme = generateReadme(makeSpec({ name: 'DevBot' }));
    expect(readme).toContain('# DevBot');
  });

  it('lists agents', () => {
    const readme = generateReadme(makeSpec({
      agents: [
        { id: 'main', name: 'Lead', description: 'The boss' },
        { id: 'helper', name: 'Helper', description: 'The helper' },
      ],
    }));
    expect(readme).toContain('**Lead**');
    expect(readme).toContain('**Helper**');
    expect(readme).toContain('The boss');
  });

  it('lists skills without builtin: prefix', () => {
    const readme = generateReadme(makeSpec({
      skills: [{ source: 'builtin:chat' }, { source: 'builtin:github' }],
    }));
    expect(readme).toContain('- chat');
    expect(readme).toContain('- github');
    expect(readme).not.toContain('builtin:');
  });

  it('includes install instructions', () => {
    const readme = generateReadme(makeSpec());
    expect(readme).toContain('openclaw.ai/install.sh');
    expect(readme).toContain('openclaw gateway start');
  });

  it('credits ClawForge', () => {
    const readme = generateReadme(makeSpec());
    expect(readme).toContain('vibeclaw.dev');
  });
});

// ── specToSlug ──

describe('specToSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(specToSlug('My Cool Server')).toBe('my-cool-server');
  });

  it('strips special characters', () => {
    expect(specToSlug('Bot!!! v2.0')).toBe('bot-v2-0');
  });

  it('strips leading/trailing hyphens', () => {
    expect(specToSlug('---hello---')).toBe('hello');
  });

  it('returns "server" for empty string', () => {
    expect(specToSlug('')).toBe('server');
  });

  it('handles unicode', () => {
    expect(specToSlug('🦀 CrabBot')).toBe('crabbot');
  });

  it('collapses multiple separators', () => {
    expect(specToSlug('a   b   c')).toBe('a-b-c');
  });
});

// ── buildPackage ──

describe('buildPackage', () => {
  it('includes all required files', () => {
    const pkg = buildPackage(makeSpec());
    expect(pkg).toHaveProperty('openclaw.json');
    expect(pkg).toHaveProperty('setup.sh');
    expect(pkg).toHaveProperty('README.md');
    expect(pkg).toHaveProperty('server-spec.json');
  });

  it('includes workspace files under workspace/', () => {
    const pkg = buildPackage(makeSpec({
      workspace: { 'SOUL.md': '# Soul', 'AGENTS.md': '# Agents' },
    }));
    expect(pkg).toHaveProperty('workspace/SOUL.md');
    expect(pkg).toHaveProperty('workspace/AGENTS.md');
    expect(pkg['workspace/SOUL.md']).toBe('# Soul');
  });

  it('skips empty workspace entries', () => {
    const pkg = buildPackage(makeSpec({
      workspace: { 'SOUL.md': '# Soul', 'EMPTY.md': '' },
    }));
    expect(pkg).toHaveProperty('workspace/SOUL.md');
    expect(pkg).not.toHaveProperty('workspace/EMPTY.md');
  });

  it('openclaw.json is valid JSON', () => {
    const pkg = buildPackage(makeSpec());
    expect(() => JSON.parse(pkg['openclaw.json'])).not.toThrow();
  });

  it('server-spec.json is valid JSON', () => {
    const pkg = buildPackage(makeSpec());
    expect(() => JSON.parse(pkg['server-spec.json'])).not.toThrow();
  });

  it('server-spec.json roundtrips the spec', () => {
    const spec = makeSpec();
    const pkg = buildPackage(spec);
    const parsed = JSON.parse(pkg['server-spec.json']);
    expect(parsed.name).toBe(spec.name);
    expect(parsed.agents.length).toBe(spec.agents.length);
  });
});

// ── specToFlavour ──

describe('specToFlavour', () => {
  it('converts spec to flavour format', () => {
    const flavour = specToFlavour(makeSpec());
    expect(flavour.id).toBe('forge-preview');
    expect(flavour.name).toBe('Test Server');
  });

  it('maps agents', () => {
    const flavour = specToFlavour(makeSpec({
      agents: [
        { id: 'main', name: 'Lead', emoji: '🦀', description: 'Boss' },
        { id: 'helper', name: 'Helper', emoji: '🔍', description: 'Side' },
      ],
    }));
    expect(flavour.agents).toHaveLength(2);
    expect(flavour.agents[0].name).toBe('Lead');
    expect(flavour.agents[1].name).toBe('Helper');
  });

  it('strips builtin: from skill sources', () => {
    const flavour = specToFlavour(makeSpec({
      skills: [{ source: 'builtin:chat' }, { source: 'builtin:github' }],
    }));
    expect(flavour.skills[0].name).toBe('chat');
    expect(flavour.skills[1].name).toBe('github');
  });

  it('carries systemPrompt from first agent', () => {
    const flavour = specToFlavour(makeSpec({
      agents: [{ id: 'main', name: 'Lead', systemPrompt: 'Be cool' }],
    }));
    expect(flavour.systemPrompt).toBe('Be cool');
  });

  it('carries workspace files', () => {
    const flavour = specToFlavour(makeSpec({
      workspace: { 'SOUL.md': '# Soul text' },
    }));
    expect(flavour.workspace).toEqual({ 'SOUL.md': '# Soul text' });
  });

  it('handles empty spec gracefully', () => {
    const flavour = specToFlavour(makeSpec({
      agents: [],
      skills: [],
      workspace: {},
    }));
    expect(flavour.agents).toEqual([]);
    expect(flavour.skills).toEqual([]);
    expect(flavour.systemPrompt).toBe('');
  });
});
