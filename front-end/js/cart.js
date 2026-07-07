/* =====================================================================
   cart.js — Shopping cart + Favorites store (LocalStorage backed).
   Single source of truth for both; emits 'cart:changed' so counters and
   any open page re-render. Also renders the cart page when present.
   Persistence keys: bayn_cart, bayn_favs.
   ===================================================================== */

const Cart = (() => {
  const CART_KEY = 'bayn_cart';   // [{ id, qty }]
  const TAX_RATE = 0.14;

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const emit = () => window.dispatchEvent(new Event('cart:changed'));

  /* ---------- Cart ---------- */
  let cart = read(CART_KEY, []);
  let favs = [];

  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  const items = () => cart;

  function add(id, qty = 1) {
    id = Number(id);
    const found = cart.find((i) => i.id === id);
    if (found) found.qty += qty; else cart.push({ id, qty });
    write(CART_KEY, cart); emit();
    if (window.UI) UI.toast(I18N.t('common.added'));
  }

  function remove(id) {
    id = Number(id);
    cart = cart.filter((i) => i.id !== id);
    write(CART_KEY, cart); emit();
  }

  function setQty(id, qty) {
    id = Number(id);
    const found = cart.find((i) => i.id === id);
    if (!found) return;
    found.qty = Math.max(1, qty);
    write(CART_KEY, cart); emit();
  }

  function clear() { cart = []; write(CART_KEY, cart); emit(); }

  /* ---------- Favorites ---------- */
  const favCount = () => favs.length;
  const favorites = () => favs;
  const isFav = (id) => favs.includes(Number(id));

  async function loadFavorites() {
    if (!window.AuthService || !AuthService.isAuthenticated()) {
      favs = [];
      emit();
      return;
    }
    try {
      const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/profile/favorites');
      if (res.ok) {
        const data = await res.json();
        favs = data.map(b => Number(b.id));
        emit();
      }
    } catch (err) {
      console.warn("Failed to load favorites", err);
    }
  }

  // Load immediately
  if (window.AuthService) {
    loadFavorites();
  } else {
    window.addEventListener('DOMContentLoaded', loadFavorites);
  }

  async function toggleFav(id) {
    if (!window.AuthService || !AuthService.isAuthenticated()) {
      if (window.UI) UI.toast(window.I18N ? I18N.t('nav.login') : 'Please login to save favorites');
      window.location.href = 'login.html';
      return false;
    }

    id = Number(id);
    try {
      const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/profile/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: id })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isFavorite) {
          if (!favs.includes(id)) favs.push(id);
          if (window.UI) UI.toast((window.I18N ? I18N.t('common.favorite') : 'Favorite') + ' ✓');
        } else {
          favs = favs.filter((f) => f !== id);
        }
        emit();
        return data.isFavorite;
      }
    } catch (err) {
      console.warn("Failed to toggle favorite", err);
    }
    return favs.includes(id);
  }

  /* ---------- Totals ---------- */
  async function totals() {
    const books = await BookService.all();
    let subtotal = 0;
    cart.forEach((i) => { const b = books.find((x) => x.id === i.id); if (b) subtotal += b.price * i.qty; });
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax };
  }

  return { count, items, add, remove, setQty, clear, favCount, favorites, isFav, toggleFav, totals, TAX_RATE };
})();

window.Cart = Cart;

/* =====================================================================
   Cart PAGE renderer — runs only on cart.html (guarded by #cart-root).
   ===================================================================== */
