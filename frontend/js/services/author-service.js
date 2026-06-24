/* =====================================================================
   author-service.js — Domain service for Authors.
   ===================================================================== */

const AuthorService = (() => {
  const SOURCE = 'data/authors.json';

  async function all() {
    const data = await DataClient.fetchJson(SOURCE);
    return data.authors;
  }

  async function getById(id) {
    const authors = await all();
    return authors.find((a) => a.id === Number(id)) || null;
  }

  /** Resolve an author's display name for a given language, safe if missing. */
  async function nameOf(id, lang = 'ar') {
    const author = await getById(id);
    return author ? author.name[lang] : '';
  }

  async function featured(limit = 4) {
    const authors = await all();
    return [...authors].sort((a, b) => b.followers - a.followers).slice(0, limit);
  }

  return { all, getById, nameOf, featured };
})();

window.AuthorService = AuthorService;
