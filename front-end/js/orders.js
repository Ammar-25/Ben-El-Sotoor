/* =====================================================================
   orders.js — Controller for the Purchased Books / Orders page.
   ===================================================================== */

const OrdersController = (() => {
  function renderOrder(order) {
    const card = document.createElement('div');
    card.className = 'order-card reveal';
    
    const total = order.total || 0;
    
    // Format Date
    const dateStr = new Date(order.orderDate).toLocaleDateString(I18N.lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Use dynamic status from backend
    const backendStatus = order.status || 'Pending';
    let statusClass = 'pending';
    let statusKey = 'orders.pending';

    switch (backendStatus) {
      case 'Processing':
        statusClass = 'processing';
        statusKey = 'orders.processing';
        break;
      case 'OnTheWay':
        statusClass = 'onTheWay';
        statusKey = 'orders.onTheWay';
        break;
      case 'Delivered':
        statusClass = 'delivered';
        statusKey = 'orders.delivered';
        break;
      case 'Cancelled':
        statusClass = 'cancelled';
        statusKey = 'orders.cancelled';
        break;
      default:
        statusClass = 'pending';
        statusKey = 'orders.pending';
    }

    const statusText = I18N.t(statusKey) || backendStatus;

    // Build books HTML
    const booksHtml = (order.orderItems || []).map(item => {
      const title = I18N.pick(item.bookTitle);
      return `
        <div class="order-book-item">
          <img src="${item.bookCover}" alt="${title}" onerror="this.src='assets/images/ui/book-placeholder.png'">
          <div class="order-book-title">${title}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="order-header">
        <div class="order-info">
          <h3>#${order.id}</h3>
          <div class="order-meta">${dateStr} · ${UI.money(total)}</div>
        </div>
        <div class="order-status ${statusClass}">${statusText}</div>
      </div>
      <div class="order-books">
        ${booksHtml}
      </div>
    `;
    
    return card;
  }

  async function init() {
    const container = document.getElementById('orders-root');
    if (!container) return;

    // Redirect to login if not authenticated
    if (!AuthService.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    try {
      await I18N.ready;
      container.innerHTML = '<div class="spinner"></div>';
      
      const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/orders');
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await res.json();
      
      container.innerHTML = '';
      if (!orders || orders.length === 0) {
        container.innerHTML = `
          <div class="state-block" style="text-align: center; padding: 5rem 1rem; background: var(--bg-surface); border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
            <div style="margin-bottom: 1.5rem; color: var(--primary-color); opacity: 0.8;">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto; display: block;">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <h3 data-i18n="orders.emptyTitle" style="margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 700;">${I18N.t('orders.emptyTitle')}</h3>
            <p data-i18n="orders.emptyDesc" style="color: var(--text-muted); margin-bottom: 2rem; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.6; font-size: 1.05rem;">
              ${I18N.t('orders.emptyDesc')}
            </p>
            <a href="library.html" data-i18n="orders.shopNow" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.05rem; border-radius: 50px;">
              ${I18N.t('orders.shopNow')}
            </a>
          </div>
        `;
        return;
      }

      orders.forEach(order => {
        container.appendChild(renderOrder(order));
      });

      UI.observeReveal(container);
    } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="state-block"><p>Failed to load orders.</p></div>`;
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', OrdersController.init);
