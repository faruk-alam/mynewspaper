import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { readJson, SRC, byDateDesc, slugify, stripHtml, readingTime, exists, imageSize } from './utils.js';

const REQUIRED_ARTICLE_FIELDS = ['id', 'slug', 'headline', 'description', 'category', 'author', 'datePublished', 'image', 'body'];

export class ValidationError extends Error {}

/**
 * Loads and validates all site data, returning an enriched model used by templates.
 */
export async function loadSite() {
  const site = await readJson(path.join(SRC, 'data', 'site.json'));
  // Environment overrides let CI build the same source for different hosts.
  if (process.env.SITE_URL) site.url = process.env.SITE_URL;
  if (process.env.BASE_PATH !== undefined) site.basePath = process.env.BASE_PATH;
  site.url = site.url.replace(/\/+$/, '');
  site.basePath = normaliseBasePath(site.basePath);
  if (site.basePath && !site.url.endsWith(site.basePath)) {
    console.warn(`  warn: site.url (${site.url}) does not end with basePath (${site.basePath}); canonical URLs may be wrong.`);
  }
  if (site.logoPng) {
    const pngFile = path.join(SRC, 'images', site.logoPng.replace('/assets/images/', ''));
    if (!(await exists(pngFile))) {
      console.warn(`  warn: site.logoPng (${site.logoPng}) not found – falling back to ${site.logo}. Add a 600x60 PNG for Google publisher logo guidelines.`);
      site.logoPng = '';
    }
  }
  const categories = await readJson(path.join(SRC, 'data', 'categories.json'));
  const authors = await readJson(path.join(SRC, 'data', 'authors.json'));
  const articles = await loadArticles();
  const pages = await loadPages();

  const buildErrors = [];
  const categoryMap = new Map(categories.map((c) => [c.slug, { ...c, url: `/news/${c.slug}/`, articles: [] }]));
  const authorMap = new Map(authors.map((a) => [a.id, { ...a, url: `/authors/${a.slug}.html`, articles: [] }]));
  const idSet = new Set();
  const urlSet = new Set();
  const draftWarnings = [];

  for (const article of articles) {
    // Drafts are never rendered, so their problems are reported as warnings instead of failing the build.
    const isDraft = (article.status || 'published') !== 'published';
    const errors = isDraft ? draftWarnings : buildErrors;

    for (const field of REQUIRED_ARTICLE_FIELDS) {
      if (article[field] === undefined || article[field] === null || article[field] === '') {
        errors.push(`${article.__file}: missing required field "${field}"`);
      }
    }
    if (idSet.has(article.id)) errors.push(`${article.__file}: duplicate id "${article.id}"`);
    idSet.add(article.id);

    if (article.slug && article.slug !== slugify(article.slug)) {
      errors.push(`${article.__file}: slug "${article.slug}" must be lowercase letters, numbers and hyphens only`);
    }
    if (!categoryMap.has(article.category)) {
      errors.push(`${article.__file}: unknown category "${article.category}"`);
    }
    if (!authorMap.has(article.author)) {
      errors.push(`${article.__file}: unknown author "${article.author}"`);
    }
    if (article.datePublished && Number.isNaN(Date.parse(article.datePublished))) {
      errors.push(`${article.__file}: invalid datePublished "${article.datePublished}"`);
    }
    if (article.dateModified && Number.isNaN(Date.parse(article.dateModified))) {
      errors.push(`${article.__file}: invalid dateModified "${article.dateModified}"`);
    }
    if (article.image && (!article.image.src || !article.image.alt)) {
      errors.push(`${article.__file}: image requires "src" and "alt"`);
    }
    if (article.image?.src?.startsWith('/assets/images/')) {
      const file = path.join(SRC, 'images', article.image.src.replace('/assets/images/', ''));
      if (!(await exists(file))) {
        errors.push(`${article.__file}: image file not found: ${article.image.src}`);
      } else {
        // Intrinsic dimensions from the file take precedence; prevents layout shift from wrong values.
        const size = await imageSize(file);
        if (size) Object.assign(article.image, size);
      }
    }
    if (!Array.isArray(article.body) || article.body.length === 0) {
      errors.push(`${article.__file}: body must be a non-empty array`);
    }

    if (isDraft) continue;
    const url = `/news/${article.category}/${article.slug}.html`;
    if (urlSet.has(url)) errors.push(`${article.__file}: duplicate URL ${url}`);
    urlSet.add(url);
  }

  if (draftWarnings.length) {
    console.warn(`  warn: ${draftWarnings.length} issue(s) in draft article(s) (not published, build continues):\n    - ${draftWarnings.join('\n    - ')}`);
  }
  if (buildErrors.length) {
    throw new ValidationError(`Content validation failed:\n  - ${buildErrors.join('\n  - ')}`);
  }

  const published = articles
    .filter((a) => (a.status || 'published') === 'published')
    .map((a) => enrichArticle(a, site, categoryMap, authorMap))
    .sort(byDateDesc);

  const byId = new Map(published.map((a) => [a.id, a]));

  // Resolve related articles (explicit list first, then fill with same-category stories).
  for (const article of published) {
    const explicit = (article.related || [])
      .map((id) => {
        const target = byId.get(id);
        if (!target) console.warn(`  warn: ${article.__file} references unknown related article "${id}"`);
        return target;
      })
      .filter(Boolean)
      .filter((t) => t.id !== article.id);
    const fill = published.filter(
      (t) => t.id !== article.id && t.category === article.category && !explicit.includes(t),
    );
    article.relatedArticles = [...explicit, ...fill].slice(0, 4);
    categoryMap.get(article.category).articles.push(article);
    authorMap.get(article.author).articles.push(article);
  }

  const drafts = articles.length - published.length;

  return {
    site,
    categories: [...categoryMap.values()],
    authors: [...authorMap.values()],
    articles: published,
    pages,
    stats: { total: articles.length, published: published.length, drafts },
  };
}

/** "" for root hosting, or "/sub-folder" (leading slash, no trailing slash). */
export function normaliseBasePath(value = '') {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

async function loadArticles() {
  const dir = path.join(SRC, 'data', 'articles');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  const articles = [];
  for (const file of files) {
    const data = await readJson(path.join(dir, file));
    data.__file = `src/data/articles/${file}`;
    articles.push(data);
  }
  return articles;
}

async function loadPages() {
  const dir = path.join(SRC, 'content', 'pages');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  const pages = [];
  for (const file of files) {
    const data = await readJson(path.join(dir, file));
    data.url = `/${data.slug}.html`;
    pages.push(data);
  }
  return pages;
}

function enrichArticle(article, site, categoryMap, authorMap) {
  const category = categoryMap.get(article.category);
  const author = authorMap.get(article.author);
  const url = `/news/${article.category}/${article.slug}.html`;
  const dateModified = article.dateModified || article.datePublished;
  const seo = article.seo || {};
  return {
    ...article,
    url,
    canonical: seo.canonical || `${site.url.replace(/\/+$/, '')}${url}`,
    categoryData: category,
    authorData: author,
    dateModified,
    seoTitle: seo.title || article.headline,
    metaDescription: seo.description || stripHtml(article.description),
    readingMinutes: readingTime(article.body),
    tags: article.tags || [],
    image: {
      width: 1200,
      height: 675,
      ...article.image,
    },
  };
}
