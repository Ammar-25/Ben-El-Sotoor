const fs = require('fs');
const file = 'd:/bayna-al-sutoor/frontend-redesign/read-sample.html';
let content = fs.readFileSync(file, 'utf8');

const newBody = `<body>
  <div class="min-h-screen pt-20" style="background: #F8F4EC; background-image: var(--paper-texture);">
      <div class="max-w-3xl mx-auto px-6 py-12">
        <a href="book-details.html" class="inline-flex items-center gap-2 mb-10 text-sm transition-colors duration-200" style="color: #8A6848; font-family: var(--font);" onmouseenter="this.style.color='#6B4423'" onmouseleave="this.style.color='#8A6848'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 rtl:rotate-180"><path d="M15 18l-6-6 6-6"/></svg>
          <span data-i18n="reading.back">العودة إلى الكتاب</span>
        </a>
        <div class="mb-8 text-center">
          <div class="text-xs mb-2 uppercase tracking-widest" style="color: #B88A3B; font-family: 'Lato', sans-serif;">فلسفة</div>
          <h2 style="font-family: var(--font-heading); color: #4A2E1A; font-size: 1.6rem;" id="reading-title">تاريخ الفلسفة اليونانية</h2>
          <p class="text-sm mt-1" style="font-family: var(--font); color: #8A6848;" id="reading-author">يوسف كرم</p>
        </div>
        <div class="mb-6 flex items-center justify-between text-xs" style="color: #8A6848; font-family: 'Lato', sans-serif; border-bottom: 1px solid #DDD0BB; padding-bottom: 12px;">
          <span data-i18n="reading.chapterOne">الفصل الأول</span>
          <span data-i18n="reading.intro">المقدمة</span>
          <span>1 / 342</span>
        </div>
        <div class="rounded p-8 md:p-12" style="background: #FCFAF5; box-shadow: 0 8px 40px rgba(90,55,30,.1); border: 1px solid #DDD0BB;">
          <p class="whitespace-pre-line" style="font-family: 'Amiri', serif; color: #2A1A0E; font-size: 1.15rem; line-height: 2.2; text-align: justify;">
            اعلم أن الكلام في هذا العلم مستحدث الصنعة، غريب النزعة، غزير الفائدة. نحن نفردنا بتأسيس هذا العلم وتمهيد قواعده، وذلك أن كيفيات الوقائع والأحوال في العمران وطبائعها مودودة في كتب التاريخ. غير أنها مختلطة بغيرها ومتفرقة في أبواب الكتاب. فلو انتُزعت تلك الكيفيات ووضعت في باب مفرد وجُعلت ذلك الباب علماً مستقلاً بنفسه كان ذلك علماً صحيحاً.
            
            وهذا العلم مستقل بنفسه، إذ له موضوع وهو العمران البشري والاجتماع الإنساني، وله مسائل وهي بيان ما يلحق العمران من العوارض والأحوال لذاته واحدة بعد أخرى. وهذا شأن كل علم من العلوم.
          </p>
        </div>
        <div class="flex items-center justify-between mt-8">
          <button class="flex items-center gap-2 px-5 py-2.5 rounded text-sm transition-colors duration-200" style="border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font); background: #FCFAF5;" onmouseenter="this.style.background='#F5EFE3'" onmouseleave="this.style.background='#FCFAF5'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 rtl:rotate-180"><path d="M15 18l-6-6 6-6"/></svg> <span data-i18n="reading.prev">السابق</span>
          </button>
          <span style="color: #8A6848; font-size: 0.75rem; font-family: 'Lato', sans-serif;">1 / 342</span>
          <button class="flex items-center gap-2 px-5 py-2.5 rounded text-sm transition-colors duration-200" style="background: #6B4423; color: #F5EFE3; font-family: var(--font);" onmouseenter="this.style.background='#B88A3B'" onmouseleave="this.style.background='#6B4423'">
            <span data-i18n="reading.next">التالي</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 rtl:rotate-180"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
  </div>
</body>`;

content = content.replace(/<body>[\s\S]*?<\/body>/, newBody);
content = content.replace(/<style>[\s\S]*?<\/style>/, '');

fs.writeFileSync(file, content, 'utf8');
console.log('read-sample.html rewritten successfully');
