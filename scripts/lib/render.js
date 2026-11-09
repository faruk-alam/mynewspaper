import { escapeHtml, escapeAttr } from './utils.js';

/**
 * Renders the structured "body" array of an article or page to HTML.
 *
 * Supported blocks:
 *   "plain string"                                  -> <p> (inline HTML allowed)
 *   { type: "paragraph", html }                     -> <p>
 *   { type: "heading", text, level? }               -> <h2>/<h3>
 *   { type: "quote", text, cite? }                  -> <blockquote>
 *   { type: "list", items: [], ordered? }           -> <ul>/<ol>
 *   { type: "image", src, alt, caption?, credit? }  -> <figure>
 *   { type: "notice", html }                        -> highlighted box
 *   { type: "html", html }                          -> raw HTML (use sparingly)
 *   { type: "embed", html }                         -> responsive wrapper
 */
export function renderBlocks(blocks = []) {
  return blocks.map(renderBlock).join('\n');
}

function renderBlock(block) {
  if (typeof block === 'string') return `<p>${block}</p>`;
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.html || escapeHtml(block.text || '')}</p>`;
    case 'heading': {
      const level = block.level === 3 ? 3 : 2;
      return `<h${level}>${escapeHtml(block.text)}</h${level}>`;
    }
    case 'quote':
      return `<blockquote><p>${escapeHtml(block.text)}</p>${
        block.cite ? `<footer class="not-italic text-sm text-ink-500">— ${escapeHtml(block.cite)}</footer>` : ''
      }</blockquote>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag}>${(block.items || []).map((i) => `<li>${i}</li>`).join('')}</${tag}>`;
    }
    case 'image':
      return `<figure>
  <img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt || '')}" loading="lazy" decoding="async"${
    block.width ? ` width="${block.width}"` : ''
  }${block.height ? ` height="${block.height}"` : ''} class="rounded">
  ${
    block.caption || block.credit
      ? `<figcaption>${escapeHtml(block.caption || '')}${
          block.credit ? ` <span class="text-ink-400">${escapeHtml(block.credit)}</span>` : ''
        }</figcaption>`
      : ''
  }
</figure>`;
    case 'notice':
      return `<div class="not-prose my-6 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">${block.html}</div>`;
    case 'embed':
      return `<div class="not-prose my-6 overflow-hidden rounded">${block.html}</div>`;
    case 'html':
      return block.html || '';
    default:
      console.warn(`  warn: unknown block type "${block.type}"`);
      return '';
  }
}
