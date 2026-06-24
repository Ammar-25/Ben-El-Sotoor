/* =====================================================================
   review-service.js — Domain service for Reviews.
   Also persists user-submitted reviews to localStorage so the demo feels
   live. When a backend exists, replace the localStorage parts with POST.
   ===================================================================== */

const ReviewService = (() => {
  const SOURCE = 'data/reviews.json';
  const LS_KEY = 'bayn_user_reviews';

  function localReviews() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  }

  async function all() {
    const data = await DataClient.fetchJson(SOURCE);
    return [...data.reviews, ...localReviews()];
  }

  async function byBook(bookId) {
    const reviews = await all();
    return reviews.filter((r) => r.bookId === Number(bookId));
  }

  /** Aggregate: { average, total, breakdown:{5:n,4:n,...} } */
  async function summary(bookId = null) {
    let reviews = await all();
    if (bookId != null) reviews = reviews.filter((r) => r.bookId === Number(bookId));
    const total = reviews.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; sum += r.rating; });
    return { average: total ? +(sum / total).toFixed(1) : 0, total, breakdown, reviews };
  }

  /** Persist a new review locally (future: POST to API). */
  function add(review) {
    const list = localReviews();
    const entry = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...review };
    list.unshift(entry);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return entry;
  }

  return { all, byBook, summary, add };
})();

window.ReviewService = ReviewService;
