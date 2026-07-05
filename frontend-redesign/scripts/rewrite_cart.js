const fs = require('fs');
const file = 'd:/bayna-al-sutoor/frontend-redesign/cart.html';
let content = fs.readFileSync(file, 'utf8');

const mainMatch = content.match(/<main id="main">([\s\S]*?)<\/main>/);
if (!mainMatch) {
    console.log("Could not find main element");
    process.exit(1);
}

const newMain = `<main id="main" class="min-h-screen pt-28" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="mb-10 text-center">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h1 class="mb-2" style="font-family: var(--font-heading); font-size: clamp(1.8rem,4vw,3rem); color: #4A2E1A;" data-i18n="cart.title">سلة التسوق</h1>
        </div>

        <div id="cart-root" aria-live="polite"><div class="spinner mx-auto"></div></div>
      </div>
  </main>`;

content = content.replace(mainMatch[0], newMain);
fs.writeFileSync(file, content, 'utf8');
console.log('cart.html rewritten successfully');
