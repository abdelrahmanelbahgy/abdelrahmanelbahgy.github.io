(() => {
  'use strict';

  /* Wire config-driven cross-site links */
  const aboutLink = document.getElementById('aboutLink');
  const portfolioLink = document.getElementById('portfolioLink');
  const githubLink = document.getElementById('githubLink');
  const footerPortfolioLink = document.getElementById('footerPortfolioLink');
  const footerGithubLink = document.getElementById('footerGithubLink');

  if (typeof SITE_CONFIG !== 'undefined') {
    if (aboutLink) aboutLink.href = SITE_CONFIG.PORTFOLIO_ABOUT_URL;
    if (portfolioLink) portfolioLink.href = SITE_CONFIG.PORTFOLIO_URL;
    if (githubLink) githubLink.href = SITE_CONFIG.GITHUB_URL;
    if (footerPortfolioLink) footerPortfolioLink.href = SITE_CONFIG.PORTFOLIO_URL;
    if (footerGithubLink) footerGithubLink.href = SITE_CONFIG.GITHUB_URL;
  }

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile nav toggle */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  /* Back to top */
  const toTopBtn = document.getElementById('toTop');
  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      toTopBtn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
