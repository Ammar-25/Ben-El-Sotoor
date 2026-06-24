/* =====================================================================
   cart.js — Shopping cart + Favorites store (LocalStorage backed).
   Single source of truth for both; emits 'cart:changed' so counters and
   any open page re-render. Also renders the cart page when present.
   Persistence keys: bayn_cart, bayn_favs.
   ===================================================================== */

const Cart = (() => {
  const CART_KEY = 'bayn_cart';   // [{ id, qty }]
  const FAV_KEY = 'bayn_favs';    // [id, id, ...]
  const TAX_RATE = 0.14;

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const emit = () => window.dispatchEvent(new Event('cart:changed'));

  /* ---------- Cart ---------- */
  let cart = read(CART_KEY, []);
  let favs = read(FAV_KEY, []);

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

  function toggleFav(id) {
    id = Number(id);
    if (favs.includes(id)) { favs = favs.filter((f) => f !== id); }
    else { favs.push(id); if (window.UI) UI.toast(I18N.t('common.favorite') + ' ✓'); }
    write(FAV_KEY, favs); emit();
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
      <img src="${b.cover}" alt="${I18N.pick(b.title)}" onerror="this.src='assets/images/ui/book-placeholder.png'">
      <div>
        <div class="ci-title">${I18N.pick(b.title)}</div>
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
  if (checkout) checkout.addEventListener('click', () => { Cart.clear(); UI.toast(I18N.t('cart.orderPlaced')); });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cart-root')) {
    renderCartPage();
    window.addEventListener('cart:changed', renderCartPage);
    window.addEventListener('page:rerender', renderCartPage);
  }
});
