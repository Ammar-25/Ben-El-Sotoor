const fs = require('fs');
const file = 'd:/bayna-al-sutoor/frontend-redesign/library.html';
let content = fs.readFileSync(file, 'utf8');

const mainMatch = content.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!mainMatch) {
    console.log("Could not find main element");
    process.exit(1);
}

const newMain = `<main id="main" class="min-h-screen pt-28" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-10">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
          <h1 class="text-center mb-2" style="font-family: var(--font-heading); font-size: clamp(1.8rem,4vw,3rem); color: #4A2E1A;" data-i18n="nav.library">المكتبة</h1>
          <p class="text-center text-sm mb-8" style="font-family: var(--font); color: #8A6848;" data-i18n="sections.featuredSub">اكتشف كنوز الأدب العربي والعالمي</p>
          
          <!-- Search + Filter -->
          <div class="flex gap-3 flex-wrap items-center">
            <div class="flex-1 min-w-64 flex items-center gap-3 px-4 py-3 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8A6848" stroke-width="2" class="w-4 h-4 shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input id="library-search" type="search" placeholder="ابحث عن كتاب أو مؤلف..." data-i18n-attr="placeholder:common.search" class="flex-1 bg-transparent outline-none text-sm w-full" style="font-family: var(--font); color: #2A1A0E;">
            </div>
            
            <div class="shrink-0">
                <select class="px-4 py-3 rounded text-sm outline-none" id="library-sort" style="background: #FCFAF5; border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);">
                <option value="newest" data-i18n="sort.newest">الأحدث</option>
                <option value="priceLow" data-i18n="sort.priceLow">السعر: من الأقل</option>
                <option value="priceHigh" data-i18n="sort.priceHigh">السعر: من الأعلى</option>
                <option value="rating" data-i18n="sort.rating">الأعلى تقييمًا</option>
                </select>
            </div>
          </div>
          <div class="mt-4 flex gap-2 flex-wrap" id="library-chips"></div>
          <p id="library-count" class="mt-4 text-sm" style="color: var(--text-muted); font-family: var(--font);"></p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="library-grid" aria-live="polite"><div class="spinner mx-auto my-12"></div></div>
        
        <div class="flex justify-center gap-2 mt-12" id="library-pager"></div>
      </div>
  </main>`;

content = content.replace(mainMatch[0], newMain);
fs.writeFileSync(file, content, 'utf8');
console.log('library.html rewritten successfully');
