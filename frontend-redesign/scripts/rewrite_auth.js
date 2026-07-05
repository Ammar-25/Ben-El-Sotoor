const fs = require('fs');

function rewriteAuthPage(file, isReg) {
    let content = fs.readFileSync(file, 'utf8');

    const mainMatch = content.match(/<main id="main"[\s\S]*?>([\s\S]*?)<\/main>/);
    if (!mainMatch) {
        console.log("Could not find main element in " + file);
        return;
    }

    const regFields = isReg ? `
                <div>
                  <label class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="auth.fullName">الاسم الكامل</label>
                  <input name="name" required placeholder="أدخل اسمك" data-i18n-attr="placeholder:auth.namePlaceholder" class="w-full px-4 py-3 rounded outline-none text-sm transition-all" style="background: #F8F4EC; border: 1px solid #DDD0BB; font-family: var(--font); color: #2A1A0E;">
                </div>
    ` : '';

    const newMain = `<main id="main" class="min-h-screen flex" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <!-- Left panel -->
      <div class="hidden lg:flex flex-1 relative items-center justify-center" style="background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=1200&fit=crop&auto=format'); background-size: cover; background-position: center;">
        <div class="absolute inset-0" style="background: rgba(30,12,3,.75);"></div>
        <div class="relative z-10 text-center p-12">
          <div style="color: #B88A3B; font-size: 3rem; font-family: 'Amiri', serif; line-height: 1; margin-bottom: 16px;">❧</div>
          <div style="font-family: 'Amiri', serif; font-size: 2.2rem; color: #F5EFE3; font-weight: 700;">بين السطور</div>
          <div style="font-family: 'Lato', sans-serif; font-size: 0.65rem; color: #B88A3B; letter-spacing: 0.25em; margin-top: 8px;">BETWEEN THE LINES</div>
          <p class="mt-8 text-sm leading-relaxed" style="font-family: var(--font); color: rgba(245,239,227,.6); max-width: 320px;" data-i18n="auth.slogan">مكتبتك الرقمية للأدب العربي والعالمي في مكان واحد</p>
        </div>
      </div>

      <!-- Form panel -->
      <div class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
          <a href="index.html" class="inline-flex items-center gap-2 mb-10 text-sm transition-colors duration-200" style="color: #8A6848; font-family: var(--font);" onmouseenter="this.style.color='#6B4423'" onmouseleave="this.style.color='#8A6848'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 rtl:rotate-180"><path d="M15 18l-6-6 6-6"/></svg>
            <span data-i18n="auth.backHome">العودة للرئيسية</span>
          </a>

          <div class="rounded p-8" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 8px 40px rgba(90,55,30,.1);">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            
            <h2 class="text-center mb-2" style="font-family: var(--font-heading); font-size: 1.6rem; color: #4A2E1A;" data-i18n="${isReg ? 'auth.createAccountTitle' : 'auth.loginTitle'}">${isReg ? 'إنشاء حساب' : 'مرحباً بعودتك'}</h2>
            <p class="text-center mb-8 text-sm" style="font-family: var(--font); color: #8A6848;" data-i18n="${isReg ? 'auth.createAccountSub' : 'auth.loginSub'}">${isReg ? 'انضم إلى مجتمع القراء' : 'سجّل دخولك لمكتبتك'}</p>

            <form id="auth-form" class="space-y-4">
              <div id="auth-error" class="hidden rounded p-3 text-sm text-center" style="background: rgba(220,53,69,0.1); color: #dc3545; border: 1px solid rgba(220,53,69,0.3);"></div>
              ${regFields}
              <div>
                <label class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="auth.email">البريد الإلكتروني</label>
                <input name="email" type="email" required dir="ltr" placeholder="you@example.com" class="w-full px-4 py-3 rounded outline-none text-sm" style="background: #F8F4EC; border: 1px solid #DDD0BB; font-family: 'Lato', sans-serif; color: #2A1A0E;">
              </div>
              <div>
                <label class="block text-xs mb-2" style="font-family: var(--font); color: #6B4423;" data-i18n="auth.password">كلمة المرور</label>
                <input name="password" type="password" required dir="ltr" placeholder="••••••••" class="w-full px-4 py-3 rounded outline-none text-sm" style="background: #F8F4EC; border: 1px solid #DDD0BB; font-family: 'Lato', sans-serif; color: #2A1A0E;">
              </div>

              <button type="submit" class="w-full mt-6 py-3.5 rounded text-sm transition-colors duration-200" style="background: #6B4423; color: #F5EFE3; font-family: var(--font); letter-spacing: 0.05em;" onmouseenter="this.style.background='#B88A3B'" onmouseleave="this.style.background='#6B4423'" data-i18n="${isReg ? 'auth.registerSubmit' : 'auth.loginSubmit'}">${isReg ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button>
            </form>

            <div class="mt-6 text-center">
              <a href="${isReg ? 'login.html' : 'register.html'}" class="inline-block text-xs transition-colors duration-200" style="font-family: var(--font); color: #8A6848;" onmouseenter="this.style.color='#6B4423'" onmouseleave="this.style.color='#8A6848'" data-i18n="${isReg ? 'auth.haveAccount' : 'auth.noAccount'}">${isReg ? 'لديك حساب؟ سجّل دخولك' : 'لا تملك حساباً؟ أنشئ واحداً'}</a>
            </div>
          </div>
        </div>
      </div>
  </main>`;

    content = content.replace(mainMatch[0], newMain);
    fs.writeFileSync(file, content, 'utf8');
    console.log(file + ' rewritten successfully');
}

rewriteAuthPage('d:/bayna-al-sutoor/frontend-redesign/login.html', false);
rewriteAuthPage('d:/bayna-al-sutoor/frontend-redesign/register.html', true);
