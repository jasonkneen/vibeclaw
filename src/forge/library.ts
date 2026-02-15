/**
 * ClawForge Library — localStorage-based server config persistence
 */

import type { ServerSpec } from './server-spec.js';

const STORAGE_KEY = 'clawforge-library';

/**
 * Load all saved servers from localStorage
 */
export function loadLibrary(): ServerSpec[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Save the library to localStorage
 */
export function saveLibrary(library: ServerSpec[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

/**
 * Add or update a server in the library.
 * If a server with the same name exists, it's updated. Otherwise added.
 * Returns the index of the saved server.
 */
export function saveServer(spec: ServerSpec): number {
  const library = loadLibrary();
  const existing = library.findIndex(s => s.name === spec.name);
  if (existing >= 0) {
    spec.id = library[existing].id; // preserve original ID
    library[existing] = spec;
    saveLibrary(library);
    return existing;
  } else {
    library.push(spec);
    saveLibrary(library);
    return library.length - 1;
  }
}

/**
 * Delete a server from the library by index
 */
export function deleteServer(index: number): boolean {
  const library = loadLibrary();
  if (index < 0 || index >= library.length) return false;
  library.splice(index, 1);
  saveLibrary(library);
  return true;
}

/**
 * Duplicate a server in the library
 * Returns the index of the new copy
 */
export function duplicateServer(index: number): number {
  const library = loadLibrary();
  if (index < 0 || index >= library.length) return -1;
  const copy = JSON.parse(JSON.stringify(library[index])) as ServerSpec;
  copy.id = 'srv_' + Math.random().toString(36).slice(2, 10);
  copy.name = (copy.name || 'Server') + ' (copy)';
  library.push(copy);
  saveLibrary(library);
  return library.length - 1;
}

/**
 * Get a server by index
 */
export function getServer(index: number): ServerSpec | null {
  const library = loadLibrary();
  return library[index] ?? null;
}
