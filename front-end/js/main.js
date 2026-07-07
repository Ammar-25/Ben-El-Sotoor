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
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  // Ensure AuthService is loaded on all pages
  if (!window.AuthService) {
    try {
      await loadScript("js/services/auth-service.js");
    } catch (e) {
      console.error("[Bootstrap] Failed to load AuthService:", e);
    }
  }

  const isAuthPage =
    currentPage === "login.html" || currentPage === "register.html";
  const isAdminPage = currentPage === "admin.html";

  // Check and run token refresh if needed
  if (window.AuthService && AuthService.shouldRefresh()) {
    const res = await AuthService.refresh();
    if (!res.ok && !isAuthPage) {
      location.href = "login.html";
      return;
    }
  }

  const hasToken = window.AuthService
    ? AuthService.isAuthenticated()
    : !!localStorage.getItem("auth_token");

  // 1. Unauthenticated users trying to access secure pages
  if (!isAuthPage && !hasToken) {
    location.href = "login.html";
    return;
  }

  // 2. Role-based routing for authenticated users
  if (hasToken && window.AuthService) {
    const isAdmin = AuthService.isAdmin();

    if (isAuthPage) {
      // Redirect away from auth pages if already logged in
      location.href = isAdmin ? "admin.html" : "index.html";
      return;
    }

    if (isAdmin && !isAdminPage) {
      // Admins are restricted to admin pages only
      location.href = "admin.html";
      return;
    }

    if (!isAdmin && isAdminPage) {
      // Regular users cannot access admin pages
      location.href = "index.html";
      return;
    }
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
  const [books, authors, readersCount, reviewsCountAPI] = await Promise.all([
    BookService.all(),
    AuthorService.all(),
    fetch("http://localhost:5033/api/stats/users/count")
      .then((res) => res.json())
      .catch(() => 0),
    fetch("http://localhost:5033/api/stats/reviews/count")
      .then((res) => res.json())
      .catch(() => 0),
  ]);
  const readers =
    readersCount > 0
      ? readersCount
      : authors.reduce((n, a) => n + a.followers, 0);
  const reviews =
    reviewsCountAPI > 0
      ? reviewsCountAPI
      : books.reduce((n, b) => n + b.reviewsCount, 0);
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
  const top = await ReviewService.top(3);
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

  // Load Profile Info
  async function loadProfileInfo() {
    let user = window.AuthService ? AuthService.getUser() : null;
    let profileData = {
      name: user ? user.name : "Guest",
      memberSince: new Date().getFullYear(),
    };
    let statsData = null;

    if (window.AuthService && AuthService.isAuthenticated()) {
      try {
        const res = await AuthService.fetchAuthenticated(
          "http://localhost:5033/api/profile/me",
        );
        if (res.ok) {
          const data = await res.json();
          profileData = {
            name: data.name || data.Name,
            memberSince: data.memberSince || data.MemberSince,
          };
          statsData = data;
        }
      } catch (err) {
        console.warn(
          "Could not fetch profile from backend, using token fallback:",
          err,
        );
      }
    }

    const headerHtml = `
      <img src="assets/images/ui/author-placeholder.png" alt="" width="100" height="100">
      <div style="flex: 1;">
        <h1>${profileData.name}</h1>
        <p><span data-i18n="profile.memberSince">${window.I18N ? I18N.t("profile.memberSince") : "عضو منذ"}</span> ${profileData.memberSince}</p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <a href="orders.html" class="btn btn-primary" data-i18n="orders.title">${window.I18N ? I18N.t("orders.title") : "الطلبات والمشتريات"}</a>
        <button class="btn btn-outline" id="logout-btn-header" data-i18n="auth.logout">${window.I18N ? I18N.t("auth.logout") : "تسجيل الخروج"}</button>
      </div>
    `;
    const headerDiv = document.querySelector(".profile-header");
    if (headerDiv) {
      headerDiv.innerHTML = headerHtml;
      const headerLogoutBtn = document.getElementById("logout-btn-header");
      if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener("click", async () => {
          if (window.AuthService) await AuthService.logout();
          else {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
          }
          location.href = "login.html";
        });
      }
    }

    if (statsData) {
      const statNums = document.querySelectorAll(".stat-num");
      if (statNums.length >= 4) {
        statNums[0].textContent =
          statsData.booksReadCount || statsData.BooksReadCount || 0;
        statNums[1].textContent =
          statsData.inProgressCount || statsData.InProgressCount || 0;
        statNums[2].textContent =
          statsData.favoritesCount || statsData.FavoritesCount || 0;
        statNums[3].textContent =
          statsData.reviewsCount || statsData.ReviewsCount || 0;
      }
    }
  }
  loadProfileInfo();

  // Load Progress
  async function renderProgress() {
    const progressHost = document.querySelector('[data-panel="progress"]');
    const readHost = document.getElementById("profile-read");
    if (!progressHost && !readHost) return;

    if (!window.AuthService || !AuthService.isAuthenticated()) {
      if (progressHost) progressHost.innerHTML = `<div class="state-block"><div class="state-icon">🔒</div><p data-i18n="nav.login">${window.I18N ? I18N.t("nav.login") : "تسجيل الدخول"}</p></div>`;
      if (readHost) readHost.innerHTML = `<div class="state-block"><div class="state-icon">🔒</div><p data-i18n="nav.login">${window.I18N ? I18N.t("nav.login") : "تسجيل الدخول"}</p></div>`;
      return;
    }

    try {
      const res = await AuthService.fetchAuthenticated(
        "http://localhost:5033/api/profile/progress",
      );
      if (res.ok) {
        const progressList = await res.json();
        
        if (progressHost) {
          const inProgress = progressList.filter(
            (p) => p.progressPercentage < 100,
          );

          if (!inProgress || !inProgress.length) {
            progressHost.innerHTML = `<div class="state-block"><div class="state-icon">📖</div><p data-i18n="profile.noProgress">${window.I18N ? I18N.t("profile.noProgress") : "You aren't reading any books right now. Start exploring!"}</p></div>`;
          } else {
            progressHost.innerHTML = inProgress
              .map((p) => {
                const title = p.bookTitle
                  ? p.bookTitle[window.I18N ? I18N.lang : "ar"] ||
                    p.bookTitle.ar ||
                    p.bookTitle.Ar
                  : "Book";
                return `<div class="progress-row"><div class="pr-head"><a href="book.html?id=${p.bookId}" style="text-decoration: none; font-weight: bold;">${title}</a><span>${p.progressPercentage}%</span></div><div class="progress-bar"><span style="width:${p.progressPercentage}%"></span></div></div>`;
              })
              .join("");
          }
        }

        if (readHost) {
          const readBooksList = progressList.filter(
            (p) => p.progressPercentage === 100,
          );

          if (!readBooksList || !readBooksList.length) {
            readHost.classList.remove("grid", "grid-books");
            readHost.innerHTML = `<div class="state-block"><div class="state-icon">📚</div><p data-i18n="profile.noReadBooks">${window.I18N ? I18N.t("profile.noReadBooks") : "You haven't finished any books yet. Keep reading!"}</p></div>`;
          } else {
            readHost.classList.remove("grid", "grid-books");
            readHost.innerHTML = `<div class="spinner"></div>`;
            const fullBooks = await Promise.all(
                readBooksList.map(p => BookService.getById(p.bookId))
            );
            const validBooks = fullBooks.filter(b => b);
            
            readHost.innerHTML = '';
            if (validBooks.length === 0) {
                 readHost.innerHTML = `<div class="state-block"><div class="state-icon">📚</div><p data-i18n="profile.noReadBooks">${window.I18N ? I18N.t("profile.noReadBooks") : "You haven't finished any books yet. Keep reading!"}</p></div>`;
            } else {
                 readHost.classList.add("grid", "grid-books");
                 UI.renderBooks(readHost, validBooks);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch progress from backend", err);
    }
  }
  renderProgress();

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
    if (!window.AuthService || !AuthService.isAuthenticated()) {
      favHost.classList.remove("grid", "grid-books");
      favHost.innerHTML = `<div class="state-block"><div class="state-icon">🔒</div><p data-i18n="nav.login">${I18N.t("nav.login")}</p></div>`;
      return;
    }

    try {
      const res = await AuthService.fetchAuthenticated(
        "http://localhost:5033/api/profile/favorites",
      );
      if (res.ok) {
        const books = await res.json();
        if (!books || !books.length) {
          favHost.classList.remove("grid", "grid-books");
          favHost.innerHTML = `<div class="state-block"><div class="state-icon">💜</div><p data-i18n="profile.noFavorites">${I18N.t("profile.noFavorites")}</p></div>`;
          return;
        }
        favHost.classList.add("grid", "grid-books");
        UI.renderBooks(favHost, books);
      } else {
        favHost.innerHTML = `<p>Failed to load favorites.</p>`;
      }
    } catch (err) {
      favHost.innerHTML = `<p>Error loading favorites.</p>`;
    }
  }
  renderFavorites();
  window.addEventListener("cart:changed", renderFavorites);
  window.addEventListener("page:rerender", renderFavorites);



  // My reviews
  const myRevHost = document.getElementById("profile-reviews");
  if (myRevHost) {
    if (!window.AuthService || !AuthService.isAuthenticated()) {
      myRevHost.innerHTML = `<div class="state-block"><div class="state-icon">🔒</div><p data-i18n="nav.login">${window.I18N ? I18N.t("nav.login") : "تسجيل الدخول"}</p></div>`;
    } else {
      const myReviews = await ReviewService.myReviews();
      if (!myReviews || !myReviews.length) {
        myRevHost.innerHTML = `<div class="state-block"><div class="state-icon">📝</div><p data-i18n="profile.noReviews">${window.I18N ? I18N.t("profile.noReviews") : "Looks like you haven't reviewed any books yet. Share your thoughts with the community!"}</p></div>`;
      } else {
        myRevHost.innerHTML = myReviews
          .map(
            (r) => {
              const bookName = r.bookTitle ? I18N.pick(r.bookTitle) : (r.bookId ? "Book #" + r.bookId : "Book");
              return `
          <div class="review-item"><div class="ri-head"><div style="display: flex; align-items: center; gap: 8px;"><b><a href="book.html?id=${r.bookId}">${bookName}</a></b> <span>${UI.stars(r.rating)}</span></div><span class="ri-date">${r.date}</span></div>
          <p>${I18N.pick(r.text)}</p></div>`;
            }
          )
          .join("");
      }
    }
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
          setTimeout(() => {
            if (AuthService.isAdmin()) {
              location.href = "admin.html";
            } else {
              location.href = "index.html";
            }
          }, 1000);
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
