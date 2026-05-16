document.documentElement.classList.add("js");

let siteInitialized = false;

function initSite() {
  if (siteInitialized) return;
  if (!document.querySelector(".site-header")) return;

  const nav = document.querySelector('.primary-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = [...document.querySelectorAll('.primary-nav a')];
  const hashLinks = navLinks.filter((link) => (link.getAttribute('href') || '').includes('#'));
  const sections = hashLinks
    .map((link) => {
      const href = link.getAttribute('href') || '';
      const hash = href.includes('#') ? `#${href.split('#')[1]}` : '';
      return hash ? document.querySelector(hash) : null;
    })
    .filter(Boolean);

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const setActiveNav = () => {
    if (!sections.length) return;
    const offset = window.scrollY + 140;
    let activeId = '';

    sections.forEach((section) => {
      if (section.offsetTop <= offset) activeId = section.id;
    });

    hashLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const hash = href.includes('#') ? href.split('#')[1] : '';
      link.classList.toggle('active', hash === activeId);
    });
  };

  window.addEventListener('scroll', setActiveNav, { passive: true });
  window.addEventListener('load', setActiveNav);

  const revealEls = document.querySelectorAll('.reveal');
  const revealReadyClass = 'reveal-ready';
  const revealFallbackDelayMs = 1200;

  if (revealEls.length) {
    // Hide reveal sections only once initialization is ready to prevent invisible content on mobile.
    document.documentElement.classList.add(revealReadyClass);
  }

  revealEls.forEach((el, i) => el.style.setProperty('--reveal-order', String(i % 8)));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => io.observe(el));

    // Defensive fallback: if observer never triggers (race/device quirk), reveal everything.
    window.setTimeout(() => {
      revealEls.forEach((el) => el.classList.add('in-view'));
    }, revealFallbackDelayMs);
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const contactModal = document.getElementById('contact-modal');
  const contactOpen = document.querySelector('[data-contact-open]');
  const contactClose = document.querySelector('[data-contact-close]');

  if (contactModal && contactOpen && contactClose) {
    const getFocusable = () => [...contactModal.querySelectorAll('button, input, textarea, a[href], select')]
      .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1');

    const trapFocus = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const openModal = () => {
      contactModal.hidden = false;
      document.body.classList.add('modal-open');
      const firstInput = contactModal.querySelector('input, textarea, button');
      if (firstInput) firstInput.focus();
      contactModal.addEventListener('keydown', trapFocus);
    };

    const closeModal = () => {
      contactModal.hidden = true;
      document.body.classList.remove('modal-open');
      contactModal.removeEventListener('keydown', trapFocus);
      contactOpen.focus();
    };

    contactOpen.addEventListener('click', openModal);
    contactClose.addEventListener('click', closeModal);

    contactModal.addEventListener('click', (event) => {
      if (event.target === contactModal) closeModal();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !contactModal.hidden) closeModal();
    });
  }

  siteInitialized = true;
}

document.addEventListener('DOMContentLoaded', initSite);
document.addEventListener('includes:loaded', initSite);
