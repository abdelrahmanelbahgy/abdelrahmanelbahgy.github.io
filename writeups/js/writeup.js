(() => {
  'use strict';

  const DIFF_CLASS = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard', Insane: 'diff-insane' };

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const writeup = WRITEUPS.find(w => w.slug === slug);

  const root = document.getElementById('writeupRoot');
  const notFound = document.getElementById('notFound');

  if (!writeup) {
    root.style.display = 'none';
    notFound.style.display = 'block';
    return;
  }

  document.title = `${writeup.title} — GHOSTIVOO Writeups`;
  root.style.display = 'block';

  /* ---------- header ---------- */
  document.getElementById('wpPlatform').textContent = writeup.platformShort;
  document.getElementById('wpTitle').textContent = writeup.title;
  document.getElementById('wpMeta').textContent = `${writeup.os} • ${writeup.difficulty} • ${writeup.dateDisplay}`;

  const sampleTag = document.getElementById('wpSampleTag');
  if (writeup.sample) {
    sampleTag.style.display = 'inline-block';
    sampleTag.textContent = 'Sample content — for demonstration';
  } else {
    sampleTag.style.display = 'none';
  }

  document.getElementById('wpTags').innerHTML =
    writeup.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join('');

  const coverWrap = document.getElementById('wpCover');
  coverWrap.innerHTML = `<img src="${writeup.cover}" alt="${escapeHtml(writeup.title)} cover">`;

  /* ---------- TOC (desktop + mobile) ---------- */
  const tocList = writeup.sections.map((s, i) =>
    `<li><a href="#${s.id}" data-section="${s.id}">${escapeHtml(s.title)}</a></li>`
  ).join('');

  document.getElementById('wpToc').innerHTML =
    `<p class="wp-toc-label">ON THIS PAGE</p><ol>${tocList}</ol>`;

  document.getElementById('wpTocMobile').innerHTML = `
    <details>
      <summary class="wp-toc-label" style="cursor:pointer;display:inline-block;">ON THIS PAGE</summary>
      <ol style="margin-top:12px;">${tocList}</ol>
    </details>`;

  /* ---------- content sections ---------- */
  document.getElementById('wpContent').innerHTML = writeup.sections.map(s => `
    <section class="wp-section" id="${s.id}">
      <h2>${escapeHtml(s.title)}</h2>
      ${s.html}
    </section>
  `).join('');

  /* ---------- prev / next (array is pre-sorted newest -> oldest) ---------- */
  const idx = WRITEUPS.findIndex(w => w.slug === writeup.slug);
  const older = WRITEUPS[idx + 1]; // previous = published before this one
  const newer = WRITEUPS[idx - 1]; // next = published after this one

  const navEl = document.getElementById('wpNav');
  navEl.innerHTML = `
    ${older
      ? `<a class="wp-nav-link prev" href="writeup.html?slug=${encodeURIComponent(older.slug)}">
           <span class="wp-nav-label">← Previous Writeup</span>
           <span class="wp-nav-title">${escapeHtml(older.title)}</span>
         </a>`
      : `<div class="wp-nav-link prev wp-nav-placeholder"><span class="wp-nav-label">← Previous Writeup</span><span class="wp-nav-title">None</span></div>`
    }
    ${newer
      ? `<a class="wp-nav-link next" href="writeup.html?slug=${encodeURIComponent(newer.slug)}">
           <span class="wp-nav-label">Next Writeup →</span>
           <span class="wp-nav-title">${escapeHtml(newer.title)}</span>
         </a>`
      : `<div class="wp-nav-link next wp-nav-placeholder"><span class="wp-nav-label">Next Writeup →</span><span class="wp-nav-title">None</span></div>`
    }
  `;

  /* ---------- helpers ---------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- code block copy buttons ---------- */
  document.querySelectorAll('.code-block').forEach(block => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg><span>Copy</span>`;
    btn.addEventListener('click', () => {
      const code = block.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : block.textContent).then(() => {
        btn.classList.add('copied');
        btn.querySelector('span').textContent = 'Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.querySelector('span').textContent = 'Copy';
        }, 1600);
      });
    });
    block.appendChild(btn);
  });

  /* ---------- TOC scroll-spy ---------- */
  const sectionEls = Array.from(document.querySelectorAll('.wp-section'));
  const tocLinks = Array.from(document.querySelectorAll('#wpToc a'));

  if (sectionEls.length && tocLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = tocLinks.find(l => l.dataset.section === entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    sectionEls.forEach(sec => spy.observe(sec));
  }

  /* ---------- image lightbox with prev/next within same gallery ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGallery = [];
  let currentGalleryIndex = 0;

  function galleryFor(name) {
    return Array.from(document.querySelectorAll(`.writeup-img[data-lightbox="${name}"]`));
  }

  function showInLightbox(i) {
    const img = currentGallery[i];
    if (!img) return;
    currentGalleryIndex = i;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightboxPrev.hidden = currentGallery.length < 2;
    lightboxNext.hidden = currentGallery.length < 2;
  }

  function openLightbox(imgEl) {
    const groupName = imgEl.dataset.lightbox || 'single';
    currentGallery = galleryFor(groupName);
    const startIndex = currentGallery.indexOf(imgEl);
    showInLightbox(startIndex === -1 ? 0 : startIndex);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 250);
  }

  document.querySelectorAll('.writeup-img').forEach(img => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); } });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showInLightbox((currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length));
  lightboxNext.addEventListener('click', () => showInLightbox((currentGalleryIndex + 1) % currentGallery.length));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });
})();
