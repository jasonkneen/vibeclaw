#!/usr/bin/env node
/**
 * Upload an image to ImgBB.
 * Requires an API key. Set it as the IMGBB_API_KEY environment variable.
 * Get a key from https://api.imgbb.com/
 *
 * Usage: node scripts/upload-image.mjs /path/to/image.png
 * Outputs the ImgBB URL on stdout.
 */
import { exec } from 'child_process';
import { statSync } from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node upload-image.mjs <path>');
  process.exit(1);
}

try {
  statSync(file);
} catch (e) {
  console.error(`Error: File not found at ${file}`);
  process.exit(1);
}

const apiKey = process.env.IMGBB_API_KEY;
if (!apiKey) {
  console.error('Error: IMGBB_API_KEY environment variable is not set.');
  console.error('Get a key from https://api.imgbb.com/ and set it.');
  process.exit(1);
}

const command = `curl --silent --location --request POST "https://api.imgbb.com/1/upload?key=${apiKey}" --form "image=@${file}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  try {
    const data = JSON.parse(stdout);
    if (data.success) {
      console.log(data.data.url);
    } else {
      console.error('Upload failed:', data.error?.message || 'Unknown API error');
      process.exit(1);
    }
  } catch (e) {
    console.error('Failed to parse API response:', stdout);
    process.exit(1);
  }
});
