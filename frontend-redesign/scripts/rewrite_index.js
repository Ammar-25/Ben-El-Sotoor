const fs = require('fs');
const path = require('path');

const file = 'd:/bayna-al-sutoor/frontend-redesign/index.html';
let content = fs.readFileSync(file, 'utf8');

const mainMatch = content.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!mainMatch) {
    console.log("Could not find main element");
    process.exit(1);
}

// Exactly mirror App.tsx for HomePage
const newMain = `<main id="main">
    <!-- HERO -->
    <section class="relative min-h-screen flex items-center justify-center" style="background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop&auto=format'); background-size: cover; background-position: center;">
      <div class="absolute inset-0" style="background: linear-gradient(to bottom, rgba(20,8,2,.65) 0%, rgba(40,18,6,.72) 60%, rgba(20,8,2,.85) 100%);"></div>

      <!-- Decorative corner ornaments -->
      <div class="absolute top-24 right-8 opacity-20 text-5xl" style="color: #B88A3B; font-family: 'Amiri', serif;">❧</div>
      <div class="absolute top-24 left-8 opacity-20 text-5xl" style="color: #B88A3B; font-family: 'Amiri', serif;">❧</div>

      <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div class="mb-6 flex items-center justify-center gap-3">
          <div class="h-px w-12 opacity-50" style="background: #B88A3B;"></div>
          <span style="color: #B88A3B; font-size: 0.7rem; letter-spacing: 0.3em; font-family: 'Lato', sans-serif; text-transform: uppercase;" data-i18n="hero.tagline">مكتبة رقمية راقية</span>
          <div class="h-px w-12 opacity-50" style="background: #B88A3B;"></div>
        </div>

        <h1 class="mb-4" style="font-family: var(--font-heading); color: #F5EFE3; font-size: clamp(2.2rem,5.5vw,4.5rem); line-height: 1.25; text-shadow: 0 2px 20px rgba(0,0,0,.4);" data-i18n="hero.title">ليست كل الكتب تُقرأ...</h1>
        <h2 class="mb-10" style="font-family: var(--font-heading); color: #C9A96E; font-size: clamp(1.5rem,3.5vw,2.8rem); font-style: italic; line-height: 1.3; text-shadow: 0 2px 12px rgba(0,0,0,.3);" data-i18n="hero.subtitle">بعضها يُعاش بين السطور.</h2>

        <!-- Search bar -->
        <div class="max-w-2xl mx-auto mb-10 relative">
          <form class="flex items-center rounded" style="background: rgba(252,250,245,.12); backdrop-filter: blur(12px); border: 1px solid rgba(184,138,59,.4); padding: 6px 6px 6px 16px;" action="library.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="#B88A3B" stroke-width="2" aria-hidden="true" class="shrink-0 w-5 h-5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input name="q" class="flex-1 bg-transparent outline-none mx-3 text-sm text-[#F5EFE3] placeholder-white/70" style="font-family: var(--font);" placeholder="ابحث في المكتبة... كتب، مؤلفون، مواضيع" data-i18n-attr="placeholder:hero.searchPlaceholder" />
            <button type="submit" class="px-6 py-3 rounded text-sm transition-colors duration-200 shrink-0 hover:bg-[#B88A3B]" style="background: #6B4423; color: #F5EFE3; font-family: var(--font); border: 1px solid rgba(184,138,59,.3);" data-i18n="nav.search">بحث</button>
          </form>
        </div>

        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a class="px-7 py-3 rounded transition-all duration-300 hover:bg-[#B88A3B]" href="library.html" style="background: #6B4423; color: #F5EFE3; font-size: 0.9rem; font-family: var(--font); letter-spacing: 0.05em; box-shadow: 0 4px 16px rgba(90,55,30,.2); border: 1px solid #4A2E1A;" data-i18n="hero.cta">استكشف المكتبة</a>
          <a class="px-7 py-3 rounded transition-all duration-300 hover:border-[#B88A3B] hover:text-[#B88A3B]" href="quiz.html" style="background: transparent; color: #F5EFE3; font-size: 0.9rem; font-family: var(--font); letter-spacing: 0.05em; border: 1px solid rgba(245,239,227,.5);" data-i18n="hero.ctaSecondary">اكتشف كتابك المثالي</a>
        </div>

        <div class="mt-14 flex items-center justify-center gap-10 flex-wrap">
          <div class="text-center">
            <div style="font-size: 1.6rem; color: #C9A96E; font-weight: 600; font-family: 'Lato', sans-serif;">+12,000</div>
            <div style="font-family: var(--font); font-size: 0.75rem; color: rgba(245,239,227,.65); letter-spacing: 0.05em;" data-i18n="hero.stat1">كتاب رقمي</div>
          </div>
          <div class="text-center">
            <div style="font-size: 1.6rem; color: #C9A96E; font-weight: 600; font-family: 'Lato', sans-serif;">+850</div>
            <div style="font-family: var(--font); font-size: 0.75rem; color: rgba(245,239,227,.65); letter-spacing: 0.05em;" data-i18n="hero.stat2">مؤلف</div>
          </div>
          <div class="text-center">
            <div style="font-size: 1.6rem; color: #C9A96E; font-weight: 600; font-family: 'Lato', sans-serif;">+45,000</div>
            <div style="font-family: var(--font); font-size: 0.75rem; color: rgba(245,239,227,.65); letter-spacing: 0.05em;" data-i18n="hero.stat3">قارئ</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED BOOKS -->
    <section class="py-24 px-6" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h2 class="mb-4" style="font-family: var(--font-heading); color: #4A2E1A; font-size: clamp(2rem,4vw,2.5rem);" data-i18n="sections.featured">الكتب المميزة</h2>
            <p style="font-family: var(--font); color: rgba(74,46,26,.65); font-size: 1.1rem; max-w-2xl mx-auto" data-i18n="sections.featuredSub">مختارات عناها أهل المعرفة ووضعوها في صدر المكتبة لكل طالب علم</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="featured-books"><div class="spinner"></div></div>
        <div class="text-center mt-12">
          <a href="library.html" class="inline-flex items-center gap-2 px-8 py-3.5 rounded transition-all duration-300 hover:bg-[#6B4423] hover:text-[#F5EFE3]" style="border: 1px solid #6B4423; color: #6B4423; font-family: var(--font); font-size: 0.9rem;" data-i18n="common.viewAll">تصفح كل الكتب</a>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="py-24 px-6" style="background: #F8F4EC;">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h2 class="mb-4" style="font-family: var(--font-heading); color: #4A2E1A; font-size: clamp(2rem,4vw,2.5rem);" data-i18n="sections.categories">أبواب المعرفة</h2>
            <p style="font-family: var(--font); color: rgba(74,46,26,.65); font-size: 1.1rem; max-w-2xl mx-auto" data-i18n="sections.categoriesSub">تجول في أروقة المكتبة واستكشف أبوابها</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="home-categories"></div>
      </div>
    </section>

    <!-- AUTHORS (Using existing #stats-band id temporarily if needed, but original used a different approach. Wait, I will just add the authors container and let backend inject if it can, but original frontend didn't have authors on home page. I will just add the structural layout.) -->
    
    <!-- QUIZ CTA -->
    <section class="py-24 px-6" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-4xl mx-auto">
        <div class="p-10 rounded text-center transition-all duration-300" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 4px 20px rgba(90,55,30,.07);">
          <div class="w-16 h-16 rounded mx-auto mb-6 flex items-center justify-center" style="background: rgba(107,68,35,.08); border: 1px solid rgba(184,138,59,.2);">
            <span style="font-size: 2rem;">✨</span>
          </div>
          <h2 class="mb-4" style="font-family: var(--font-heading); color: #4A2E1A; font-size: 1.8rem;" data-i18n="sections.quizCta">لا تعرف ماذا تقرأ؟</h2>
          <p class="mb-8" style="font-family: var(--font); color: #8A6848; font-size: 1rem;" data-i18n="sections.quizCtaSub">أجب عن أسئلة بسيطة ودعنا نقترح لك الكتاب المثالي</p>
          <a class="inline-block px-8 py-3 rounded transition-all duration-300 hover:bg-[#B88A3B]" href="quiz.html" style="background: #6B4423; color: #F5EFE3; font-size: 1rem; border: 1px solid #4A2E1A;" data-i18n="nav.quiz">اكتشف كتابك</a>
        </div>
      </div>
    </section>

    <!-- SUBSCRIPTION CTA -->
    <section class="py-24 px-6 relative overflow-hidden" style="background: #2A1A0E;">
      <div class="absolute inset-0 opacity-10" style="background-image: var(--paper-texture);"></div>
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full" style="background: rgba(184,138,59,.2); border: 1px solid rgba(184,138,59,.4);">
          <span style="font-size: 2rem; color: #B88A3B;">💎</span>
        </div>
        <h2 class="mb-4" style="font-family: var(--font-heading); color: #F5EFE3; font-size: 2.2rem;" data-i18n="sections.subsCta">اقرأ بلا حدود</h2>
        <p class="mb-8" style="font-family: var(--font); color: rgba(245,239,227,.7); font-size: 1.1rem;" data-i18n="sections.subsCtaSub">اشترك الآن واحصل على وصول كامل لمكتبتنا</p>
        <a class="inline-block px-8 py-3 rounded transition-all duration-300 hover:bg-[#F5EFE3] hover:text-[#2A1A0E]" href="subscriptions.html" style="background: #B88A3B; color: #2A1A0E; font-size: 1rem; font-weight: 600;" data-i18n="subscriptions.subscribe">اشترك الآن</a>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="py-24 px-6" style="background: #F8F4EC;">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h2 class="mb-4" style="font-family: var(--font-heading); color: #4A2E1A; font-size: clamp(2rem,4vw,2.5rem);" data-i18n="sections.testimonials">ماذا قال قراؤنا</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="testimonials"></div>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="py-20 px-6" style="background: #6B4423;">
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-3" style="color: #C9A96E; font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase;">النشرة البريدية</div>
        <h2 class="mb-3" style="font-family: var(--font-heading); color: #F5EFE3; font-size: clamp(1.5rem,3vw,2.2rem);" data-i18n="sections.newsletter">اشترك في نشرتنا</h2>
        <p class="mb-8 text-sm" style="font-family: var(--font); color: rgba(245,239,227,.65); line-height: 1.7;" data-i18n="sections.newsletterSub">أحدث الإصدارات والعروض مباشرة إلى بريدك</p>
        
        <form class="flex items-center rounded overflow-hidden" style="background: rgba(252,250,245,.1); border: 1px solid rgba(184,138,59,.4);" data-newsletter novalidate>
          <label class="sr-only" for="nl-email" data-i18n="newsletter.placeholder">بريدك الإلكتروني</label>
          <input class="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-[#F5EFE3] placeholder-white/50" id="nl-email" type="email" required data-i18n-attr="placeholder:newsletter.placeholder" placeholder="بريدك الإلكتروني">
          <button class="px-6 py-3 text-sm transition-colors duration-200 hover:bg-[#B88A3B]" type="submit" style="background: #B88A3B; color: #1A1412; font-weight: 600;" data-i18n="newsletter.button">اشترك</button>
        </form>
      </div>
    </section>
  </main>`;

content = content.replace(mainMatch[0], newMain);
fs.writeFileSync(file, content, 'utf8');
console.log('index.html rewritten successfully');
