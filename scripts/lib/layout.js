import { escapeHtml, escapeAttr, absUrl } from './utils.js';
import { header, footer } from './components.js';
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from './seo.js';

/**
 * Wraps page content in the full HTML document.
 * @param {object} model   loaded site model
 * @param {object} page    { title, description, canonical (path), ogType, ogImage, bodyClass, jsonLd[], currentPath, noindex, extraHead, published, modified, section, tags, breaking, feeds[] }
 * @param {string} content page body HTML
 */
export function layout(model, page, content) {
  const { site, categories, articles } = model;
  const title = page.title ? `${page.title} | ${site.name}` : `${site.name} – ${site.tagline}`;
  const canonical = absUrl(site, page.canonical || '/');
  const ogImage = absUrl(site, page.ogImage || site.defaultImage);
  const description = page.description || site.description;
  const breaking = page.breaking === false ? [] : articles.filter((a) => a.breaking).slice(0, 5);
  const structured = [organizationJsonLd(site), websiteJsonLd(site), ...(page.jsonLd || [])];
  const feeds = page.feeds || [{ title: `${site.name} – All stories`, href: '/rss.xml' }];

  return `<!DOCTYPE html>
<html lang="${site.language}" class="scroll-smooth">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${escapeAttr(canonical)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'}
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c0c0b" media="(prefers-color-scheme: dark)">
<meta property="og:site_name" content="${escapeAttr(site.name)}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:title" content="${escapeAttr(page.ogTitle || page.title || site.name)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${escapeAttr(canonical)}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta property="og:image:width" content="${page.ogImageWidth || 1200}">
<meta property="og:image:height" content="${page.ogImageHeight || 630}">
<meta property="og:image:alt" content="${escapeAttr(page.ogImageAlt || site.name)}">
<meta property="og:locale" content="${site.locale}">
${page.published ? `<meta property="article:published_time" content="${page.published}">` : ''}
${page.modified ? `<meta property="article:modified_time" content="${page.modified}">` : ''}
${page.section ? `<meta property="article:section" content="${escapeAttr(page.section)}">` : ''}
${(page.tags || []).map((t) => `<meta property="article:tag" content="${escapeAttr(t)}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
${site.social?.twitterHandle ? `<meta name="twitter:site" content="${escapeAttr(site.social.twitterHandle)}">` : ''}
<meta name="twitter:title" content="${escapeAttr(page.ogTitle || page.title || site.name)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/images/brand/favicon.svg">
${feeds.map((f) => `<link rel="alternate" type="application/rss+xml" title="${escapeAttr(f.title)}" href="${escapeAttr(absUrl(site, f.href))}">`).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"></noscript>
<link rel="stylesheet" href="/assets/css/styles.css">
<script>try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}</script>
${structured.map(jsonLdScript).join('\n')}
${site.ads?.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeAttr(site.ads.adsenseClient)}" crossorigin="anonymous"></script>` : ''}
${page.extraHead || ''}
</head>
<body class="min-h-screen flex flex-col ${page.bodyClass || ''}">
${header(site, { currentPath: page.currentPath || page.canonical || '/', breaking })}
<main id="main" class="flex-1">
${content}
</main>
${footer(site, categories)}
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}
