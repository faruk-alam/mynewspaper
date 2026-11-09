#!/usr/bin/env node
/**
 * Static site generator for the newspaper.
 *
 *   node scripts/build.js                 build everything into dist/
 *   node scripts/build.js --validate-only validate content without writing files
 */
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { loadSite, ValidationError } from './lib/load.js';
import { writeOut, copyDir, SRC, DIST, ROOT, exists } from './lib/utils.js';
import { homePage, articlePage, categoryPage, staticPage, searchPage, authorPage, authorsIndexPage, notFoundPage } from './lib/templates.js';
import { buildSitemap, buildNewsSitemap, buildRss, buildRobots } from './lib/seo.js';
import { copyFile, mkdir, readFile } from 'node:fs/promises';

const validateOnly = process.argv.includes('--validate-only');
const t0 = performance.now();

async function main() {
  console.log('▶ Loading content…');
  const model = await loadSite();
  const { site, articles, categories, authors, pages, stats } = model;
  console.log(`  ${stats.published} published article(s), ${stats.drafts} draft(s), ${categories.length} categories, ${authors.length} authors`);

  if (validateOnly) {
    console.log('✔ Content is valid.');
    return;
  }

  let count = 0;
  const sitemap = [];

  // --- Homepage -------------------------------------------------------
  await writeOut('index.html', homePage(model));
  sitemap.push({ loc: '/', lastmod: articles[0]?.dateModified, changefreq: 'hourly', priority: '1.0' });
  count++;

  // --- Articles -------------------------------------------------------
  console.log('▶ Generating article pages…');
  for (const article of articles) {
    await writeOut(article.url, articlePage(model, article));
    sitemap.push({ loc: article.url, lastmod: article.dateModified, changefreq: 'weekly', priority: '0.8', image: article.image });
    count++;
  }

  // --- Categories (paginated) + per-category RSS ----------------------
  console.log('▶ Generating category pages…');
  const pageSize = site.categoryPageSize || 12;
  for (const category of categories) {
    const total = Math.max(1, Math.ceil(category.articles.length / pageSize));
    for (let p = 1; p <= total; p++) {
      const slice = category.articles.slice((p - 1) * pageSize, p * pageSize);
      const rel = p === 1 ? `${category.url}index.html` : `${category.url}page/${p}/index.html`;
      await writeOut(rel, categoryPage(model, category, slice, p, total));
      count++;
    }
    sitemap.push({ loc: category.url, lastmod: category.articles[0]?.dateModified, changefreq: 'daily', priority: '0.9' });
    await writeOut(`${category.url}rss.xml`, buildRss(site, category.articles, { title: `${site.name} – ${category.title}`, link: category.url, description: category.description }));
  }

  // --- Static pages ---------------------------------------------------
  console.log('▶ Generating static pages…');
  for (const page of pages) {
    await writeOut(page.url, staticPage(model, page));
    sitemap.push({ loc: page.url, lastmod: page.lastUpdated, changefreq: 'monthly', priority: '0.3' });
    count++;
  }
  await writeOut('search.html', searchPage(model));
  await writeOut('404.html', notFoundPage(model));
  count += 2;

  // --- Authors --------------------------------------------------------
  await writeOut('authors/index.html', authorsIndexPage(model));
  sitemap.push({ loc: '/authors/', changefreq: 'monthly', priority: '0.4' });
  for (const author of authors.filter((a) => a.articles.length)) {
    await writeOut(author.url, authorPage(model, author));
    sitemap.push({ loc: author.url, lastmod: author.articles[0]?.dateModified, changefreq: 'weekly', priority: '0.5' });
    count++;
  }

  // --- Search index (client-side) -------------------------------------
  const index = articles.map((a) => ({
    t: a.headline,
    d: a.description,
    u: a.url,
    c: a.categoryData.name,
    a: a.authorData.name,
    p: a.datePublished,
    i: a.image.src,
    k: a.tags.join(' '),
  }));
  await writeOut('assets/data/search-index.json', JSON.stringify(index));

  // --- SEO files ------------------------------------------------------
  console.log('▶ Generating sitemap, RSS and robots.txt…');
  await writeOut('sitemap.xml', buildSitemap(site, sitemap));
  await writeOut('news-sitemap.xml', buildNewsSitemap(site, articles));
  await writeOut('rss.xml', buildRss(site, articles));
  await writeOut('robots.txt', buildRobots(site));

  // --- Static assets --------------------------------------------------
  console.log('▶ Copying assets…');
  await copyDir(path.join(SRC, 'images'), path.join(DIST, 'assets', 'images'));
  await mkdir(path.join(DIST, 'assets', 'js'), { recursive: true });
  await copyFile(path.join(SRC, 'js', 'main.js'), path.join(DIST, 'assets', 'js', 'main.js'));
  await copyFile(path.join(SRC, 'images', 'brand', 'favicon.svg'), path.join(DIST, 'favicon.svg'));
  const htaccess = path.join(SRC, 'static', '.htaccess');
  if (await exists(htaccess)) await copyFile(htaccess, path.join(DIST, '.htaccess'));
  for (const extra of ['ads.txt']) {
    const file = path.join(SRC, 'static', extra);
    if (await exists(file)) await copyFile(file, path.join(DIST, extra));
  }

  const ms = Math.round(performance.now() - t0);
  console.log(`✔ Built ${count} HTML pages + feeds into ${path.relative(ROOT, DIST)}/ in ${ms}ms`);
  console.log('  Run "npm run build:css" (or "npm run build") to compile Tailwind CSS.');
}

main().catch((err) => {
  if (err instanceof ValidationError) {
    console.error(`\n✖ ${err.message}\n`);
  } else {
    console.error('\n✖ Build failed:', err);
  }
  process.exit(1);
});
