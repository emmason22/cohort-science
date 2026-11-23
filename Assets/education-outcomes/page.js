for (const frame of document.querySelectorAll('.outcome-frame')) {
  frame.addEventListener('load', () => {
    const body = frame.contentDocument?.body;
    if (!body) return;

    const style = frame.contentDocument.createElement('style');
    style.textContent = `
      body, button, select, input { font-family: Inter, Arial, sans-serif !important; }
      body { background: #fff !important; }
      button, select, input { letter-spacing: normal; }
    `;
    frame.contentDocument.head?.append(style);

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
  const insightTitle = document.querySelector('#insight-title');
  const insightCopy = document.querySelector('#insight-copy');
  const insightQuestion = document.querySelector('#insight-question');
  const insightStat = document.querySelector('#insight-stat');
  const insightBenchmark = document.querySelector('#insight-benchmark');
  const moduleSelect = document.querySelector('#outcome-module-select');
  const copyButton = document.querySelector('#copy-outcome-view');
  const copyStatus = document.querySelector('#outcome-copy-status');
  let copyStatusTimer;

  if (links.length && panels.every(Boolean)) {
    const selectPanel = (index) => {
      for (const [i, panel] of panels.entries()) {
        panel.hidden = i !== index;
        if (i === index) links[i].setAttribute('aria-current', 'true');
        else links[i].removeAttribute('aria-current');
      }
      if (insightTitle) insightTitle.textContent = links[index].dataset.insightTitle || '';
      if (insightCopy) insightCopy.textContent = links[index].dataset.insightCopy || '';
      if (insightQuestion) insightQuestion.textContent = links[index].dataset.insightQuestion || '';
      if (insightStat) insightStat.textContent = links[index].dataset.insightStat || '';
      if (insightBenchmark) insightBenchmark.textContent = links[index].dataset.insightBenchmark || '';
      if (moduleSelect) moduleSelect.value = links[index].hash;
      const navigation = links[index].parentElement;
      if (navigation && navigation.scrollWidth > navigation.clientWidth) {
        requestAnimationFrame(() => links[index].scrollIntoView({ block: 'nearest', inline: 'nearest' }));
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
    moduleSelect?.addEventListener('change', () => {
      const index = links.findIndex((link) => link.hash === moduleSelect.value);
      if (index < 0) return;
      if (location.hash !== links[index].hash) history.pushState(null, '', links[index].hash);
      selectPanel(index);
    });
    copyButton?.addEventListener('click', async () => {
      const activeLink = links.find((link) => link.getAttribute('aria-current') === 'true') || links[0];
      const viewUrl = new URL(location.href);
      viewUrl.hash = activeLink.hash;
      let message = 'View link copied';
      try {
        await navigator.clipboard.writeText(viewUrl.href);
      } catch {
        message = 'Copy the URL from your browser';
      }
      if (copyStatus) {
        window.clearTimeout(copyStatusTimer);
        copyStatus.textContent = message;
        copyStatus.classList.add('is-visible');
        copyStatusTimer = window.setTimeout(() => copyStatus.classList.remove('is-visible'), 2400);
      }
    });
    window.addEventListener('hashchange', syncHash);
    syncHash();
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector('.outcomes-dashboard')?.scrollIntoView({ block: 'start' }));
    }
  }
}

const logoGrid = document.querySelector('#institution-logos');
const logoToggle = document.querySelector('#institution-logos-toggle');

if (logoGrid && logoToggle && logoGrid.children.length > 36) {
  const logoScaleOverrides = new Map([
    ['075-166027_harvard-business-school.png', 1.35],
    ['153-190150_columbia-business-school.png', 1.5],
    ['056-130794_yale-school-of-management.png', 1.45],
    ['178-234076_darden-school-of-business.png', 1.22],
    ['154-190415_cornell-sc-johnson-college-of-business.png', 1.18],
    ['072-152080_mendoza-college-of-business.png', 1.45],
    ['161-199120_unc-kenan-flagler-business-school.png', 1.4],
    ['167-221999_owen-graduate-school-of-management.png', 1.3],
    ['071-151351_kelley-school-of-business.png', 1.3],
    ['058-131496_mcdonough-school-of-business.png', 1.4],
    ['171-228778_mccombs-school-of-business.png', 1.2],
    ['064-139755_scheller-college-of-business.png', 1.25],
    ['088-204796_max-m-fisher-college-of-business.png', 1.3],
    ['135-160755_a-b-freeman-school-of-business.png', 1.35]
  ]);
  const fitLogoToTile = (image) => {
    const tile = image.closest('.logo-tile');
    if (!tile || tile.hidden) return;
    const filename = image.src.split('/').pop().split('?')[0];
    const preferredScale = logoScaleOverrides.get(filename) || 1;
    tile.style.setProperty('--logo-scale', preferredScale);
    requestAnimationFrame(() => {
      const tileRect = tile.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      if (!tileRect.width || !tileRect.height || !imageRect.width || !imageRect.height) return;
      const availableWidth = Math.max(1, tile.clientWidth - 20);
      const availableHeight = Math.max(1, tile.clientHeight - 16);
      const fitRatio = Math.min(1, availableWidth / imageRect.width, availableHeight / imageRect.height);
      const safeScale = Math.max(.5, Math.floor(preferredScale * fitRatio * 100) / 100);
      tile.style.setProperty('--logo-scale', safeScale);
    });
  };
  const classifyLogo = (image) => {
    const tile = image.closest('.logo-tile');
    if (!tile || !image.naturalWidth || !image.naturalHeight) return;
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    tile.classList.remove('logo-tile--compact', 'logo-tile--wide', 'logo-tile--ultrawide');
    if (aspectRatio >= 5) tile.classList.add('logo-tile--ultrawide');
    else if (aspectRatio >= 3) tile.classList.add('logo-tile--wide');
    else if (aspectRatio <= 1.15) tile.classList.add('logo-tile--compact');
    fitLogoToTile(image);
  };
  for (const image of logoGrid.querySelectorAll('img')) {
    if (image.complete) classifyLogo(image);
    else image.addEventListener('load', () => classifyLogo(image), { once: true });
  }

  const featuredLogoOrder = [
    '075-166027_harvard-business-school.png',
    '181-243744_stanford-graduate-school-of-business.png',
    '164-215062_the-wharton-school.png',
    '144-166683_mit-sloan-school-of-management.png',
    '129-144050_university-of-chicago-booth-school-of-business.png',
    '131-147767_kellogg-school-of-management.png',
    '153-190150_columbia-business-school.png',
    '150-182670_tuck-school-of-business.png',
    '056-130794_yale-school-of-management.png',
    '160-198419_duke-universitys-fuqua-school-of-business.png',
    '049-110635_haas-school-of-business.png',
    '145-170976_michigan-ross-school-of-business.png',
    '156-193900_nyu-stern-school-of-business.png',
    '178-234076_darden-school-of-business.png',
    '154-190415_cornell-sc-johnson-college-of-business.png',
    '119-110662_ucla-anderson-school-of-management.png',
    '072-152080_mendoza-college-of-business.png',
    '161-199120_unc-kenan-flagler-business-school.png',
    '167-221999_owen-graduate-school-of-management.png',
    '071-151351_kelley-school-of-business.png',
    '149-179867_olin-business-school.png',
    '091-211440_tepper-school-of-business.png',
    '058-131496_mcdonough-school-of-business.png',
    '171-228778_mccombs-school-of-business.png',
    '122-123961_usc-marshall-school-of-business.png',
    '128-139658_goizueta-business-school.png',
    '169-227757_rice-business.png',
    '064-139755_scheller-college-of-business.png',
    '088-204796_max-m-fisher-college-of-business.png',
    '100-228723_mays-business-school.png',
    '170-228246_cox-school-of-business.png',
    '138-164580_babson-college.png',
    '162-199847_wake-forest-university-school-of-business.png',
    '175-230038_byu-marriott-school-of-business.png',
    '135-160755_a-b-freeman-school-of-business.png',
    '106-236948_michael-g-foster-school-of-business.png'
  ];
  const featuredRanks = new Map(featuredLogoOrder.map((name, index) => [name, index]));
  const logoItems = Array.from(logoGrid.children);
  logoItems.sort((a, b) => {
    const aName = a.querySelector('img')?.src.split('/').pop().split('?')[0] || '';
    const bName = b.querySelector('img')?.src.split('/').pop().split('?')[0] || '';
    const aRank = featuredRanks.get(aName) ?? Number.MAX_SAFE_INTEGER;
    const bRank = featuredRanks.get(bName) ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
  for (const logo of logoItems) logoGrid.append(logo);

  let logoResizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(logoResizeTimer);
    logoResizeTimer = window.setTimeout(() => {
      for (const image of logoGrid.querySelectorAll('img')) fitLogoToTile(image);
    }, 120);
  });

  const extraLogos = Array.from(logoGrid.children).slice(36);

  const setLogoGridExpanded = (expanded) => {
    for (const logo of extraLogos) logo.hidden = !expanded;
    logoToggle.setAttribute('aria-expanded', String(expanded));
    logoToggle.textContent = expanded ? 'View fewer' : 'View more';
    if (expanded) {
      requestAnimationFrame(() => {
        for (const image of logoGrid.querySelectorAll('img')) fitLogoToTile(image);
      });
    }
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
