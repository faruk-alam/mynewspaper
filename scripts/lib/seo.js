import { absUrl, escapeHtml, stripHtml, toRfc822 } from './utils.js';
import { renderBlocks } from './render.js';

export function organizationJsonLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: site.name,
    url: site.url,
    logo: {
      '@type': 'ImageObject',
      url: absUrl(site, site.logoPng || site.logo),
      width: 600,
      height: 60,
    },
    sameAs: Object.values(site.social || {}).filter((v) => /^https?:/.test(v)),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'newsroom',
      email: site.contactEmail,
    },
  };
}

export function websiteJsonLd(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absUrl(site, '/search.html')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(site, crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absUrl(site, c.href),
    })),
  };
}

export function newsArticleJsonLd(site, article) {
  const author = article.authorData;
  return {
    '@context': 'https://schema.org',
    '@type': article.category === 'opinion' ? 'OpinionNewsArticle' : 'NewsArticle',
    headline: article.headline,
    description: article.metaDescription,
    image: [absUrl(site, article.image.src)],
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: [
      {
        '@type': 'Person',
        name: author.name,
        url: absUrl(site, author.url),
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: absUrl(site, site.logoPng || site.logo),
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': article.canonical },
    articleSection: article.categoryData.name,
    keywords: article.tags.join(', '),
    inLanguage: site.language,
    isAccessibleForFree: true,
    wordCount: stripHtml(renderBlocks(article.body)).split(/\s+/).length,
  };
}

export function jsonLdScript(data) {
  // Escape "<" so a "</script>" inside content cannot break out of the tag.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function buildSitemap(site, entries) {
  const items = entries
    .map(
      (e) => `  <url>
    <loc>${escapeHtml(absUrl(site, e.loc))}</loc>${e.lastmod ? `\n    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''}${
        e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ''
      }${e.priority ? `\n    <priority>${e.priority}</priority>` : ''}${
        e.image
          ? `\n    <image:image>\n      <image:loc>${escapeHtml(absUrl(site, e.image.src))}</image:loc>\n      <image:caption>${escapeHtml(
              e.image.alt || '',
            )}</image:caption>\n    </image:image>`
          : ''
      }
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>
`;
}

/** Google News sitemap: only articles published in the last 48 hours are eligible. */
export function buildNewsSitemap(site, articles) {
  const cutoff = Date.now() - 48 * 3600 * 1000;
  const recent = articles.filter((a) => new Date(a.datePublished).getTime() >= cutoff);
  const items = recent
    .map(
      (a) => `  <url>
    <loc>${escapeHtml(a.canonical)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeHtml(site.name)}</news:name>
        <news:language>${site.language}</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.datePublished).toISOString()}</news:publication_date>
      <news:title>${escapeHtml(a.headline)}</news:title>
      <news:keywords>${escapeHtml(a.tags.join(', '))}</news:keywords>
    </news:news>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;
}

export function buildRss(site, articles, { title, link, description, limit = 30 } = {}) {
  const items = articles
    .slice(0, limit)
    .map(
      (a) => `    <item>
      <title>${escapeHtml(a.headline)}</title>
      <link>${escapeHtml(a.canonical)}</link>
      <guid isPermaLink="true">${escapeHtml(a.canonical)}</guid>
      <pubDate>${toRfc822(a.datePublished)}</pubDate>
      <dc:creator>${escapeHtml(a.authorData.name)}</dc:creator>
      <category>${escapeHtml(a.categoryData.name)}</category>
      <description>${escapeHtml(a.metaDescription)}</description>
      <content:encoded><![CDATA[<p><img src="${absUrl(site, a.image.src)}" alt="${escapeHtml(a.image.alt)}"></p>${renderBlocks(
        a.body,
      ).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
      <enclosure url="${escapeHtml(absUrl(site, a.image.src))}" type="image/jpeg" length="0"/>
    </item>`,
    )
    .join('\n');
  const lastBuild = articles.length ? toRfc822(articles[0].dateModified) : new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeHtml(title || site.name)}</title>
    <link>${escapeHtml(absUrl(site, link || '/'))}</link>
    <atom:link href="${escapeHtml(absUrl(site, link === '/' || !link ? '/rss.xml' : `${link}rss.xml`))}" rel="self" type="application/rss+xml"/>
    <description>${escapeHtml(description || site.description)}</description>
    <language>${site.language}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <image>
      <url>${escapeHtml(absUrl(site, site.logoPng || site.logo))}</url>
      <title>${escapeHtml(site.name)}</title>
      <link>${escapeHtml(site.url)}</link>
    </image>
${items}
  </channel>
</rss>
`;
}

export function buildRobots(site) {
  return `User-agent: *
Allow: /
Disallow: /search.html?*

Sitemap: ${absUrl(site, '/sitemap.xml')}
Sitemap: ${absUrl(site, '/news-sitemap.xml')}
`;
}
