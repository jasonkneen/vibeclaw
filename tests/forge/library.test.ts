import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadLibrary,
  saveLibrary,
  saveServer,
  deleteServer,
  duplicateServer,
  getServer,
} from '../../src/forge/library.js';
import type { ServerSpec } from '../../src/forge/server-spec.js';

// Mock localStorage
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
  get length() { return storage.size; },
  key: vi.fn((index: number) => [...storage.keys()][index] ?? null),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function makeSpec(name = 'Test Server'): ServerSpec {
  return {
    specVersion: '1.0',
    id: `srv_${Math.random().toString(36).slice(2, 8)}`,
    name,
    emoji: '🦀',
    runtime: { type: 'single', model: { provider: 'deepseek', model: 'deepseek/deepseek-chat-v3-0324:free' } },
    agents: [{ id: 'main', name: 'Claw', role: 'lead', description: 'Test' }],
    skills: [{ source: 'builtin:chat' }],
    workspace: { 'SOUL.md': '# Soul' },
  };
}

describe('Library', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  // ── loadLibrary ──

  describe('loadLibrary', () => {
    it('returns empty array when nothing stored', () => {
      expect(loadLibrary()).toEqual([]);
    });

    it('returns empty array for invalid JSON', () => {
      storage.set('clawforge-library', 'not json');
      expect(loadLibrary()).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      storage.set('clawforge-library', '{"foo": "bar"}');
      expect(loadLibrary()).toEqual([]);
    });

    it('returns stored array', () => {
      const specs = [makeSpec('A'), makeSpec('B')];
      storage.set('clawforge-library', JSON.stringify(specs));
      const result = loadLibrary();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
    });
  });

  // ── saveLibrary ──

  describe('saveLibrary', () => {
    it('writes to localStorage', () => {
      const specs = [makeSpec()];
      saveLibrary(specs);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clawforge-library',
        expect.any(String),
      );
    });

    it('roundtrips through loadLibrary', () => {
      const specs = [makeSpec('A'), makeSpec('B')];
      saveLibrary(specs);
      const result = loadLibrary();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
    });
  });

  // ── saveServer ──

  describe('saveServer', () => {
    it('adds a new server and returns its index', () => {
      const idx = saveServer(makeSpec('New'));
      expect(idx).toBe(0);
      expect(loadLibrary()).toHaveLength(1);
    });

    it('updates existing server by name', () => {
      saveServer(makeSpec('Existing'));
      const spec2 = makeSpec('Existing');
      spec2.emoji = '🚀';
      const idx = saveServer(spec2);
      expect(idx).toBe(0);
      expect(loadLibrary()).toHaveLength(1);
      expect(loadLibrary()[0].emoji).toBe('🚀');
    });

    it('preserves original ID on update', () => {
      const original = makeSpec('Keep ID');
      original.id = 'srv_original';
      saveServer(original);

      const updated = makeSpec('Keep ID');
      updated.id = 'srv_new';
      saveServer(updated);

      expect(loadLibrary()[0].id).toBe('srv_original');
    });

    it('adds multiple different servers', () => {
      saveServer(makeSpec('A'));
      saveServer(makeSpec('B'));
      saveServer(makeSpec('C'));
      expect(loadLibrary()).toHaveLength(3);
    });
  });

  // ── deleteServer ──

  describe('deleteServer', () => {
    it('deletes server at index', () => {
      saveServer(makeSpec('A'));
      saveServer(makeSpec('B'));
      const result = deleteServer(0);
      expect(result).toBe(true);
      expect(loadLibrary()).toHaveLength(1);
      expect(loadLibrary()[0].name).toBe('B');
    });

    it('returns false for invalid index', () => {
      expect(deleteServer(5)).toBe(false);
      expect(deleteServer(-1)).toBe(false);
    });

    it('handles deleting last item', () => {
      saveServer(makeSpec('Only'));
      deleteServer(0);
      expect(loadLibrary()).toEqual([]);
    });
  });

  // ── duplicateServer ──

  describe('duplicateServer', () => {
    it('duplicates server and appends (copy)', () => {
      saveServer(makeSpec('Original'));
      const newIdx = duplicateServer(0);
      expect(newIdx).toBe(1);
      const lib = loadLibrary();
      expect(lib).toHaveLength(2);
      expect(lib[1].name).toBe('Original (copy)');
    });

    it('gives duplicate a new ID', () => {
      saveServer(makeSpec('Original'));
      duplicateServer(0);
      const lib = loadLibrary();
      expect(lib[0].id).not.toBe(lib[1].id);
    });

    it('returns -1 for invalid index', () => {
      expect(duplicateServer(99)).toBe(-1);
    });

    it('deep copies (no reference sharing)', () => {
      const spec = makeSpec('Original');
      spec.workspace = { 'SOUL.md': 'original' };
      saveServer(spec);
      duplicateServer(0);
      
      // Modify original
      const lib = loadLibrary();
      lib[0].workspace['SOUL.md'] = 'modified';
      saveLibrary(lib);

      const lib2 = loadLibrary();
      expect(lib2[1].workspace['SOUL.md']).toBe('original');
    });
  });

  // ── getServer ──

  describe('getServer', () => {
    it('returns server at index', () => {
      saveServer(makeSpec('Target'));
      const srv = getServer(0);
      expect(srv).not.toBeNull();
      expect(srv!.name).toBe('Target');
    });

    it('returns null for invalid index', () => {
      expect(getServer(0)).toBeNull();
      expect(getServer(-1)).toBeNull();
      expect(getServer(999)).toBeNull();
    });
  });
});
