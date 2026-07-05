const fs = require('fs');

// ─── Helper: page header ornament ───────────────────────────────────────────
const ornament = (title, subtitle, i18nTitle = '', i18nSub = '') => `
        <div class="mb-10 text-center">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h1 class="mb-2" style="font-family: var(--font-heading); font-size: clamp(1.8rem,4vw,3rem); color: #4A2E1A;" ${i18nTitle ? `data-i18n="${i18nTitle}"` : ''}>${title}</h1>
            ${subtitle ? `<p style="font-family: var(--font); color: #8A6848; font-size: 1.1rem;" ${i18nSub ? `data-i18n="${i18nSub}"` : ''}>${subtitle}</p>` : ''}
        </div>`;

// ─── Helper: replace main ───────────────────────────────────────────────────
function replaceMain(file, newMain) {
    let c = fs.readFileSync(file, 'utf8');
    // Match both with and without class/style attributes
    const m = c.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
    if (!m) { console.log(`SKIP (no <main>): ${file}`); return; }
    c = c.replace(m[0], newMain);
    fs.writeFileSync(file, c, 'utf8');
    console.log(`OK: ${file}`);
}

const BASE = 'd:/bayna-al-sutoor/frontend-redesign';

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEARCH PAGE
// ─────────────────────────────────────────────────────────────────────────────
replaceMain(`${BASE}/search.html`, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6">
        ${ornament('بحث', 'ابحث في مكتبة بين السطور', 'nav.search', 'sections.searchSub')}

        <!-- Big search bar -->
        <div class="max-w-2xl mx-auto mb-8">
            <div class="flex items-center gap-3 px-5 py-4 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.07);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#8A6848" stroke-width="2" class="w-5 h-5 shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <label class="visually-hidden" for="search-input" data-i18n="common.search">ابحث عن كتاب أو مؤلف...</label>
                <input class="flex-1 bg-transparent outline-none text-sm w-full" id="search-input" type="search" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="search-suggestions" data-i18n-attr="placeholder:common.search" placeholder="ابحث عن كتاب أو مؤلف..." style="font-family: var(--font); color: #2A1A0E; font-size: 1rem;">
            </div>
            <ul class="hidden" id="search-suggestions" role="listbox" aria-label="Suggestions" style="background: #FCFAF5; border: 1px solid #DDD0BB; border-top: none; border-radius: 0 0 6px 6px; box-shadow: 0 8px 20px rgba(90,55,30,.1); list-style: none;"></ul>
        </div>

        <!-- Filters row -->
        <div class="flex flex-wrap gap-4 mb-8 p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
            <div class="flex-1 min-w-40">
                <label for="search-category" class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="filters.category">التصنيف</label>
                <select class="w-full px-3 py-2 rounded text-sm outline-none" id="search-category" style="background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);"></select>
            </div>
            <div class="flex-1 min-w-40">
                <label for="search-language" class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="filters.language">اللغة</label>
                <select class="w-full px-3 py-2 rounded text-sm outline-none" id="search-language" style="background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);">
                    <option value="all" data-i18n="common.all">الكل</option>
                    <option value="العربية">العربية</option>
                    <option value="Arabic">Arabic</option>
                </select>
            </div>
            <div class="flex-1 min-w-40">
                <label for="search-price" class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;"><span data-i18n="filters.priceRange">نطاق السعر</span> — <span id="search-price-label" data-i18n="common.all">الكل</span></label>
                <input type="range" id="search-price" min="50" max="150" step="10" value="150" class="w-full" style="accent-color: #B88A3B;">
            </div>
        </div>

        <p id="search-count" class="mb-6 text-sm" style="color: var(--text-muted); font-family: var(--font);"></p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="search-results" aria-live="polite"></div>
      </div>
  </main>`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CATEGORIES PAGE
// ─────────────────────────────────────────────────────────────────────────────
replaceMain(`${BASE}/categories.html`, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-7xl mx-auto px-6">
        ${ornament('تصفّح حسب التصنيف', 'اعثر على ما يناسب ذوقك', 'sections.categories', 'sections.categoriesSub')}

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-16" id="categories-grid"><div class="spinner mx-auto col-span-full"></div></div>

        <div id="category-books-section" class="hidden">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px flex-1" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <h2 id="category-books-title" style="font-family: var(--font-heading); color: #2A1A0E; font-size: 1.6rem; white-space: nowrap;">…</h2>
                <div class="h-px flex-1" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="category-books" aria-live="polite"></div>
        </div>
      </div>
  </main>`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. REVIEWS PAGE
// ─────────────────────────────────────────────────────────────────────────────
replaceMain(`${BASE}/reviews.html`, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6">
        ${ornament('التقييمات والمراجعات', '', 'reviews.title', '')}

        <div id="reviews-root">
            <div id="reviews-summary" class="mb-10"></div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div class="lg:col-span-2">
                    <h2 class="mb-6 text-lg flex items-center gap-3" style="font-family: var(--font-heading); color: #2A1A0E;">
                        <div class="h-px w-8" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                        <span data-i18n="reviews.userReviews">آراء القراء</span>
                    </h2>
                    <div id="reviews-list" class="space-y-4"></div>
                </div>

                <!-- Review form -->
                <aside>
                    <div class="p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.05); position: sticky; top: 6rem;">
                        <h3 class="mb-6 text-lg" style="font-family: var(--font-heading); color: #4A2E1A; border-bottom: 1px solid #DDD0BB; padding-bottom: 1rem;" data-i18n="reviews.writeReview">اكتب مراجعة</h3>
                        <form id="review-form" novalidate class="space-y-4">
                            <div>
                                <label class="block text-xs mb-3" style="font-family: var(--font); color: #6B4423;" data-i18n="reviews.yourRating">تقييمك</label>
                                <div class="rating-input flex flex-row-reverse justify-end gap-1">
                                    <input type="radio" id="r5" name="rating" value="5" checked class="hidden"><label for="r5" class="text-2xl cursor-pointer transition-colors" style="color: #B88A3B;">★</label>
                                    <input type="radio" id="r4" name="rating" value="4" class="hidden"><label for="r4" class="text-2xl cursor-pointer transition-colors" style="color: #B88A3B;">★</label>
                                    <input type="radio" id="r3" name="rating" value="3" class="hidden"><label for="r3" class="text-2xl cursor-pointer transition-colors" style="color: #B88A3B;">★</label>
                                    <input type="radio" id="r2" name="rating" value="2" class="hidden"><label for="r2" class="text-2xl cursor-pointer transition-colors" style="color: #B88A3B;">★</label>
                                    <input type="radio" id="r1" name="rating" value="1" class="hidden"><label for="r1" class="text-2xl cursor-pointer transition-colors" style="color: #B88A3B;">★</label>
                                </div>
                            </div>
                            <div>
                                <label for="review-text" class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="reviews.yourReview">رأيك</label>
                                <textarea class="w-full px-4 py-3 rounded outline-none text-sm" id="review-text" name="review" required rows="5" style="background: #F8F4EC; border: 1px solid #DDD0BB; font-family: var(--font); color: #2A1A0E; resize: vertical;"></textarea>
                            </div>
                            <button class="w-full py-3 rounded text-sm transition-colors duration-200" type="submit" style="background: #6B4423; color: #F5EFE3; font-family: var(--font);" onmouseenter="this.style.background='#B88A3B'" onmouseleave="this.style.background='#6B4423'" data-i18n="reviews.submit">إرسال المراجعة</button>
                        </form>
                    </div>
                </aside>
            </div>
        </div>
      </div>
  </main>`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. QUOTES PAGE
// ─────────────────────────────────────────────────────────────────────────────
replaceMain(`${BASE}/quotes.html`, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-3xl mx-auto px-6">
        ${ornament('اقتباسات', 'مختارات من أجمل ما كُتب، كلمات خالدة تضيء العقول.')}

        <div class="space-y-8">
            <div class="relative p-10 rounded text-center group transition-all duration-500 hover:-translate-y-1" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.06);">
                <div class="absolute top-6 inset-x-0 text-center opacity-10" style="font-family: 'Amiri', serif; font-size: 8rem; line-height: 1; color: #B88A3B; pointer-events: none;">"</div>
                <p class="relative z-10 mb-6" style="font-family: 'Amiri', serif; font-size: 1.7rem; line-height: 1.8; color: #4A2E1A;">من يقرأ يعش ألف حياة قبل أن يموت، ومن لا يقرأ يعش حياة واحدة فقط.</p>
                <p style="font-family: var(--font); color: #8A6848; font-size: .95rem;">— جورج ر.ر. مارتن</p>
            </div>
            <div class="relative p-10 rounded text-center group transition-all duration-500 hover:-translate-y-1" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.06);">
                <div class="absolute top-6 inset-x-0 text-center opacity-10" style="font-family: 'Amiri', serif; font-size: 8rem; line-height: 1; color: #B88A3B; pointer-events: none;">"</div>
                <p class="relative z-10 mb-6" style="font-family: 'Amiri', serif; font-size: 1.7rem; line-height: 1.8; color: #4A2E1A;">القراءة رحلة لا تنتهي، تبدأ من أول حرف وتنتهي حيث لا حدود للخيال.</p>
                <p style="font-family: var(--font); color: #8A6848; font-size: .95rem;">— بين السطور</p>
            </div>
            <div class="relative p-10 rounded text-center group transition-all duration-500 hover:-translate-y-1" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.06);">
                <div class="absolute top-6 inset-x-0 text-center opacity-10" style="font-family: 'Amiri', serif; font-size: 8rem; line-height: 1; color: #B88A3B; pointer-events: none;">"</div>
                <p class="relative z-10 mb-6" style="font-family: 'Amiri', serif; font-size: 1.7rem; line-height: 1.8; color: #4A2E1A;">الكتب ليست أكواماً من الورق، بل عقول محفوظة بانتظار من يوقظها.</p>
                <p style="font-family: var(--font); color: #8A6848; font-size: .95rem;">— مؤلف مجهول</p>
            </div>
            <div class="relative p-10 rounded text-center group transition-all duration-500 hover:-translate-y-1" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.06);">
                <div class="absolute top-6 inset-x-0 text-center opacity-10" style="font-family: 'Amiri', serif; font-size: 8rem; line-height: 1; color: #B88A3B; pointer-events: none;">"</div>
                <p class="relative z-10 mb-6" style="font-family: 'Amiri', serif; font-size: 1.7rem; line-height: 1.8; color: #4A2E1A;">أعظم كنوز الدنيا لا تكمن في الذهب، بل في الكلمات المطبوعة التي تبني صرح المعرفة.</p>
                <p style="font-family: var(--font); color: #8A6848; font-size: .95rem;">— والت ديزني</p>
            </div>
        </div>
      </div>
  </main>`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUBSCRIPTIONS PAGE (update hero)
// ─────────────────────────────────────────────────────────────────────────────
replaceMain(`${BASE}/subscriptions.html`, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6">
        ${ornament('اختر خطتك', 'خطط مرنة تناسب كل قارئ', 'subscriptions.title', 'subscriptions.subtitle')}

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" id="plans-grid"><div class="spinner mx-auto col-span-full"></div></div>

        <!-- Comparison table -->
        <div class="mb-20">
            <h2 class="text-center mb-8" style="font-family: var(--font-heading); font-size: 1.8rem; color: #4A2E1A;" data-i18n="subscriptions.comparison">مقارنة الخطط</h2>
            <div class="rounded overflow-hidden" style="border: 1px solid #DDD0BB;">
                <table class="w-full" id="compare-table" style="border-collapse: collapse;"></table>
            </div>
        </div>

        <!-- FAQ -->
        <div class="mb-20">
            <h2 class="text-center mb-8" style="font-family: var(--font-heading); font-size: 1.8rem; color: #4A2E1A;" data-i18n="subscriptions.faq">الأسئلة الشائعة</h2>
            <div class="max-w-3xl mx-auto space-y-4" id="faq-list"></div>
        </div>

        <!-- CTA Banner -->
        <div class="rounded p-12 text-center relative overflow-hidden" style="background: linear-gradient(135deg, #4A2E1A, #6B4423); border: 1px solid rgba(184,138,59,.3);">
            <div class="absolute inset-0 opacity-5" style="background-image: var(--paper-texture);"></div>
            <div class="relative z-10">
                <div class="text-3xl mb-4" style="color: #B88A3B;">❧</div>
                <h2 class="mb-4" style="font-family: var(--font-heading); font-size: 2.2rem; color: #F5EFE3;" data-i18n="sections.subsCta">اقرأ بلا حدود</h2>
                <p class="mb-8 text-sm" style="font-family: var(--font); color: rgba(245,239,227,.7);" data-i18n="sections.subsCtaSub">اشترك الآن واحصل على وصول كامل لمكتبتنا</p>
                <a class="inline-block px-8 py-3.5 rounded text-sm transition-all duration-300" href="login.html" style="background: #B88A3B; color: #F5EFE3; font-family: var(--font); font-weight: 700;" onmouseenter="this.style.background='#D4AF37'" onmouseleave="this.style.background='#B88A3B'" data-i18n="subscriptions.subscribe">اشترك الآن</a>
            </div>
        </div>
      </div>
  </main>`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. LATEST PAGE
// ─────────────────────────────────────────────────────────────────────────────
const latestFile = `${BASE}/latest.html`;
if (fs.existsSync(latestFile)) {
    replaceMain(latestFile, `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-7xl mx-auto px-6">
        ${ornament('أحدث الإصدارات', 'أجدد الكتب في مكتبتنا', 'nav.latest', '')}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="latest-grid" aria-live="polite"><div class="spinner mx-auto col-span-full"></div></div>
      </div>
  </main>`);
}

console.log('\nAll pages rewritten!');
