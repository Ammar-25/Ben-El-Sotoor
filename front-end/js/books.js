/* =====================================================================
   books.js — Listing pages: Library, Latest, Categories.
   Each initializer is guarded by a container id, so the file is safe to
   include everywhere. Sorting/filtering/pagination run client-side via
   BookService (never touching the JSON directly).
   ===================================================================== */

const PAGE_SIZE = 8;

/* ---------- Shared sort helper ---------- */
function sortBooks(books, mode) {
  const arr = [...books];
  switch (mode) {
    case 'priceLow': return arr.sort((a, b) => a.price - b.price);
    case 'priceHigh': return arr.sort((a, b) => b.price - a.price);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'newest':
    default: return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/* =====================================================================
   LIBRARY PAGE
   ===================================================================== */
async function initLibrary() {
  const grid = document.getElementById('library-grid');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get('category') || 'all',
    sort: 'newest',
    q: '',
    page: 1,
  };

  const chipsHost = document.getElementById('library-chips');
  const sortSel = document.getElementById('library-sort');
  const searchInput = document.getElementById('library-search');
  const pager = document.getElementById('library-pager');
  const countEl = document.getElementById('library-count');

  // Build category chips
  const cats = await BookService.categoriesWithCounts();
  const chipList = [{ key: 'all' }, ...cats];
  chipsHost.innerHTML = chipList.map((c) =>
    `<button class="chip ${c.key === state.category ? 'active' : ''}" data-chip="${c.key}">${c.key === 'all' ? I18N.t('common.all') : I18N.t('categories.' + c.key)}</button>`).join('');

  const authorsList = await AuthorService.all();
  const authorMap = new Map();
  authorsList.forEach(a => {
    let nameStr = '';
    if (a.name && typeof a.name === 'object') {
      nameStr = `${a.name.ar || ''} ${a.name.en || ''}`;
    } else {
      nameStr = a.name || a.Name || '';
    }
    authorMap.set(a.id, nameStr.toLowerCase());
  });

  async function render() {
    let books = await BookService.byCategory(state.category);
    if (state.q) { 
      const t = state.q.toLowerCase(); 
      books = books.filter((b) => {
        const titleMatch = I18N.pick(b.title).toLowerCase().includes(t) || b.title.en.toLowerCase().includes(t);
        const authorMatch = b.authorId && authorMap.has(b.authorId) && authorMap.get(b.authorId).includes(t);
        return titleMatch || authorMatch;
      }); 
    }
    books = sortBooks(books, state.sort);

    if (countEl) countEl.textContent = `${books.length} ${I18N.t('common.results')}`;

    const pages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const slice = books.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    UI.renderBooks(grid, slice);

    // Pagination
    if (pager) {
      pager.innerHTML = '';
      if (pages > 1) {
        const mk = (label, page, disabled, active) =>
          `<button class="chip ${active ? 'active' : ''}" data-page="${page}" ${disabled ? 'disabled' : ''}>${label}</button>`;
        let html = mk('‹', state.page - 1, state.page === 1);
        for (let i = 1; i <= pages; i++) html += mk(i, i, false, i === state.page);
        html += mk('›', state.page + 1, state.page === pages);
        pager.innerHTML = html;
        pager.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => { state.page = Number(b.dataset.page); render(); window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' }); }));
      }
    }
  }

  chipsHost.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    state.category = chip.dataset.chip; state.page = 1;
    chipsHost.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    render();
  });
  if (sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
  if (searchInput) searchInput.addEventListener('input', () => { state.q = searchInput.value; state.page = 1; render(); });

  render();
  window.addEventListener('page:rerender', render);
}

/* =====================================================================
   LATEST PAGE (weekly / monthly / yearly)
   ===================================================================== */
async function initLatest() {
  const grid = document.getElementById('latest-grid');
  if (!grid) return;
  const chips = document.getElementById('latest-filters');
  let range = 'monthly';

  async function render() {
    const books = await BookService.latest(range);
    UI.renderBooks(grid, books);
  }
  if (chips) {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-range]');
      if (!chip) return;
      range = chip.dataset.range;
      chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
      render();
    });
  }
  render();
  window.addEventListener('page:rerender', render);
}

/* =====================================================================
   CATEGORIES PAGE — category cards + books under selected category
   ===================================================================== */
async function initCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  const booksHost = document.getElementById('category-books');
  const booksTitle = document.getElementById('category-books-title');

  const cats = await BookService.categoriesWithCounts();
  grid.innerHTML = '';
  cats.forEach((c) => {
    const card = UI.categoryCard(c);
    card.href = 'javascript:void(0)';
    card.addEventListener('click', () => showCategory(c.key));
    grid.appendChild(card);
  });
  UI.observeReveal(grid);

  async function showCategory(key) {
    const books = await BookService.byCategory(key);
    if (booksTitle) booksTitle.textContent = I18N.t('categories.' + key);
    if (booksHost) { UI.renderBooks(booksHost, books); booksHost.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  // Show first category by default
  if (cats.length) showCategory(cats[0].key);
  window.addEventListener('page:rerender', () => initCategories());
}

document.addEventListener('DOMContentLoaded', () => {
  initLibrary();
  initLatest();
  initCategories();
});
