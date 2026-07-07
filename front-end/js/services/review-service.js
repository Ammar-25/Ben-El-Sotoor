/* =====================================================================
   review-service.js — Domain service for Reviews.
   Also persists user-submitted reviews to localStorage so the demo feels
   live. When a backend exists, replace the localStorage parts with POST.
   ===================================================================== */

const ReviewService = (() => {
  const API_BASE = 'http://localhost:5033/api/reviews';

  // Helper for GET requests
  async function fetchApi(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('[ReviewService]', e);
      return null;
    }
  }

  async function all() {
    const sum = await summary();
    return sum ? sum.reviews : [];
  }

  async function byBook(bookId, page = 1, limit = 5) {
    const res = await fetchApi(`/book/${bookId}?page=${page}&limit=${limit}`);
    return res || { items: [], totalCount: 0 };
  }

  /** Aggregate: { average, total, breakdown:{5:n,4:n,...} } */
  async function summary(bookId = null) {
    const endpoint = bookId ? `/summary/${bookId}` : `/summary`;
    const res = await fetchApi(endpoint);
    return res || { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews: [] };
  }

  /** Persist a new review locally (future: POST to API). */
  async function add(review) {
    if (!window.AuthService || !AuthService.isAuthenticated()) return null;
    try {
      const response = await AuthService.fetchAuthenticated(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: review.bookId,
          rating: review.rating,
          textAr: review.text?.ar || review.text,
          textEn: review.text?.en || review.text
        })
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.error('[ReviewService] add error', e);
    }
    return null;
  }

  async function top(limit = 3) {
    const res = await fetchApi(`/top?limit=${limit}`);
    return res || [];
  }

  async function myReviews() {
    if (!window.AuthService || !AuthService.isAuthenticated()) return [];
    try {
      const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/profile/reviews');
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('[ReviewService] myReviews error', e);
    }
    return [];
  }

  return { all, byBook, summary, add, top, myReviews };
})();

window.ReviewService = ReviewService;
