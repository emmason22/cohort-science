const nav = document.querySelector('.primary-nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const hashLinks = navLinks.filter((link) => link.getAttribute('href').startsWith('#'));
const sections = hashLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
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
  if (!sections.length) {
    return;
  }

  const offset = window.scrollY + 140;
  let activeId = '';

  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });

  hashLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('active', isActive);
  });
};

window.addEventListener('scroll', setActiveNav, { passive: true });
window.addEventListener('load', setActiveNav);

const revealEls = document.querySelectorAll('.reveal');
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
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const contactModal = document.getElementById('contact-modal');
const contactOpen = document.querySelector('[data-contact-open]');
const contactClose = document.querySelector('[data-contact-close]');

if (contactModal && contactOpen && contactClose) {
  const openModal = () => {
    contactModal.hidden = false;
    document.body.classList.add('modal-open');
    const firstInput = contactModal.querySelector('input, textarea, button');
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeModal = () => {
    contactModal.hidden = true;
    document.body.classList.remove('modal-open');
    contactOpen.focus();
  };

  contactOpen.addEventListener('click', openModal);
  contactClose.addEventListener('click', closeModal);

  contactModal.addEventListener('click', (event) => {
    if (event.target === contactModal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !contactModal.hidden) {
      closeModal();
    }
  });
}
