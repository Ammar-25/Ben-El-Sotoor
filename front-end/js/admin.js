/* =====================================================================
   admin.js — Logic for Admin Dashboard.
   ===================================================================== */

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
        AuthService.fetchAuthenticated("http://localhost:5033/api/dashboard/users/count"),
        AuthService.fetchAuthenticated("http://localhost:5033/api/dashboard/orders/count"),
        AuthService.fetchAuthenticated("http://localhost:5033/api/dashboard/books/count"),
        AuthService.fetchAuthenticated("http://localhost:5033/api/dashboard/revenue/total")
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

  } catch (error) {
    console.error("[Admin] Error loading data:", error);
  }
}
