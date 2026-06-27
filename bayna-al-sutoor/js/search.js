/* =====================================================================
   search.js — Search page with filters + live suggestions, recent
   searches (LocalStorage), keyword highlighting, and clear states
   (empty / loading / no-results).
   ===================================================================== */

const RECENT_KEY = 'bayn_recent_searches';

function getRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } }
function pushRecent(q) {
  q = q.trim(); if (!q) return;
  let list = getRecent().filter((x) => x !== q);
  list.unshift(q); list = list.slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}
function highlight(text, term) {
  if (!term) return text;
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

async function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  const grid = document.getElementById('search-results');
  const suggBox = document.getElementById('search-suggestions');
  const catSel = document.getElementById('search-category');
  const langSel = document.getElementById('search-language');
  const priceInput = document.getElementById('search-price');
  const priceLabel = document.getElementById('search-price-label');
  const countEl = document.getElementById('search-count');

  const state = { q: '', category: 'all', lang: 'all', maxPrice: Infinity };
  let activeSugg = -1;

  // Populate category options
  if (catSel) {
    const cats = await BookService.categoriesWithCounts();
    catSel.innerHTML = `<option value="all">${I18N.t('common.all')}</option>` +
      cats.map((c) => `<option value="${c.key}">${I18N.t('categories.' + c.key)}</option>`).join('');
  }

  async function runSearch() {
    grid.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div>';
    const res = await BookService.search({ q: state.q, category: state.category, lang: state.lang, maxPrice: state.maxPrice });
    let books = res.data;

    if (countEl) countEl.textContent = `${books.length} ${I18N.t('common.results')}`;

    if (!state.q && state.category === 'all' && state.maxPrice === Infinity) {
      grid.innerHTML = `<div class="state-block"><div class="state-icon">🔍</div><p>${I18N.t('common.search')}</p></div>`;
      renderRecent();
      return;
    }
    UI.renderBooks(grid, books, I18N.t('common.noResults'));
  }

  function renderRecent() {
    const recent = getRecent();
    if (!recent.length || !suggBox) return;
  }

  // Live suggestions
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    state.q = input.value;
    debounce = setTimeout(async () => {
      await showSuggestions();
      runSearch();
    }, 180);
  });

  async function showSuggestions() {
    if (!suggBox) return;
    const q = input.value.trim();
    activeSugg = -1;
    if (!q) {
      const recent = getRecent();
      if (!recent.length) { suggBox.classList.remove('open'); return; }
      suggBox.innerHTML = `<li class="recent-head">${I18N.t('common.search')}</li>` +
        recent.map((r) => `<li data-sugg="${r}">${UI.icon.search} ${r}</li>`).join('');
      suggBox.classList.add('open');
      wireSugg();
      return;
    }
    const results = await BookService.suggest(q, 6);
    if (!results.length) { suggBox.classList.remove('open'); return; }
    suggBox.innerHTML = results.map((b) =>
      `<li data-sugg="${I18N.pick(b.title)}" data-book="${b.id}">${UI.icon.search} ${highlight(I18N.pick(b.title), q)}</li>`).join('');
    suggBox.classList.add('open');
    wireSugg();
  }

  function wireSugg() {
    suggBox.querySelectorAll('[data-sugg]').forEach((li) => {
      li.addEventListener('click', () => {
        input.value = li.dataset.sugg; state.q = li.dataset.sugg;
        pushRecent(state.q); suggBox.classList.remove('open'); runSearch();
      });
    });
  }

  // Keyboard navigation for suggestions
  input.addEventListener('keydown', (e) => {
    const items = suggBox ? [...suggBox.querySelectorAll('[data-sugg]')] : [];
    if (e.key === 'ArrowDown') { e.preventDefault(); activeSugg = Math.min(activeSugg + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeSugg = Math.max(activeSugg - 1, 0); }
    else if (e.key === 'Enter') { if (items[activeSugg]) { e.preventDefault(); items[activeSugg].click(); } else { pushRecent(state.q); suggBox && suggBox.classList.remove('open'); runSearch(); } return; }
    else if (e.key === 'Escape') { suggBox && suggBox.classList.remove('open'); return; }
    items.forEach((it, i) => it.setAttribute('aria-selected', String(i === activeSugg)));
  });

  document.addEventListener('click', (e) => { if (suggBox && !e.target.closest('.search-bar')) suggBox.classList.remove('open'); });

  if (catSel) catSel.addEventListener('change', () => { state.category = catSel.value; runSearch(); });
  if (langSel) langSel.addEventListener('change', () => { state.lang = langSel.value; runSearch(); });
  if (priceInput) priceInput.addEventListener('input', () => {
    state.maxPrice = Number(priceInput.value) >= Number(priceInput.max) ? Infinity : Number(priceInput.value);
    if (priceLabel) priceLabel.textContent = state.maxPrice === Infinity ? I18N.t('common.all') : UI.money(priceInput.value);
    runSearch();
  });

  // Deep link: search.html?q=...
  const initialQ = new URLSearchParams(location.search).get('q');
  if (initialQ) { input.value = initialQ; state.q = initialQ; }
  runSearch();
  window.addEventListener('page:rerender', runSearch);
}

document.addEventListener('DOMContentLoaded', initSearch);
