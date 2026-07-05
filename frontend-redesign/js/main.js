/* =====================================================================
   main.js — Application bootstrap (loaded on every page, last).
   • Waits for translations, then initializes the shared UI (UI.init).
   • Renders HOME page dynamic sections (featured, stats, categories,
     testimonials) when their containers exist.
   • Handles the newsletter form.
   Page-specific logic lives in its own module (books.js, authors.js…)
   and is also guarded by element presence, so including all scripts on
   all pages is safe.
   ===================================================================== */

(async function bootstrap() {
  await I18N.ready;          // translations loaded + document dir/lang set
  document.addEventListener('DOMContentLoaded', start);
  if (document.readyState !== 'loading') start();
})();

let _started = false;
function start() {
  if (_started) return; _started = true;
  UI.init();
  initHome();
  initNewsletter();
  initProfile();
  initAuth();
  initReviews();
  window.addEventListener('page:rerender', initHome);
}

/* ---------- HOME PAGE ---------- */
async function initHome() {
  await renderFeatured();
  await renderStats();
  await renderHomeCategories();
  await renderHomeAuthors();
  await renderTestimonials();
  await renderHeroCovers();
  initQuotesCarousel();
}

async function renderHeroCovers() {
  const host = document.getElementById('hero-covers');
  if (!host) return;
  const books = await BookService.featured(3);
  host.innerHTML = books.map((b) =>
    `<img src="${b.cover}" alt="${I18N.pick(b.title)}" loading="eager" onerror="this.src='assets/images/ui/book-placeholder.png'">`).join('');
}

async function renderFeatured() {
  const host = document.getElementById('featured-books');
  if (!host) return;
  const books = await BookService.featured(8);
  UI.renderBooks(host, books);
}

async function renderStats() {
  const host = document.getElementById('stats-band');
  if (!host) return;
  const [books, authors] = await Promise.all([BookService.all(), AuthorService.all()]);
  const readers = authors.reduce((n, a) => n + a.followers, 0);
  const reviews = books.reduce((n, b) => n + b.reviewsCount, 0);
  const data = [
    { num: books.length, key: 'stats.books' },
    { num: authors.length, key: 'stats.authors' },
    { num: readers, key: 'stats.readers' },
    { num: reviews, key: 'stats.reviews' },
  ];
  host.innerHTML = data.map((d) =>
    `<div class="text-center reveal p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.05);"><div class="stat-num mb-2" data-count-to="${d.num}" style="font-family: var(--font-english); font-size: 3rem; font-weight: 700; color: #2A1A0E; line-height: 1;">0</div><div class="stat-label text-sm" style="font-family: var(--font); color: #8A6848;" data-i18n="${d.key}">${I18N.t(d.key)}</div></div>`).join('');
  UI.observeReveal(host);
  animateCounters(host);
}

