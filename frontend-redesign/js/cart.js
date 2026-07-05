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
    root.innerHTML = `<div class="p-12 text-center rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
      <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background: rgba(184,138,59,.15);">
          <svg viewBox="0 0 24 24" fill="none" stroke="#B88A3B" stroke-width="2" class="w-8 h-8"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      </div>
      <h3 style="font-family: var(--font-heading); color: #4A2E1A; font-size: 1.4rem; margin-bottom: .5rem;" data-i18n="cart.empty">${I18N.t('cart.empty')}</h3>
      <p style="font-family: var(--font); color: #8A6848; font-size: .95rem; margin-bottom: 1.5rem;" data-i18n="cart.emptySub">يبدو أنك لم تضف أي كتب بعد.</p>
      <a class="inline-block px-6 py-3 rounded transition-colors duration-200" href="library.html" style="background: #6B4423; color: #F5EFE3; font-family: var(--font); font-size: .9rem;" data-i18n="cart.emptyCta">${I18N.t('cart.emptyCta')}</a>
    </div>`;
    return;
  }

  const rows = items.map((i) => {
    const b = books.find((x) => x.id === i.id);
    if (!b) return '';
    return `<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded mb-4" data-row="${b.id}" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
      <img class="w-20 h-28 object-cover rounded shadow-sm" src="${b.cover}" alt="${I18N.pick(b.title)}" onerror="this.src='assets/images/ui/book-placeholder.png'" style="border: 1px solid rgba(184,138,59,.2);">
      <div class="flex-1">
        <div style="font-family: var(--font-heading); font-size: 1.1rem; color: #4A2E1A; font-weight: 700; margin-bottom: .25rem;">${I18N.pick(b.title)}</div>
        <div class="author-name" style="font-family: var(--font); font-size: .85rem; color: #8A6848; margin-bottom: .5rem;" data-author="${b.authorId}"></div>
        <div style="font-family: 'Lato', sans-serif; font-size: 1rem; color: #6B4423; font-weight: 600;">${UI.money(b.price)}</div>
      </div>
      <div class="flex flex-col items-end gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
        <div class="flex items-center rounded" style="border: 1px solid #DDD0BB; background: #F5EFE3;">
          <button class="px-3 py-1 text-lg" style="color: #6B4423; transition: background .2s;" data-dec="${b.id}" onmouseenter="this.style.background='rgba(184,138,59,.1)'" onmouseleave="this.style.background='transparent'">−</button>
          <span class="px-3 py-1" style="font-family: 'Lato', sans-serif; font-size: .95rem; color: #2A1A0E; border-left: 1px solid #DDD0BB; border-right: 1px solid #DDD0BB;">${i.qty}</span>
          <button class="px-3 py-1 text-lg" style="color: #6B4423; transition: background .2s;" data-inc="${b.id}" onmouseenter="this.style.background='rgba(184,138,59,.1)'" onmouseleave="this.style.background='transparent'">+</button>
        </div>
        <button class="text-xs transition-colors duration-200" style="color: #dc3545; font-family: var(--font);" data-del="${b.id}" onmouseenter="this.style.color='#a71d2a'" onmouseleave="this.style.color='#dc3545'" data-i18n="cart.remove">${I18N.t('cart.remove')}</button>
      </div>
    </div>`;
  }).join('');

  const t = await Cart.totals();
  root.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">${rows}</div>
      <aside>
        <div class="p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
            <h3 class="text-lg mb-6" style="font-family: var(--font-heading); color: #4A2E1A; border-bottom: 1px solid #DDD0BB; padding-bottom: 1rem;" data-i18n="cart.summary">${I18N.t('cart.summary')}</h3>
            <div class="flex justify-between items-center mb-4 text-sm" style="font-family: var(--font); color: #6B4423;">
                <span data-i18n="cart.subtotal">${I18N.t('cart.subtotal')}</span>
                <span style="font-family: 'Lato', sans-serif;">${UI.money(t.subtotal.toFixed(0))}</span>
            </div>
            <div class="flex justify-between items-center mb-6 text-sm" style="font-family: var(--font); color: #6B4423;">
                <span data-i18n="cart.tax">${I18N.t('cart.tax')}</span>
                <span style="font-family: 'Lato', sans-serif;">${UI.money(t.tax.toFixed(0))}</span>
            </div>
            <div class="flex justify-between items-center mb-8 pt-4" style="border-top: 1px dashed #DDD0BB;">
                <span style="font-family: var(--font-heading); font-size: 1.2rem; color: #2A1A0E;" data-i18n="cart.total">${I18N.t('cart.total')}</span>
                <span style="font-family: 'Lato', sans-serif; font-size: 1.3rem; color: #6B4423; font-weight: 700;">${UI.money(t.total.toFixed(0))}</span>
            </div>
            <button class="w-full py-3 rounded text-sm transition-colors duration-200" id="checkout-btn" style="background: #6B4423; color: #F5EFE3; font-family: var(--font);" onmouseenter="this.style.background='#B88A3B'" onmouseleave="this.style.background='#6B4423'" data-i18n="cart.checkout">${I18N.t('cart.checkout')}</button>
        </div>
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
