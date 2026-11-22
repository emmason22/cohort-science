for (const frame of document.querySelectorAll('.outcome-frame')) {
  frame.addEventListener('load', () => {
    const body = frame.contentDocument?.body;
    if (!body) return;

    const resize = () => {
      const height = Math.ceil(body.getBoundingClientRect().height);
      if (height > 0 && frame.height !== String(height)) frame.height = height;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(body);
    resize();
  }, { once: true });
}

const workspace = document.querySelector('.outcome-workspace');
if (workspace) {
  const links = Array.from(workspace.querySelectorAll('.outcome-workspace-nav a'));
  const panels = links.map((link) => document.getElementById(link.hash.slice(1))?.closest('article'));

  if (links.length && panels.every(Boolean)) {
    const selectPanel = (index) => {
      for (const [i, panel] of panels.entries()) {
        panel.hidden = i !== index;
        if (i === index) links[i].setAttribute('aria-current', 'true');
        else links[i].removeAttribute('aria-current');
      }
      const chartWindow = panels[index].querySelector('iframe')?.contentWindow;
      if (chartWindow) requestAnimationFrame(() => chartWindow.dispatchEvent(new Event('resize')));
    };
    const syncHash = () => {
      const index = links.findIndex((link) => link.hash === location.hash);
      selectPanel(Math.max(0, index));
    };

    workspace.classList.add('outcome-workspace-ready');
    for (const [index, link] of links.entries()) {
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        selectPanel(index);
      });
    }
    window.addEventListener('hashchange', syncHash);
    syncHash();
  }
}

const logoGrid = document.querySelector('#institution-logos');
const logoToggle = document.querySelector('#institution-logos-toggle');

if (logoGrid && logoToggle && logoGrid.children.length > 36) {
  const extraLogos = Array.from(logoGrid.children).slice(36);

  const setLogoGridExpanded = (expanded) => {
    for (const logo of extraLogos) logo.hidden = !expanded;
    logoToggle.setAttribute('aria-expanded', String(expanded));
    logoToggle.textContent = expanded ? 'View fewer' : 'View more';
  };

  setLogoGridExpanded(false);
  logoToggle.hidden = false;
  logoToggle.addEventListener('click', () => {
    const expanded = logoToggle.getAttribute('aria-expanded') !== 'true';
    setLogoGridExpanded(expanded);
    if (expanded) {
      extraLogos[0].tabIndex = -1;
      extraLogos[0].focus();
    }
  });
}
