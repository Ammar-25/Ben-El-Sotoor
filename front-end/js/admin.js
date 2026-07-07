/* =====================================================================
   admin.js — Logic for Admin Dashboard.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  if (typeof AuthService !== 'undefined') {
    if (!AuthService.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }
    // Ideally, we'd also check if the user role is 'admin' here.
    // Since it's mock data, we just let authenticated users view the dashboard.
  }

  initAdminTabs();
  loadAdminData();
});

function initAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.admin-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => {
        p.hidden = true;
        p.classList.remove('active');
      });

      // Activate clicked
      btn.classList.add('active');
      const targetPanel = document.querySelector(`.admin-panel[data-panel="${btn.dataset.tab}"]`);
      if (targetPanel) {
        targetPanel.hidden = false;
        // Small delay to trigger animation
        setTimeout(() => targetPanel.classList.add('active'), 10);
      }
    });
  });
}

async function loadAdminData() {
  try {
    // We mock the data loading since there isn't a dedicated admin API yet.
    // In a real scenario, we would use fetchAuthenticated to get data from endpoints.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockStats = {
      users: 1245,
      orders: 342,
      books: 85,
      revenue: 25400
    };

    const mockOrders = [
      { id: 'ORD-001', customer: 'أحمد محمد', date: '2026-07-01', status: 'delivered', total: 450 },
      { id: 'ORD-002', customer: 'سارة خالد', date: '2026-07-03', status: 'processing', total: 120 },
      { id: 'ORD-003', customer: 'يوسف علي', date: '2026-07-05', status: 'pending', total: 340 },
      { id: 'ORD-004', customer: 'ليلى عمر', date: '2026-07-06', status: 'cancelled', total: 90 },
      { id: 'ORD-005', customer: 'طارق زياد', date: '2026-07-07', status: 'onTheWay', total: 210 }
    ];

    const mockUsers = [
      { id: 'USR-01', name: 'أحمد محمد', email: 'ahmed@example.com', role: 'user' },
      { id: 'USR-02', name: 'سارة خالد', email: 'sara@example.com', role: 'admin' },
      { id: 'USR-03', name: 'يوسف علي', email: 'yousef@example.com', role: 'user' },
      { id: 'USR-04', name: 'ليلى عمر', email: 'laila@example.com', role: 'user' }
    ];

    let mockBooks = [];
    if (typeof BookService !== 'undefined') {
      const res = await BookService.getBooks();
      if (res && res.data) {
        mockBooks = res.data.slice(0, 10); // Take first 10 for demo
      }
    }

    renderStats(mockStats);
    renderOrders(mockOrders);
    renderUsers(mockUsers);
    renderBooks(mockBooks);

  } catch (error) {
    console.error('[Admin] Error loading data:', error);
  }
}

function renderStats(stats) {
  const uEl = document.getElementById('stat-users');
  const oEl = document.getElementById('stat-orders');
  const bEl = document.getElementById('stat-books');
  const rEl = document.getElementById('stat-revenue');

  if (uEl) uEl.textContent = stats.users.toLocaleString();
  if (oEl) oEl.textContent = stats.orders.toLocaleString();
  if (bEl) bEl.textContent = stats.books.toLocaleString();
  if (rEl) rEl.textContent = stats.revenue.toLocaleString() + ' ج.م';
}

function getStatusBadge(status) {
  const statusMap = {
    'pending': { class: 'warning', key: 'orders.pending' },
    'processing': { class: 'warning', key: 'orders.processing' },
    'onTheWay': { class: 'success', key: 'orders.onTheWay' },
    'delivered': { class: 'success', key: 'orders.delivered' },
    'cancelled': { class: 'danger', key: 'orders.cancelled' }
  };
  const s = statusMap[status] || { class: '', key: status };
  return `<span class="status-badge ${s.class}" data-i18n="${s.key}"></span>`;
}

function renderOrders(orders) {
  const tbodyOverview = document.getElementById('overview-orders-tbody');
  const tbodyOrders = document.getElementById('admin-orders-tbody');
  
  let html = '';
  orders.forEach(order => {
    html += `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td dir="ltr" style="text-align: right;">${order.date}</td>
        <td>${getStatusBadge(order.status)}</td>
        <td>${order.total} <span data-i18n="common.currency"></span></td>
      </tr>
    `;
  });

  let htmlWithActions = '';
  orders.forEach(order => {
    htmlWithActions += `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td dir="ltr" style="text-align: right;">${order.date}</td>
        <td>${getStatusBadge(order.status)}</td>
        <td>${order.total} <span data-i18n="common.currency"></span></td>
        <td class="actions-cell">
          <button class="btn-icon" title="Edit">✎</button>
          <button class="btn-icon danger" title="Delete">🗑</button>
        </td>
      </tr>
    `;
  });

  if (tbodyOverview) {
    tbodyOverview.innerHTML = html;
  }
  if (tbodyOrders) {
    tbodyOrders.innerHTML = htmlWithActions;
  }
  
  // Re-run language check for newly injected i18n attributes
  if (typeof updateTranslations === 'function') {
    updateTranslations();
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  let html = '';
  users.forEach(user => {
    const roleBadgeClass = user.role === 'admin' ? 'success' : 'warning';
    html += `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="status-badge ${roleBadgeClass}">${user.role}</span></td>
        <td class="actions-cell">
          <button class="btn-icon" title="Edit">✎</button>
          <button class="btn-icon danger" title="Delete">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderBooks(books) {
  const tbody = document.getElementById('admin-books-tbody');
  if (!tbody) return;

  if (!books || books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center" data-i18n="common.noResults">لا توجد نتائج</td></tr>`;
    return;
  }

  let html = '';
  books.forEach(book => {
    html += `
      <tr>
        <td style="display:flex;align-items:center;gap:1rem;">
          <img src="${book.coverImage}" alt="${book.title}" width="40" height="60" style="object-fit:cover;border-radius:4px;">
          <span>${book.title}</span>
        </td>
        <td>${book.author}</td>
        <td>${book.price} <span data-i18n="common.currency"></span></td>
        <td class="actions-cell">
          <button class="btn-icon" title="Edit">✎</button>
          <button class="btn-icon danger" title="Delete">🗑</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  
  if (typeof updateTranslations === 'function') {
    updateTranslations();
  }
}
