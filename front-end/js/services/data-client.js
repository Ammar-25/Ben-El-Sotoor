/* =====================================================================
   data-client.js — Low-level data access utility (the ONLY place that
   knows data currently comes from JSON files).
   ---------------------------------------------------------------------
   FUTURE MIGRATION: To switch from JSON files to a REST API (Laravel,
   ASP.NET Core, Node, ...) change ONLY this file — point `fetchJson` at
   your endpoint, or replace the body with an authenticated fetch. The
   services above and the entire UI stay untouched because they depend on
   the service contracts, never on the storage mechanism.
   ===================================================================== */

const DataClient = (() => {
  // In-memory cache so each JSON file is fetched once per page load.
  const cache = new Map();

  /**
   * Fetch and parse a JSON resource (relative to site root).
   * @param {string} path e.g. "data/books.json"
   * @returns {Promise<object>}
   */
  async function fetchJson(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        cache.delete(path); // allow retry on failure
        console.error('[DataClient]', err);
        throw err;
      });
    cache.set(path, promise);
    return promise;
  }

  return { fetchJson };
})();

window.DataClient = DataClient;
