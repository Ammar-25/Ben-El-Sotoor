/* =====================================================================
   admin.js — Logic for Admin Dashboard.
   ===================================================================== */

let currentUsersPage = 1;
let currentUsersTotalPages = 1;
const USERS_PER_PAGE = 10;

let currentOrdersPage = 1;
let currentOrdersTotalPages = 1;
const ORDERS_PER_PAGE = 10;

let currentBooksPage = 1;
let currentBooksTotalPages = 1;
const BOOKS_PER_PAGE = 10;

document.addEventListener("DOMContentLoaded", () => {
  // Authentication check
  if (typeof AuthService !== "undefined") {
    if (!AuthService.isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }
  }

  initAdminTabs();
  loadAdminData();

  // Re-render pagination text on language change
  window.addEventListener("i18n:changed", () => {
    updateUsersPagination(currentUsersPage, currentUsersTotalPages);
    updateOrdersPagination(currentOrdersPage, currentOrdersTotalPages);
    if (typeof updateBooksPagination === "function") {
      updateBooksPagination(currentBooksPage, currentBooksTotalPages);
    }

    // Re-render the tables to update translated text if they are currently visible
    loadRecentOrders();
    const ordersPanel = document.querySelector(
      '.admin-panel[data-panel="orders"]',
    );
    if (ordersPanel && !ordersPanel.hidden) {
      loadAdminOrders(currentOrdersPage);
    }

    const booksPanel = document.querySelector(
      '.admin-panel[data-panel="books"]',
    );
    if (booksPanel && !booksPanel.hidden) {
      if (typeof loadAdminBooks === "function") {
        loadAdminBooks(currentBooksPage);
      }
    }
  });

  // Setup pagination listeners
  const prevBtn = document.getElementById("users-prev-btn");
  const nextBtn = document.getElementById("users-next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentUsersPage > 1) {
        loadAdminUsers(currentUsersPage - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      loadAdminUsers(currentUsersPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const prevOrdersBtn = document.getElementById("orders-prev-btn");
  const nextOrdersBtn = document.getElementById("orders-next-btn");

  if (prevOrdersBtn) {
    prevOrdersBtn.addEventListener("click", () => {
      if (currentOrdersPage > 1) {
        loadAdminOrders(currentOrdersPage - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (nextOrdersBtn) {
    nextOrdersBtn.addEventListener("click", () => {
      loadAdminOrders(currentOrdersPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const prevBooksBtn = document.getElementById("books-prev-btn");
  const nextBooksBtn = document.getElementById("books-next-btn");

  if (prevBooksBtn) {
    prevBooksBtn.addEventListener("click", () => {
      if (currentBooksPage > 1) {
        loadAdminBooks(currentBooksPage - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (nextBooksBtn) {
    nextBooksBtn.addEventListener("click", () => {
      loadAdminBooks(currentBooksPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (typeof AuthService !== "undefined") {
        await AuthService.logout();
      }
      window.location.href = "login.html";
    });
  }

  // Setup search listener for books
  const booksSearchInput = document.getElementById("admin-books-search");
  if (booksSearchInput) {
    let debounceTimer;
    booksSearchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadAdminBooks(1);
      }, 300);
    });
  }
});

function initAdminTabs() {
  const tabButtons = document.querySelectorAll(".admin-nav-item");
  const panels = document.querySelectorAll(".admin-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => {
        p.hidden = true;
        p.classList.remove("active");
      });

      btn.classList.add("active");
      const targetPanel = document.querySelector(
        `.admin-panel[data-panel="${btn.dataset.tab}"]`,
      );
      if (targetPanel) {
        targetPanel.hidden = false;
        setTimeout(() => targetPanel.classList.add("active"), 10);
      }

      // Load specific panel data lazily
      if (btn.dataset.tab === "users") {
        loadAdminUsers(1);
      } else if (btn.dataset.tab === "orders") {
        loadAdminOrders(1);
      } else if (btn.dataset.tab === "books") {
        if (typeof loadAdminBooks === "function") {
          loadAdminBooks(1);
        }
      }
    });
  });
}

async function loadAdminData() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockStats = {
      users: 0,
      orders: 0,
      books: 0,
      revenue: 0,
    };

    // Fetch stats concurrently
    try {
      const [usersRes, ordersRes, booksRes, revenueRes] = await Promise.all([
        AuthService.fetchAuthenticated(
          "http://localhost:5033/api/dashboard/users/count",
        ),
        AuthService.fetchAuthenticated(
          "http://localhost:5033/api/dashboard/orders/count",
        ),
        AuthService.fetchAuthenticated(
          "http://localhost:5033/api/dashboard/books/count",
        ),
        AuthService.fetchAuthenticated(
          "http://localhost:5033/api/dashboard/revenue/total",
        ),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        mockStats.users = data.totalUsers || data.TotalUsers || 0;
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        mockStats.orders = data.totalOrders || data.TotalOrders || 0;
      }
      if (booksRes.ok) {
        const data = await booksRes.json();
        mockStats.books = data.totalBooks || data.TotalBooks || 0;
      }
      if (revenueRes.ok) {
        const data = await revenueRes.json();
        mockStats.revenue = data.totalRevenue || data.TotalRevenue || 0;
      }
    } catch (err) {
      console.warn("Could not fetch some stats:", err);
    }

    const updateStat = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    updateStat("stat-users", mockStats.users);
    updateStat("stat-orders", mockStats.orders);
    updateStat("stat-books", mockStats.books);
    updateStat("stat-revenue", `$${mockStats.revenue}`);

    loadRecentOrders();
  } catch (error) {
    console.error("[Admin] Error loading data:", error);
  }
}

async function loadAdminUsers(page = 1) {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center"><div class="spinner" style="margin: 1rem auto;"></div></td></tr>`;

  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/dashboard/users?page=${page}&limit=${USERS_PER_PAGE}`,
    );
    if (res.ok) {
      const data = await res.json();
      renderUsersTable(data.users || data.Users || []);
      updateUsersPagination(
        data.page || data.Page || 1,
        data.totalPages || data.TotalPages || 1,
      );
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--error-color);">فشل في تحميل المستخدمين</td></tr>`;
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--error-color);">خطأ في الاتصال بالخادم</td></tr>`;
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById("admin-users-tbody");
  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">لا يوجد مستخدمين</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const roles = u.roles || u.Roles || [];
      const roleBadges = roles
        .map((r) => `<span class="status-badge success">${r}</span>`)
        .join(" ");

      return `
      <tr>
        <td>${u.id || u.Id}</td>
        <td>${u.name || u.Name || "—"}</td>
        <td>${u.email || u.Email || "—"}</td>
        <td>${roleBadges}</td>
      </tr>
    `;
    })
    .join("");
}

function updateUsersPagination(currentPage, totalPages) {
  currentUsersPage = currentPage;
  currentUsersTotalPages = totalPages || 1;
  const prevBtn = document.getElementById("users-prev-btn");
  const nextBtn = document.getElementById("users-next-btn");
  const pageInfo = document.getElementById("users-page-info");

  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn)
    nextBtn.disabled =
      currentPage >= currentUsersTotalPages || currentUsersTotalPages === 0;
  if (pageInfo) {
    const template =
      typeof I18N !== "undefined" && I18N.t
        ? I18N.t("common.pageOf")
        : "صفحة {0} من {1}";

    // Fallback if I18N hasn't loaded or doesn't have pageOf yet
    const text = template === "common.pageOf" ? "صفحة {0} من {1}" : template;

    pageInfo.textContent = text
      .replace("{0}", currentPage)
      .replace("{1}", currentUsersTotalPages);
  }
}

async function loadRecentOrders() {
  const tbody = document.getElementById("overview-orders-tbody");
  if (!tbody) return;

  try {
    const res = await AuthService.fetchAuthenticated(
      "http://localhost:5033/api/dashboard/recent-orders?limit=5",
    );
    if (res.ok) {
      const orders = await res.json();
      renderRecentOrdersTable(orders);
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--error-color);">فشل في تحميل الطلبات</td></tr>`;
    }
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--error-color);">خطأ في الاتصال بالخادم</td></tr>`;
  }
}

function renderRecentOrdersTable(orders) {
  const tbody = document.getElementById("overview-orders-tbody");
  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">لا يوجد طلبات</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      return `
      <tr>
        <td>${o.id || o.Id}</td>
        <td>${o.customerName || o.CustomerName || "—"}</td>
        <td>${new Date(o.orderDate || o.OrderDate).toLocaleDateString()}</td>
        <td><span class="status-badge status-${(o.status || o.Status || "").toLowerCase()}">${translateStatus(o.status || o.Status)}</span></td>
        <td>$${o.total || o.Total || 0}</td>
      </tr>
    `;
    })
    .join("");
}

async function loadAdminOrders(page = 1) {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center"><div class="spinner" style="margin: 1rem auto;"></div></td></tr>`;

  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/dashboard/orders?page=${page}&limit=${ORDERS_PER_PAGE}`,
    );
    if (res.ok) {
      const data = await res.json();
      renderOrdersTable(data.orders || data.Orders || []);
      updateOrdersPagination(
        data.page || data.Page || 1,
        data.totalPages || data.TotalPages || 1,
      );
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--error-color);">فشل في تحميل الطلبات</td></tr>`;
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--error-color);">خطأ في الاتصال بالخادم</td></tr>`;
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">لا يوجد طلبات</td></tr>`;
    return;
  }

  const viewText =
    typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.view") : "عرض";
  const cleanViewText = viewText === "admin.view" ? "عرض" : viewText;

  tbody.innerHTML = orders
    .map((o) => {
      return `
      <tr>
        <td>${o.id || o.Id}</td>
        <td>${o.customerName || o.CustomerName || "—"}</td>
        <td>${new Date(o.orderDate || o.OrderDate).toLocaleDateString()}</td>
        <td><span class="status-badge status-${(o.status || o.Status || "").toLowerCase()}">${translateStatus(o.status || o.Status)}</span></td>
        <td>$${o.total || o.Total || 0}</td>
        <td style="text-align: center; display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
          <select class="status-select" onchange="changeOrderStatus(${o.id || o.Id}, this)">
            <option value="Pending" ${(o.status || o.Status) === "Pending" ? "selected" : ""}>${translateStatus("Pending")}</option>
            <option value="Processing" ${(o.status || o.Status) === "Processing" ? "selected" : ""}>${translateStatus("Processing")}</option>
            <option value="OnTheWay" ${(o.status || o.Status) === "OnTheWay" ? "selected" : ""}>${translateStatus("OnTheWay")}</option>
            <option value="Delivered" ${(o.status || o.Status) === "Delivered" ? "selected" : ""}>${translateStatus("Delivered")}</option>
            <option value="Cancelled" ${(o.status || o.Status) === "Cancelled" ? "selected" : ""}>${translateStatus("Cancelled")}</option>
          </select>
          <button class="btn-action-view" onclick="viewOrderDetails(${o.id || o.Id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            ${cleanViewText}
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function changeOrderStatus(orderId, selectElement) {
  const newStatus = selectElement.value;
  selectElement.disabled = true;

  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/dashboard/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      },
    );

    if (res.ok) {
      if (typeof UI !== "undefined" && UI.showToast) {
        const msg =
          typeof I18N !== "undefined" && I18N.t
            ? I18N.t("admin.statusUpdated") || "Status updated"
            : "Status updated";
        UI.showToast(msg, "success");
      }
      loadAdminOrders(currentOrdersPage);
      loadAdminData(); // Refresh overview stats as well
    } else {
      alert("Failed to update status");
      selectElement.disabled = false;
    }
  } catch (err) {
    console.error("Error updating status:", err);
    alert("Connection error");
    selectElement.disabled = false;
  }
}

function updateOrdersPagination(currentPage, totalPages) {
  currentOrdersPage = currentPage;
  currentOrdersTotalPages = totalPages || 1;
  const prevBtn = document.getElementById("orders-prev-btn");
  const nextBtn = document.getElementById("orders-next-btn");
  const pageInfo = document.getElementById("orders-page-info");

  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn)
    nextBtn.disabled =
      currentPage >= currentOrdersTotalPages || currentOrdersTotalPages === 0;
  if (pageInfo) {
    const template =
      typeof I18N !== "undefined" && I18N.t
        ? I18N.t("common.pageOf")
        : "صفحة {0} من {1}";
    const text = template === "common.pageOf" ? "صفحة {0} من {1}" : template;
    pageInfo.textContent = text
      .replace("{0}", currentPage)
      .replace("{1}", currentOrdersTotalPages);
  }
}

function translateStatus(status) {
  if (!status) return "—";
  const s = status.toLowerCase();

  let key = s;
  if (s === "shipped" || s === "ontheway") key = "onTheWay";

  if (typeof I18N !== "undefined" && I18N.t) {
    const translated = I18N.t("orders." + key);
    if (translated && translated !== "orders." + key) {
      return translated;
    }
  }

  if (s === "pending") return "قيد الانتظار";
  if (s === "processing") return "قيد المعالجة";
  if (s === "shipped" || s === "ontheway") return "في الطريق";
  if (s === "delivered") return "تم التوصيل";
  if (s === "cancelled") return "ملغي";
  return status;
}

async function viewOrderDetails(orderId) {
  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/dashboard/orders/${orderId}`,
    );
    if (!res.ok) {
      if (typeof UI !== "undefined" && UI.showToast) {
        UI.showToast("Failed to load order details", "error");
      }
      return;
    }

    const order = await res.json();
    showOrderModal(order);
  } catch (err) {
    console.error("Error fetching order details:", err);
    if (typeof UI !== "undefined" && UI.showToast) {
      UI.showToast("Connection error", "error");
    }
  }
}

