(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     FOOTER YEAR
  ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     NAVBAR — scrolled state + mobile toggle + active link
  ============================================================ */
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const navLinkEls = Array.from(document.querySelectorAll('.nav-link'));
  const toTopBtn = document.getElementById('toTop');

  function onScroll() {
    const scrolled = window.scrollY > 12;
    navbar.classList.toggle('scrolled', scrolled);
    toTopBtn.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  navLinkEls.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // Active nav link based on section in view
  const sections = navLinkEls
    .map(l => document.getElementById(l.dataset.nav))
    .filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(l => l.classList.toggle('active', l.dataset.nav === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));

  /* ============================================================
     TYPING ANIMATION
  ============================================================ */
  const typedEl = document.getElementById('typedText');
  const roles = [
    'Penetration Tester',
    'Red Team Enthusiast',
    'Offensive Security Learner',
    'Ethical Hacker',
    'Cybersecurity Student'
  ];

  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const TYPE_SPEED = 65;
      const DELETE_SPEED = 35;
      const HOLD_TIME = 1400;

      function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
          charIndex++;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, HOLD_TIME);
            return;
          }
          setTimeout(tick, TYPE_SPEED);
        } else {
          charIndex--;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(tick, 350);
            return;
          }
          setTimeout(tick, DELETE_SPEED);
        }
      }
      tick();
    }
  }

  /* ============================================================
     PROJECT ACCORDION
  ============================================================ */
  const projectHeads = document.querySelectorAll('.project-head');

  projectHeads.forEach(head => {
    head.addEventListener('click', () => {
      const card = head.closest('.project-card');
      const body = card.querySelector('.project-body');
      const isOpen = card.classList.contains('open');

      // close all others
      document.querySelectorAll('.project-card.open').forEach(openCard => {
        if (openCard !== card) {
          openCard.classList.remove('open');
          openCard.querySelector('.project-head').setAttribute('aria-expanded', 'false');
          openCard.querySelector('.project-body').style.maxHeight = null;
        }
      });

      if (isOpen) {
        card.classList.remove('open');
        head.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = null;
      } else {
        card.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ============================================================
     CERT LIGHTBOX
  ============================================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocusedEl = null;

  function openLightbox(triggerBtn) {
    const img = triggerBtn.querySelector('img');
    if (!img || triggerBtn.classList.contains('no-image')) return;

    lastFocusedEl = triggerBtn;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
    setTimeout(() => { lightboxImg.src = ''; }, 250);
  }

  document.querySelectorAll('.cert-expand').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(btn));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  /* ============================================================
     SCROLL REVEAL
  ============================================================ */
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .cert-card, .project-card, .social-card, .about-block, .writeups-empty'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if (prefersReducedMotion) {
    revealTargets.forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      revealObserver.observe(el);
    });
  }

})();
