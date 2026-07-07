/* =====================================================================
   author-service.js — Domain service for Authors.
   ===================================================================== */

const AuthorService = (() => {
  const API_BASE = 'http://localhost:5033/api/authors';

  // Helper for GET requests
  async function fetchApi(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('[AuthorService]', e);
      return null;
    }
  }

  async function all() {
    const res = await fetchApi('');
    return res || [];
  }

  async function getById(id) {
    return await fetchApi(`/${id}`);
  }

  /** Resolve an author's display name for a given language, safe if missing. */
  async function nameOf(id, lang = 'ar') {
    const author = await getById(id);
    if (!author) return '';
    // Handle both { ar: '...', en: '...' } and flat string names
    if (author.name && typeof author.name === 'object') {
      return author.name[lang] || author.name.en || author.name.ar || '';
    }
    return author.name || author.Name || '';
  }

  async function featured(limit = 4) {
    const res = await fetchApi(`/featured?limit=${limit}`);
    return res || [];
  }

  return { all, getById, nameOf, featured };
})();

window.AuthorService = AuthorService;
