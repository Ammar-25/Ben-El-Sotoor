/* =====================================================================
   authors.js — Authors listing page + Author details page.
   ===================================================================== */

/* ---------- Authors listing ---------- */
async function initAuthors() {
  const grid = document.getElementById('authors-grid');
  if (!grid) return;
  const authors = await AuthorService.all();
  grid.innerHTML = '';
  authors.forEach((a) => grid.appendChild(UI.authorCard(a)));
  UI.observeReveal(grid);
  window.addEventListener('page:rerender', () => { initAuthors(); });
}

/* ---------- Author details ---------- */
async function initAuthorDetails() {
  const root = document.getElementById('author-details');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || 1;
  const author = await AuthorService.getById(id);
  if (!author) { root.innerHTML = `<div class="state-block"><p>${I18N.t('common.noResults')}</p></div>`; return; }

  // Update document title for SEO
  document.title = `${I18N.pick(author.name)} — ${I18N.t('common.brand')}`;

  const achievements = I18N.pick(author.achievements).map((a) => `<li>${a}</li>`).join('');
  root.innerHTML = `
    <div class="author-banner">
      <img src="${author.banner}" alt="" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="author-profile">
      <img src="${author.photo}" alt="${I18N.pick(author.name)}" onerror="this.src='assets/images/ui/author-placeholder.png'">
      <div>
        <h1>${I18N.pick(author.name)}</h1>
        <div class="author-stats" style="justify-content:flex-start">
          <div><b>${author.booksCount}</b> <span data-i18n="common.books">${I18N.t('common.books')}</span></div>
          <div><b>${author.rating}</b> ★</div>
        </div>
      </div>
    </div>
    <p style="margin:1.5rem 0;color:var(--text-muted)">${I18N.pick(author.bio)}</p>
    <ul class="achievements">${achievements}</ul>
    <blockquote class="author-quote">"${I18N.pick(author.quote)}"</blockquote>
    <div class="section-head" style="text-align:start;margin-bottom:1rem"><h2 data-i18n="profile.purchased" style="font-size:1.4rem">${I18N.pick(author.name)} — ${I18N.t('common.books')}</h2></div>
    <div id="author-genre-filters" class="chips" style="margin-bottom:1.5rem"></div>
    <div class="grid grid-books" id="author-books"></div>`;

  const books = await BookService.byAuthor(author.id);
  const genres = [...new Set(books.map((b) => b.category))];
  const filters = document.getElementById('author-genre-filters');
  filters.innerHTML = [`<button class="chip active" data-genre="all">${I18N.t('common.all')}</button>`,
    ...genres.map((g) => `<button class="chip" data-genre="${g}">${I18N.t('categories.' + g)}</button>`)].join('');

  const booksHost = document.getElementById('author-books');
  const renderGenre = (g) => UI.renderBooks(booksHost, g === 'all' ? books : books.filter((b) => b.category === g));
  filters.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-genre]');
    if (!chip) return;
    filters.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderGenre(chip.dataset.genre);
  });
  renderGenre('all');

  window.addEventListener('page:rerender', () => initAuthorDetails());
}

document.addEventListener('DOMContentLoaded', () => {
  initAuthors();
  initAuthorDetails();
});
