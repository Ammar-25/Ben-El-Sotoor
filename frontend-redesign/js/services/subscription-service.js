/* =====================================================================
   subscription-service.js — Domain service for Subscription plans.
   ===================================================================== */

const SubscriptionService = (() => {
  const SOURCE = 'data/subscriptions.json';

  async function all() {
    const data = await DataClient.fetchJson(SOURCE);
    return data.plans;
  }

  async function getById(id) {
    const plans = await all();
    return plans.find((p) => p.id === id) || null;
  }

  async function featured() {
    const plans = await all();
    return plans.find((p) => p.featured) || null;
  }

  return { all, getById, featured };
})();

window.SubscriptionService = SubscriptionService;
