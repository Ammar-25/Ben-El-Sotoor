/* =====================================================================
   ui.js — Shared UI layer used by every page.
   Responsibilities:
     • Inject the shared navbar (#site-header) and footer (#site-footer).
     • SVG icon set, toast notifications, reveal-on-scroll, native lazy img.
     • Reusable component builders: book card, author card, category card,
       star rating, plan card.
     • Accessible book-details modal (open/close + focus trap + ESC).
   Depends on: I18N, Theme, BookService, AuthorService, ReviewService,
   Cart (for add-to-cart / favorites).
   ===================================================================== */

const UI = (() => {
  /* ---------- Inline SVG icons (single source of truth) ---------- */
  const icon = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 4 4M20 20l-1-1M19 5l1-1M4 20l1-1"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.6 3.2L6.7 14l-5-4.8 7-.9z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h3l-7 8 8 12h-6l-5-7-5 7H3l8-11L3 2h6l4 6z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.6 0-1.2-.1-1.8H12v3.5h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3.1a10 10 0 0 0 0 8.8z"/><path fill="#EA4335" d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.6l3.3 2.6C7.2 8 9.4 6.4 12 6.4z"/></svg>',
  };

  const PAGES = [
    { href: 'index.html', key: 'nav.home' },
    { href: 'library.html', key: 'nav.library' },
    { href: 'latest.html', key: 'nav.latest' },
    { href: 'categories.html', key: 'nav.categories' },
    { href: 'authors.html', key: 'nav.authors' },
    { href: 'quiz.html', key: 'nav.quiz' }
  ];

  const current = () => (location.pathname.split('/').pop() || 'index.html');

  /* ---------- Navbar ---------- */
  function buildNavbar() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const cur = current();
    const links = PAGES.map(
      (p) => `<a href="${p.href}" data-i18n="${p.key}" class="${p.href === cur ? 'active' : ''}">${I18N.t(p.key)}</a>`
    ).join('');
    const drawerLinks = PAGES.map(
      (p) => `<a href="${p.href}" data-i18n="${p.key}" class="${p.href === cur ? 'active' : ''}">${I18N.t(p.key)}</a>`
    ).join('');

    host.className = 'navbar';
    host.innerHTML = `
      <nav class="container" aria-label="Main">
        <a class="nav-logo" href="index.html" aria-label="${I18N.t('common.brand')}">
          <!-- LOGO: replace assets/images/ui/logo-placeholder.png with the official logo -->
          <img src="assets/images/ui/logo-placeholder.png" alt="${I18N.t('common.brand')}" width="38" height="38"
               onerror="this.style.display='none'">
          <span data-i18n="common.brand">${I18N.t('common.brand')}</span>
        </a>
        <div class="nav-links">${links}</div>
        <div class="nav-actions">
          <a class="icon-btn" href="cart.html" aria-label="${I18N.t('nav.cart')}" title="${I18N.t('nav.cart')}">${icon.cart}<span class="count-bubble" data-cart-count></span></a>
          <a class="icon-btn desktop-only" href="profile.html" aria-label="${I18N.t('nav.profile')}" title="${I18N.t('nav.profile')}">${icon.user}</a>
          <div class="lang-switch desktop-only" role="group" aria-label="Language">
            <button data-lang-btn="ar" aria-pressed="${I18N.lang === 'ar'}">العربية</button>
            <button data-lang-btn="en" aria-pressed="${I18N.lang === 'en'}">EN</button>
          </div>
          <button class="theme-toggle desktop-only" data-theme-toggle aria-label="${I18N.t('common.darkMode')}" aria-pressed="false">
            <span class="knob">${icon.moon}</span>
          </button>
          <button class="icon-btn nav-toggle" data-drawer-open aria-label="Menu" aria-expanded="false">${icon.menu}</button>
        </div>
      </nav>
      <div class="nav-drawer" data-drawer hidden>
        <div class="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="nav-drawer-head">
            <span class="nav-logo"><span data-i18n="common.brand">${I18N.t('common.brand')}</span></span>
            <button class="icon-btn" data-drawer-close aria-label="${I18N.t('common.close')}">✕</button>
          </div>
          ${drawerLinks}
          <a href="login.html" data-i18n="nav.login">${I18N.t('nav.login')}</a>
          <a href="profile.html" data-i18n="nav.profile">${I18N.t('nav.profile')}</a>
          <div class="lang-switch" role="group" aria-label="Language" style="margin-top:1rem">
            <button data-lang-btn="ar" aria-pressed="${I18N.lang === 'ar'}">العربية</button>
            <button data-lang-btn="en" aria-pressed="${I18N.lang === 'en'}">EN</button>
          </div>
          <button class="theme-toggle" data-theme-toggle aria-label="${I18N.t('common.darkMode')}" style="margin-top:1rem">
            <span class="knob">${icon.moon}</span>
          </button>
        </div>
      </div>`;
    wireNavbar(host);
    updateCounts();
  }

  function wireNavbar(host) {
    const drawer = host.querySelector('[data-drawer]');
    const openBtn = host.querySelector('[data-drawer-open]');
    const closeDrawer = () => { drawer.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); setTimeout(() => (drawer.hidden = true), 250); };
    const openDrawer = () => { drawer.hidden = false; requestAnimationFrame(() => drawer.classList.add('open')); openBtn.setAttribute('aria-expanded', 'true'); };
    openBtn.addEventListener('click', openDrawer);
    host.querySelectorAll('[data-drawer-close]').forEach((b) => b.addEventListener('click', closeDrawer));
    drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
    // Language buttons
    host.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', () => I18N.set(btn.dataset.langBtn));
    });
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    const link = (href, key) => `<li><a href="${href}" data-i18n="${key}">${I18N.t(key)}</a></li>`;
    host.className = 'footer';
    host.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <span class="nav-logo">
              <img src="assets/images/ui/logo-placeholder.png" alt="${I18N.t('common.brand')}" width="38" height="38" onerror="this.style.display='none'">
              <span data-i18n="common.brand">${I18N.t('common.brand')}</span>
            </span>
            <p data-i18n="footer.aboutText">${I18N.t('footer.aboutText')}</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook">${icon.fb}</a>
              <a href="#" aria-label="X">${icon.x}</a>
              <a href="#" aria-label="Instagram">${icon.ig}</a>
            </div>
          </div>
          <div class="footer-col">
            <h3 data-i18n="footer.quickLinks">${I18N.t('footer.quickLinks')}</h3>
            <ul>${link('library.html', 'nav.library')}${link('categories.html', 'nav.categories')}${link('authors.html', 'nav.authors')}</ul>
          </div>
          <div class="footer-col">
            <h3 data-i18n="footer.support">${I18N.t('footer.support')}</h3>
            <ul>${link('#', 'footer.contact')}${link('faq.html', 'footer.faq')}${link('#', 'footer.privacy')}${link('#', 'footer.terms')}</ul>
          </div>
          <div class="footer-col">
            <h3 data-i18n="footer.followUs">${I18N.t('footer.followUs')}</h3>
            <ul>${link('quiz.html', 'nav.quiz')}${link('reviews.html', 'nav.reviews')}</ul>
          </div>
        </div>
        <div class="footer-bottom"><span data-i18n="footer.rights">${I18N.t('footer.rights')}</span></div>
      </div>`;
  }

  /* ---------- Counts (cart + favorites bubbles) ---------- */
  function updateCounts() {
    const cartN = window.Cart ? Cart.count() : 0;
    const favN = window.Cart ? Cart.favCount() : 0;
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = cartN || ''; el.dataset.count = cartN; });
    document.querySelectorAll('[data-fav-count]').forEach((el) => { el.textContent = favN || ''; el.dataset.count = favN; });
    document.querySelectorAll('[data-fav-mirror]').forEach((el) => { el.textContent = favN; });
  }

  function onCartChanged() {
    updateCounts();
    if (window.Cart) {
      document.querySelectorAll('[data-fav]').forEach((btn) => {
        const on = Cart.isFav(btn.dataset.fav);
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
      // also update all data-add buttons on the page
      document.querySelectorAll('.book-card [data-add]').forEach((btn) => {
        const inCart = Cart.items().some(i => i.id === Number(btn.dataset.add));
        if (inCart) {
          btn.classList.add('added');
          btn.setAttribute('disabled', 'true');
          const textSpan = btn.querySelector('.btn-text');
          if (textSpan) {
            textSpan.dataset.i18n = 'common.added';
            textSpan.textContent = I18N.t('common.added');
          }
        } else {
          btn.classList.remove('added');
          btn.removeAttribute('disabled');
          const textSpan = btn.querySelector('.btn-text');
          if (textSpan) {
            textSpan.dataset.i18n = 'common.addToCart';
            textSpan.textContent = I18N.t('common.addToCart');
          }
        }
      });
    }
  }

  /* ---------- Helpers ---------- */
  const PLACEHOLDER_BOOK = 'assets/images/ui/book-placeholder.png';
  const PLACEHOLDER_AUTHOR = 'assets/images/ui/author-placeholder.png';

  function stars(rating) {
    const full = Math.round(rating);
    let html = '<span class="stars" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) html += i <= full ? icon.star : `<span style="opacity:.25">${icon.star}</span>`;
    html += '</span>';
    return html;
  }

  function money(n) { return `${n} ${I18N.t('common.currency')}`; }

  /* ---------- Book card builder ---------- */
  function bookCard(book) {
    const title = I18N.pick(book.title);
    const isFav = window.Cart && Cart.isFav(book.id);
    const inCart = window.Cart && window.Cart.items().some(i => i.id === Number(book.id));
    const discount = book.oldPrice > book.price
      ? `<span class="badge badge-off">-${Math.round((1 - book.price / book.oldPrice) * 100)}%</span>` : '';
    const newBadge = book.isNew ? `<span class="badge badge-new" data-i18n="common.new">${I18N.t('common.new')}</span>` : '';
    const card = document.createElement('article');
    card.className = 'book-card reveal';
    card.dataset.bookId = book.id;
    card.innerHTML = `
      <div class="book-cover">
        <div class="book-badges">${newBadge}${discount}</div>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-fav="${book.id}" aria-label="${I18N.t('common.favorite')}" aria-pressed="${!!isFav}">${icon.heart}</button>
        <img src="${book.cover}" alt="${title}" loading="lazy" width="230" height="307"
             onerror="this.onerror=null;this.src='${PLACEHOLDER_BOOK}'">
        <div class="book-actions">
          <button class="icon-btn" data-quickview="${book.id}" aria-label="${I18N.t('common.quickView')}" title="${I18N.t('common.quickView')}">${icon.eye}</button>
          <button class="icon-btn cart-icon-btn ${inCart ? 'added' : ''}" data-add="${book.id}" aria-label="${I18N.t('common.addToCart')}" title="${I18N.t('common.addToCart')}" ${inCart ? 'disabled' : ''}>${icon.cart}</button>
        </div>
      </div>
      <div class="book-body">
        <span class="badge badge-cat">${I18N.t('categories.' + book.category)}</span>
        <h3 class="book-title">${title}</h3>
        <p class="book-author author-name" data-author="${book.authorId}">${I18N.t('common.by')} …</p>
        <div class="book-meta">${stars(book.rating)} <span>${book.rating}</span> · <span>${book.reviewsCount} ${I18N.t('common.reviews')}</span></div>
        <p class="book-desc">${I18N.pick(book.description)}</p>
        <div class="book-foot">
          <div class="book-price">
            <span class="now">${money(book.price)}</span>
            ${book.oldPrice > book.price ? `<span class="was">${money(book.oldPrice)}</span>` : ''}
          </div>
          <button class="btn btn-primary global-cart-btn ${inCart ? 'added' : ''}" data-add="${book.id}" ${inCart ? 'disabled' : ''}>
            <span class="btn-text" data-i18n="${inCart ? 'common.added' : 'common.addToCart'}">${inCart ? I18N.t('common.added') : I18N.t('common.addToCart')}</span>
          </button>
        </div>
      </div>`;
    // Resolve author name asynchronously (kept out of the hot render path)
    AuthorService.nameOf(book.authorId, I18N.lang).then((name) => {
      const el = card.querySelector('.author-name');
      if (el) el.textContent = `${I18N.t('common.by')} ${name}`;
    });

    card.addEventListener('click', (e) => {
      // Prevent navigation if clicking on buttons or their children
      if (e.target.closest('button') || e.target.closest('a')) return;
      window.location.href = `book.html?id=${book.id}`;
    });

    return card;
  }

  /** Render a list of books into a container element. */
  function renderBooks(container, books, emptyMsg) {
    container.innerHTML = '';
    if (!books.length) {
      container.innerHTML = `<div class="state-block"><div class="state-icon">📚</div><p>${emptyMsg || I18N.t('common.noResults')}</p></div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    books.forEach((b) => frag.appendChild(bookCard(b)));
    container.appendChild(frag);
    observeReveal(container);
  }

  /* ---------- Author card ---------- */
  function authorCard(author) {
    const card = document.createElement('article');
    card.className = 'author-card reveal';
    card.innerHTML = `
      <img src="${author.photo}" alt="${I18N.pick(author.name)}" loading="lazy" width="96" height="96"
           onerror="this.onerror=null;this.src='${PLACEHOLDER_AUTHOR}'">
      <h3>${I18N.pick(author.name)}</h3>
      <p class="author-bio">${I18N.pick(author.bio)}</p>
      <div class="author-stats">
        <div><b>${author.booksCount}</b><span data-i18n="common.books">${I18N.t('common.books')}</span></div>
        <div><b>${(author.followers / 1000).toFixed(1)}k</b><span data-i18n="common.followers">${I18N.t('common.followers')}</span></div>
        <div><b>${author.rating}</b><span>★</span></div>
      </div>
      <a class="btn btn-outline" href="author-details.html?id=${author.id}" data-i18n="common.viewProfile">${I18N.t('common.viewProfile')}</a>`;
    return card;
  }

  /* ---------- Category card ---------- */
  const CAT_ICONS = { science: '🔬', novels: '📖', 'self-development': '🌱', history: '🏛️', poetry: '🪶', business: '💼', children: '🧸' };
  function categoryCard({ key, count }) {
    const a = document.createElement('a');
    a.className = 'cat-card reveal';
    a.href = `library.html?category=${key}`;
    a.innerHTML = `
      <span class="cat-icon" aria-hidden="true">${CAT_ICONS[key] || '📚'}</span>
      <h3 data-i18n="categories.${key}">${I18N.t('categories.' + key)}</h3>
      <span>${count} ${I18N.t('common.books')}</span>`;
    return a;
  }

  /* ---------- Toasts ---------- */
  function toast(msg, type = 'success') {
    let stack = document.querySelector('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; stack.setAttribute('aria-live', 'polite'); document.body.appendChild(stack); }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.setAttribute('role', 'status');
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2600);
  }

  /* ---------- Reveal-on-scroll ---------- */
  let revealObserver;
  function observeReveal(root = document) {
    if (!('IntersectionObserver' in window)) { root.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
      }, { threshold: 0.12 });
    }
    root.querySelectorAll('.reveal:not(.in)').forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Book-details modal (accessible) ---------- */
  let lastFocus = null;
  function ensureModal() {
    let m = document.getElementById('book-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'book-modal';
    m.className = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'modal-title');
    m.innerHTML = `<div class="modal-card"><button class="modal-close" data-modal-close aria-label="${I18N.t('common.close')}">✕</button><div class="modal-content"></div></div>`;
    document.body.appendChild(m);
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-modal-close]')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('open')) closeModal(); });
    return m;
  }

  async function openBook(id) {
    const book = await BookService.getById(id);
    if (!book) return;
    const [author, sum] = await Promise.all([
      AuthorService.getById(book.authorId),
      ReviewService.summary(book.id),
    ]);
    const m = ensureModal();
    const spec = (label, val) => `<div><dt>${label}</dt><dd>${val}</dd></div>`;
    const reviewsHtml = sum.reviews.slice(0, 2).map((r) =>
      `<div class="mini-review"><b>${I18N.pick(r.userName)} ${stars(r.rating)}</b>${I18N.pick(r.text)}</div>`).join('') ||
      `<p style="color:var(--text-muted)">${I18N.t('common.noResults')}</p>`;
    m.querySelector('.modal-content').innerHTML = `
      <div class="modal-body">
        <div class="modal-cover"><img src="${book.cover}" alt="${I18N.pick(book.title)}" onerror="this.src='${PLACEHOLDER_BOOK}'"></div>
        <div class="modal-info">
          <h2 id="modal-title">${I18N.pick(book.title)}</h2>
          <p class="modal-author">${I18N.t('common.by')} ${author ? I18N.pick(author.name) : ''}</p>
          <div class="book-meta">${stars(book.rating)} <span>${book.rating}</span> · ${book.reviewsCount} ${I18N.t('common.reviews')}</div>
          <p class="modal-desc">${I18N.pick(book.description)}</p>
          <dl class="modal-specs">
            ${spec(I18N.t('modal.publisher'), I18N.pick(book.publisher))}
            ${spec(I18N.t('modal.language'), I18N.pick(book.bookLanguage))}
            ${spec(I18N.t('modal.pages'), book.pages)}
            ${spec(I18N.t('modal.year'), book.year)}
            ${spec(I18N.t('modal.category'), I18N.t('categories.' + book.category))}
            ${spec(I18N.t('modal.rating'), book.rating + ' / 5')}
          </dl>
          <div class="book-price"><span class="now">${money(book.price)}</span>${book.oldPrice > book.price ? `<span class="was">${money(book.oldPrice)}</span>` : ''}</div>
          <div class="modal-reviews">
            <h3 data-i18n="modal.reviewsPreview">${I18N.t('modal.reviewsPreview')}</h3>
            ${reviewsHtml}
          </div>
          <div class="modal-cta">
            <button class="btn btn-primary" data-add="${book.id}" data-i18n="common.addToCart">${I18N.t('common.addToCart')}</button>
            <a class="btn btn-ghost" href="book.html?id=${book.id}" data-i18n="common.readSample">${I18N.t('common.readSample')}</a>
          </div>
        </div>
      </div>`;
    lastFocus = document.activeElement;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    trapFocus(m);
    m.querySelector('.modal-close').focus();
  }

  function closeModal() {
    const m = document.getElementById('book-modal');
    if (!m) return;
    m.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function trapFocus(modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = modal.querySelectorAll('button, [href], input, select, textarea');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Global delegated clicks (cards anywhere) ---------- */
  function wireGlobalClicks() {
    document.addEventListener('click', async (e) => {
      const qv = e.target.closest('[data-quickview]');
      const add = e.target.closest('[data-add]');
      const fav = e.target.closest('[data-fav]');
      const langBtn = e.target.closest('[data-lang-btn]');
      if (qv) { e.preventDefault(); openBook(qv.dataset.quickview); }
      if (add && window.Cart) { e.preventDefault(); Cart.add(add.dataset.add); }
      if (fav && window.Cart) {
        e.preventDefault();
        const on = await Cart.toggleFav(fav.dataset.fav);
        fav.classList.toggle('active', on);
        fav.setAttribute('aria-pressed', String(on));
      }
      if (langBtn && window.I18N) {
        e.preventDefault();
        I18N.set(langBtn.dataset.langBtn);
      }
    });
  }

  function init() {
    buildNavbar();
    buildFooter();
    wireGlobalClicks();
    observeReveal();
    // Re-render shared chrome + translate dynamic content on language change
    window.addEventListener('i18n:changed', () => { buildNavbar(); buildFooter(); I18N.apply(); window.dispatchEvent(new Event('page:rerender')); });
    window.addEventListener('cart:changed', onCartChanged);
  }

  return { init, icon, stars, money, bookCard, renderBooks, authorCard, categoryCard, categoryIcons: CAT_ICONS, toast, observeReveal, openBook, closeModal, updateCounts };
})();

window.UI = UI;
