import { escapeHtml, escapeAttr, formatDate, absUrl } from './utils.js';

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no icon library)                                 */
/* ------------------------------------------------------------------ */
export const icons = {
  menu: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>',
  sun: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  rss: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.18 15.64a2.18 2.18 0 110 4.36 2.18 2.18 0 010-4.36zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44zm0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  facebook: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/></svg>',
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.78h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.3-1.65a11.88 11.88 0 005.74 1.46h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41"/></svg>',
  mail: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>',
  instagram: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1012 18.16 6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>',
  youtube: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
};

/* ------------------------------------------------------------------ */
/* Header / Footer                                                      */
/* ------------------------------------------------------------------ */
export function header(site, { currentPath = '/', breaking = [] } = {}) {
  const navLinks = site.nav
    .map((item) => {
      const isCurrent = item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href);
      return `<li><a href="${item.href}" class="nav-link"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`;
    })
    .join('');

  const mobileLinks = site.nav
    .map(
      (item) =>
        `<li><a href="${item.href}" class="block border-b border-ink-100 px-4 py-3 text-base font-semibold dark:border-ink-800">${escapeHtml(
          item.label,
        )}</a></li>`,
    )
    .join('');

  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return `<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white">Skip to main content</a>
<header class="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
  <div class="border-b border-ink-100 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
    <div class="container-site flex h-8 items-center justify-between">
      <time datetime="${new Date().toISOString().slice(0, 10)}" class="hidden sm:block">${today}</time>
      <div class="flex items-center gap-4 ml-auto">
        <a href="/rss.xml" class="hover:text-brand-600">RSS</a>
        <a href="/contact.html" class="hover:text-brand-600">Contact</a>
      </div>
    </div>
  </div>
  <div class="container-site flex items-center justify-between gap-4 py-4 md:py-5">
    <button type="button" class="btn-ghost md:hidden" data-menu-open aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">${icons.menu}</button>
    <a href="/" class="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="${escapeAttr(site.name)} home">
      <span class="block h-7 w-1 shrink-0 bg-brand-600 sm:h-8 sm:w-1.5 md:h-10" aria-hidden="true"></span>
      <span class="truncate font-serif text-xl font-bold tracking-tight sm:text-2xl md:text-4xl">${escapeHtml(site.name)}</span>
    </a>
    <div class="flex items-center gap-1">
      <a href="/search.html" class="btn-ghost" aria-label="Search">${icons.search}</a>
      <button type="button" class="btn-ghost" data-theme-toggle aria-label="Toggle dark mode"><span class="dark:hidden">${icons.moon}</span><span class="hidden dark:inline">${icons.sun}</span></button>
    </div>
  </div>
  <nav class="hidden border-t border-ink-200 md:block dark:border-ink-800" aria-label="Main">
    <div class="container-site">
      <ul class="no-scrollbar flex items-center justify-center overflow-x-auto">${navLinks}</ul>
    </div>
  </nav>
  <div id="mobile-menu" class="fixed inset-0 z-50 hidden md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="absolute inset-0 bg-black/50" data-menu-close></div>
    <div class="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-ink-950">
      <div class="flex items-center justify-between border-b border-ink-200 px-4 py-3 dark:border-ink-800">
        <span class="font-serif text-xl font-bold">${escapeHtml(site.shortName || site.name)}</span>
        <button type="button" class="btn-ghost" data-menu-close aria-label="Close menu">${icons.close}</button>
      </div>
      <form action="/search.html" method="get" role="search" class="border-b border-ink-200 p-4 dark:border-ink-800">
        <label for="mobile-search" class="sr-only">Search</label>
        <div class="flex">
          <input id="mobile-search" type="search" name="q" placeholder="Search news…" class="w-full rounded-l-md border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900" required>
          <button type="submit" class="rounded-r-md bg-brand-600 px-3 text-white" aria-label="Submit search">${icons.search}</button>
        </div>
      </form>
      <ul class="flex-1 overflow-y-auto">${mobileLinks}</ul>
      <div class="border-t border-ink-200 p-4 text-sm dark:border-ink-800">
        <a href="/about.html" class="block py-1">About Us</a>
        <a href="/contact.html" class="block py-1">Contact</a>
        <a href="/privacy-policy.html" class="block py-1">Privacy Policy</a>
      </div>
    </div>
  </div>
</header>
${breaking.length ? breakingTicker(breaking) : ''}`;
}