function showOrderModal(order) {
  let m = document.getElementById("admin-order-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "admin-order-modal";
    m.className = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-card" style="max-width: 600px;"><button class="modal-close" data-modal-close aria-label="Close">✕</button><div class="modal-content"></div></div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-modal-close]"))
        closeOrderModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && m.classList.contains("open")) closeOrderModal();
    });
  }

  const itemsHtml = (order.orderItems || order.OrderItems || [])
    .map((item) => {
      const title =
        item.bookTitle?.en ||
        item.BookTitle?.En ||
        item.bookTitle?.ar ||
        item.BookTitle?.Ar ||
        "Unknown Book";
      return `
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); margin-right:10px">
                <img src="${item.bookCover || item.BookCover || "assets/images/ui/book-placeholder.png"}" alt="${title}" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${title}</h4>
                    <p style="margin: 0; color: var(--text-muted); font-size: 0.875rem;">Qty: ${item.quantity || item.Quantity} × $${item.unitPrice || item.UnitPrice}</p>
                </div>
                <div style="font-weight: 600;">
                    $${((item.quantity || item.Quantity) * (item.unitPrice || item.UnitPrice)).toFixed(2)}
                </div>
            </div>
        `;
    })
    .join("");

  m.querySelector(".modal-content").innerHTML = `
        <div style="padding: 1.5rem;">
            <h2 style="margin-bottom: 1.5rem;">Order Details #${order.id || order.Id}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-surface); border-radius: 8px;">
                <div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">Customer</span>
                    <div style="font-weight: 500;">${order.customerName || order.CustomerName}</div>
                </div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">Date</span>
                    <div style="font-weight: 500;">${new Date(order.orderDate || order.OrderDate).toLocaleString()}</div>
                </div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">Status</span>
                    <div><span class="status-badge status-${(order.status || order.Status || "").toLowerCase()}">${translateStatus(order.status || order.Status)}</span></div>
                </div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">Total</span>
                    <div style="font-weight: 700; color: var(--primary-color);">$${order.total || order.Total}</div>
                </div>
            </div>

            <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Items</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                ${itemsHtml || "<p>No items found.</p>"}
            </div>
        </div>
    `;

  m.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  const m = document.getElementById("admin-order-modal");
  if (!m) return;
  m.classList.remove("open");
  document.body.style.overflow = "";
}

