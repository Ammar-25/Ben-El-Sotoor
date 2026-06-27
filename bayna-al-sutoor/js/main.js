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
  const currentPage = location.pathname.split("/").pop() || "index.html";

  // Helper to dynamically load dependency scripts
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  // Ensure AuthService is loaded on all pages
  if (!window.AuthService) {
    try {
      await loadScript('js/services/auth-service.js');
    } catch (e) {
      console.error('[Bootstrap] Failed to load AuthService:', e);
    }
  }

  const isAuthPage = currentPage === "login.html" || currentPage === "register.html";

  // Check and run token refresh if needed
  if (window.AuthService && AuthService.shouldRefresh()) {
    const res = await AuthService.refresh();
    if (!res.ok && !isAuthPage) {
      location.href = 'login.html';
      return;
    }
  }

  const hasToken = window.AuthService ? AuthService.isAuthenticated() : !!localStorage.getItem("auth_token");

  // Authorization Guard: All non-auth pages require a valid token
  if (!isAuthPage && !hasToken) {
    location.href = "login.html";
    return;
  }

  // Already authenticated guard: Redirect logged-in users away from auth pages
  if (isAuthPage && hasToken) {
    location.href = "index.html";
    return;
  }

  await I18N.ready; // translations loaded + document dir/lang set
  document.addEventListener("DOMContentLoaded", start);
  if (document.readyState !== "loading") start();
})();

let _started = false;
function start() {
  if (_started) return;
  _started = true;
  UI.init();
  initHome();
  initNewsletter();
  initProfile();
  initAuth();
  initReviews();
  window.addEventListener("page:rerender", initHome);
}

/* ---------- HOME PAGE ---------- */
async function initHome() {
  await renderFeatured();
  await renderStats();
  await renderHomeCategories();
  await renderTestimonials();
  await renderHeroCovers();
}

async function renderHeroCovers() {
  const host = document.getElementById("hero-covers");
  if (!host) return;
  const books = await BookService.featured(3);
  host.innerHTML = books
    .map(
      (b) =>
        `<img src="${b.cover}" alt="${I18N.pick(b.title)}" loading="eager" onerror="this.src='assets/images/ui/book-placeholder.png'">`,
    )
    .join("");
}

async function renderFeatured() {
  const host = document.getElementById("featured-books");
  if (!host) return;
  const books = await BookService.featured(8);
  UI.renderBooks(host, books);
}

async function renderStats() {
  const host = document.getElementById("stats-band");
  if (!host) return;
  const [books, authors] = await Promise.all([
    BookService.all(),
    AuthorService.all(),
  ]);
  const readers = authors.reduce((n, a) => n + a.followers, 0);
  const reviews = books.reduce((n, b) => n + b.reviewsCount, 0);
  const data = [
    { num: books.length, key: "stats.books" },
    { num: authors.length, key: "stats.authors" },
    { num: readers, key: "stats.readers" },
    { num: reviews, key: "stats.reviews" },
  ];
  host.innerHTML = data
    .map(
      (d) =>
        `<div class="stat-card reveal"><div class="stat-num" data-count-to="${d.num}">0</div><div class="stat-label" data-i18n="${d.key}">${I18N.t(d.key)}</div></div>`,
    )
    .join("");
  UI.observeReveal(host);
  animateCounters(host);
}

function animateCounters(root) {
  root.querySelectorAll("[data-count-to]").forEach((el) => {
    const target = Number(el.dataset.countTo);
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          o.disconnect();
          const dur = 1200;
          const t0 = performance.now();
          const step = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.floor(p * target).toLocaleString(
              I18N.lang === "ar" ? "ar-EG" : "en",
            );
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
  });
}

async function renderHomeCategories() {
  const host = document.getElementById("home-categories");
  if (!host) return;
  const cats = await BookService.categoriesWithCounts();
  host.innerHTML = "";
  cats.forEach((c) => host.appendChild(UI.categoryCard(c)));
  UI.observeReveal(host);
}

async function renderTestimonials() {
  const host = document.getElementById("testimonials");
  if (!host) return;
  const sum = await ReviewService.summary();
  const top = sum.reviews.filter((r) => r.rating === 5).slice(0, 3);
  host.innerHTML = top
    .map(
      (r) => `
    <div class="testimonial reveal">
      <div class="book-meta">${UI.stars(r.rating)}</div>
      <p>"${I18N.pick(r.text)}"</p>
      <div class="who">
        <div class="author-card-avatar" style="width:44px;height:44px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;font-weight:800;color:var(--brand)">${I18N.pick(r.userName).charAt(0)}</div>
        <div><b>${I18N.pick(r.userName)}</b></div>
      </div>
    </div>`,
    )
    .join("");
  UI.observeReveal(host);
}

/* ---------- Newsletter ---------- */
function initNewsletter() {
  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      UI.toast(I18N.t("newsletter.success"));
      form.reset();
    });
  });
}