export function breakingTicker(articles) {
  const items = articles
    .map(
      (a) =>
        `<a href="${a.url}" class="whitespace-nowrap text-sm font-medium hover:underline">${escapeHtml(a.headline)}</a>`,
    )
    .join('<span aria-hidden="true" class="text-brand-200">•</span>');
  return `<div class="ticker bg-ink-900 text-white dark:bg-ink-900" role="region" aria-label="Breaking news">
  <div class="container-site flex items-stretch gap-0 overflow-hidden">
    <span class="flex shrink-0 items-center bg-brand-600 px-3 py-2 text-xs font-extrabold uppercase tracking-widest">Breaking</span>
    <div class="flex flex-1 items-center overflow-hidden py-2 pl-4">
      <div class="ticker-track">${items}<span aria-hidden="true" class="text-brand-200">•</span>${items}</div>
    </div>
  </div>
</div>`;
}

export function footer(site, categories) {
  const cols = Object.entries(site.footerNav)
    .map(
      ([heading, links]) => `<div>
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">${escapeHtml(heading)}</h2>
        <ul class="space-y-2 text-sm">${links
          .map((l) => `<li><a href="${l.href}" class="hover:text-brand-600 dark:hover:text-red-300">${escapeHtml(l.label)}</a></li>`)
          .join('')}</ul>
      </div>`,
    )
    .join('');
  const sections = `<div>
        <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">Sections</h2>
        <ul class="space-y-2 text-sm">${categories
          .map((c) => `<li><a href="${c.url}" class="hover:text-brand-600 dark:hover:text-red-300">${escapeHtml(c.name)}</a></li>`)
          .join('')}</ul>
      </div>`;
  const socials = [
    ['twitter', icons.x, 'X (Twitter)'],
    ['facebook', icons.facebook, 'Facebook'],
    ['instagram', icons.instagram, 'Instagram'],
    ['linkedin', icons.linkedin, 'LinkedIn'],
    ['youtube', icons.youtube, 'YouTube'],
  ]
    .filter(([key]) => site.social?.[key])
    .map(
      ([key, icon, label]) =>
        `<a href="${escapeAttr(site.social[key])}" target="_blank" rel="noopener noreferrer" class="btn-ghost" aria-label="${label}">${icon}</a>`,
    )
    .join('');

  return `<footer class="mt-16 border-t border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
  <div class="container-site py-12">
    <div class="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <div>
        <a href="/" class="flex items-center gap-3"><span class="block h-8 w-1.5 bg-brand-600" aria-hidden="true"></span><span class="font-serif text-2xl font-bold">${escapeHtml(site.name)}</span></a>
        <p class="mt-4 max-w-sm text-sm text-ink-500 dark:text-ink-400">${escapeHtml(site.description)}</p>
        <div class="mt-4 flex gap-1">${socials}<a href="/rss.xml" class="btn-ghost" aria-label="RSS feed">${icons.rss}</a></div>
      </div>
      ${sections}
      ${cols}
    </div>
    <div class="mt-10 flex flex-col gap-2 border-t border-ink-200 pt-6 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400 md:flex-row md:items-center md:justify-between">
      <p>© ${new Date().getFullYear()} ${escapeHtml(site.copyrightHolder || site.name)}. All rights reserved.</p>
      ${site.demoMode ? '<p>Demonstration website. All articles are fictional sample content.</p>' : ''}
    </div>
  </div>
</footer>`;
}