async function loadAdminBooks(page = 1) {
  const tbody = document.getElementById("admin-books-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("admin-books-search");
  const searchQuery = searchInput ? searchInput.value.trim() : "";
  const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center"><div class="spinner" style="margin: 1rem auto;"></div></td></tr>`;

  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/dashboard/books?page=${page}&limit=${BOOKS_PER_PAGE}${searchParam}`,
    );
    if (res.ok) {
      const data = await res.json();
      renderBooksTable(data.books || data.Books || []);
      updateBooksPagination(
        data.page || data.Page || 1,
        data.totalPages || data.TotalPages || 1,
      );
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--error-color);">فشل في تحميل الكتب</td></tr>`;
    }
  } catch (err) {
    console.error("Error fetching books:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--error-color);">خطأ في الاتصال بالخادم</td></tr>`;
  }
}

function renderBooksTable(books) {
  const tbody = document.getElementById("admin-books-tbody");
  if (!books || books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">لا يوجد كتب</td></tr>`;
    return;
  }

  const deleteBtnText =
    typeof I18N !== "undefined" && I18N.t
      ? I18N.t("admin.delete") || "حذف"
      : "حذف";
  
  const editBtnText =
    typeof I18N !== "undefined" && I18N.t
      ? I18N.t("admin.edit") || "تعديل"
      : "تعديل";

  tbody.innerHTML = books
    .map((b) => {
      const currentLang = typeof I18N !== "undefined" ? I18N.lang : "ar";
      const titleAr = b.title?.ar || b.Title?.Ar;
      const titleEn = b.title?.en || b.Title?.En;
      const title = currentLang === "en" ? (titleEn || titleAr || "Unknown Title") : (titleAr || titleEn || "بدون عنوان");
      
      const authorNameAr = b.authorName?.ar || b.AuthorName?.Ar;
      const authorNameEn = b.authorName?.en || b.AuthorName?.En;
      const authorNameId = b.authorId || b.AuthorId || "—";
      const authorName = currentLang === "en" ? (authorNameEn || authorNameAr || authorNameId) : (authorNameAr || authorNameEn || authorNameId);
      return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="${b.cover || b.Cover || "assets/images/ui/book-placeholder.png"}" alt="${title}" style="width: 30px; height: 45px; object-fit: cover; border-radius: 2px;">
            <span>${title}</span>
          </div>
        </td>
        <td>${authorName}</td>
        <td>$${b.price || b.Price || 0}</td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
            <button class="btn-icon" title="${editBtnText}" data-i18n-title="admin.edit" aria-label="${editBtnText}" onclick="openBookModal('${b.id || b.Id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon danger" title="${deleteBtnText}" data-i18n-title="admin.delete" aria-label="${deleteBtnText}" data-book-id="${b.id || b.Id}" data-book-title="${title.replace(/"/g, '&quot;')}" onclick="confirmDeleteBook(this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

function updateBooksPagination(currentPage, totalPages) {
  currentBooksPage = currentPage;
  currentBooksTotalPages = totalPages || 1;
  const prevBtn = document.getElementById("books-prev-btn");
  const nextBtn = document.getElementById("books-next-btn");
  const pageInfo = document.getElementById("books-page-info");

  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn)
    nextBtn.disabled =
      currentPage >= currentBooksTotalPages || currentBooksTotalPages === 0;
  if (pageInfo) {
    const template =
      typeof I18N !== "undefined" && I18N.t
        ? I18N.t("common.pageOf")
        : "صفحة {0} من {1}";
    const text = template === "common.pageOf" ? "صفحة {0} من {1}" : template;
    pageInfo.textContent = text
      .replace("{0}", currentPage)
      .replace("{1}", currentBooksTotalPages);
  }
}

function confirmDeleteBook(btn) {
  const bookId = btn.getAttribute('data-book-id');
  const bookTitle = btn.getAttribute('data-book-title');

  let m = document.getElementById("admin-delete-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "admin-delete-modal";
    m.className = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-card" style="max-width: 400px; text-align: center;"><button class="modal-close" data-modal-close aria-label="Close">✕</button><div class="modal-content"></div></div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-modal-close]"))
        closeDeleteModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && m.classList.contains("open")) closeDeleteModal();
    });
  }

  m.querySelector(".modal-content").innerHTML = `
    <div style="padding: 1.5rem;">
      <h3 style="margin-bottom: 1rem;" data-i18n="admin.deleteBookConfirm">هل أنت متأكد من حذف الكتاب؟</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 1.125rem;">${bookTitle}</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button class="btn btn-secondary" onclick="closeDeleteModal()" data-i18n="common.cancel">إلغاء</button>
        <button class="btn btn-danger" onclick="executeDeleteBook(${bookId})" data-i18n="admin.delete">حذف</button>
      </div>
    </div>
  `;

  if (typeof I18N !== "undefined" && I18N.apply) {
    I18N.apply(m);
  }

  m.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDeleteModal() {
  const m = document.getElementById("admin-delete-modal");
  if (!m) return;
  m.classList.remove("open");
  document.body.style.overflow = "";
}

