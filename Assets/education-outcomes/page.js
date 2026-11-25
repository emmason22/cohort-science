if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const openAtHero = () => {
  if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

openAtHero();
window.addEventListener('pageshow', openAtHero);

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

    if (window.matchMedia('(max-width: 780px)').matches && frame.title.includes('Seniority Shift')) {
      const clusterInputs = Array.from(body.querySelectorAll('#ddClusterMenu input[type="checkbox"]'));
      for (const input of clusterInputs.slice(1)) input.checked = false;
      if (clusterInputs.length) frame.contentWindow?.onClusterCheck?.(clusterInputs[0]);
    }

    const resize = () => {
      const height = Math.ceil(body.getBoundingClientRect().height);
      if (height > 0 && frame.height !== String(height)) frame.height = height;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(body);
    resize();
    window.connectOutcomeChart?.(frame);
  }, { once: true });
}

const reportCarousel = document.querySelector('.hero-report-grid');
const reportPrevious = document.querySelector('[data-report-previous]');
const reportNext = document.querySelector('[data-report-next]');

if (reportCarousel && reportPrevious && reportNext) {
  const reportSlides = Array.from(reportCarousel.querySelectorAll('.hero-report'));
  const reportInteractionRegion = reportCarousel.closest('.hero-report-showcase') || reportCarousel;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeReport = 0;
  let pointerPaused = false;
  let focusPaused = false;
  let scrollTimer;

  const setActiveReport = () => {
    reportSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeReport));
  };

  const getVisibleReportCount = () => {
    const firstSlide = reportSlides[0];
    if (!firstSlide) return 1;
    const styles = getComputedStyle(reportCarousel);
    const gap = parseFloat(styles.columnGap) || 0;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    return Math.max(1, Math.floor((reportCarousel.clientWidth + gap + 1) / (slideWidth + gap)));
  };

  const getLastReportIndex = () => Math.max(0, reportSlides.length - getVisibleReportCount());

  const showReport = (index, behavior = 'smooth') => {
    const lastIndex = getLastReportIndex();
    activeReport = index < 0 ? lastIndex : index > lastIndex ? 0 : index;
    setActiveReport();
    reportCarousel.scrollTo({ left: reportSlides[activeReport].offsetLeft, behavior });
  };

  const syncReportPosition = () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const closestIndex = reportSlides.reduce((closest, slide, index) => (
        Math.abs(slide.offsetLeft - reportCarousel.scrollLeft)
          < Math.abs(reportSlides[closest].offsetLeft - reportCarousel.scrollLeft)
          ? index
          : closest
      ), 0);
      activeReport = Math.min(closestIndex, getLastReportIndex());
      setActiveReport();
    }, 120);
  };

  setActiveReport();

  reportPrevious.addEventListener('click', () => showReport(activeReport - 1));
  reportNext.addEventListener('click', () => showReport(activeReport + 1));
  reportCarousel.addEventListener('scroll', syncReportPosition, { passive: true });
  reportInteractionRegion.addEventListener('pointerenter', () => { pointerPaused = true; });
  reportInteractionRegion.addEventListener('pointerleave', () => { pointerPaused = false; });
  reportInteractionRegion.addEventListener('focusin', () => { focusPaused = true; });
  reportInteractionRegion.addEventListener('focusout', () => { focusPaused = false; });
  window.addEventListener('resize', () => showReport(Math.min(activeReport, getLastReportIndex()), 'auto'));

  window.setInterval(() => {
    if (reducedMotion.matches || pointerPaused || focusPaused || document.hidden) return;
    showReport(activeReport + 1);
  }, 3600);
}

const reduceRevealMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.outcomes-why .container, .outcome-demo .container > h2, .outcome-demo-intro, .outcome-topic > summary, ' +
    '.outcome-methodology, .outcomes-coverage h2, .coverage-intro, .outcome-logo-grid, .outcomes-conversion .container'
  );
  const revealObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach(({target}, index) => {
      revealObserver.unobserve(target);
      if (reduceRevealMotion.matches) return;
      target.animate?.(
        [{ opacity: .1, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { delay: Math.min(index, 4) * 45, duration: 340, easing: 'ease-out', fill: 'backwards' }
      );
    });
  }, { rootMargin: '0px 0px 24px 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
}

const clientIdentification = document.querySelector('#outcomes-client-identification');
if (clientIdentification) {
  const pageParameters = new URLSearchParams(location.search);
  const clientName = pageParameters.get('client')?.trim().slice(0, 80);
  if (clientName) {
    const auditPeriod = pageParameters.get('period')?.trim().slice(0, 40)
      || new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    clientIdentification.textContent = `Prepared for ${clientName} · ${auditPeriod}`;
    clientIdentification.hidden = false;
  }
}

const topics = Array.from(document.querySelectorAll('.outcome-topic'));
if (topics.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();

  for (const topic of topics) {
    topic.addEventListener('toggle', () => {
      animations.get(topic)?.cancel();
      animations.delete(topic);
      if (!topic.open) {
        if (location.hash === '#' + topic.id && !topics.some((item) => item.open)) {
          history.replaceState(null, '', '#dashboard-preview');
        }
        return;
      }

      history.replaceState(null, '', '#' + topic.id);
      const cards = topic.querySelector('.outcome-topic-grid');
      if (!reduceMotion.matches && cards.animate) {
        animations.set(topic,
          cards.animate(
            [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 240, easing: 'ease-out' }
          )
        );
      }

      const chartWindow = topic.querySelector('iframe')?.contentWindow;
      if (chartWindow) requestAnimationFrame(() => chartWindow.dispatchEvent(new Event('resize')));
    });
  }

  const openLinkedTopic = () => {
    const topic = topics.find((item) => '#' + item.id === location.hash);
    if (!topic) return;
    topic.open = true;
    requestAnimationFrame(() => topic.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', openLinkedTopic);
  openLinkedTopic();
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

  const logoItems = Array.from(logoGrid.children);
  const logoName = (logo) => logo.querySelector('img')?.src.split('/').pop().split('?')[0] || '';
  const logoHash = (name) => {
    let hash = 2166136261;
    for (let index = 0; index < name.length; index += 1) {
      hash ^= name.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  logoItems.sort((a, b) => {
    return logoHash(logoName(a)) - logoHash(logoName(b));
  });
  for (const logo of logoItems) logoGrid.append(logo);

  let logoResizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(logoResizeTimer);
    logoResizeTimer = window.setTimeout(() => {
      for (const image of logoGrid.querySelectorAll('img')) fitLogoToTile(image);
    }, 120);
  });

  const mobileLogoQuery = window.matchMedia('(max-width: 600px)');
  const getVisibleLogoLimit = () => mobileLogoQuery.matches ? 12 : 36;

  const setLogoGridExpanded = (expanded) => {
    const visibleLogoLimit = getVisibleLogoLimit();
    for (const [index, logo] of Array.from(logoGrid.children).entries()) {
      logo.hidden = !expanded && index >= visibleLogoLimit;
    }
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
  mobileLogoQuery.addEventListener('change', () => {
    if (logoToggle.getAttribute('aria-expanded') !== 'true') setLogoGridExpanded(false);
  });
  logoToggle.addEventListener('click', () => {
    const expanded = logoToggle.getAttribute('aria-expanded') !== 'true';
    const firstExtraLogo = Array.from(logoGrid.children)[getVisibleLogoLimit()];
    setLogoGridExpanded(expanded);
    if (expanded && firstExtraLogo) {
      firstExtraLogo.tabIndex = -1;
      firstExtraLogo.focus();
    }
  });
}
