(() => {
  const PARTIALS_VERSION = '2026-05-15-1';
  const cache = new Map();

  const loadPartial = async (name) => {
    if (cache.has(name)) return cache.get(name);
    const p = fetch(`partials/${name}.html?v=${PARTIALS_VERSION}`, { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error(`Failed to load partial ${name}`);
      return r.text();
    });
    cache.set(name, p);
    return p;
  };

  const applyAriaCurrent = () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.primary-nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const samePageHash = page === 'index.html' && href.startsWith('index.html#');
      const isCurrent = href === page || (page === 'index.html' && href === 'index.html') || samePageHash;
      if (isCurrent) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  };

  const run = async () => {
    const nodes = [...document.querySelectorAll('[data-include]')];
    await Promise.all(nodes.map(async (node) => {
      const name = node.getAttribute('data-include');
      if (!name) return;
      node.innerHTML = await loadPartial(name);
      node.replaceWith(...node.childNodes);
    }));

    applyAriaCurrent();
    document.dispatchEvent(new CustomEvent('includes:loaded'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
