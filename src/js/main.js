/* The Daily Meridian – minimal client-side enhancements (no dependencies). */
(function () {
  'use strict';

  /* ---------- Theme toggle ---------- */
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var root = document.documentElement;
      var dark = root.classList.toggle('dark');
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch (e) {
        /* storage unavailable */
      }
    });
  });

  /* ---------- Mobile menu ---------- */
  var menu = document.getElementById('mobile-menu');
  if (menu) {
    var openBtn = document.querySelector('[data-menu-open]');
    var lastFocus = null;
    function openMenu() {
      lastFocus = document.activeElement;
      menu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      openBtn && openBtn.setAttribute('aria-expanded', 'true');
      var first = menu.querySelector('input, a, button');
      first && first.focus();
    }
    function closeMenu() {
      menu.classList.add('hidden');
      document.body.style.overflow = '';
      openBtn && openBtn.setAttribute('aria-expanded', 'false');
      lastFocus && lastFocus.focus();
    }
    openBtn && openBtn.addEventListener('click', openMenu);
    menu.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) closeMenu();
    });
  }

  /* ---------- Copy link ---------- */
  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy-link');
      var done = function () {
        var prev = btn.getAttribute('aria-label');
        btn.setAttribute('aria-label', 'Link copied');
        btn.classList.add('text-brand-600');
        setTimeout(function () {
          btn.setAttribute('aria-label', prev);
          btn.classList.remove('text-brand-600');
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          window.prompt('Copy this link:', url);
        });
      } else {
        window.prompt('Copy this link:', url);
      }
    });
  });

  /* ---------- Newsletter (demo only) ---------- */
  document.querySelectorAll('[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var msg = form.querySelector('[data-newsletter-message]');
      if (!input || !msg) return;
      if (!input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'mt-2 text-xs text-brand-600';
        input.focus();
        return;
      }
      msg.textContent = 'Thanks! This is a demo: no data was sent or stored.';
      msg.className = 'mt-2 text-xs text-green-700 dark:text-green-400';
      input.value = '';
    });
  });

  /* ---------- Search ---------- */
  var results = document.querySelector('[data-search-results]');
  if (results) {
    var form = document.querySelector('[data-search-form]');
    var input = document.getElementById('search-input');
    var status = document.querySelector('[data-search-status]');
    var index = null;
    var loading = null;

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function loadIndex() {
      if (index) return Promise.resolve(index);
      if (!loading) {
        loading = fetch('/assets/data/search-index.json')
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          })
          .then(function (data) {
            index = data;
            return index;
          })
          .catch(function () {
            status.textContent = 'Search is temporarily unavailable.';
            return [];
          });
      }
      return loading;
    }

    function score(item, terms) {
      var hay = {
        t: item.t.toLowerCase(),
        d: item.d.toLowerCase(),
        k: (item.k || '').toLowerCase(),
        c: item.c.toLowerCase(),
        a: item.a.toLowerCase(),
      };
      var total = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var s = 0;
        if (hay.t.indexOf(term) > -1) s += 10;
        if (hay.k.indexOf(term) > -1) s += 6;
        if (hay.c.indexOf(term) > -1) s += 4;
        if (hay.a.indexOf(term) > -1) s += 4;
        if (hay.d.indexOf(term) > -1) s += 2;
        if (s === 0) return 0;
        total += s;
      }
      return total;
    }

    function render(q) {
      var terms = q
        .toLowerCase()
        .split(/\s+/)
        .filter(function (t) {
          return t.length > 1;
        });
      if (!terms.length) {
        results.innerHTML = '';
        status.textContent = 'Enter a term to search.';
        return;
      }
      loadIndex().then(function (data) {
        var hits = data
          .map(function (item) {
            return { item: item, s: score(item, terms) };
          })
          .filter(function (h) {
            return h.s > 0;
          })
          .sort(function (a, b) {
            return b.s - a.s || new Date(b.item.p) - new Date(a.item.p);
          });
        status.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + q + '”';
        results.innerHTML = hits
          .map(function (h) {
            var it = h.item;
            var date = new Date(it.p).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              '<article class="grid gap-4 border-b border-ink-200 py-5 dark:border-ink-800 sm:grid-cols-[160px_1fr]">' +
              '<a href="' + esc(it.u) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(it.i) + '" alt="" loading="lazy" class="card-img rounded"></a>' +
              '<div><span class="kicker">' + esc(it.c) + '</span>' +
              '<h2 class="mt-1 text-lg font-bold leading-snug"><a href="' + esc(it.u) + '" class="headline-link">' + esc(it.t) + '</a></h2>' +
              '<p class="mt-1 text-sm text-ink-600 dark:text-ink-300">' + esc(it.d) + '</p>' +
              '<p class="mt-2 text-xs text-ink-500">' + esc(it.a) + ' · ' + date + '</p></div></article>'
            );
          })
          .join('');
      });
    }

    var params = new URLSearchParams(location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      document.title = 'Search: ' + initial + ' – ' + document.title;
      render(initial);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      history.replaceState(null, '', q ? '/search.html?q=' + encodeURIComponent(q) : '/search.html');
      render(q);
    });
    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        render(input.value.trim());
      }, 200);
    });
  }

  /* ---------- External links: open safely ---------- */
  document.querySelectorAll('main a[href^="http"]').forEach(function (a) {
    if (a.hostname !== location.hostname) {
      a.setAttribute('rel', 'noopener noreferrer');
      if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
    }
  });
})();