async function executeDeleteBook(bookId) {
  try {
    const res = await AuthService.fetchAuthenticated(
      `http://localhost:5033/api/books/${bookId}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      if (typeof UI !== "undefined" && UI.showToast) {
        const msg = typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.bookDeleted") || "Book deleted successfully" : "Book deleted successfully";
        UI.showToast(msg, "success");
      }
      closeDeleteModal();
      loadAdminBooks(currentBooksPage);
      loadAdminData(); // Refresh overview stats
    } else {
      if (typeof UI !== "undefined" && UI.showToast) {
        UI.showToast("Failed to delete book", "error");
      }
    }
  } catch (err) {
    console.error("Error deleting book:", err);
    if (typeof UI !== "undefined" && UI.showToast) {
      UI.showToast("Connection error", "error");
    }
  }
}

async function loadBookDropdowns() {
  try {
    const [authorsRes, categoriesRes] = await Promise.all([
      AuthService.fetchAuthenticated("http://localhost:5033/api/authors"),
      AuthService.fetchAuthenticated("http://localhost:5033/api/category")
    ]);

    if (authorsRes.ok) {
      const authors = await authorsRes.json();
      const list = document.getElementById("authors-list");
      if (list) {
        list.innerHTML = authors.map(a => `<option data-id="${a.id}" value="${a.name?.ar || a.Name?.Ar || ''} - ${a.name?.en || a.Name?.En || ''}"></option>`).join('');
      }
    }

    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      const list = document.getElementById("categories-list");
      if (list) {
        list.innerHTML = categories.map(c => `<option data-id="${c.id}" value="${c.nameAr || c.NameAr || ''} - ${c.nameEn || c.NameEn || ''}"></option>`).join('');
      }
    }
  } catch (err) {
    console.error("Failed to load dropdowns:", err);
  }
}

async function openBookModal(bookId = null) {
  let m = document.getElementById("admin-book-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "admin-book-modal";
    m.className = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-card" style="max-width: 800px;"><button class="modal-close" data-modal-close aria-label="Close">✕</button><div class="modal-content"></div></div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-modal-close]"))
        closeBookModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && m.classList.contains("open")) closeBookModal();
    });
  }
  const isEdit = !!bookId;
  const modalTitle = isEdit ? (typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.editBook") || "تعديل كتاب" : "تعديل كتاب") : (typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.addBook") || "إضافة كتاب" : "إضافة كتاب");
  const btnText = isEdit ? (typeof I18N !== "undefined" && I18N.t ? I18N.t("common.save") || "حفظ" : "حفظ") : (typeof I18N !== "undefined" && I18N.t ? I18N.t("common.add") || "إضافة" : "إضافة");

  m.querySelector(".modal-content").innerHTML = `
    <div style="padding: 2rem;">
      <h2 style="margin-bottom: 2rem; font-size: 1.5rem; font-weight: 800;">${modalTitle}</h2>
      <form id="book-form" onsubmit="event.preventDefault(); handleBookSubmit(event, ${bookId ? `'${bookId}'` : 'null'}); return false;">
        <div id="book-form-error" class="error-message" style="display: none; color: #ef4444; margin-bottom: 1.5rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2); font-weight: 500; font-size: 0.95rem;"></div>
        <div class="admin-form-grid">
          <!-- Titles -->
          <div class="form-group">
            <label data-i18n="admin.bookTitleAr">العنوان (عربي)</label>
            <input type="text" id="book-title-ar" class="form-control" required>
          </div>
          <div class="form-group">
            <label data-i18n="admin.bookTitleEn">العنوان (إنجليزي)</label>
            <input type="text" id="book-title-en" class="form-control" required>
          </div>
          
          <!-- Dropdowns -->
          <div class="form-group">
            <label data-i18n="admin.authorNameAr">المؤلف</label>
            <input type="text" id="book-author" list="authors-list" class="form-control" autocomplete="off" placeholder="Search..." required>
            <datalist id="authors-list"></datalist>
          </div>
          <div class="form-group">
            <label data-i18n="admin.category">التصنيف</label>
            <input type="text" id="book-category" list="categories-list" class="form-control" autocomplete="off" placeholder="Search..." required>
            <datalist id="categories-list"></datalist>
          </div>
          
          <!-- Language & Rating -->
          <div class="form-group">
            <label data-i18n="admin.bookLanguage">لغة الكتاب</label>
            <select id="book-language" class="form-control status-select" required>
              <option value="Arabic">Arabic / عربي</option>
              <option value="English">English / إنجليزي</option>
            </select>
          </div>
          <div class="form-group">
            <label data-i18n="admin.rating">التقييم</label>
            <input type="number" step="0.1" min="0" max="5" id="book-rating" class="form-control" required>
          </div>

          <!-- Pricing -->
          <div class="form-group">
            <label data-i18n="admin.price">السعر</label>
            <input type="number" step="0.01" min="0" id="book-price" class="form-control" required>
          </div>
          <div class="form-group">
            <label data-i18n="admin.oldPrice">السعر القديم</label>
            <input type="number" step="0.01" min="0" id="book-old-price" class="form-control" required>
          </div>

          <!-- Info -->
          <div class="form-group">
            <label data-i18n="admin.pages">عدد الصفحات</label>
            <input type="number" min="1" id="book-pages" class="form-control" required>
          </div>
          <div class="form-group">
            <label data-i18n="admin.year">سنة النشر</label>
            <input type="number" min="1000" max="9999" id="book-year" class="form-control" required>
          </div>
          <div class="form-group">
            <label data-i18n="admin.publisherAr">الناشر (عربي)</label>
            <input type="text" id="book-publisher-ar" class="form-control" required>
          </div>
          <div class="form-group">
            <label data-i18n="admin.publisherEn">الناشر (إنجليزي)</label>
            <input type="text" id="book-publisher-en" class="form-control" required>
          </div>

          <!-- Descriptions -->
          <div class="form-group full-width">
            <label data-i18n="admin.descriptionAr">الوصف (عربي)</label>
            <textarea id="book-desc-ar" class="form-control" rows="3" required></textarea>
          </div>
          <div class="form-group full-width">
            <label data-i18n="admin.descriptionEn">الوصف (إنجليزي)</label>
            <textarea id="book-desc-en" class="form-control" rows="3" required></textarea>
          </div>

          <!-- Cover Image -->
          <div class="form-group full-width">
            <label data-i18n="admin.coverImage">صورة الغلاف</label>
            <input type="file" id="book-cover-file" accept="image/*" class="form-control">
            <input type="hidden" id="book-cover-url">
            <img id="book-cover-preview" src="" style="display:none; max-width: 100px; height: 140px; object-fit: cover; margin-top: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
          </div>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2.5rem;">
          <button type="button" class="btn btn-ghost" onclick="closeBookModal()" data-i18n="common.cancel">إلغاء</button>
          <button type="submit" class="btn btn-primary" id="book-submit-btn">${btnText}</button>
        </div>
      </form>
    </div>
  `;

  loadBookDropdowns();

  if (typeof I18N !== "undefined" && I18N.apply) {
    I18N.apply(m);
  }

  document.getElementById("book-cover-file").addEventListener("change", function(e) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = document.getElementById("book-cover-preview");
        preview.src = e.target.result;
        preview.style.display = "block";
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  if (isEdit) {
    const btn = document.getElementById("book-submit-btn");
    btn.disabled = true;
    try {
      const res = await AuthService.fetchAuthenticated(`http://localhost:5033/api/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById("book-title-ar").value = data.title?.ar || data.Title?.Ar || "";
        document.getElementById("book-title-en").value = data.title?.en || data.Title?.En || "";
        
        // Wait briefly for datalists to populate, or just set it
        setTimeout(() => {
          const authorInput = document.getElementById("book-author");
          const authorList = document.getElementById("authors-list");
          const authorOption = authorList ? Array.from(authorList.options).find(o => o.getAttribute("data-id") == (data.authorId || data.AuthorId)) : null;
          if (authorOption) authorInput.value = authorOption.value;
          else if (data.authorName) authorInput.value = (data.authorName?.ar || data.authorName?.en || data.AuthorName?.Ar || data.AuthorName?.En || "");

          const categoryInput = document.getElementById("book-category");
          const categoryList = document.getElementById("categories-list");
          const cat = data.category || data.Category || "";
          const catOption = categoryList ? Array.from(categoryList.options).find(o => o.value.includes(cat) || o.getAttribute("data-id") == cat) : null;
          categoryInput.value = catOption ? catOption.value : cat;
        }, 300);

        const langEn = data.bookLanguage?.en || data.BookLanguage?.En || "";
        document.getElementById("book-language").value = langEn.includes("Arabic") ? "Arabic" : "English";
        
        document.getElementById("book-rating").value = data.rating || data.Rating || 0;
        document.getElementById("book-price").value = data.price || data.Price || 0;
        document.getElementById("book-old-price").value = data.oldPrice || data.OldPrice || 0;
        document.getElementById("book-pages").value = data.pages || data.Pages || 0;
        document.getElementById("book-year").value = data.year || data.Year || new Date().getFullYear();
        document.getElementById("book-publisher-ar").value = data.publisher?.ar || data.Publisher?.Ar || "";
        document.getElementById("book-publisher-en").value = data.publisher?.en || data.Publisher?.En || "";
        document.getElementById("book-desc-ar").value = data.description?.ar || data.Description?.Ar || "";
        document.getElementById("book-desc-en").value = data.description?.en || data.Description?.En || "";

        const currentCover = data.cover || data.Cover || "";
        document.getElementById("book-cover-url").value = currentCover;
        const preview = document.getElementById("book-cover-preview");
        if (currentCover) {
          preview.src = currentCover;
          preview.style.display = "block";
        }
      } else {
        if (typeof UI !== "undefined" && UI.showToast) UI.showToast("Failed to load book data", "error");
        closeBookModal();
        return;
      }
    } catch (err) {
      console.error("Error loading book:", err);
      if (typeof UI !== "undefined" && UI.showToast) UI.showToast("Connection error", "error");
      closeBookModal();
      return;
    } finally {
      btn.disabled = false;
    }
  }

  m.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeBookModal() {
  const m = document.getElementById("admin-book-modal");
  if (!m) return;
  m.classList.remove("open");
  document.body.style.overflow = "";
}

