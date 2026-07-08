/* =====================================================================
   book.js — Logic for single book details page and reading progress
   ===================================================================== */

async function initBookPage() {
  const host = document.getElementById('book-page-content');
  if (!host) return;

  const params = new URLSearchParams(location.search);
  const bookId = params.get('id');

  if (!bookId) {
    host.innerHTML = `<div class="state-block"><p>${I18N.t('common.noResults')}</p></div>`;
    return;
  }

  // Fetch book and author
  const book = await BookService.getById(bookId);
  if (!book) {
    location.href = '404.html';
    return;
  }

  const author = await AuthorService.getById(book.authorId);
  const authorName = author ? I18N.pick(author.name) : '';
  
  // Local storage keys for reading progress
  const lsKeyReading = `reading_${book.id}`;
  const lsKeyPages = `pages_${book.id}`;
  
  let isReading = false;
  let savedPages = 0;
  const totalPages = book.pages || 1;

  if (window.AuthService && AuthService.isAuthenticated()) {
      try {
          const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/Profile/progress');
          if (res.ok) {
              const progresses = await res.json();
              const progress = progresses.find(p => p.bookId == book.id);
              if (progress) {
                  isReading = true;
                  savedPages = Math.round((progress.progressPercentage / 100) * totalPages);
              }
          }
      } catch (err) {
          console.error("Failed to load reading progress:", err);
      }
  } else {
      isReading = localStorage.getItem(lsKeyReading) === 'true';
      savedPages = parseInt(localStorage.getItem(lsKeyPages)) || 0;
  }
  
  // Calculate percentage
  const getPct = (p) => Math.min(100, Math.max(0, Math.round((p / totalPages) * 100)));
  const initialPct = getPct(savedPages);

  const spec = (label, val) => `<div><dt>${label}</dt><dd>${val}</dd></div>`;
  const money = (n) => `${n} ${I18N.t('common.currency')}`;

  const isFav = window.Cart && window.Cart.isFav(book.id);
  const inCart = window.Cart && window.Cart.items().some(i => i.id === Number(book.id));

  host.innerHTML = `
    <div class="book-page-wrap reveal">
      <aside>
        <div class="book-page-cover">
          <img src="${book.cover}" alt="${I18N.pick(book.title)}" onerror="this.src='assets/images/ui/book-placeholder.png'">
          <div class="book-page-price">
            <span class="now">${money(book.price)}</span>
            ${book.oldPrice > book.price ? `<span class="was">${money(book.oldPrice)}</span>` : ''}
          </div>
          <div class="book-page-actions" style="margin-top: 1.5rem;">
            <button class="btn btn-primary btn-lg book-cart-btn ${inCart ? 'added' : ''}" data-add="${book.id}" ${inCart ? 'disabled' : ''}>
              ${UI.icon.cart} <span class="cart-btn-text">${inCart ? I18N.t('common.added') : I18N.t('common.addToCart')}</span>
            </button>
            <button class="btn btn-outline ${isFav ? 'active' : ''}" data-fav="${book.id}">
              ${UI.icon.heart} ${I18N.t('common.favorite')}
            </button>
          </div>
        </div>
      </aside>

      <div class="book-page-main">
        <div class="book-page-info">
          <div class="book-page-header">
            <h1 class="book-page-title">${I18N.pick(book.title)}</h1>
            <a href="author-details.html?id=${book.authorId}" class="book-page-author">${I18N.t('common.by')} ${authorName}</a>
            <div class="book-page-meta">
              <span class="rating-score-badge">
                <span class="rating-score-number">${book.rating}</span>
                <span class="rating-score-max">/ 5</span>
              </span>
              ${UI.stars(book.rating)}
              <span class="rating-reviews-count">${book.reviewsCount} ${I18N.t('common.reviews')}</span>
            </div>
          </div>
          
          <div class="book-page-desc">
            ${I18N.pick(book.description)}
          </div>

          <dl class="book-page-specs">
            ${spec(I18N.t('modal.publisher'), I18N.pick(book.publisher))}
            ${spec(I18N.t('modal.language'), I18N.pick(book.bookLanguage))}
            ${spec(I18N.t('modal.pages'), book.pages)}
            ${spec(I18N.t('modal.year'), book.year)}
            ${spec(I18N.t('modal.category'), I18N.t('categories.' + book.category))}
          </dl>

          <!-- Reading Progress Tracker -->
          <div class="reading-progress-card">
            <div class="reading-progress-header">
              <h3>📖 ${I18N.lang === 'ar' ? 'تتبع قراءتك' : 'Track Reading'}</h3>
              <label class="reading-progress-toggle">
                <input type="checkbox" id="is-reading-cb" style="display:none;" ${isReading ? 'checked' : ''}>
                <div class="toggle-switch"></div>
                <span>${I18N.lang === 'ar' ? 'أقرأه حالياً' : 'Currently Reading'}</span>
              </label>
            </div>
            
            <div class="reading-progress-body ${isReading ? 'open' : ''}" id="reading-body">
              <div class="progress-track-wrap">
                <div class="progress-track-info">
                  <span>${I18N.lang === 'ar' ? 'الصفحات المقروءة:' : 'Pages read:'} <b id="pages-text">${savedPages}</b> / ${totalPages}</span>
                  <span class="pct" id="pct-text">${initialPct}%</span>
                </div>
                <div class="progress-bar-thick">
                  <div class="fill" id="progress-fill" style="width: ${initialPct}%"></div>
                </div>
              </div>
              <div class="progress-controls">
                <input type="number" id="pages-input" class="input" min="0" max="${totalPages}" value="${savedPages}">
                <button class="btn btn-primary" id="save-progress-btn">${I18N.lang === 'ar' ? 'تحديث' : 'Update'}</button>
              </div>
            </div>
          </div>
          
          <!-- Reviews Section -->
          <div class="book-reviews-section" style="margin-top: 3rem;">
            <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;" data-i18n="reviews.title">${I18N.lang === 'ar' ? 'التقييمات والمراجعات' : 'Reviews'}</h3>
            
            <div id="book-reviews-list">
              <div class="spinner"></div>
            </div>
            
            <div id="book-reviews-pagination" class="pagination" style="margin-top: 1rem; justify-content: center; display: none; gap: 0.5rem;"></div>
            
            <div class="review-form-wrap auth-card" style="margin-top: 2rem; max-width: 100%;">
              <h4 style="margin-bottom:1rem" data-i18n="reviews.writeReview">${I18N.lang === 'ar' ? 'اكتب مراجعة' : 'Write a review'}</h4>
              <form id="book-review-form" novalidate>
                <div class="field">
                  <label data-i18n="reviews.yourRating">${I18N.lang === 'ar' ? 'تقييمك' : 'Your Rating'}</label>
                  <div class="rating-input">
                    <input type="radio" id="r5" name="rating" value="5" checked><label for="r5">★</label>
                    <input type="radio" id="r4" name="rating" value="4"><label for="r4">★</label>
                    <input type="radio" id="r3" name="rating" value="3"><label for="r3">★</label>
                    <input type="radio" id="r2" name="rating" value="2"><label for="r2">★</label>
                    <input type="radio" id="r1" name="rating" value="1"><label for="r1">★</label>
                  </div>
                </div>
                <div class="field">
                  <label for="review-text" data-i18n="reviews.yourReview">${I18N.lang === 'ar' ? 'رأيك' : 'Your Review'}</label>
                  <textarea class="textarea" id="review-text" name="review" required></textarea>
                </div>
                <button class="btn btn-primary btn-block" type="submit" data-i18n="reviews.submit">${I18N.lang === 'ar' ? 'إرسال المراجعة' : 'Submit Review'}</button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;

  UI.observeReveal(host);

  // Initialize interactive elements
  const isReadingCb = document.getElementById('is-reading-cb');
  const readingBody = document.getElementById('reading-body');
  const pagesInput = document.getElementById('pages-input');
  const saveBtn = document.getElementById('save-progress-btn');
  const pagesText = document.getElementById('pages-text');
  const pctText = document.getElementById('pct-text');
  const progressFill = document.getElementById('progress-fill');

  isReadingCb.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    
    if (window.AuthService && AuthService.isAuthenticated()) {
       if (checked && savedPages === 0) {
           try {
                await AuthService.fetchAuthenticated('http://localhost:5033/api/Profile/progress', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: parseInt(book.id), progressPercentage: 0 })
                });
           } catch(err) { console.error(err); }
       }
    } else {
       localStorage.setItem(lsKeyReading, checked);
    }

    if (checked) {
      readingBody.classList.add('open');
    } else {
      readingBody.classList.remove('open');
    }
  });

  saveBtn.addEventListener('click', async () => {
    let val = parseInt(pagesInput.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > totalPages) val = totalPages;
    
    pagesInput.value = val;
    const pct = getPct(val);
    
    if (window.AuthService && AuthService.isAuthenticated()) {
        const oldText = saveBtn.innerText;
        saveBtn.innerText = '...';
        saveBtn.disabled = true;
        try {
            const res = await AuthService.fetchAuthenticated('http://localhost:5033/api/Profile/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: parseInt(book.id), progressPercentage: pct })
            });
            if (!res.ok) throw new Error('Failed to update');
        } catch (err) {
            console.error("Failed to save progress to server", err);
            UI.toast(I18N.lang === 'ar' ? 'فشل تحديث التقدم' : 'Failed to update progress', 'error');
            saveBtn.innerText = oldText;
            saveBtn.disabled = false;
            return;
        }
        saveBtn.innerText = oldText;
        saveBtn.disabled = false;
    } else {
        localStorage.setItem(lsKeyPages, val);
    }
    
    pagesText.textContent = val;
    pctText.textContent = pct + '%';
    progressFill.style.width = pct + '%';
    
    UI.toast(I18N.lang === 'ar' ? 'تم تحديث تقدم القراءة بنجاح' : 'Reading progress updated successfully');
  });

  // Dynamic cart sync
  function syncCartBtn() {
    const btn = host.querySelector('.book-cart-btn');
    const span = btn.querySelector('.cart-btn-text');
    if (!btn || !window.Cart) return;
    const inC = Cart.items().some(i => i.id === Number(book.id));
    if (inC) {
      btn.classList.add('added');
      btn.setAttribute('disabled', 'true');
      span.textContent = I18N.t('common.added');
    } else {
      btn.classList.remove('added');
      btn.removeAttribute('disabled');
      span.textContent = I18N.t('common.addToCart');
    }
  }

  // Remove old listeners to prevent duplication
  if (window._bookCartSync) window.removeEventListener('cart:changed', window._bookCartSync);
  window._bookCartSync = syncCartBtn;
  window.addEventListener('cart:changed', window._bookCartSync);

  // Reviews logic
  const reviewsList = document.getElementById('book-reviews-list');
  const paginationHost = document.getElementById('book-reviews-pagination');
  const reviewForm = document.getElementById('book-review-form');
  
  let currentPage = 1;
  const limit = 5;

  async function loadReviews(page) {
    if (!reviewsList) return;
    reviewsList.innerHTML = '<div class="spinner"></div>';
    
    const data = await ReviewService.byBook(bookId, page, limit);
    const items = data.items || [];
    const totalCount = data.totalCount || 0;
    
    if (items.length === 0) {
      reviewsList.innerHTML = `<p style="color:var(--text-muted); padding: 1rem 0;">${I18N.lang === 'ar' ? 'لا توجد مراجعات بعد. كن أول من يكتب مراجعة!' : 'No reviews yet. Be the first to review!'}</p>`;
      paginationHost.style.display = 'none';
      return;
    }
    
    reviewsList.innerHTML = items.map(r => `
      <div class="review-item" style="border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
        <div class="ri-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <b style="font-size: 1.1rem;">${I18N.pick(r.userName)}</b>
            <span>${UI.stars(r.rating)}</span>
          </div>
          <span class="ri-date" style="color: var(--text-muted); font-size: 0.9rem;">${r.date}</span>
        </div>
        <div class="ri-body" style="line-height: 1.6;">${I18N.pick(r.text)}</div>
      </div>
    `).join('');
    
    renderPagination(totalCount, page);
  }

  function renderPagination(totalCount, page) {
    const totalPages = Math.ceil(totalCount / limit);
    if (totalPages <= 1) {
      paginationHost.style.display = 'none';
      return;
    }
    
    paginationHost.style.display = 'flex';
    let html = '';
    
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="btn btn-outline btn-sm ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    paginationHost.innerHTML = html;
    
    paginationHost.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentPage = parseInt(e.target.dataset.page);
        loadReviews(currentPage);
      });
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!window.AuthService || !AuthService.isAuthenticated()) {
        UI.toast(I18N.lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
        return;
      }
      
      const ratingInput = reviewForm.querySelector('[name="rating"]:checked');
      const rating = ratingInput ? parseInt(ratingInput.value) : 5;
      const text = reviewForm.querySelector('[name="review"]').value.trim();
      
      if (!text) return;
      
      const btn = reviewForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      
      const reviewReq = {
        bookId: parseInt(bookId),
        rating,
        text: { ar: text, en: text }
      };
      
      const created = await ReviewService.add(reviewReq);
      btn.disabled = false;
      
      if (created) {
        book.reviewsCount = (book.reviewsCount || 0) + 1;
        const reviewsCountElem = host.querySelector('.rating-reviews-count');
        if (reviewsCountElem) {
          reviewsCountElem.innerHTML = `${book.reviewsCount} ${I18N.t('common.reviews')}`;
        }
        reviewForm.reset();
        UI.toast(I18N.lang === 'ar' ? 'تمت إضافة مراجعتك بنجاح!' : 'Your review has been added!');
        currentPage = 1;
        loadReviews(currentPage);
      } else {
        UI.toast(I18N.lang === 'ar' ? 'حدث خطأ. هل اشتريت أو قرأت هذا الكتاب؟' : 'Error. Have you purchased or read this book?', 'error');
      }
    });
  }

  loadReviews(currentPage);
}

document.addEventListener('DOMContentLoaded', initBookPage);
window.addEventListener('page:rerender', initBookPage);
