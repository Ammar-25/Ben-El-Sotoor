const fs = require('fs');
const htmlFile = 'd:/bayna-al-sutoor/frontend-redesign/authors.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

const mainMatch = htmlContent.match(/<main id="main">([\s\S]*?)<\/main>/);
if (mainMatch) {
    const newMain = `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-10 text-center">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h1 class="mb-2" style="font-family: var(--font-heading); font-size: clamp(1.8rem,4vw,3rem); color: #4A2E1A;" data-i18n="sections.authors">مؤلفونا</h1>
            <p style="font-family: var(--font); color: #8A6848; font-size: 1.1rem;" data-i18n="sections.authorsSub">تعرّف على العقول خلف الكلمات</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="authors-grid"><div class="spinner mx-auto col-span-full"></div></div>
      </div>
  </main>`;
    htmlContent = htmlContent.replace(mainMatch[0], newMain);
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    console.log('authors.html rewritten successfully');
}
