import { escapeHtml, escapeAttr, formatDateTime, formatDate } from './utils.js';
import { renderBlocks } from './render.js';
import { layout } from './layout.js';
import {
  heroCard,
  card,
  compactCard,
  listRow,
  numberedList,
  sectionBlock,
  adSlot,
  newsletterBox,
  shareButtons,
  breadcrumbs,
  pagination,
  authorCard,
} from './components.js';
import { breadcrumbJsonLd, newsArticleJsonLd } from './seo.js';

/* ------------------------------------------------------------------ */
/* Homepage                                                             */
/* ------------------------------------------------------------------ */
export function homePage(model) {
  const { site, articles, categories } = model;
  const cfg = site.homepage;
  const featured = articles.filter((a) => a.featured);
  const hero = featured[0] || articles[0];
  const heroSide = featured.filter((a) => a !== hero).slice(0, 4);
  const usedIds = new Set([hero, ...heroSide].map((a) => a.id));
  const latest = articles.filter((a) => !usedIds.has(a.id)).slice(0, cfg.latestCount);
  const trending = articles.filter((a) => a.trending).slice(0, cfg.trendingCount);
  const opinion = categories.find((c) => c.slug === 'opinion');

  const content = `
<div class="container-site">
  ${adSlot(site, { size: 'leaderboard', id: 'home-top' })}

  <section aria-label="Top stories" class="grid gap-8 lg:grid-cols-3">
    <div class="lg:col-span-2">${heroCard(hero, { headingLevel: 1 })}</div>
    <div class="flex flex-col divide-y divide-ink-200 dark:divide-ink-800 lg:border-l lg:border-ink-200 lg:pl-8 lg:dark:border-ink-800">
      ${heroSide.map((a) => `<div class="py-4 first:pt-0">${compactCard(a, { headingLevel: 2 })}</div>`).join('')}
    </div>
  </section>

  <div class="mt-14 grid gap-12 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <section aria-labelledby="latest-heading">
        <h2 id="latest-heading" class="section-title">Latest News</h2>
        <div class="mt-6 grid gap-8 sm:grid-cols-2">
          ${latest.map((a) => card(a, { sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' })).join('')}
        </div>
      </section>
    </div>
    <aside class="space-y-10">
      <section aria-labelledby="trending-heading">
        <h2 id="trending-heading" class="section-title">Trending</h2>
        <div class="mt-4">${numberedList(trending)}</div>
      </section>
      ${adSlot(site, { size: 'rectangle', id: 'home-sidebar' })}
      ${newsletterBox()}
    </aside>
  </div>

  ${categories
    .filter((c) => c.slug !== 'opinion')
    .map((c) => sectionBlock(c, c.articles, { count: cfg.sectionCount }))
    .join('')}

  ${adSlot(site, { size: 'leaderboard', id: 'home-mid' })}

  ${
    opinion && opinion.articles.length
      ? `<section class="mt-14 rounded-xl bg-ink-50 p-6 dark:bg-ink-900 md:p-10" aria-labelledby="section-opinion">
    <h2 id="section-opinion" class="section-title"><a href="${opinion.url}" class="hover:text-brand-600">${escapeHtml(opinion.title)}</a></h2>
    <div class="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      ${opinion.articles
        .slice(0, 3)
        .map(
          (a) => `<article class="border-l-4 border-brand-500 pl-4">
        <p class="text-xs font-bold uppercase tracking-widest text-ink-400">${escapeHtml(a.authorData.name)}</p>
        <h3 class="mt-1 font-serif text-xl font-bold leading-snug"><a href="${a.url}" class="headline-link">${escapeHtml(a.headline)}</a></h3>
        <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">${escapeHtml(a.description)}</p>
      </article>`,
        )
        .join('')}
    </div>
  </section>`
      : ''
  }
</div>`;

  return layout(
    model,
    {
      title: '',
      ogTitle: `${site.name} – ${site.tagline}`,
      description: site.description,
      canonical: '/',
      currentPath: '/',
      ogImage: hero.image.src,
      ogImageWidth: hero.image.width,
      ogImageHeight: hero.image.height,
      ogImageAlt: hero.image.alt,
    },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* Article                                                              */
/* ------------------------------------------------------------------ */
export function articlePage(model, article) {
  const { site } = model;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: article.categoryData.name, href: article.categoryData.url },
    { label: article.headline, href: article.url },
  ];
  const body = renderBlocks(article.body);
  // Insert an in-article ad after the 3rd paragraph when the article is long enough.
  const paragraphs = body.split('\n');
  const adIndex = paragraphs.length > 6 ? 3 : -1;
  const bodyWithAd =
    adIndex > 0
      ? [...paragraphs.slice(0, adIndex), `<div class="not-prose">${adSlot(site, { size: 'in-article', id: 'article-inline' })}</div>`, ...paragraphs.slice(adIndex)].join('\n')
      : body;
  const updated = article.dateModified !== article.datePublished;
  const moreFromCategory = article.categoryData.articles.filter((a) => a.id !== article.id && !article.relatedArticles.includes(a)).slice(0, 3);

  const content = `
<article class="container-site" itemscope itemtype="https://schema.org/${article.category === 'opinion' ? 'OpinionNewsArticle' : 'NewsArticle'}">
  ${adSlot(site, { size: 'leaderboard', id: 'article-top' })}
  <div class="mx-auto max-w-5xl">
    ${breadcrumbs(crumbs)}
    <header class="mt-4">
      <a href="${article.categoryData.url}" class="kicker">${escapeHtml(article.categoryData.name)}</a>
      <h1 class="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight md:text-5xl" itemprop="headline">${escapeHtml(article.headline)}</h1>
      ${article.subheadline ? `<p class="mt-4 text-lg text-ink-600 dark:text-ink-300 md:text-xl" itemprop="description">${escapeHtml(article.subheadline)}</p>` : ''}
      <div class="mt-6 flex flex-col gap-4 border-y border-ink-200 py-4 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <img src="${escapeAttr(article.authorData.image)}" alt="" width="44" height="44" class="h-11 w-11 rounded-full bg-ink-100">
          <div class="text-sm">
            <p class="font-semibold" itemprop="author" itemscope itemtype="https://schema.org/Person"><a href="${article.authorData.url}" class="hover:underline" itemprop="url"><span itemprop="name">${escapeHtml(article.authorData.name)}</span></a></p>
            <p class="text-ink-500 dark:text-ink-400">
              <time datetime="${article.datePublished}" itemprop="datePublished">${formatDateTime(article.datePublished)}</time>
              ${updated ? `<span class="mx-1" aria-hidden="true">·</span> Updated <time datetime="${article.dateModified}" itemprop="dateModified">${formatDateTime(article.dateModified)}</time>` : `<meta itemprop="dateModified" content="${article.dateModified}">`}
              <span class="mx-1" aria-hidden="true">·</span> ${article.readingMinutes} min read
            </p>
          </div>
        </div>
        ${shareButtons(site, article)}
      </div>
    </header>

    <figure class="mt-8">
      <img src="${escapeAttr(article.image.src)}" alt="${escapeAttr(article.image.alt)}" width="${article.image.width}" height="${article.image.height}" class="aspect-[16/9] w-full rounded-lg object-cover bg-ink-100 dark:bg-ink-800" fetchpriority="high" itemprop="image">
      ${article.image.caption || article.image.credit ? `<figcaption class="mt-2 text-xs text-ink-500 dark:text-ink-400">${escapeHtml(article.image.caption || '')} ${article.image.credit ? `<span class="text-ink-400">${escapeHtml(article.image.credit)}</span>` : ''}</figcaption>` : ''}
    </figure>

    <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        ${article.demo && site.demoMode ? `<p class="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"><strong>Demonstration content:</strong> ${escapeHtml(site.demoNotice)}</p>` : ''}
        <div class="prose prose-lg dark:prose-invert" itemprop="articleBody">
${bodyWithAd}
        </div>
        ${
          article.tags.length
            ? `<div class="mt-10 flex flex-wrap gap-2" aria-label="Topics">${article.tags
                .map((t) => `<a href="/search.html?q=${encodeURIComponent(t)}" class="rounded-full border border-ink-300 px-3 py-1 text-xs font-medium hover:border-brand-500 hover:text-brand-600 dark:border-ink-700">${escapeHtml(t)}</a>`)
                .join('')}</div>`
            : ''
        }
        <div class="mt-8 flex items-center justify-between border-t border-ink-200 pt-6 dark:border-ink-800">
          ${shareButtons(site, article)}
        </div>
        <div class="mt-8">${authorCard(article.authorData)}</div>
      </div>
      <aside class="space-y-8">
        ${adSlot(site, { size: 'rectangle', id: 'article-sidebar' })}
        <section aria-labelledby="more-heading">
          <h2 id="more-heading" class="section-title text-base">More in ${escapeHtml(article.categoryData.name)}</h2>
          <div class="mt-4 flex flex-col gap-5">${moreFromCategory.map((a) => compactCard(a)).join('') || '<p class="text-sm text-ink-500">No other stories yet.</p>'}</div>
        </section>
        ${newsletterBox()}
      </aside>
    </div>
  </div>

  ${
    article.relatedArticles.length
      ? `<section class="mx-auto mt-16 max-w-5xl" aria-labelledby="related-heading">
    <h2 id="related-heading" class="section-title">Related Stories</h2>
    <div class="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">${article.relatedArticles.map((a) => card(a, { excerpt: false, sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw' })).join('')}</div>
  </section>`
      : ''
  }
  ${adSlot(site, { size: 'leaderboard', id: 'article-bottom' })}
</article>`;

  return layout(
    model,
    {
      title: article.seoTitle,
      ogTitle: article.headline,
      description: article.metaDescription,
      canonical: article.url,
      currentPath: article.categoryData.url,
      ogType: 'article',
      ogImage: article.image.src,
      ogImageWidth: article.image.width,
      ogImageHeight: article.image.height,
      ogImageAlt: article.image.alt,
      published: article.datePublished,
      modified: article.dateModified,
      section: article.categoryData.name,
      tags: article.tags,
      jsonLd: [newsArticleJsonLd(site, article), breadcrumbJsonLd(site, crumbs)],
      feeds: [
        { title: `${site.name} – All stories`, href: '/rss.xml' },
        { title: `${site.name} – ${article.categoryData.name}`, href: `${article.categoryData.url}rss.xml` },
      ],
    },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* Category (paginated)                                                 */
/* ------------------------------------------------------------------ */
export function categoryPage(model, category, pageArticles, pageNum, totalPages) {
  const { site } = model;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: category.name, href: category.url },
  ];
  const path = pageNum === 1 ? category.url : `${category.url}page/${pageNum}/`;
  const trending = model.articles.filter((a) => a.trending && a.category !== category.slug).slice(0, 5);
  const [lead, ...rest] = pageArticles;

  const content = `
<div class="container-site">
  ${adSlot(site, { size: 'leaderboard', id: 'category-top' })}
  ${breadcrumbs(crumbs)}
  <header class="mt-4 border-b-4 border-ink-900 pb-4 dark:border-ink-200">
    <h1 class="font-serif text-4xl font-bold tracking-tight md:text-5xl">${escapeHtml(category.title)}${pageNum > 1 ? ` <span class="text-ink-400">– Page ${pageNum}</span>` : ''}</h1>
    <p class="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">${escapeHtml(category.description)}</p>
  </header>
  <div class="mt-8 grid gap-12 lg:grid-cols-3">
    <div class="lg:col-span-2">
      ${pageNum === 1 && lead ? `<div class="border-b border-ink-200 pb-8 dark:border-ink-800">${heroCard(lead)}</div>` : ''}
      ${(pageNum === 1 ? rest : pageArticles).map((a) => listRow(a)).join('')}
      ${pagination(pageNum, totalPages, category.url)}
    </div>
    <aside class="space-y-10">
      ${adSlot(site, { size: 'rectangle', id: 'category-sidebar' })}
      <section aria-labelledby="cat-trending">
        <h2 id="cat-trending" class="section-title">Trending</h2>
        <div class="mt-4">${numberedList(trending)}</div>
      </section>
      ${newsletterBox()}
    </aside>
  </div>
</div>`;

  const prevNext =
    (pageNum > 1 ? `<link rel="prev" href="${escapeAttr(pageNum === 2 ? category.url : `${category.url}page/${pageNum - 1}/`)}">` : '') +
    (pageNum < totalPages ? `<link rel="next" href="${escapeAttr(`${category.url}page/${pageNum + 1}/`)}">` : '');

  return layout(
    model,
    {
      title: pageNum > 1 ? `${category.title} – Page ${pageNum}` : category.title,
      description: category.description,
      canonical: path,
      currentPath: category.url,
      ogImage: lead?.image.src,
      ogImageWidth: lead?.image.width,
      ogImageHeight: lead?.image.height,
      jsonLd: [breadcrumbJsonLd(site, crumbs)],
      extraHead: prevNext,
      feeds: [
        { title: `${site.name} – All stories`, href: '/rss.xml' },
        { title: `${site.name} – ${category.name}`, href: `${category.url}rss.xml` },
      ],
    },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* Static pages (About, Contact, policies)                              */
/* ------------------------------------------------------------------ */
export function staticPage(model, page) {
  const { site } = model;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: page.title, href: page.url },
  ];
  const content = `
<div class="container-site">
  <div class="mx-auto max-w-3xl">
    ${breadcrumbs(crumbs)}
    <header class="mt-4 border-b border-ink-200 pb-6 dark:border-ink-800">
      <h1 class="font-serif text-4xl font-bold tracking-tight">${escapeHtml(page.title)}</h1>
      ${page.lastUpdated ? `<p class="mt-2 text-sm text-ink-500">Last updated <time datetime="${page.lastUpdated}">${formatDate(page.lastUpdated)}</time></p>` : ''}
    </header>
    <div class="prose mt-8 dark:prose-invert">
${renderBlocks(page.body)}
    </div>
  </div>
</div>`;
  return layout(
    model,
    {
      title: page.seoTitle || page.title,
      description: page.description,
      canonical: page.url,
      currentPath: page.url,
      jsonLd: [breadcrumbJsonLd(site, crumbs)],
    },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                               */
/* ------------------------------------------------------------------ */
export function searchPage(model) {
  const { site, articles } = model;
  const content = `
<div class="container-site">
  <div class="mx-auto max-w-3xl">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Search', href: '/search.html' }])}
    <h1 class="mt-4 font-serif text-4xl font-bold tracking-tight">Search</h1>
    <form action="/search.html" method="get" role="search" class="mt-6" data-search-form>
      <label for="search-input" class="sr-only">Search articles</label>
      <div class="flex">
        <input id="search-input" type="search" name="q" placeholder="Search headlines, topics, authors…" class="w-full rounded-l-md border border-ink-300 bg-white px-4 py-3 text-base dark:border-ink-700 dark:bg-ink-900" autocomplete="off" autofocus>
        <button type="submit" class="rounded-r-md bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">Search</button>
      </div>
    </form>
    <p class="mt-4 text-sm text-ink-500" data-search-status aria-live="polite">Enter a term to search ${articles.length} articles.</p>
    <div class="mt-6" data-search-results></div>
    <noscript><p class="mt-6 rounded bg-amber-50 p-4 text-sm text-amber-900">Search requires JavaScript. Browse by section instead: ${model.categories.map((c) => `<a href="${c.url}" class="underline">${escapeHtml(c.name)}</a>`).join(', ')}.</p></noscript>
  </div>
</div>`;
  return layout(
    model,
    {
      title: 'Search',
      description: `Search ${site.name} articles by headline, topic or author.`,
      canonical: '/search.html',
      currentPath: '/search.html',
      noindex: true,
      breaking: false,
    },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* Authors                                                              */
/* ------------------------------------------------------------------ */
export function authorPage(model, author) {
  const { site } = model;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Our Journalists', href: '/authors/' },
    { label: author.name, href: author.url },
  ];
  const content = `
<div class="container-site">
  <div class="mx-auto max-w-4xl">
    ${breadcrumbs(crumbs)}
    <header class="mt-4 flex items-start gap-6 border-b border-ink-200 pb-8 dark:border-ink-800">
      <img src="${escapeAttr(author.image)}" alt="" width="96" height="96" class="h-24 w-24 rounded-full bg-ink-100">
      <div>
        <h1 class="font-serif text-3xl font-bold tracking-tight md:text-4xl">${escapeHtml(author.name)}</h1>
        <p class="mt-1 text-ink-500 dark:text-ink-400">${escapeHtml(author.role)}</p>
        <p class="mt-3 max-w-2xl text-ink-700 dark:text-ink-300">${escapeHtml(author.bio)}</p>
        ${author.email ? `<p class="mt-2 text-sm"><a href="mailto:${escapeAttr(author.email)}" class="text-brand-600 hover:underline">${escapeHtml(author.email)}</a></p>` : ''}
      </div>
    </header>
    <h2 class="mt-8 section-title">Latest by ${escapeHtml(author.name)}</h2>
    ${author.articles.map((a) => listRow(a)).join('') || '<p class="mt-6 text-ink-500">No articles yet.</p>'}
  </div>
</div>`;
  return layout(
    model,
    {
      title: `${author.name} – ${author.role}`,
      description: author.bio,
      canonical: author.url,
      currentPath: '/authors/',
      jsonLd: [
        breadcrumbJsonLd(site, crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: { '@type': 'Person', name: author.name, jobTitle: author.role, description: author.bio, url: `${site.url}${author.url}` },
        },
      ],
    },
    content,
  );
}

export function authorsIndexPage(model) {
  const { authors, site } = model;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Our Journalists', href: '/authors/' },
  ];
  const content = `
<div class="container-site">
  <div class="mx-auto max-w-4xl">
    ${breadcrumbs(crumbs)}
    <h1 class="mt-4 font-serif text-4xl font-bold tracking-tight">Our Journalists</h1>
    <div class="mt-8 grid gap-6 sm:grid-cols-2">
      ${authors
        .filter((a) => a.articles.length)
        .map(
          (a) => `<div class="flex gap-4 rounded-lg border border-ink-200 p-5 dark:border-ink-800">
        <img src="${escapeAttr(a.image)}" alt="" width="64" height="64" class="h-16 w-16 rounded-full bg-ink-100" loading="lazy">
        <div>
          <h2 class="text-lg font-bold"><a href="${a.url}" class="headline-link">${escapeHtml(a.name)}</a></h2>
          <p class="text-sm text-ink-500">${escapeHtml(a.role)}</p>
          <p class="mt-1 text-xs text-ink-400">${a.articles.length} article${a.articles.length === 1 ? '' : 's'}</p>
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</div>`;
  return layout(
    model,
    { title: 'Our Journalists', description: `Meet the writers and editors of ${site.name}.`, canonical: '/authors/', currentPath: '/authors/', jsonLd: [breadcrumbJsonLd(site, crumbs)] },
    content,
  );
}

/* ------------------------------------------------------------------ */
/* 404                                                                  */
/* ------------------------------------------------------------------ */
export function notFoundPage(model) {
  const latest = model.articles.slice(0, 4);
  const content = `
<div class="container-site">
  <div class="mx-auto max-w-3xl py-12 text-center">
    <p class="kicker">Error 404</p>
    <h1 class="mt-2 font-serif text-4xl font-bold tracking-tight">Page not found</h1>
    <p class="mt-4 text-ink-600 dark:text-ink-300">The page you requested does not exist or has moved. Try searching, or browse the latest stories below.</p>
    <form action="/search.html" method="get" role="search" class="mx-auto mt-6 flex max-w-md">
      <label for="nf-search" class="sr-only">Search</label>
      <input id="nf-search" type="search" name="q" placeholder="Search…" class="w-full rounded-l-md border border-ink-300 px-4 py-2 dark:border-ink-700 dark:bg-ink-900">
      <button type="submit" class="rounded-r-md bg-brand-600 px-4 font-semibold text-white">Search</button>
    </form>
  </div>
  <h2 class="section-title">Latest News</h2>
  <div class="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">${latest.map((a) => card(a, { excerpt: false })).join('')}</div>
</div>`;
  return layout(model, { title: 'Page not found', description: 'The page you requested could not be found.', canonical: '/404.html', noindex: true, breaking: false }, content);
}
