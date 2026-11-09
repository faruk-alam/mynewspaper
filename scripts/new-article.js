#!/usr/bin/env node
/**
 * Scaffold a new article JSON file.
 *
 *   npm run new-article -- "My headline here" world
 *   npm run new-article -- "My headline here" world --author=a-rossi
 */
import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { SRC, slugify, exists } from './lib/utils.js';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => a.replace(/^--/, '').split('=')),
);

const [headline, category = 'world'] = args;
if (!headline) {
  console.error('Usage: npm run new-article -- "Headline" <category> [--author=id]');
  process.exit(1);
}

const categories = JSON.parse(await readFile(path.join(SRC, 'data', 'categories.json'), 'utf8'));
if (!categories.some((c) => c.slug === category)) {
  console.error(`Unknown category "${category}". Available: ${categories.map((c) => c.slug).join(', ')}`);
  process.exit(1);
}

const now = new Date();
const stamp = now.toISOString().slice(0, 7); // YYYY-MM
const slug = slugify(headline);
const id = `${stamp}-${slug}`.slice(0, 80);
const file = path.join(SRC, 'data', 'articles', `${id}.json`);

if (await exists(file)) {
  console.error(`File already exists: ${path.relative(process.cwd(), file)}`);
  process.exit(1);
}

const article = {
  id,
  slug,
  headline,
  subheadline: '',
  description: '',
  category,
  author: flags.author || 'editorial-team',
  datePublished: now.toISOString().replace(/\.\d{3}Z$/, '+00:00'),
  dateModified: now.toISOString().replace(/\.\d{3}Z$/, '+00:00'),
  image: {
    src: '/assets/images/articles/REPLACE-ME.jpg',
    alt: '',
    caption: '',
    credit: '',
    width: 1200,
    height: 675,
  },
  tags: [],
  related: [],
  featured: false,
  breaking: false,
  trending: false,
  status: 'draft',
  demo: false,
  seo: { title: headline, description: '' },
  body: ['First paragraph…', { type: 'heading', text: 'Subheading' }, 'Second paragraph…'],
};

await writeFile(file, JSON.stringify(article, null, 2) + '\n', 'utf8');
console.log(`✔ Created ${path.relative(process.cwd(), file)}`);
console.log('  Fill in the fields, set "status": "published", add an image to src/images/articles/, then run: npm run build');
