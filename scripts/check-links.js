#!/usr/bin/env node
/**
 * Checks every internal link, image, script and stylesheet in dist/ resolves to a real file,
 * and performs light HTML sanity checks (one <h1>, title, canonical, description).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { DIST } from './lib/utils.js';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function resolveTarget(href) {
  let p = href.split('#')[0].split('?')[0];
  if (!p) return null;
  if (p.endsWith('/')) p += 'index.html';
  return path.join(DIST, decodeURIComponent(p));
}

const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));
const problems = [];
const checked = new Map();

async function existsCached(file) {
  if (!checked.has(file)) {
    checked.set(
      file,
      stat(file)
        .then(() => true)
        .catch(() => false),
    );
  }
  return checked.get(file);
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(DIST, file).replace(/\\/g, '/');

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: expected 1 <h1>, found ${h1s}`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${rel}: missing <title>`);
  if (!/<link rel="canonical"/.test(html)) problems.push(`${rel}: missing canonical`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${rel}: missing meta description`);
  const imgsNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length;
  if (imgsNoAlt) problems.push(`${rel}: ${imgsNoAlt} <img> without alt`);

  // Structural well-formedness: every opening tag of these elements must be closed in order.
  const tracked = new Set(['html', 'head', 'body', 'div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'ul', 'ol', 'li', 'figure', 'figcaption', 'form', 'h1', 'h2', 'h3', 'h4', 'p', 'a', 'span', 'button', 'blockquote', 'time', 'label', 'strong', 'em']);
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let bad = null;
  let t;
  while ((t = tagRe.exec(html)) && !bad) {
    const [, closing, nameRaw, selfClose] = t;
    const name = nameRaw.toLowerCase();
    if (!tracked.has(name) || selfClose) continue;
    if (!closing) stack.push(name);
    else {
      const open = stack.pop();
      if (open !== name) bad = `expected </${open}> but found </${name}> near offset ${t.index}`;
    }
  }
  if (!bad && stack.length) bad = `unclosed <${stack[stack.length - 1]}>`;
  if (bad) problems.push(`${rel}: malformed HTML – ${bad}`);

  const attrRe = /\b(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = resolveTarget(href);
    if (!target) continue;
    if (!(await existsCached(target))) problems.push(`${rel}: broken link → ${href}`);
  }
}

// Sitemap entries must exist too.
try {
  const sm = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  for (const [, loc] of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const pathname = new URL(loc).pathname;
    const target = resolveTarget(pathname);
    if (target && !(await existsCached(target))) problems.push(`sitemap.xml: missing page → ${pathname}`);
  }
} catch {
  problems.push('sitemap.xml not found');
}

if (problems.length) {
  console.error(`✖ ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✔ Checked ${files.length} HTML pages: no broken internal links, all pages have title/canonical/description/h1.`);
