# The Daily Meridian – static newspaper publishing platform

A data-driven, SEO-first digital newspaper built with **HTML5, Tailwind CSS (CLI), vanilla JavaScript and a Node.js build script**. No frameworks, no database, no backend: the build turns JSON article files into a complete static website that runs on Hostinger shared hosting (or any static host).

> All sample articles are **fictional demonstration content** and are labelled as such on every page. Replace them with real reporting before launch.

---

## 1. Quick start

```bash
npm install          # once
npm run build        # generates the site into dist/
npm run dev          # preview at http://localhost:8080 (serves dist/)
npm run check        # verifies internal links, HTML structure and metadata
```

Requires Node.js 18+. No other tooling needed.

## 2. Project structure

```
mynewspaper/
├── src/                      SOURCE (edit these)
│   ├── data/
│   │   ├── site.json         site name, domain, navigation, social links, ad settings
│   │   ├── categories.json   sections (world, politics, …)
│   │   ├── authors.json      author profiles
│   │   └── articles/         ONE JSON FILE PER ARTICLE  ← the "CMS"
│   │       └── _template.json  copy this to create a new article
│   ├── content/pages/        About, Contact, Privacy, Terms, Editorial & Corrections policies
│   ├── css/input.css         Tailwind source
│   ├── js/main.js            small progressive-enhancement script (menu, theme, search, share)
│   ├── images/               article images + brand assets (credits.json records licences)
│   └── static/               .htaccess, ads.txt – copied verbatim to dist/
├── scripts/
│   ├── build.js              static site generator
│   ├── lib/                  templates, components, SEO (sitemap/RSS/JSON-LD), loader/validator
│   ├── new-article.js        scaffolds an article JSON
│   ├── check-links.js        post-build QA
│   ├── dev-server.js         zero-dependency preview server
│   └── fetch-demo-images.js  downloads the freely licensed demo photos
├── dist/                     GENERATED OUTPUT – never edit, never commit (gitignored)
├── .github/workflows/        CI build + deploy to the "deploy" branch
├── tailwind.config.js
└── package.json
```

## 3. Publishing workflow

### Add a new article

1. **Scaffold** (optional helper):
   ```bash
   npm run new-article -- "Headline of the story" world --author=a-rossi
   ```
   or copy `src/data/articles/_template.json` to `src/data/articles/2026-12-my-story.json`.
2. **Fill in the fields** (see §4). Put the image in `src/images/articles/` (ideally 1200×675 JPEG, ≤300 KB).
3. Set `"status": "published"`.
4. `npm run build` – the build validates the file and regenerates:
   - the article page `dist/news/<category>/<slug>.html`
   - homepage, category pages (paginated), author pages
   - `sitemap.xml`, `news-sitemap.xml`, `rss.xml` and per-category RSS
   - related-article links and the client-side search index
5. Commit and push to `master`. GitHub Actions builds and publishes `dist/` to the `deploy` branch, which Hostinger pulls.

Validation errors (missing fields, unknown category/author, missing image, duplicate slug) stop the build with a clear message.

### Edit an article

Edit the JSON, update `dateModified`, rebuild. The URL is derived from `category` + `slug`, so **never change those** on a published article – the old URL would 404. Change the headline, body, image or anything else freely.

### Permanent URLs

Articles are never removed by the build; every JSON file with `status: published` is rendered on every build. To unpublish, set `"status": "draft"` (the URL will then 404 – prefer adding a correction note instead, per the Corrections Policy).

### Publishing from a phone

Everything is plain JSON in Git. On GitHub mobile (web or app): open `src/data/articles/`, tap **Add file → Create new file**, paste a copy of `_template.json`, edit, commit to `master`. The Action builds and deploys automatically. Upload images via **Add file → Upload files** into `src/images/articles/`.

## 4. Article fields

