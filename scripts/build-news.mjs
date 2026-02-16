#!/usr/bin/env node
/**
 * Build news articles from markdown → JSON for the news page.
 * Reads content/news/*.md, parses frontmatter, outputs public/news-data.json
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const NEWS_DIR = join(process.cwd(), 'content/news');
const OUT = join(process.cwd(), 'public/news-data.json');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };

  const lines = match[1].split('\n');
  const meta = {};
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Parse arrays
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    // Strip quotes
    if (typeof val === 'string') val = val.replace(/^["']|["']$/g, '');
    meta[key] = val;
  }
  return { meta, body: match[2].trim() };
}

// Simple markdown → HTML (covers 90% of cases)
function md2html(md) {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
    // Tables
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // separator row
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Wrap consecutive <tr> in <table>
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (match) => `<table>${match}</table>`);

  // Paragraphs — wrap remaining bare lines
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<')) return block;
    return `<p>${block}</p>`;
  }).join('\n');

  return html;
}

try {
  const files = readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'));
  const articles = files.map(file => {
    const raw = readFileSync(join(NEWS_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    return {
      slug: basename(file, '.md'),
      title: meta.title || 'Untitled',
      date: meta.date || '2026-01-01',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      author: meta.author || 'VibeClaw',
      image: meta.image || '📰',
      summary: meta.summary || '',
      html: md2html(body),
    };
  });

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  writeFileSync(OUT, JSON.stringify(articles, null, 2));
  console.log(`✓ Built ${articles.length} articles → public/news-data.json`);
} catch (err) {
  console.error('News build error:', err.message);
  // Write empty array so the page still loads
  writeFileSync(OUT, '[]');
}