/* ------------------------------------------------------------------ */
/* Cards & lists                                                        */
/* ------------------------------------------------------------------ */
export function img(article, { sizes = '(min-width: 1024px) 33vw, 100vw', eager = false, className = 'card-img' } = {}) {
  return `<img src="${escapeAttr(article.image.src)}" alt="${escapeAttr(article.image.alt)}" width="${article.image.width}" height="${
    article.image.height
  }" sizes="${sizes}" class="${className}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

export function categoryBadge(article) {
  return `<a href="${article.categoryData.url}" class="kicker hover:underline">${escapeHtml(article.categoryData.name)}</a>`;
}

export function meta(article, { showAuthor = true } = {}) {
  return `<p class="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-ink-500 dark:text-ink-400">${
    showAuthor ? `<a href="${article.authorData.url}" class="font-medium hover:underline">${escapeHtml(article.authorData.name)}</a><span aria-hidden="true">·</span>` : ''
  }<time datetime="${article.datePublished}">${formatDate(article.datePublished)}</time></p>`;
}

export function heroCard(article, { headingLevel = 2 } = {}) {
  const H = `h${headingLevel}`;
  return `<article class="group relative">
  <a href="${article.url}" class="block overflow-hidden rounded-lg" tabindex="-1" aria-hidden="true">${img(article, {
    sizes: '(min-width: 1024px) 66vw, 100vw',
    eager: true,
    className: 'card-img transition-transform duration-300 group-hover:scale-[1.02]',
  })}</a>
  <div class="mt-4">
    ${categoryBadge(article)}
    <${H} class="mt-2 font-serif text-3xl font-bold leading-tight md:text-4xl"><a href="${article.url}" class="headline-link">${escapeHtml(
      article.headline,
    )}</a></${H}>
    <p class="mt-3 text-base text-ink-600 dark:text-ink-300 md:text-lg">${escapeHtml(article.subheadline || article.description)}</p>
    ${meta(article)}
  </div>
</article>`;
}

export function card(article, { headingLevel = 3, excerpt = true, sizes } = {}) {
  const H = `h${headingLevel}`;
  return `<article class="group flex flex-col">
  <a href="${article.url}" class="block overflow-hidden rounded-md" tabindex="-1" aria-hidden="true">${img(article, {
    sizes,
    className: 'card-img transition-transform duration-300 group-hover:scale-[1.03]',
  })}</a>
  <div class="mt-3 flex flex-1 flex-col">
    ${categoryBadge(article)}
    <${H} class="mt-1 text-lg font-bold leading-snug"><a href="${article.url}" class="headline-link">${escapeHtml(article.headline)}</a></${H}>
    ${excerpt ? `<p class="mt-2 line-clamp-3 text-sm text-ink-600 dark:text-ink-300">${escapeHtml(article.description)}</p>` : ''}
    ${meta(article, { showAuthor: false })}
  </div>
</article>`;
}

export function compactCard(article, { headingLevel = 3 } = {}) {
  const H = `h${headingLevel}`;
  return `<article class="group flex gap-4">
  <a href="${article.url}" class="block w-28 shrink-0 overflow-hidden rounded sm:w-36" tabindex="-1" aria-hidden="true">${img(article, {
    sizes: '144px',
  })}</a>
  <div class="min-w-0">
    ${categoryBadge(article)}
    <${H} class="mt-1 text-base font-bold leading-snug"><a href="${article.url}" class="headline-link block line-clamp-3">${escapeHtml(
      article.headline,
    )}</a></${H}>
    ${meta(article, { showAuthor: false })}
  </div>
</article>`;
}

export function listRow(article, { headingLevel = 2 } = {}) {
  const H = `h${headingLevel}`;
  return `<article class="group grid gap-4 border-b border-ink-200 py-6 dark:border-ink-800 sm:grid-cols-[240px_1fr]">
  <a href="${article.url}" class="block overflow-hidden rounded-md" tabindex="-1" aria-hidden="true">${img(article, { sizes: '(min-width: 640px) 240px, 100vw' })}</a>
  <div>
    ${categoryBadge(article)}
    <${H} class="mt-1 font-serif text-xl font-bold leading-snug md:text-2xl"><a href="${article.url}" class="headline-link">${escapeHtml(
      article.headline,
    )}</a></${H}>
    <p class="mt-2 text-sm text-ink-600 dark:text-ink-300 md:text-base">${escapeHtml(article.description)}</p>
    ${meta(article)}
  </div>
</article>`;
}

export function numberedList(articles, { headingLevel = 3 } = {}) {
  const H = `h${headingLevel}`;
  return `<ol class="divide-y divide-ink-200 dark:divide-ink-800">${articles
    .map(
      (a, i) => `<li class="flex gap-4 py-3">
    <span class="font-serif text-3xl font-bold leading-none text-brand-600/70 dark:text-red-300/70" aria-hidden="true">${i + 1}</span>
    <div class="min-w-0">
      ${categoryBadge(a)}
      <${H} class="mt-0.5 text-base font-bold leading-snug"><a href="${a.url}" class="headline-link">${escapeHtml(a.headline)}</a></${H}>
    </div>
  </li>`,
    )
    .join('')}</ol>`;
}

export function sectionBlock(category, articles, { count = 4 } = {}) {
  const items = articles.slice(0, count);
  if (!items.length) return '';
  const [lead, ...rest] = items;
  return `<section class="mt-14" aria-labelledby="section-${category.slug}">
  <h2 id="section-${category.slug}" class="section-title"><a href="${category.url}" class="hover:text-brand-600">${escapeHtml(category.title)}</a></h2>
  <div class="mt-6 grid gap-8 lg:grid-cols-2">
    ${card(lead, { sizes: '(min-width: 1024px) 50vw, 100vw' })}
    <div class="flex flex-col gap-5">${rest.map((a) => compactCard(a)).join('')}</div>
  </div>
  <p class="mt-5 text-right text-sm"><a href="${category.url}" class="font-semibold text-brand-600 hover:underline dark:text-red-300">More ${escapeHtml(category.name)} →</a></p>
</section>`;
}

/* ------------------------------------------------------------------ */
/* Misc blocks                                                          */
/* ------------------------------------------------------------------ */

/**
 * Advertisement placeholder. After AdSense approval, replace the inner markup with the
 * <ins class="adsbygoogle"> snippet (and add the AdSense loader script in layout.js).
 */
export function adSlot(site, { size = 'leaderboard', id = '' } = {}) {
  if (!site.ads?.enabled) return '';
  const sizes = {
    leaderboard: 'min-h-[90px] max-w-[728px]',
    rectangle: 'min-h-[250px] max-w-[336px]',
    mobile: 'min-h-[100px] max-w-[320px]',
    'in-article': 'min-h-[250px]',
  };
  return `<aside class="my-8 no-print" aria-label="Advertisement">
  <p class="mb-1 text-center text-[10px] uppercase tracking-widest text-ink-400">Advertisement</p>
  <div class="ad-slot ${sizes[size] || sizes.leaderboard}" data-ad-slot="${escapeAttr(id || size)}">Ad space (${size})</div>
</aside>`;
}

export function newsletterBox() {
  return `<section class="rounded-lg border border-ink-200 bg-ink-50 p-6 dark:border-ink-800 dark:bg-ink-900" aria-labelledby="newsletter-heading">
  <h2 id="newsletter-heading" class="font-serif text-xl font-bold">Morning Briefing</h2>
  <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">The day's top stories in your inbox before 7am.</p>
  <form class="mt-4" data-newsletter novalidate>
    <label for="newsletter-email" class="sr-only">Email address</label>
    <div class="flex">
      <input id="newsletter-email" type="email" placeholder="you@example.com" class="w-full rounded-l-md border border-ink-300 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950" required>
      <button type="submit" class="rounded-r-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Subscribe</button>
    </div>
    <p class="mt-2 text-xs text-ink-500" data-newsletter-message>Demo only: this form does not collect or send data.</p>
  </form>
</section>`;
}

export function shareButtons(site, article) {
  const url = encodeURIComponent(article.canonical);
  const text = encodeURIComponent(article.headline);
  const links = [
    [`https://twitter.com/intent/tweet?url=${url}&text=${text}`, icons.x, 'Share on X'],
    [`https://www.facebook.com/sharer/sharer.php?u=${url}`, icons.facebook, 'Share on Facebook'],
    [`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, icons.linkedin, 'Share on LinkedIn'],
    [`https://api.whatsapp.com/send?text=${text}%20${url}`, icons.whatsapp, 'Share on WhatsApp'],
    [`mailto:?subject=${text}&body=${url}`, icons.mail, 'Share by email'],
  ]
    .map(
      ([href, icon, label]) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer" class="btn-ghost" aria-label="${label}" title="${label}">${icon}</a>`,
    )
    .join('');
  return `<div class="flex flex-wrap items-center gap-1 no-print" aria-label="Share this article">
  <span class="mr-2 text-xs font-bold uppercase tracking-widest text-ink-400">Share</span>
  ${links}
  <button type="button" class="btn-ghost" data-copy-link="${escapeAttr(article.canonical)}" aria-label="Copy link" title="Copy link">${icons.link}</button>
</div>`;
}