| Field | Required | Notes |
|---|---|---|
| `id` | ✔ | Unique, stable; used for `related` links |
| `slug` | ✔ | Lowercase letters, digits, hyphens. Forms the URL |
| `headline` | ✔ | |
| `subheadline` | | Standfirst under the headline |
| `description` | ✔ | 120–160 chars; used in listings, RSS, fallback meta |
| `category` | ✔ | Slug from `categories.json` |
| `author` | ✔ | `id` from `authors.json` |
| `datePublished` | ✔ | ISO 8601 with timezone |
| `dateModified` | | Defaults to `datePublished` |
| `image.src/alt` | ✔ | `caption`, `credit` optional. Width/height detected automatically |
| `tags` | | Shown as topic chips; used by search |
| `related` | | Array of article `id`s; filled up with same-category stories |
| `featured` / `breaking` / `trending` | | Homepage hero, ticker and trending list |
| `status` | | `published` (default) or `draft` |
| `demo` | | Shows the demonstration-content notice |
| `seo.title/description/canonical` | | Overrides |
| `body` | ✔ | Array of blocks – see `_template.json` for every block type |

## 5. SEO features

- Unique `<title>`, meta description, canonical, Open Graph, Twitter cards on every page
- JSON-LD: `NewsArticle`/`OpinionNewsArticle`, `NewsMediaOrganization`, `WebSite` (+SearchAction), `BreadcrumbList`, `ProfilePage`
- `sitemap.xml` (with image extension), `news-sitemap.xml` (last 48 h), `robots.txt`
- `rss.xml` plus `/news/<category>/rss.xml`
- Semantic HTML, single `<h1>`, breadcrumbs, `rel=prev/next` on paginated pages, `noindex` on search/404
- Article text is in the HTML source (no client-side rendering); `width`/`height` on all images (no CLS); lazy loading below the fold; `fetchpriority=high` on the hero
- Dark mode via `prefers-color-scheme` + toggle, no flash

**Before launch**: set `url`, `name`, social links and contact details in `src/data/site.json`; add a 600×60 PNG logo at `src/images/brand/logo-600x60.png` (Google requires a raster publisher logo – the build falls back to the SVG with a warning until then); replace the placeholder legal pages after legal review.

## 6. Google AdSense

Ad placeholders are rendered by `adSlot()` in `scripts/lib/components.js` (`data-ad-slot` identifies each position: `home-top`, `home-sidebar`, `home-mid`, `article-top`, `article-inline`, `article-sidebar`, `article-bottom`, `category-top`, `category-sidebar`). After approval:

1. Put your `ca-pub-…` id in `site.json → ads.adsenseClient` (this injects the AdSense loader script).
2. Replace the inner markup of `adSlot()` with your `<ins class="adsbygoogle">` snippet.
3. Replace `src/static/ads.txt` with the line Google provides.
4. Set `ads.enabled: false` to hide all slots.

## 7. Deploying to Hostinger via GitHub

1. Push this repository to GitHub (`master` branch).
2. The workflow in `.github/workflows/deploy.yml` builds the site and force-pushes `dist/` to a `deploy` branch.
3. In Hostinger **hPanel → Websites → Manage → Advanced → Git**: add the repository, branch **`deploy`**, install path `public_html` (leave empty for the root domain).
4. Optional: copy the **Auto-deployment webhook URL** from the same page into a GitHub secret named `HOSTINGER_DEPLOY_WEBHOOK` so each build is pulled immediately.
5. Enable SSL in hPanel; `.htaccess` already redirects to HTTPS and sets caching and security headers.

Hosting limitations: shared hosting cannot run Node, so the build must happen in GitHub Actions (or locally with a manual upload). Search is client-side (a small JSON index). The newsletter form is UI only.

## 8. Images

Keep article images around 1200×675 px JPEG (≤300 KB). The build does not resize images (no native dependencies), so export them at the right size before committing. Demo photos come from Wikimedia Commons under CC0/CC BY/CC BY-SA – see `src/images/credits.json`; attribution is shown in each caption.

## 9. Scripts

| Command | What it does |
|---|---|
| `npm run build` | Clean, generate HTML/feeds, compile Tailwind |
| `npm run build:html` / `build:css` | Individual steps |
| `npm run validate` | Validate content without writing files |
| `npm run check` | Link, HTML structure and metadata QA on `dist/` |
| `npm run dev` | Preview server (`-- --port=3000` to change port) |
| `npm run new-article -- "Title" category` | Scaffold an article |
| `npm run fetch-demo-images` | Re-download demo photos |
