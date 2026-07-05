const fs = require('fs');
const file = 'd:/bayna-al-sutoor/frontend-redesign/profile.html';
let content = fs.readFileSync(file, 'utf8');

const mainMatch = content.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!mainMatch) {
    console.log("Could not find main element");
    process.exit(1);
}

const newMain = `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6">
        
        <!-- Header -->
        <div class="rounded p-8 mb-8 flex flex-col md:flex-row items-center gap-6" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 8px 40px rgba(90,55,30,.05);">
          <div class="relative group cursor-pointer">
            <img src="assets/images/ui/author-placeholder.png" alt="User Avatar" id="user-avatar-img" class="w-24 h-24 rounded-full object-cover" style="border: 3px solid #B88A3B; padding: 3px; background: #F8F4EC;">
            <label for="avatar-upload" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </label>
            <input type="file" id="avatar-upload" class="hidden" accept="image/*">
          </div>
          <div class="flex-1 text-center md:text-start">
            <h1 class="mb-1" style="font-family: var(--font-heading); font-size: 2rem; color: #2A1A0E;">محمد علي</h1>
            <p style="font-family: var(--font); color: #8A6848; font-size: .95rem;"><span data-i18n="profile.memberSince">قارئ منذ</span> 2024</p>
          </div>
          <div>
            <a href="settings.html" class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm transition-colors duration-200" style="border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font); background: #F8F4EC;" onmouseenter="this.style.background='#F5EFE3'" onmouseleave="this.style.background='#F8F4EC'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              الإعدادات
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div class="text-center p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
              <div style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #6B4423; font-weight: 700;">12</div>
              <div style="font-family: var(--font); font-size: .85rem; color: #8A6848; margin-top: .5rem;" data-i18n="profile.booksRead">كتب مقروءة</div>
          </div>
          <div class="text-center p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
              <div style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #6B4423; font-weight: 700;">3</div>
              <div style="font-family: var(--font); font-size: .85rem; color: #8A6848; margin-top: .5rem;" data-i18n="profile.inProgress">قيد القراءة</div>
          </div>
          <div class="text-center p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
              <div style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #6B4423; font-weight: 700;" data-fav-mirror>0</div>
              <div style="font-family: var(--font); font-size: .85rem; color: #8A6848; margin-top: .5rem;" data-i18n="profile.favorites">رف المفضلة</div>
          </div>
          <div class="text-center p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
              <div style="font-family: 'Playfair Display', serif; font-size: 2rem; color: #6B4423; font-weight: 700;">8</div>
              <div style="font-family: var(--font); font-size: .85rem; color: #8A6848; margin-top: .5rem;" data-i18n="reviews.userReviews">المراجعات</div>
          </div>
        </div>

        <div>
            <!-- Tabs -->
            <div class="flex overflow-x-auto gap-2 mb-8 border-b" style="border-color: #DDD0BB;" role="tablist">
              <button class="px-6 py-4 text-sm whitespace-nowrap transition-colors" style="border-bottom: 2px solid #B88A3B; color: #4A2E1A; font-weight: 700; font-family: var(--font);" data-tab="progress" data-i18n="profile.readingProgress">جلسات القراءة</button>
              <button class="px-6 py-4 text-sm whitespace-nowrap transition-colors" style="border-bottom: 2px solid transparent; color: #8A6848; font-family: var(--font);" data-tab="favorites" data-i18n="profile.favorites">المفضلة</button>
              <button class="px-6 py-4 text-sm whitespace-nowrap transition-colors" style="border-bottom: 2px solid transparent; color: #8A6848; font-family: var(--font);" data-tab="reviews" data-i18n="profile.myReviews">تقييماتي</button>
              <button class="px-6 py-4 text-sm whitespace-nowrap transition-colors" style="border-bottom: 2px solid transparent; color: #8A6848; font-family: var(--font);" data-tab="purchased" data-i18n="profile.purchased">مكتبتي</button>
              <button class="px-6 py-4 text-sm whitespace-nowrap transition-colors" style="border-bottom: 2px solid transparent; color: #8A6848; font-family: var(--font);" data-tab="activity">سجل النشاط</button>
            </div>

            <!-- Panels -->
            <div data-panel="progress">
              <div class="space-y-4">
                  <div class="p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
                    <div class="flex justify-between text-sm mb-3" style="font-family: var(--font); color: #4A2E1A;"><span class="font-bold">أسرار الكون</span><span style="font-family: 'Lato', sans-serif;">72%</span></div>
                    <div class="w-full h-2 rounded-full overflow-hidden" style="background: rgba(184,138,59,.2);"><div class="h-full rounded-full" style="background: #B88A3B; width: 72%;"></div></div>
                  </div>
                  <div class="p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
                    <div class="flex justify-between text-sm mb-3" style="font-family: var(--font); color: #4A2E1A;"><span class="font-bold">عقل بلا حدود</span><span style="font-family: 'Lato', sans-serif;">45%</span></div>
                    <div class="w-full h-2 rounded-full overflow-hidden" style="background: rgba(184,138,59,.2);"><div class="h-full rounded-full" style="background: #B88A3B; width: 45%;"></div></div>
                  </div>
                  <div class="p-6 rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
                    <div class="flex justify-between text-sm mb-3" style="font-family: var(--font); color: #4A2E1A;"><span class="font-bold">فن الهدوء</span><span style="font-family: 'Lato', sans-serif;">20%</span></div>
                    <div class="w-full h-2 rounded-full overflow-hidden" style="background: rgba(184,138,59,.2);"><div class="h-full rounded-full" style="background: #B88A3B; width: 20%;"></div></div>
                  </div>
              </div>
            </div>

            <div data-panel="favorites" class="hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="profile-favorites" aria-live="polite"></div>
            </div>

            <div data-panel="reviews" class="hidden">
              <div class="space-y-4" id="profile-reviews"></div>
            </div>

            <div data-panel="purchased" class="hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="profile-purchased"></div>
            </div>

            <div data-panel="activity" class="hidden">
              <div class="space-y-6 border-r-2 pr-6" style="border-color: #DDD0BB;">
                <div class="relative">
                  <div class="absolute w-3 h-3 rounded-full -right-[1.9rem] top-1" style="background: #B88A3B; border: 2px solid #F5EFE3;"></div>
                  <div class="text-xs mb-1" style="font-family: var(--font); color: #8A6848;">اليوم، 10:30 صباحاً</div>
                  <div class="text-sm" style="font-family: var(--font); color: #4A2E1A;">أضفت كتاب <strong style="color: #6B4423;">"عقل بلا حدود"</strong> إلى مفضلتك.</div>
                </div>
                <div class="relative">
                  <div class="absolute w-3 h-3 rounded-full -right-[1.9rem] top-1" style="background: #DDD0BB; border: 2px solid #F5EFE3;"></div>
                  <div class="text-xs mb-1" style="font-family: var(--font); color: #8A6848;">منذ يومين</div>
                  <div class="text-sm" style="font-family: var(--font); color: #4A2E1A;">أكملت قراءة 72% من <strong style="color: #6B4423;">"أسرار الكون"</strong>.</div>
                </div>
                <div class="relative">
                  <div class="absolute w-3 h-3 rounded-full -right-[1.9rem] top-1" style="background: #DDD0BB; border: 2px solid #F5EFE3;"></div>
                  <div class="text-xs mb-1" style="font-family: var(--font); color: #8A6848;">24 أكتوبر 2024</div>
                  <div class="text-sm" style="font-family: var(--font); color: #4A2E1A;">كتبت مراجعة لكتاب <strong style="color: #6B4423;">"فن الهدوء"</strong> وأعطيته تقييم 5 نجوم.</div>
                </div>
              </div>
            </div>
        </div>
      </div>
  </main>`;

content = content.replace(mainMatch[0], newMain);
// Add JS for tabs since old profile layout used CSS that is now gone, wait, old profile didn't use CSS for tabs? 
// No, old profile used `ui.js` or `main.js` to handle `data-tab` but we can inject a script here to be safe.
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if(scriptMatch) {
    const tabLogic = `
      const pTabs = document.querySelectorAll('[data-tab]');
      const pPanels = document.querySelectorAll('[data-panel]');
      pTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          pTabs.forEach(t => {
              t.style.borderBottomColor = 'transparent';
              t.style.color = '#8A6848';
              t.style.fontWeight = 'normal';
          });
          tab.style.borderBottomColor = '#B88A3B';
          tab.style.color = '#4A2E1A';
          tab.style.fontWeight = '700';
          
          pPanels.forEach(p => p.classList.add('hidden'));
          document.querySelector('[data-panel="' + tab.dataset.tab + '"]').classList.remove('hidden');
        });
      });
    `;
    content = content.replace(scriptMatch[1], scriptMatch[1] + tabLogic);
}

fs.writeFileSync(file, content, 'utf8');
console.log('profile.html rewritten successfully');