export function breadcrumbs(crumbs) {
  return `<nav aria-label="Breadcrumb" class="text-xs text-ink-500 dark:text-ink-400">
  <ol class="flex flex-wrap items-center gap-1">${crumbs
    .map((c, i) => {
      const last = i === crumbs.length - 1;
      return `<li class="flex items-center gap-1">${
        last ? `<span aria-current="page">${escapeHtml(c.label)}</span>` : `<a href="${c.href}" class="hover:text-brand-600">${escapeHtml(c.label)}</a><span aria-hidden="true">/</span>`
      }</li>`;
    })
    .join('')}</ol>
</nav>`;
}

export function pagination(current, total, basePath) {
  if (total <= 1) return '';
  const link = (n) => (n === 1 ? basePath : `${basePath}page/${n}/`);
  const pages = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - current) <= 1) pages.push(n);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return `<nav aria-label="Pagination" class="mt-10 flex items-center justify-center gap-1 text-sm">
  ${current > 1 ? `<a href="${link(current - 1)}" rel="prev" class="rounded border border-ink-300 px-3 py-2 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800">← Previous</a>` : ''}
  ${pages
    .map((p) =>
      p === '…'
        ? '<span class="px-2">…</span>'
        : p === current
          ? `<span aria-current="page" class="rounded bg-brand-600 px-3 py-2 font-semibold text-white">${p}</span>`
          : `<a href="${link(p)}" class="rounded border border-ink-300 px-3 py-2 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800">${p}</a>`,
    )
    .join('')}
  ${current < total ? `<a href="${link(current + 1)}" rel="next" class="rounded border border-ink-300 px-3 py-2 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800">Next →</a>` : ''}
</nav>`;
}

export function authorCard(author) {
  return `<div class="flex items-start gap-4 rounded-lg border border-ink-200 p-5 dark:border-ink-800">
  <img src="${escapeAttr(author.image)}" alt="" width="64" height="64" class="h-16 w-16 rounded-full bg-ink-100" loading="lazy">
  <div>
    <p class="text-xs font-bold uppercase tracking-widest text-ink-400">Written by</p>
    <h2 class="text-lg font-bold"><a href="${author.url}" class="headline-link">${escapeHtml(author.name)}</a></h2>
    <p class="text-sm text-ink-500 dark:text-ink-400">${escapeHtml(author.role)}</p>
    <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">${escapeHtml(author.bio)}</p>
  </div>
</div>`;
}

export { absUrl };
