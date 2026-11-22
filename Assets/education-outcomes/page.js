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