function animateCounters(root) {
  root.querySelectorAll('[data-count-to]').forEach((el) => {
    const target = Number(el.dataset.countTo);
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        o.disconnect();
        const dur = 1200; const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          el.textContent = Math.floor(p * target).toLocaleString(I18N.lang === 'ar' ? 'ar-EG' : 'en');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

async function renderHomeCategories() {
  const host = document.getElementById('home-categories');
  if (!host) return;
  const cats = await BookService.categoriesWithCounts();
  host.innerHTML = '';
  cats.forEach((c) => host.appendChild(UI.categoryCard(c)));
  UI.observeReveal(host);
}

/* ---------- HOME AUTHORS ---------- */
async function renderHomeAuthors() {
  const host = document.getElementById('home-authors');
  if (!host) return;
  const authors = await AuthorService.all();
  const top = authors.slice(0, 4);
  host.innerHTML = '';
  top.forEach(author => host.appendChild(UI.authorCard(author)));
  UI.observeReveal(host);
}

/* ---------- QUOTES CAROUSEL ---------- */
function initQuotesCarousel() {
  const QUOTES = [
    {
      text: { ar: 'الكتاب وعاء مليء علماً، يفتح بابه لمن استحق الدخول.', en: 'A book is a vessel full of knowledge, opening its door to those who deserve to enter.' },
      author: { ar: 'الجاحظ', en: 'Al-Jahiz' },
      book: { ar: 'البيان والتبيين', en: 'The Book of Eloquence' }
    },
    {
      text: { ar: 'اقرأ وارقَ. فإن الكتاب سلّمٌ من أراد الصعود إلى النور.', en: 'Read and rise. For the book is a ladder for those who wish to ascend toward light.' },
      author: { ar: 'ابن القيم الجوزية', en: 'Ibn al-Qayyim' },
      book: { ar: 'مدارج السالكين', en: 'Madarij al-Salikin' }
    },
    {
      text: { ar: 'لو كانت الكتب تُباع بأعمار الناس لاشتريتها بعمري كله.', en: 'If books were sold for the price of lifetimes, I would buy them with my entire life.' },
      author: { ar: 'الإمام الشافعي', en: 'Imam al-Shafi\'i' },
      book: { ar: 'مناقب الشافعي', en: 'Manaqib al-Shafi\'i' }
    }
  ];

  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const bookEl = document.getElementById('quote-book');
  const dotsEl = document.getElementById('quote-dots');
  if (!textEl || !authorEl || !bookEl) return;

  let active = 0;

  function update(idx) {
    const q = QUOTES[idx];
    const lang = I18N.lang;
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = q.text[lang];
      authorEl.textContent = '\u2500 ' + q.author[lang];
      bookEl.textContent = q.book[lang];
      textEl.style.opacity = '1';
    }, 300);
    if (dotsEl) {
      dotsEl.querySelectorAll('[data-quote]').forEach((btn, i) => {
        btn.style.width = i === idx ? '24px' : '8px';
        btn.style.background = i === idx ? '#B88A3B' : 'rgba(184,138,59,.3)';
      });
    }
    active = idx;
  }

  // Wire dot buttons
  if (dotsEl) {
    dotsEl.querySelectorAll('[data-quote]').forEach(btn => {
      btn.addEventListener('click', () => update(Number(btn.dataset.quote)));
    });
  }

  // Auto-rotate every 5s
  setInterval(() => update((active + 1) % QUOTES.length), 5000);

  // Initial render with current language
  update(0);

  // Re-render on language change
  window.addEventListener('i18n:changed', () => update(active));
}

async function renderTestimonials() {
  const host = document.getElementById('testimonials');
  if (!host) return;
  const sum = await ReviewService.summary();
  const top = sum.reviews.filter((r) => r.rating === 5).slice(0, 3);
  host.innerHTML = top.map((r) => `
    <div class="reveal p-8 rounded relative text-center" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.05);">
      <div class="absolute top-4 inset-x-0 opacity-10" style="font-family: 'Amiri', serif; font-size: 5rem; line-height: 1; color: #B88A3B; pointer-events: none;">"</div>
      <div class="flex items-center justify-center gap-1 mb-4 relative z-10">${UI.stars(r.rating)}</div>
      <p class="mb-6 relative z-10" style="font-family: var(--font); color: #6A5040; line-height: 1.8;">"${I18N.pick(r.text)}"</p>
      <div class="flex flex-col items-center gap-2">
        <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style="background: rgba(184,138,59,.15); color: #B88A3B; font-family: var(--font); border: 1px solid #DDD0BB;">${I18N.pick(r.userName).charAt(0)}</div>
        <div style="font-family: var(--font-heading); color: #4A2E1A; font-weight: 700;">${I18N.pick(r.userName)}</div>
      </div>
    </div>`).join('');
  UI.observeReveal(host);
}

/* ---------- Newsletter ---------- */
function initNewsletter() {
  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      UI.toast(I18N.t('newsletter.success'));
      form.reset();
    });
  });
}

