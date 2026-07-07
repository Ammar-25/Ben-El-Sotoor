/* =====================================================================
   book-service.js — Domain service for Books.
   UI talks to THIS, never to the JSON directly. Methods return plain
   data objects (the "contract"); keep their shapes stable when migrating
   to a backend so the UI keeps working.
   ===================================================================== */

const BookService = (() => {
  const API_BASE = 'http://localhost:5033/api/books';

  // Helper for GET requests
  async function fetchApi(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('[BookService]', e);
      return null;
    }
  }

  // Fallback for missing backend "all" endpoint. Fetches a large page.
  async function all() {
    const res = await fetchApi('?page=1&pageSize=100');
    return res ? res.data : [];
  }

  async function getById(id) {
    return await fetchApi(`/${id}`);
  }

  async function byAuthor(authorId) {
    // Backend doesn't support author filtering yet. Mock it by filtering the large page.
    const books = await all();
    return books.filter((b) => b.authorId === Number(authorId));
  }

  async function byCategory(category) {
    const catQuery = category === 'all' ? '' : `&category=${encodeURIComponent(category)}`;
    const res = await fetchApi(`?pageSize=100${catQuery}`);
    return res ? res.data : [];
  }

  async function featured(limit = 8) {
    const res = await fetchApi(`/featured?limit=${limit}`);
    return res || [];
  }

  async function newest(limit = 12) {
    const res = await fetchApi(`?sort=newest&pageSize=${limit}`);
    return res ? res.data : [];
  }

  /** Latest filtered by time window: 'weekly' | 'monthly' | 'yearly' | 'all' */
  async function latest(range = 'all') {
    let apiRange = 'all';
    if (range === 'weekly') apiRange = '7days';
    else if (range === 'monthly') apiRange = '30days';
    else if (range === 'yearly') apiRange = '365days';
    
    const res = await fetchApi(`/latest?range=${apiRange}&limit=12`);
    return res || [];
  }

  /** Free-text + filters search. opts: {q, category, lang, maxPrice} */
  async function search(opts = {}) {
    const { q = '', category = 'all', lang = 'all', maxPrice = Infinity } = opts;
    
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category && category !== 'all') params.append('category', category);
    if (lang && lang !== 'all') params.append('lang', lang);
    if (maxPrice !== Infinity) params.append('maxPrice', maxPrice);
    
    const res = await fetchApi(`?${params.toString()}`);
    return res || { data: [], total: 0 };
  }

  /** Lightweight suggestion list for live search. */
  async function suggest(q, limit = 6) {
    const res = await fetchApi(`/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`);
    return res || [];
  }

  /** Distinct categories with counts (for categories page). */
  async function categoriesWithCounts() {
    // Backend doesn't support this yet. Mock it by calculating from the large page.
    const books = await all();
    const map = {};
    books.forEach((b) => { 
        if (b.category) {
            map[b.category] = (map[b.category] || 0) + 1; 
        }
    });
    return Object.entries(map).map(([key, count]) => ({ key, count }));
  }

  return {
    all, getById, byAuthor, byCategory, featured, newest, latest,
    search, suggest, categoriesWithCounts,
  };
})();

window.BookService = BookService;
