#!/usr/bin/env node
/**
 * Build flavour manifests index for the browser.
 * Outputs dist/flavours.json with all flavour metadata.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const FLAVOURS_DIR = 'vfs-flavours';
const OUTPUT = 'public/flavours.json';

const flavours = [];

for (const dir of readdirSync(FLAVOURS_DIR)) {
  const manifestPath = join(FLAVOURS_DIR, dir, 'manifest.json');
  if (!existsSync(manifestPath)) continue;
  
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    flavours.push(manifest);
    console.log(`  ✓ ${manifest.emoji} ${manifest.name} (${manifest.id}) — ${manifest.agents.length} agents, ${manifest.skills.length} skills`);
  } catch (e) {
    console.error(`  ✗ ${dir}: ${e.message}`);
  }
}

writeFileSync(OUTPUT, JSON.stringify(flavours, null, 2));
console.log(`\n${flavours.length} flavours → ${OUTPUT}`);