async function renderCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;
  const items = Cart.items();
  const books = await BookService.all();

  if (!items.length) {
    root.innerHTML = `<div class="state-block"><div class="state-icon">🛒</div>
      <p data-i18n="cart.empty">${I18N.t('cart.empty')}</p>
      <a class="btn btn-primary" href="library.html" style="margin-top:1rem" data-i18n="cart.emptyCta">${I18N.t('cart.emptyCta')}</a></div>`;
    return;
  }

  const rows = items.map((i) => {
    const b = books.find((x) => x.id === i.id);
    if (!b) return '';
    return `<div class="cart-item" data-row="${b.id}">
      <a href="book.html?id=${b.id}">
        <img src="${b.cover}" alt="${I18N.pick(b.title)}" onerror="this.src='assets/images/ui/book-placeholder.png'">
      </a>
      <div>
        <a href="book.html?id=${b.id}" style="text-decoration: none; color: inherit;">
          <div class="ci-title">${I18N.pick(b.title)}</div>
        </a>
        <div class="ci-author author-name" data-author="${b.authorId}"></div>
        <div class="book-price"><span class="now">${UI.money(b.price)}</span></div>
      </div>
      <div style="text-align:end">
        <div class="qty" role="group" aria-label="${I18N.t('cart.quantity')}">
          <button data-dec="${b.id}" aria-label="-">−</button>
          <span>${i.qty}</span>
          <button data-inc="${b.id}" aria-label="+">+</button>
        </div>
        <button class="btn btn-ghost" data-del="${b.id}" style="margin-top:.5rem;font-size:.8rem" data-i18n="cart.remove">${I18N.t('cart.remove')}</button>
      </div>
    </div>`;
  }).join('');

  const t = await Cart.totals();
  root.innerHTML = `
    <div class="cart-layout">
      <div>${rows}</div>
      <aside class="summary">
        <h3 data-i18n="cart.summary">${I18N.t('cart.summary')}</h3>
        <div class="summary-row"><span data-i18n="cart.subtotal">${I18N.t('cart.subtotal')}</span><span>${UI.money(t.subtotal.toFixed(0))}</span></div>
        <div class="summary-row"><span data-i18n="cart.tax">${I18N.t('cart.tax')}</span><span>${UI.money(t.tax.toFixed(0))}</span></div>
        <div class="summary-row total"><span data-i18n="cart.total">${I18N.t('cart.total')}</span><span>${UI.money(t.total.toFixed(0))}</span></div>
        <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:1rem" data-i18n="cart.checkout">${I18N.t('cart.checkout')}</button>
      </aside>
    </div>`;

  // Resolve author names
  root.querySelectorAll('.author-name').forEach(async (el) => {
    el.textContent = `${I18N.t('common.by')} ${await AuthorService.nameOf(el.dataset.author, I18N.lang)}`;
  });

  // Wire quantity / delete / checkout
  root.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => { const i = Cart.items().find((x) => x.id === Number(b.dataset.inc)); Cart.setQty(b.dataset.inc, i.qty + 1); }));
  root.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => { const i = Cart.items().find((x) => x.id === Number(b.dataset.dec)); Cart.setQty(b.dataset.dec, i.qty - 1); }));
  root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => Cart.remove(b.dataset.del)));
  const checkout = document.getElementById('checkout-btn');
  if (checkout) {
    checkout.addEventListener('click', () => {
      let m = document.getElementById('payment-modal');
      if (!m) {
        m = document.createElement('div');
        m.id = 'payment-modal';
        m.className = 'modal';
        m.setAttribute('role', 'dialog');
        m.setAttribute('aria-modal', 'true');
        m.innerHTML = `
          <div class="modal-card" style="max-width: 440px; margin: 0 auto; position: relative;">
            <button class="modal-close" data-modal-close aria-label="${I18N.t('common.close')}">✕</button>
            <div style="padding: 2rem;">
              <h2 style="margin-bottom: 1.5rem; text-align: center; font-weight: bold; font-size: 1.4rem;">${I18N.t('cart.paymentDetails') || 'Payment Details'}</h2>
              <form id="payment-form">
                <div class="field" style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: .4rem;">${I18N.t('cart.nameOnCard') || 'Name on Card'}</label>
                  <input type="text" class="input" required placeholder="John Doe">
                </div>
                <div class="field" style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: .4rem;">${I18N.t('cart.cardNumber') || 'Card Number'}</label>
                  <input type="text" class="input" required placeholder="0000 0000 0000 0000" pattern="\\d{16}" maxlength="16" title="16 digit card number">
                </div>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                  <div class="field" style="flex: 1;">
                    <label style="display: block; margin-bottom: .4rem;">${I18N.t('cart.expiry') || 'Expiry (MM/YY)'}</label>
                    <input type="text" class="input" required placeholder="MM/YY" pattern="\\d\\d/\\d\\d" maxlength="5">
                  </div>
                  <div class="field" style="flex: 1;">
                    <label style="display: block; margin-bottom: .4rem;">${I18N.t('cart.cvv') || 'CVV'}</label>
                    <input type="text" class="input" required placeholder="123" pattern="\\d{3,4}" maxlength="4">
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1.5rem;">${I18N.t('cart.payNow') || 'Pay Now'}</button>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(m);
        
        m.addEventListener('click', (e) => { 
          if (e.target === m || e.target.closest('[data-modal-close]')) {
            m.classList.remove('open');
          }
        });

        const form = m.querySelector('#payment-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          if (!window.AuthService || !AuthService.isAuthenticated()) {
            m.classList.remove('open');
            if (window.UI) UI.toast(window.I18N ? I18N.t('nav.login') : 'Please login to checkout');
            window.location.href = 'login.html';
            return;
          }

          const items = Cart.items();
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0 auto; display: inline-block; vertical-align: middle;"></div> <span style="vertical-align: middle; margin-left: 0.5rem;">' + (I18N.t('cart.processing') || 'Processing...') + '</span>';
          }

          try {
            const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/orders/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items })
            });

            if (res.ok) {
              m.classList.remove('open');
              Cart.clear(); 
              if (window.UI) UI.toast(I18N.t('cart.orderPlaced')); 
            } else {
              if (window.UI) UI.toast('Checkout failed');
            }
          } catch (err) {
            console.error('Checkout error:', err);
            if (window.UI) UI.toast('Checkout error');
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = I18N.t('cart.payNow') || 'Pay Now';
            }
          }
        });
      }
      // slight delay to ensure transition works if it was just added
      requestAnimationFrame(() => m.classList.add('open'));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-root')) {
    renderCartPage();
    window.addEventListener('cart:changed', renderCartPage);
    window.addEventListener('page:rerender', renderCartPage);
  }
});
