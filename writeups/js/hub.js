(() => {
  'use strict';

  const grid = document.getElementById('writeupGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const platformSelect = document.getElementById('platformFilter');
  const osSelect = document.getElementById('osFilter');
  const difficultySelect = document.getElementById('difficultyFilter');
  const categorySelect = document.getElementById('categoryFilter');
  const clearBtn = document.getElementById('clearFilters');
  const resultsMeta = document.getElementById('resultsMeta');

  const DIFF_CLASS = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard', Insane: 'diff-insane' };

  function searchableString(w) {
    return [w.title, w.platform, w.os, w.difficulty, ...w.categories, ...w.tags]
      .join(' ').toLowerCase();
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const platform = platformSelect.value;
    const os = osSelect.value;
    const difficulty = difficultySelect.value;
    const category = categorySelect.value;

    let results = WRITEUPS.filter(w => {
      if (platform !== 'All' && w.platform !== platform) return false;
      if (os !== 'All' && w.os !== os) return false;
      if (difficulty !== 'All' && w.difficulty !== difficulty) return false;
      if (category !== 'All' && !w.categories.includes(category)) return false;
      if (q && !searchableString(w).includes(q)) return false;
      return true;
    });

    switch (sortSelect.value) {
      case 'oldest': results.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'az': results.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za': results.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'difficulty': results.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]); break;
      default: results.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest
    }

    render(results);
  }

  function render(results) {
    resultsMeta.innerHTML = `<strong>${results.length}</strong> writeup${results.length === 1 ? '' : 's'} found`;

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <strong>No writeups match those filters</strong>
          Try clearing a filter or searching a different term.
        </div>`;
      return;
    }

    grid.innerHTML = results.map((w, i) => `
      <article class="writeup-card" style="animation-delay:${Math.min(i, 8) * 45}ms">
        <a href="writeup.html?slug=${encodeURIComponent(w.slug)}" aria-label="Open writeup: ${escapeHtml(w.title)}">
          <div class="wc-cover">
            <img src="${w.cover}" alt="${escapeHtml(w.title)} cover" loading="lazy">
            <div class="wc-badge-row">
              <span class="wc-platform-badge">${escapeHtml(w.platformShort)}</span>
              ${w.sample ? '<span class="wc-sample-badge">Sample</span>' : ''}
            </div>
          </div>
        </a>
        <div class="wc-body">
          <div class="wc-meta-row">
            <span>${escapeHtml(w.os)}</span>
            <span>•</span>
            <span class="${DIFF_CLASS[w.difficulty] || ''}">${escapeHtml(w.difficulty)}</span>
          </div>
          <a href="writeup.html?slug=${encodeURIComponent(w.slug)}"><h3>${escapeHtml(w.title)}</h3></a>
          <p class="wc-excerpt">${escapeHtml(w.excerpt)}</p>
          <div class="wc-tags">
            ${w.tags.map(t => `<button type="button" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`).join('')}
          </div>
          <p class="wc-date">${escapeHtml(w.dateDisplay)}</p>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.wc-tags button').forEach(btn => {
      btn.addEventListener('click', () => {
        searchInput.value = btn.dataset.tag;
        applyFilters();
        if (typeof searchInput.scrollIntoView === 'function') {
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function clearFilters() {
    searchInput.value = '';
    platformSelect.value = 'All';
    osSelect.value = 'All';
    difficultySelect.value = 'All';
    categorySelect.value = 'All';
    sortSelect.value = 'newest';
    applyFilters();
  }

  [searchInput, sortSelect, platformSelect, osSelect, difficultySelect, categorySelect]
    .forEach(el => el.addEventListener('input', applyFilters));

  clearBtn.addEventListener('click', clearFilters);

  applyFilters();
})();