/* ---------- PROFILE PAGE ---------- */
async function initProfile() {
  const favHost = document.getElementById('profile-favorites');
  if (!favHost) return;

  // Tabs
  document.querySelectorAll('.profile-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.profile-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
  }));

  async function renderFavorites() {
    const ids = Cart.favorites();
    const all = await BookService.all();
    const books = all.filter((b) => ids.includes(b.id));
    if (!books.length) {
      favHost.innerHTML = `<div class="state-block"><div class="state-icon">💜</div><p data-i18n="profile.noFavorites">${I18N.t('profile.noFavorites')}</p></div>`;
      return;
    }
    UI.renderBooks(favHost, books);
  }
  renderFavorites();
  window.addEventListener('cart:changed', renderFavorites);
  window.addEventListener('page:rerender', renderFavorites);

  // Purchased = current cart contents (demo)
  const purchasedHost = document.getElementById('profile-purchased');
  if (purchasedHost) {
    const all = await BookService.all();
    const sample = all.slice(0, 3);
    UI.renderBooks(purchasedHost, sample);
  }

  // My reviews
  const myRevHost = document.getElementById('profile-reviews');
  if (myRevHost) {
    const sum = await ReviewService.summary();
    myRevHost.innerHTML = sum.reviews.slice(0, 3).map((r) => `
      <div class="p-5 rounded mb-4" style="background: #FCFAF5; border: 1px solid #DDD0BB;"><div class="flex items-center justify-between mb-3"><b style="font-family: var(--font-heading); color: #4A2E1A;">${I18N.pick(r.userName)}</b><span style="font-size: .85rem; color: #8A6848;">${r.date}</span></div>
      <div class="mb-3">${UI.stars(r.rating)}</div><p style="font-family: var(--font); color: #6A5040; line-height: 1.6;">${I18N.pick(r.text)}</p></div>`).join('');
  }
}

/* ---------- LOGIN / REGISTER PAGE ---------- */
function initAuth() {
  const tabs = document.querySelector('.auth-tabs');
  if (!tabs) return;
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabs.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    const isLogin = btn.dataset.tab === 'login';
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
  }));

  [loginForm, registerForm].forEach((form) => form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    UI.toast(I18N.t('auth.loginBtn') + ' ✓');
    setTimeout(() => (location.href = 'profile.html'), 800);
  }));

  document.querySelectorAll('[data-social]').forEach((b) => b.addEventListener('click', () => UI.toast(b.dataset.social + ' …')));
}

/* ---------- REVIEWS PAGE ---------- */
async function initReviews() {
  const host = document.getElementById('reviews-root');
  if (!host) return;
  const summaryHost = document.getElementById('reviews-summary');
  const listHost = document.getElementById('reviews-list');

  async function render() {
    const sum = await ReviewService.summary();
    if (summaryHost) {
      const total = sum.total || 1;
      const breakdown = [5, 4, 3, 2, 1].map((star) => {
        const pct = Math.round((sum.breakdown[star] / total) * 100);
        return `<div class="flex items-center gap-3 text-sm" style="font-family: var(--font); color: #6B4423;"><span class="w-8 shrink-0">${star} ★</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background: rgba(184,138,59,.15);"><div class="h-full rounded-full transition-all duration-1000" style="width:${pct}%; background: #B88A3B;"></div></div><span class="w-8 shrink-0 text-end" style="color: #8A6848;">${sum.breakdown[star]}</span></div>`;
      }).join('');
      summaryHost.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded mb-12 items-center" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.05);">
          <div class="text-center md:text-start md:border-l border-[#DDD0BB] pl-8">
            <div style="font-family: var(--font-english); font-size: 4rem; font-weight: 700; color: #2A1A0E; line-height: 1;">${sum.average}</div>
            <div class="flex items-center justify-center md:justify-start gap-1 my-2">${UI.stars(sum.average)}</div>
            <p style="color:var(--text-muted); font-family: var(--font);">${sum.total} ${I18N.t('common.reviews')}</p>
          </div>
          <div class="md:col-span-2 space-y-3">${breakdown}</div>
        </div>`;
    }
    if (listHost) {
      listHost.innerHTML = sum.reviews.map((r) => `
        <div class="p-6 rounded mb-4" style="background: #FCFAF5; border: 1px solid #DDD0BB;"><div class="flex items-center justify-between mb-4"><b style="font-family: var(--font-heading); color: #4A2E1A; font-size: 1.1rem;">${I18N.pick(r.userName)}</b><span style="font-size: .85rem; color: #8A6848;">${r.date}</span></div>
        <div class="mb-4">${UI.stars(r.rating)}</div><p style="font-family: var(--font); color: #6A5040; line-height: 1.7;">${I18N.pick(r.text)}</p></div>`).join('');
    }
  }
  await render();

  const form = document.getElementById('review-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = Number(form.querySelector('input[name="rating"]:checked')?.value || 5);
    const text = form.querySelector('[name="review"]').value.trim();
    if (!text) return;
    ReviewService.add({ bookId: 1, userName: { ar: 'أنت', en: 'You' }, rating, text: { ar: text, en: text } });
    UI.toast(I18N.t('reviews.thanks'));
    form.reset();
    render();
  });

  window.addEventListener('page:rerender', render);
}
