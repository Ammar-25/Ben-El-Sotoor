/* =====================================================================
   book-service.js — Domain service for Books.
   UI talks to THIS, never to the JSON directly. Methods return plain
   data objects (the "contract"); keep their shapes stable when migrating
   to a backend so the UI keeps working.
   ===================================================================== */

const BookService = (() => {
  const SOURCE = 'data/books.json';

  async function all() {
    const data = await DataClient.fetchJson(SOURCE);
    return data.books;
  }

  async function getById(id) {
    const books = await all();
    return books.find((b) => b.id === Number(id)) || null;
  }

  async function byAuthor(authorId) {
    const books = await all();
    return books.filter((b) => b.authorId === Number(authorId));
  }

  async function byCategory(category) {
    const books = await all();
    return category === 'all' ? books : books.filter((b) => b.category === category);
  }

  async function featured(limit = 8) {
    const books = await all();
    return [...books].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  async function newest(limit = 12) {
    const books = await all();
    return [...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }

  /** Latest filtered by time window: 'weekly' | 'monthly' | 'yearly' | 'all' */
  async function latest(range = 'all') {
    const books = await all();
    if (range === 'all') return books;
    const now = new Date();
    const cutoff = new Date(now);
    if (range === 'weekly') cutoff.setDate(now.getDate() - 7);
    else if (range === 'monthly') cutoff.setMonth(now.getMonth() - 1);
    else if (range === 'yearly') cutoff.setFullYear(now.getFullYear() - 1);
    // Demo data spans a couple of years, so "weekly/monthly" relative to
    // today may be empty; fall back to the N most-recent for a good demo.
    const filtered = books.filter((b) => new Date(b.createdAt) >= cutoff);
    if (filtered.length) return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const n = range === 'weekly' ? 4 : range === 'monthly' ? 8 : 12;
    return newest(n);
  }

  /** Free-text + filters search. opts: {q, category, lang, maxPrice} */
  async function search(opts = {}) {
    const { q = '', category = 'all', maxPrice = Infinity } = opts;
    const books = await all();
    const term = q.trim().toLowerCase();
    return books.filter((b) => {
      const matchesText = !term ||
        b.title.ar.toLowerCase().includes(term) ||
        b.title.en.toLowerCase().includes(term);
      const matchesCat = category === 'all' || b.category === category;
      const matchesPrice = b.price <= maxPrice;
      return matchesText && matchesCat && matchesPrice;
    });
  }

  /** Lightweight suggestion list for live search. */
  async function suggest(q, limit = 6) {
    const results = await search({ q });
    return results.slice(0, limit);
  }

  /** Distinct categories with counts (for categories page). */
  async function categoriesWithCounts() {
    const books = await all();
    const map = {};
    books.forEach((b) => { map[b.category] = (map[b.category] || 0) + 1; });
    return Object.entries(map).map(([key, count]) => ({ key, count }));
  }

  return {
    all, getById, byAuthor, byCategory, featured, newest, latest,
    search, suggest, categoriesWithCounts,
  };
})();

window.BookService = BookService;
