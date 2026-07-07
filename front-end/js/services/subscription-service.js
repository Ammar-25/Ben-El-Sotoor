/* =====================================================================
   subscription-service.js — Domain service for Subscription plans.
   ===================================================================== */

const SubscriptionService = (() => {
  const API_BASE = 'http://localhost:5033/api/subscriptions';

  // Helper for GET requests
  async function fetchApi(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('[SubscriptionService]', e);
      return null;
    }
  }

  async function all() {
    const res = await fetchApi('/plans');
    return res || [];
  }

  async function getById(id) {
    const plans = await all();
    return plans.find((p) => p.id === id) || null;
  }

  async function featured() {
    const plans = await all();
    return plans.find((p) => p.isFeatured || p.featured) || null;
  }

  return { all, getById, featured };
})();

window.SubscriptionService = SubscriptionService;
