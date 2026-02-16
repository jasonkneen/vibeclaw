#!/usr/bin/env node
/**
 * Upload an image to Imgur (anonymous, no account needed).
 * Usage: node scripts/upload-image.mjs /path/to/image.png
 * Outputs the Imgur URL on stdout.
 */
import { readFileSync } from 'fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node upload-image.mjs <path>'); process.exit(1); }

const img = readFileSync(file);
const b64 = img.toString('base64');

const resp = await fetch('https://api.imgur.com/3/image', {
  method: 'POST',
  headers: {
    Authorization: 'Client-ID 546c25a59c58ad7', // Anonymous uploads, public client ID
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ image: b64, type: 'base64' }),
});

const data = await resp.json();
if (data.success) {
  console.log(data.data.link);
} else {
  console.error('Upload failed:', data.data?.error || 'unknown error');
  process.exit(1);
}
