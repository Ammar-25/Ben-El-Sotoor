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
    { href: 'categories.html', key: 'nav.categories' },
    { href: 'authors.html', key: 'nav.authors' },
    { href: '#', key: 'nav.articles' },
    { href: 'quotes.html', key: 'nav.quotes' },
  ];

  const current = () => (location.pathname.split('/').pop() || 'index.html');

  /* ---------- Navbar ---------- */
  function buildNavbar() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const cur = current();
    const isScrolled = window.scrollY > 20; // In a real app we'd attach a scroll listener to update this
    const textColor = isScrolled || cur !== 'index.html' ? '#4A2E1A' : '#F5EFE3';
    const activeBorderColor = isScrolled || cur !== 'index.html' ? '#B88A3B' : 'rgba(245,239,227,.5)';
    
    const links = PAGES.map(
      (p) => `<a href="${p.href}" data-i18n="${p.key}" class="transition-all duration-200 text-sm" style="font-family: var(--font); color: ${p.href === cur ? '#B88A3B' : textColor}; border-bottom: ${p.href === cur && p.key !== 'nav.home' ? '1px solid #B88A3B' : 'none'}; padding-bottom: 2px;" onmouseenter="this.style.color='#B88A3B'" onmouseleave="this.style.color='${p.href === cur ? '#B88A3B' : textColor}'">${I18N.t(p.key)}</a>`
    ).join('');

    const drawerLinks = PAGES.map(
      (p) => `<a href="${p.href}" data-i18n="${p.key}" class="w-full text-start py-3 transition-colors duration-200" style="font-family: var(--font); color: #4A2E1A; font-size: 0.95rem; border-bottom: 1px solid #EFE3CE;">${I18N.t(p.key)}</a>`
    ).join('');

    host.className = 'navbar fixed top-0 left-0 right-0 z-50 transition-all duration-500';
    host.style.background = isScrolled || cur !== 'index.html' ? "rgba(252,250,245,0.95)" : "transparent";
    host.style.backdropFilter = isScrolled || cur !== 'index.html' ? "blur(12px)" : "none";
    host.style.borderBottom = isScrolled || cur !== 'index.html' ? "1px solid #DDD0BB" : "none";
    host.style.boxShadow = isScrolled || cur !== 'index.html' ? "0 2px 20px rgba(90,55,30,.08)" : "none";

    host.innerHTML = `
      <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style="height: 72px;">
        <a class="flex items-center gap-3 group" href="index.html" aria-label="${I18N.t('common.brand')}">
          <div class="w-10 h-10 rounded flex items-center justify-center transition-all duration-300" style="border: 2px solid #B88A3B; background: rgba(184,138,59,.08);">
            <svg viewBox="0 0 24 24" fill="none" stroke="#B88A3B" stroke-width="2" aria-hidden="true" width="18" height="18"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <div style="font-family: 'Amiri', serif; font-size: 1.1rem; color: ${textColor}; line-height: 1.1; font-weight: 700;" data-i18n="common.brand">${I18N.t('common.brand')}</div>
            <div style="font-family: 'Lato', sans-serif; font-size: 0.55rem; color: ${isScrolled || cur !== 'index.html' ? '#B88A3B' : 'rgba(245,239,227,.7)'}; letter-spacing: 0.18em; text-transform: uppercase;">Between The Lines</div>
          </div>
        </a>
        <div class="hidden md:flex items-center gap-7">${links}</div>
        <div class="hidden md:flex items-center gap-4">
          <a class="transition-colors duration-200" href="search.html" style="color: ${textColor};" aria-label="${I18N.t('nav.search')}" title="${I18N.t('nav.search')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </a>
          <div class="lang-switch" role="group" aria-label="Language" style="display: flex;">
            <button data-lang-btn="ar" aria-pressed="${I18N.lang === 'ar'}" class="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200" style="border: 1px solid ${isScrolled || cur !== 'index.html' ? '#DDD0BB' : 'rgba(245,239,227,.3)'}; color: ${textColor}; font-family: 'Lato', sans-serif; font-size: 0.75rem;">عربي</button>
            <button data-lang-btn="en" aria-pressed="${I18N.lang === 'en'}" class="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200" style="border: 1px solid ${isScrolled || cur !== 'index.html' ? '#DDD0BB' : 'rgba(245,239,227,.3)'}; color: ${textColor}; font-family: 'Lato', sans-serif; font-size: 0.75rem;">EN</button>
          </div>
          <a class="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 relative" href="cart.html" aria-label="${I18N.t('nav.cart')}" title="${I18N.t('nav.cart')}" style="background: ${isScrolled || cur !== 'index.html' ? '#6B4423' : 'rgba(107,68,35,.8)'}; color: #F5EFE3; font-family: var(--font); font-size: 0.8rem; border: 1px solid rgba(184,138,59,.3);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="14" height="14"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span class="count-bubble" data-cart-count></span>
          </a>
          <a class="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200" href="login.html" aria-label="${I18N.t('nav.login')}" title="${I18N.t('nav.login')}" style="background: transparent; color: ${textColor}; border: 1px solid ${isScrolled || cur !== 'index.html' ? '#DDD0BB' : 'rgba(245,239,227,.3)'}; font-family: var(--font); font-size: 0.8rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
            <span data-i18n="nav.login">${I18N.t('nav.login')}</span>
          </a>
        </div>
        <button class="md:hidden nav-toggle" data-drawer-open aria-label="Menu" aria-expanded="false" style="color: ${textColor};">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="22" height="22"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>

      <div class="nav-drawer" data-drawer hidden style="background: rgba(74, 46, 26, .8); backdrop-filter: blur(8px);">
        <div class="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu" style="background: #F8F4EC; border-inline-start: 1px solid #DDD0BB; padding: 24px; padding-top: 16px;">
          <div class="flex items-center justify-between mb-8">
            <span class="nav-logo" style="font-family: 'Amiri', serif; font-size: 1.1rem; color: #4A2E1A; font-weight: 700;" data-i18n="common.brand">${I18N.t('common.brand')}</span>
            <button class="icon-btn" data-drawer-close aria-label="${I18N.t('common.close')}" style="color: #4A2E1A;">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="22" height="22"><path d="M18 2h3l-7 8 8 12h-6l-5-7-5 7H3l8-11L3 2h6l4 6z"/></svg>
            </button>
          </div>
          ${drawerLinks}
          <div class="flex gap-3 mt-8">
            <button data-lang-btn="${I18N.lang === 'ar' ? 'en' : 'ar'}" class="flex-1 py-2.5 rounded text-sm transition-all" style="border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);">
              ${I18N.lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <a href="login.html" class="flex-1 py-2.5 rounded text-sm text-center" style="background: #6B4423; color: #F5EFE3; font-family: var(--font);" data-i18n="nav.login">${I18N.t('nav.login')}</a>
          </div>
        </div>
      </div>`;
    wireNavbar(host);
    updateCounts();
    
    // Add scroll listener logic for dynamic navbar style
    if (cur === 'index.html') {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 20;
        host.style.background = scrolled ? "rgba(252,250,245,0.95)" : "transparent";
        host.style.backdropFilter = scrolled ? "blur(12px)" : "none";
        host.style.borderBottom = scrolled ? "1px solid #DDD0BB" : "none";
        host.style.boxShadow = scrolled ? "0 2px 20px rgba(90,55,30,.08)" : "none";
        
        const newColor = scrolled ? '#4A2E1A' : '#F5EFE3';
        host.querySelectorAll('.nav-logo div').forEach(el => {
          if(el.textContent.includes('بين')) el.style.color = newColor;
          else el.style.color = scrolled ? '#B88A3B' : 'rgba(245,239,227,.7)';
        });
        host.querySelectorAll('.nav-links a:not(.active)').forEach(el => { el.style.color = newColor; });
        const actions = host.querySelectorAll('.nav-actions a, .nav-actions button:not(.bg-brown)');
        if(actions.length > 0) {
          actions[0].style.color = newColor;
          actions[1].style.color = newColor;
          actions[1].style.borderColor = scrolled ? '#DDD0BB' : 'rgba(245,239,227,.3)';
          actions[2].style.color = newColor;
          actions[2].style.borderColor = scrolled ? '#DDD0BB' : 'rgba(245,239,227,.3)';
          actions[3].style.background = scrolled ? '#6B4423' : 'rgba(107,68,35,.8)';
        }
        const toggler = host.querySelector('.nav-toggle');
        if(toggler) toggler.style.color = newColor;
      }, { passive: true });
    }
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
    
    // Extracted footer column structure
    const cols = [
      {
        head: 'footer.col1Head',
        links: [
          { href: 'library.html', key: 'footer.col1Link1' },
          { href: 'authors.html', key: 'footer.col1Link2' },
          { href: 'categories.html', key: 'footer.col1Link3' },
          { href: 'quotes.html', key: 'footer.col1Link4' }
        ]
      },
      {
        head: 'footer.col2Head',
        links: [
          { href: 'profile.html', key: 'footer.col2Link1' },
          { href: 'profile.html', key: 'footer.col2Link2' },
          { href: 'profile.html', key: 'footer.col2Link3' },
          { href: 'profile.html', key: 'footer.col2Link4' }
        ]
      },
      {
        head: 'footer.col3Head',
        links: [
          { href: '#', key: 'footer.col3Link1' },
          { href: '#', key: 'footer.col3Link2' },
          { href: '#', key: 'footer.col3Link3' },
          { href: '#', key: 'footer.col3Link4' }
        ]
      }
    ];

    const columnsHtml = cols.map(col => `
      <div>
        <h5 class="mb-5 text-xs uppercase tracking-widest" style="font-family: 'Lato', sans-serif; color: #B88A3B; letter-spacing: 0.2em;" data-i18n="${col.head}">${I18N.t(col.head)}</h5>
        <div class="flex flex-col gap-3">
          ${col.links.map(l => `
            <a href="${l.href}" data-i18n="${l.key}" class="text-start text-sm transition-colors duration-200" style="font-family: var(--font); color: rgba(245,239,227,.5);" onmouseenter="this.style.color='#C9A96E'" onmouseleave="this.style.color='rgba(245,239,227,.5)'">
              ${I18N.t(l.key)}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    host.outerHTML = `
      <footer id="site-footer" style="background: #2A1A0E; border-top: 1px solid rgba(184,138,59,.2);">
        <div class="max-w-7xl mx-auto px-6 py-16">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 rounded flex items-center justify-center" style="border: 2px solid #B88A3B;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#B88A3B" stroke-width="2" aria-hidden="true" width="18" height="18"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <div>
                  <div style="font-family: 'Amiri', serif; font-size: 1.1rem; color: #F5EFE3; font-weight: 700;" data-i18n="common.brand">${I18N.t('common.brand')}</div>
                  <div style="font-family: 'Lato', sans-serif; font-size: 0.55rem; color: #B88A3B; letter-spacing: 0.18em;">BETWEEN THE LINES</div>
                </div>
              </div>
              <p style="font-family: var(--font); color: rgba(245,239,227,.5); font-size: 0.8rem; line-height: 1.8;" data-i18n="footer.aboutText">
                ${I18N.t('footer.aboutText')}
              </p>
            </div>
            ${columnsHtml}
          </div>
          <div class="mt-12 pt-6 flex items-center justify-between flex-wrap gap-4" style="border-top: 1px solid rgba(184,138,59,.12);">
            <span style="font-family: 'Lato', sans-serif; color: rgba(245,239,227,.3); font-size: 0.75rem;">
              © ${new Date().getFullYear()} بين السطور · Between The Lines. <span data-i18n="footer.rights">${I18N.t('footer.rights')}</span>
            </span>
            <span style="color: #B88A3B; font-size: 1rem;">✦</span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- Counts (cart + favorites bubbles) ---------- */
  function updateCounts() {
    const cartN = window.Cart ? Cart.count() : 0;
    const favN = window.Cart ? Cart.favCount() : 0;
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = cartN || ''; el.dataset.count = cartN; });
    document.querySelectorAll('[data-fav-count]').forEach((el) => { el.textContent = favN || ''; el.dataset.count = favN; });
    document.querySelectorAll('[data-fav-mirror]').forEach((el) => { el.textContent = favN; });
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
    const card = document.createElement('article');
    card.className = 'book-card reveal text-start w-full rounded overflow-hidden transition-all duration-500';
    card.dataset.bookId = book.id;
    // We try to generate a consistent accent color/gradient based on ID or use existing if any
    const colors = ["#6B4423", "#B88A3B", "#4A2E1A", "#68714F", "#9E4E3F"];
    const accent = colors[book.id % colors.length];
    
    card.innerHTML = `
      <div class="book-cover relative h-56 flex items-end p-5" style="background: linear-gradient(135deg, rgba(0,0,0,0.8), ${accent});">
        <div class="absolute inset-0 opacity-10" style="background-image: var(--paper-texture)"></div>
        <div class="absolute top-4 right-4 opacity-30" style="color: ${accent}; font-size: 2rem; font-family: 'Amiri', serif;">❧</div>
        <!-- Actual image overlaid with opacity if exists to match design's CSS covers -->
        <img src="${book.cover}" class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" onerror="this.style.display='none'" />
        
        <div class="relative z-10 w-full">
          <div class="text-xs mb-2 opacity-70" style="color: ${accent}; font-family: 'Lato', sans-serif; letter-spacing: 0.15em; text-transform: uppercase;">${I18N.t('categories.' + book.category)}</div>
          <div style="font-family: 'Amiri', serif; color: #F5EFE3; font-size: 1.25rem; line-height: 1.3; font-weight: 700;">${title}</div>
        </div>
        <div class="absolute left-0 top-0 w-3 h-full" style="background: rgba(0,0,0,.2)"></div>
        
        <div class="book-actions absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 hover:opacity-100 transition-opacity z-20">
          <button class="w-10 h-10 rounded-full bg-[#FCFAF5] flex items-center justify-center text-[#6B4423] hover:bg-[#6B4423] hover:text-[#FCFAF5] transition-colors" data-quickview="${book.id}" aria-label="${I18N.t('common.quickView')}">${icon.eye}</button>
          <button class="w-10 h-10 rounded-full bg-[#FCFAF5] flex items-center justify-center text-[#6B4423] hover:bg-[#6B4423] hover:text-[#FCFAF5] transition-colors" data-add="${book.id}" aria-label="${I18N.t('common.addToCart')}">${icon.cart}</button>
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="author-name" data-author="${book.authorId}" style="font-family: var(--font); color: #6B4423; font-size: 0.85rem; font-weight: 600;">${I18N.t('common.by')} …</span>
          <span style="font-family: 'Lato', sans-serif; color: #8A6848; font-size: 0.75rem;">${book.year || ''}</span>
        </div>
        <p class="mb-4 line-clamp-2 flex-1" style="font-family: var(--font); color: #6A5040; font-size: 0.82rem; line-height: 1.6;">
          ${I18N.pick(book.description)}
        </p>
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-[#DDD0BB]/50">
          <div class="flex items-center gap-1">
            ${stars(book.rating)}
          </div>
          <div class="flex gap-2">
            <button class="p-1.5 rounded transition-colors fav-btn ${isFav ? 'active' : ''}" style="color: ${isFav ? '#9E4E3F' : '#B88A3B'}" data-fav="${book.id}">${icon.heart}</button>
          </div>
        </div>
      </div>`;
    // Resolve author name asynchronously
    AuthorService.nameOf(book.authorId, I18N.lang).then((name) => {
      const el = card.querySelector('.author-name');
      if (el) el.textContent = name;
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
    const card = document.createElement('a');
    card.href = `author-details.html?id=${author.id}`;
    card.className = 'author-card rounded overflow-hidden transition-all duration-400 group block';
    card.style = 'background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.07); text-align: start; padding: 0;';
    card.innerHTML = `
      <div class="relative h-52 overflow-hidden">
        <img src="${author.photo}" alt="${I18N.pick(author.name)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.onerror=null;this.src='${PLACEHOLDER_AUTHOR}'">
        <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(74,46,26,.7) 0%, transparent 60%)"></div>
        <div class="absolute bottom-4 inset-x-4">
          <div style="font-family: 'Amiri', serif; color: #F5EFE3; font-size: 1.1rem; font-weight: 700;">${I18N.pick(author.name)}</div>
          <div style="font-family: 'Lato', sans-serif; color: #C9A96E; font-size: 0.7rem; letter-spacing: 0.1em;">${author.booksCount} ${I18N.t('common.books')}</div>
        </div>
      </div>
      <div class="p-5">
        <p style="font-family: var(--font); color: #6A5040; font-size: 0.82rem; line-height: 1.7;" class="line-clamp-3">
          ${I18N.pick(author.bio)}
        </p>
        <div class="mt-4 text-xs transition-colors duration-200 flex items-center gap-1" style="color: #B88A3B; font-family: var(--font);">
          ${I18N.t('common.viewProfile')}
          <span style="font-size: 14px;">${I18N.lang === 'ar' ? '‹' : '›'}</span>
        </div>
      </div>`;
    return card;
  }

  /* ---------- Category card ---------- */
  const CAT_ICONS = { 
    'arabic-lit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>',
    'philosophy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>',
    'history': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'poetry': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    'novels': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    'sufism': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    // Fallbacks for older keys
    'science': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2v2M15 2v2M12 17v4M12 21h4M8 21h4"/><path d="M17.5 7.5c-2.5-1-5.5-1-8 0L2 14c2.5 1 5.5 1 8 0l7.5-6.5z"/></svg>', 
    'self-development': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
    'business': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', 
    'children': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
  };
  const CAT_COLORS = { 'arabic-lit': '#6B4423', 'philosophy': '#4A2E1A', 'history': '#3D5A3E', 'poetry': '#4A3728', 'novels': '#5C3D2E', 'sufism': '#2C3E50', science: '#2C3E50', 'self-development': '#68714F', business: '#4A2E1A', children: '#B88A3B' };
  
  function categoryCard({ key, count }) {
    const a = document.createElement('a');
    a.className = 'cat-card-new flex flex-col items-center p-6 rounded text-center transition-all duration-300';
    const bg = CAT_COLORS[key] || '#6B4423';
    a.style = 'background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 2px 8px rgba(90,55,30,.05);';
    a.href = 'library.html?category=' + key;
    
    // Add hover listeners dynamically since we use inline styles for hover in React
    a.addEventListener('mouseenter', () => {
      a.style.background = bg;
      a.style.borderColor = bg;
      a.style.boxShadow = '0 8px 30px rgba(90,55,30,.2)';
      a.style.transform = 'translateY(-4px)';
      a.querySelector('.icon-box').style.background = 'rgba(255,255,255,.15)';
      a.querySelector('.cat-icon').style.color = '#F5EFE3';
      a.querySelector('.cat-title').style.color = '#F5EFE3';
      a.querySelector('.cat-count').style.color = 'rgba(245,239,227,.7)';
    });
    a.addEventListener('mouseleave', () => {
      a.style.background = '#FCFAF5';
      a.style.borderColor = '#DDD0BB';
      a.style.boxShadow = '0 2px 8px rgba(90,55,30,.05)';
      a.style.transform = 'none';
      a.querySelector('.icon-box').style.background = bg + '18';
      a.querySelector('.cat-icon').style.color = bg;
      a.querySelector('.cat-title').style.color = '#2A1A0E';
      a.querySelector('.cat-count').style.color = '#8A6848';
    });

    a.innerHTML = \`
      <div class="icon-box w-12 h-12 rounded flex items-center justify-center mb-4 transition-all duration-300" style="background: \${bg}18;">
        <div class="cat-icon w-6 h-6 transition-colors duration-300" style="color: \${bg};">\${CAT_ICONS[key] || CAT_ICONS['novels']}</div>
      </div>
      <div class="cat-title font-medium mb-1 transition-colors duration-300 text-sm" style="font-family: var(--font); color: #2A1A0E;">
        \${I18N.t('categories.' + key)}
      </div>
      <div class="cat-count text-xs transition-colors duration-300" style="font-family: 'Lato', sans-serif; color: #8A6848;">
        \${count} \${I18N.t('common.books')}
      </div>\`;
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
    m.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style="background: rgba(42, 26, 14, 0.85); backdrop-filter: blur(8px);">
        <div class="modal-card relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl transition-all duration-300 transform scale-95 opacity-0" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
          <button class="modal-close absolute top-4 end-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 z-10" data-modal-close aria-label="${I18N.t('common.close')}" style="background: #F8F4EC; color: #4A2E1A; border: 1px solid #DDD0BB;" onmouseenter="this.style.background='#F5EFE3'" onmouseleave="this.style.background='#F8F4EC'">✕</button>
          <div class="modal-content"></div>
        </div>
      </div>`;
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
    const spec = (label, val) => `<div class="flex justify-between py-3" style="border-bottom: 1px solid rgba(221,208,187,.5);"><dt style="font-family: var(--font); color: #8A6848;">${label}</dt><dd style="font-family: var(--font-heading); color: #2A1A0E; font-weight: 700;">${val}</dd></div>`;
    const reviewsHtml = sum.reviews.slice(0, 2).map((r) =>
      `<div class="p-4 rounded mb-3" style="background: #F8F4EC; border: 1px solid #DDD0BB;"><div class="flex items-center justify-between mb-2"><b style="font-family: var(--font-heading); color: #4A2E1A;">${I18N.pick(r.userName)}</b><div class="text-sm">${stars(r.rating)}</div></div><p style="font-family: var(--font); color: #6A5040; font-size: 0.9rem;">${I18N.pick(r.text)}</p></div>`).join('') ||
      `<p style="color:var(--text-muted)">${I18N.t('common.noResults')}</p>`;
    m.querySelector('.modal-content').innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-5 gap-8 p-6 md:p-10">
        <div class="md:col-span-2">
          <div class="rounded overflow-hidden shadow-lg mb-6 relative" style="border: 1px solid #DDD0BB;">
            <img src="${book.cover}" alt="${I18N.pick(book.title)}" class="w-full h-auto" onerror="this.src='${PLACEHOLDER_BOOK}'">
            <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: var(--paper-texture);"></div>
          </div>
          <div class="flex items-center justify-between mb-8 pb-6" style="border-bottom: 1px solid #DDD0BB;">
            <div class="flex flex-col">
              <span class="text-xs mb-1" style="font-family: 'Lato', sans-serif; color: #8A6848; letter-spacing: 0.1em; text-transform: uppercase;">السعر</span>
              <div class="flex items-center gap-3">
                <span style="font-family: var(--font-english); font-size: 1.8rem; font-weight: 700; color: #4A2E1A; line-height: 1;">${money(book.price)}</span>
                ${book.oldPrice > book.price ? `<span style="text-decoration: line-through; color: #B88A3B; font-family: var(--font-english); font-size: 1rem;">${money(book.oldPrice)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <button class="w-full py-3.5 rounded text-sm transition-colors duration-200" data-add="${book.id}" data-i18n="common.addToCart" style="background: #6B4423; color: #F5EFE3; font-family: var(--font); font-weight: 700;" onmouseenter="this.style.background='#B88A3B'" onmouseleave="this.style.background='#6B4423'">${I18N.t('common.addToCart')}</button>
            <button class="w-full py-3.5 rounded text-sm transition-colors duration-200" data-i18n="common.readSample" style="background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);" onmouseenter="this.style.background='#F5EFE3'" onmouseleave="this.style.background='#F8F4EC'">${I18N.t('common.readSample')}</button>
          </div>
        </div>
        <div class="md:col-span-3">
          <div class="mb-4">
            <h2 id="modal-title" class="mb-2" style="font-family: var(--font-heading); font-size: 2.2rem; color: #2A1A0E; line-height: 1.3;">${I18N.pick(book.title)}</h2>
            <p style="font-family: var(--font); color: #6B4423; font-size: 1.1rem;">${I18N.t('common.by')} <a href="author-details.html?id=${author?.id}" class="underline hover:text-[#B88A3B] transition-colors">${author ? I18N.pick(author.name) : ''}</a></p>
          </div>
          <div class="flex items-center gap-4 mb-8">
            <div class="flex items-center gap-1">${stars(book.rating)}</div>
            <span style="font-family: var(--font); color: #8A6848; font-size: 0.95rem;">${book.rating} · ${book.reviewsCount} ${I18N.t('common.reviews')}</span>
          </div>
          <div class="mb-8 p-6 rounded relative" style="background: #F8F4EC; border: 1px solid rgba(221,208,187,.5);">
            <div class="absolute top-2 inset-x-0 text-center opacity-[0.03]" style="font-family: 'Amiri', serif; font-size: 4rem; line-height: 1; color: #4A2E1A; pointer-events: none;">"</div>
            <p class="relative z-10" style="font-family: var(--font); color: #6A5040; line-height: 1.8;">${I18N.pick(book.description)}</p>
          </div>
          <div class="mb-10">
            <h3 class="mb-4" style="font-family: var(--font-heading); font-size: 1.2rem; color: #4A2E1A;" data-i18n="modal.details">التفاصيل</h3>
            <dl class="text-sm">
              ${spec(I18N.t('modal.publisher'), I18N.pick(book.publisher))}
              ${spec(I18N.t('modal.language'), I18N.pick(book.bookLanguage))}
              ${spec(I18N.t('modal.pages'), book.pages)}
              ${spec(I18N.t('modal.year'), book.year)}
              ${spec(I18N.t('modal.category'), I18N.t('categories.' + book.category))}
            </dl>
          </div>
          <div>
            <h3 class="mb-4 flex items-center justify-between" style="font-family: var(--font-heading); font-size: 1.2rem; color: #4A2E1A;">
              <span data-i18n="modal.reviewsPreview">${I18N.t('modal.reviewsPreview')}</span>
              <a href="reviews.html" style="font-family: var(--font); font-size: 0.85rem; color: #B88A3B;" class="hover:underline">عرض الكل</a>
            </h3>
            ${reviewsHtml}
          </div>
        </div>
      </div>`;
    lastFocus = document.activeElement;
    m.classList.add('open');
    setTimeout(() => {
        m.querySelector('.modal-card').classList.remove('scale-95', 'opacity-0');
        m.querySelector('.modal-card').classList.add('scale-100', 'opacity-100');
    }, 10);
    document.body.style.overflow = 'hidden';
    trapFocus(m);
    m.querySelector('.modal-close').focus();
  }

  function closeModal() {
    const m = document.getElementById('book-modal');
    if (!m) return;
    const card = m.querySelector('.modal-card');
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        m.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }, 300);
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
    document.addEventListener('click', (e) => {
      const qv = e.target.closest('[data-quickview]');
      const add = e.target.closest('[data-add]');
      const fav = e.target.closest('[data-fav]');
      if (qv) { e.preventDefault(); openBook(qv.dataset.quickview); }
      if (add && window.Cart) { e.preventDefault(); Cart.add(add.dataset.add); }
      if (fav && window.Cart) {
        e.preventDefault();
        const on = Cart.toggleFav(fav.dataset.fav);
        fav.classList.toggle('active', on);
        fav.setAttribute('aria-pressed', String(on));
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
    window.addEventListener('cart:changed', updateCounts);
  }

  return { init, icon, stars, money, bookCard, renderBooks, authorCard, categoryCard, categoryIcons: CAT_ICONS, toast, observeReveal, openBook, closeModal, updateCounts };
})();

window.UI = UI;