/* ---------- PROFILE PAGE ---------- */
async function initProfile() {
  const favHost = document.getElementById("profile-favorites");
  if (!favHost) return;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (window.AuthService) {
        await AuthService.logout();
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
      location.href = "login.html";
    });
  }

  // Tabs
  document.querySelectorAll(".profile-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".profile-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll("[data-panel]").forEach((p) => {
        p.hidden = p.dataset.panel !== tab.dataset.tab;
      });
    }),
  );

  async function renderFavorites() {
    const ids = Cart.favorites();
    const all = await BookService.all();
    const books = all.filter((b) => ids.includes(b.id));
    if (!books.length) {
      favHost.innerHTML = `<div class="state-block"><div class="state-icon">💜</div><p data-i18n="profile.noFavorites">${I18N.t("profile.noFavorites")}</p></div>`;
      return;
    }
    UI.renderBooks(favHost, books);
  }
  renderFavorites();
  window.addEventListener("cart:changed", renderFavorites);
  window.addEventListener("page:rerender", renderFavorites);

  // Purchased = current cart contents (demo)
  const purchasedHost = document.getElementById("profile-purchased");
  if (purchasedHost) {
    const all = await BookService.all();
    const sample = all.slice(0, 3);
    UI.renderBooks(purchasedHost, sample);
  }

  // My reviews
  const myRevHost = document.getElementById("profile-reviews");
  if (myRevHost) {
    const sum = await ReviewService.summary();
    myRevHost.innerHTML = sum.reviews
      .slice(0, 3)
      .map(
        (r) => `
      <div class="review-item"><div class="ri-head"><b>${I18N.pick(r.userName)}</b><span class="ri-date">${r.date}</span></div>
      <div class="book-meta">${UI.stars(r.rating)}</div><p>${I18N.pick(r.text)}</p></div>`,
      )
      .join("");
  }
}

/* ---------- LOGIN / REGISTER PAGE ---------- */
function initAuth() {
  const tabs = document.querySelector(".auth-tabs");
  if (!tabs) return;
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  tabs.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      tabs
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      const isLogin = btn.dataset.tab === "login";
      loginForm.hidden = !isLogin;
      registerForm.hidden = isLogin;
    }),
  );

  [loginForm, registerForm].forEach((form) => {
    if (!form) return;
    const isLogin = form.id === "login-form";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      if (isLogin) {
        const email = document.getElementById("login-email").value.trim();
        const pass = document.getElementById("login-pass").value;

        if (!email || !pass) {
          UI.toast(I18N.t("auth.validationError"), "error");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18N.t("common.loading");

        const res = await AuthService.login(email, pass);

        if (res.ok) {
          UI.toast(I18N.t("auth.loginSuccess"), "success");
          setTimeout(() => (location.href = "index.html"), 1000);
        } else {
          UI.toast(res.message, "error");
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      } else {
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const pass = document.getElementById("reg-pass").value;
        const confirm = document.getElementById("reg-confirm").value;

        if (!name || !email || !pass || !confirm) {
          UI.toast(I18N.t("auth.validationError"), "error");
          return;
        }

        if (pass !== confirm) {
          UI.toast(I18N.t("auth.passwordMismatch"), "error");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = I18N.t("common.loading");

        const res = await AuthService.register(name, email, pass);

        if (res.ok) {
          UI.toast(I18N.t("auth.registerSuccess"), "success");
          setTimeout(() => (location.href = "index.html"), 1000);
        } else {
          UI.toast(res.message, "error");
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  });

  document
    .querySelectorAll("[data-social]")
    .forEach((b) =>
      b.addEventListener("click", () => UI.toast(b.dataset.social + " …")),
    );
}

/* ---------- REVIEWS PAGE ---------- */
async function initReviews() {
  const host = document.getElementById("reviews-root");
  if (!host) return;
  const summaryHost = document.getElementById("reviews-summary");
  const listHost = document.getElementById("reviews-list");

  async function render() {
    const sum = await ReviewService.summary();
    if (summaryHost) {
      const total = sum.total || 1;
      const breakdown = [5, 4, 3, 2, 1]
        .map((star) => {
          const pct = Math.round((sum.breakdown[star] / total) * 100);
          return `<div class="rating-bar"><span>${star} ★</span><div class="track"><span style="width:${pct}%"></span></div><span>${sum.breakdown[star]}</span></div>`;
        })
        .join("");
      summaryHost.innerHTML = `
        <div class="reviews-score">
          <div class="big">${sum.average}</div>
          <div class="book-meta" style="justify-content:center">${UI.stars(sum.average)}</div>
          <p style="color:var(--text-muted)">${sum.total} ${I18N.t("common.reviews")}</p>
        </div>
        <div>${breakdown}</div>`;
    }
    if (listHost) {
      listHost.innerHTML = sum.reviews
        .map(
          (r) => `
        <div class="review-item"><div class="ri-head"><b>${I18N.pick(r.userName)}</b><span class="ri-date">${r.date}</span></div>
        <div class="book-meta">${UI.stars(r.rating)}</div><p>${I18N.pick(r.text)}</p></div>`,
        )
        .join("");
    }
  }
  await render();

  const form = document.getElementById("review-form");
  if (form)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rating = Number(
        form.querySelector('input[name="rating"]:checked')?.value || 5,
      );
      const text = form.querySelector('[name="review"]').value.trim();
      if (!text) return;
      ReviewService.add({
        bookId: 1,
        userName: { ar: "أنت", en: "You" },
        rating,
        text: { ar: text, en: text },
      });
      UI.toast(I18N.t("reviews.thanks"));
      form.reset();
      render();
    });

  window.addEventListener("page:rerender", render);
}