async function handleBookSubmit(e, bookId) {
  e.preventDefault();
  const btn = document.getElementById("book-submit-btn");
  btn.disabled = true;

  const errDiv = document.getElementById("book-form-error");
  if (errDiv) {
    errDiv.style.display = "none";
    errDiv.innerHTML = "";
  }

  let coverUrl = document.getElementById("book-cover-url").value;
  const fileInput = document.getElementById("book-cover-file");
  if (fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    try {
      const uploadRes = await AuthService.fetchAuthenticated("http://localhost:5033/api/upload", {
        method: "POST",
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        coverUrl = uploadData.url;
      } else {
        if (typeof UI !== "undefined" && UI.showToast) UI.showToast("Failed to upload image", "error");
        btn.disabled = false;
        return;
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (typeof UI !== "undefined" && UI.showToast) UI.showToast("Image upload connection error", "error");
      btn.disabled = false;
      return;
    }
  }

  const authorInput = document.getElementById("book-author").value;
  const authorList = document.getElementById("authors-list");
  let authorId = 0;
  if (authorList) {
    const option = Array.from(authorList.options).find(o => o.value === authorInput);
    if (option) authorId = parseInt(option.getAttribute("data-id")) || 0;
  }

  const categoryInput = document.getElementById("book-category").value;
  const categoryList = document.getElementById("categories-list");
  let categoryStr = categoryInput;
  if (categoryList) {
    const catOption = Array.from(categoryList.options).find(o => o.value === categoryInput);
    if (catOption) categoryStr = catOption.getAttribute("data-id") || categoryInput;
  }

  const langSelect = document.getElementById("book-language").value;
  const langAr = langSelect === "Arabic" ? "عربي" : "إنجليزي";
  const langEn = langSelect;

  const payload = {
    TitleAr: document.getElementById("book-title-ar").value.trim() || "",
    TitleEn: document.getElementById("book-title-en").value.trim() || "",
    AuthorId: authorId,
    Category: categoryStr || "",
    Cover: coverUrl || "",
    DescriptionAr: document.getElementById("book-desc-ar").value.trim() || "",
    DescriptionEn: document.getElementById("book-desc-en").value.trim() || "",
    Price: parseFloat(document.getElementById("book-price").value) || 0,
    OldPrice: parseFloat(document.getElementById("book-old-price").value) || 0,
    IsNew: false,
    PublisherAr: document.getElementById("book-publisher-ar").value.trim() || "",
    PublisherEn: document.getElementById("book-publisher-en").value.trim() || "",
    LanguageAr: langAr,
    LanguageEn: langEn,
    Pages: parseInt(document.getElementById("book-pages").value) || 0,
    Year: parseInt(document.getElementById("book-year").value) || new Date().getFullYear(),
    Rating: parseFloat(document.getElementById("book-rating").value) || 0
  };

  if (bookId) {
    payload.Id = parseInt(bookId);
  }

  const isEdit = !!bookId;
  const url = isEdit ? `http://localhost:5033/api/books/${bookId}` : `http://localhost:5033/api/books`;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await AuthService.fetchAuthenticated(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      if (typeof UI !== "undefined" && UI.showToast) {
        const msg = isEdit ? 
          (typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.bookUpdated") || "Book updated successfully" : "Book updated successfully") :
          (typeof I18N !== "undefined" && I18N.t ? I18N.t("admin.bookAdded") || "Book added successfully" : "Book added successfully");
        UI.showToast(msg, "success");
      }
      closeBookModal();
      loadAdminBooks(currentBooksPage);
      loadAdminData();
    } else {
      let errorMsg = "Failed to save book";
      try {
        const errData = await res.json();
        if (errData.errors) {
            errorMsg = Object.values(errData.errors).flat().join('<br>');
        } else if (errData.message) {
            errorMsg = errData.message;
        } else if (errData.title) {
            errorMsg = errData.title;
        }
      } catch (e) {}
      
      if (errDiv) {
        errDiv.innerHTML = errorMsg;
        errDiv.style.display = "block";
        const modalContent = document.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (typeof UI !== "undefined" && UI.showToast) {
        UI.showToast(errorMsg, "error");
      }
    }
  } catch (err) {
    console.error("Error saving book:", err);
    if (errDiv) {
      errDiv.innerHTML = "حدث خطأ في الاتصال أو البيانات غير صالحة.";
      errDiv.style.display = "block";
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (typeof UI !== "undefined" && UI.showToast) {
      UI.showToast("Connection error", "error");
    }
  } finally {
    btn.disabled = false;
  }
}
