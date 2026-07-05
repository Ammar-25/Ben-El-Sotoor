const fs = require('fs');

// 1. Rewrite author-details.html
const htmlFile = 'd:/bayna-al-sutoor/frontend-redesign/author-details.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

const mainMatch = htmlContent.match(/<main id="main">([\s\S]*?)<\/main>/);
if (mainMatch) {
    const newMain = `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-6xl mx-auto px-6">
        <div id="author-details" aria-live="polite"><div class="spinner mx-auto"></div></div>
      </div>
  </main>`;
    htmlContent = htmlContent.replace(mainMatch[0], newMain);
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    console.log('author-details.html rewritten successfully');
}

// 2. Rewrite js/authors.js
const jsFile = 'd:/bayna-al-sutoor/frontend-redesign/js/authors.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

const initAuthorDetailsMatch = jsContent.match(/async function initAuthorDetails\(\) \{[\s\S]*?\}\)\;\n\}/);
if (initAuthorDetailsMatch) {
    const newInitAuthorDetails = `async function initAuthorDetails() {
  const root = document.getElementById('author-details');
  if (!root) return;
  const id = new URLSearchParams(location.search).get('id') || 1;
  const author = await AuthorService.getById(id);
  if (!author) { root.innerHTML = \`<div class="p-12 text-center rounded" style="background: #FCFAF5; border: 1px solid #DDD0BB;"><p>\${I18N.t('common.noResults')}</p></div>\`; return; }

  // Update document title for SEO
  document.title = \`\${I18N.pick(author.name)} — \${I18N.t('common.brand')}\`;

  const achievements = I18N.pick(author.achievements).map((a) => \`<li class="flex items-center gap-2 mb-2" style="font-family: var(--font); color: #6A5040; font-size: .95rem;"><div class="w-1.5 h-1.5 rounded-full" style="background: #B88A3B;"></div>\${a}</li>\`).join('');
  root.innerHTML = \`
    <div class="rounded overflow-hidden mb-12" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 8px 40px rgba(90,55,30,.05);">
        <div class="h-64 relative">
            <img src="\${author.banner}" alt="" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">
            <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(74,46,26,.8) 0%, transparent 100%)"></div>
        </div>
        <div class="px-8 pb-8 relative text-center md:text-start" style="margin-top: -4rem;">
            <div class="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <img src="\${author.photo}" alt="\${I18N.pick(author.name)}" class="w-32 h-32 rounded-full object-cover relative z-10" style="border: 4px solid #FCFAF5; box-shadow: 0 4px 12px rgba(0,0,0,.15);" onerror="this.src='assets/images/ui/author-placeholder.png'">
                <div class="flex-1">
                    <h1 class="mb-2" style="font-family: var(--font-heading); font-size: 2.2rem; color: #2A1A0E;">\${I18N.pick(author.name)}</h1>
                    <div class="flex items-center justify-center md:justify-start gap-6 text-sm" style="font-family: 'Lato', sans-serif; color: #8A6848;">
                        <div><strong style="color: #6B4423; font-size: 1.1rem;">\${author.booksCount}</strong> <span data-i18n="common.books" style="font-family: var(--font);">\${I18N.t('common.books')}</span></div>
                        <div class="w-1 h-1 rounded-full" style="background: #DDD0BB;"></div>
                        <div><strong style="color: #6B4423; font-size: 1.1rem;">\${(author.followers / 1000).toFixed(1)}k</strong> <span data-i18n="common.followers" style="font-family: var(--font);">\${I18N.t('common.followers')}</span></div>
                        <div class="w-1 h-1 rounded-full" style="background: #DDD0BB;"></div>
                        <div class="flex items-center gap-1"><strong style="color: #6B4423; font-size: 1.1rem;">\${author.rating}</strong> <span style="color: #B88A3B;">★</span></div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="md:col-span-2">
                    <h3 class="mb-4 text-lg" style="font-family: var(--font-heading); color: #4A2E1A; border-bottom: 1px solid #DDD0BB; padding-bottom: .5rem;">نبذة عن المؤلف</h3>
                    <p style="font-family: var(--font); color: #6A5040; line-height: 1.8; font-size: 1rem; text-align: justify; margin-bottom: 2rem;">\${I18N.pick(author.bio)}</p>
                    
                    <blockquote class="p-6 rounded relative mb-8" style="background: rgba(184,138,59,.08); border-right: 4px solid #B88A3B; font-family: 'Amiri', serif; font-size: 1.25rem; color: #4A2E1A; line-height: 1.6;">
                        "\${I18N.pick(author.quote)}"
                        <div class="absolute top-4 left-4 opacity-20" style="color: #B88A3B; font-size: 4rem; line-height: 1;">"</div>
                    </blockquote>
                </div>
                <div>
                    <h3 class="mb-4 text-lg" style="font-family: var(--font-heading); color: #4A2E1A; border-bottom: 1px solid #DDD0BB; padding-bottom: .5rem;">إنجازات وجوائز</h3>
                    <ul>\${achievements}</ul>
                </div>
            </div>
        </div>
    </div>

    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 class="text-xl flex items-center gap-3" style="font-family: var(--font-heading); color: #2A1A0E;">
            <div class="h-px w-8" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
            \${I18N.pick(author.name)} — <span data-i18n="common.books">\${I18N.t('common.books')}</span>
        </h2>
        <div id="author-genre-filters" class="flex flex-wrap gap-2"></div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="author-books"></div>\`;

  const books = await BookService.byAuthor(author.id);
  const genres = [...new Set(books.map((b) => b.category))];
  const filters = document.getElementById('author-genre-filters');
  filters.innerHTML = [\`<button class="chip active px-4 py-1.5 rounded-full text-sm transition-colors duration-200" style="background: #6B4423; color: #F5EFE3; font-family: var(--font);" data-genre="all">\${I18N.t('common.all')}</button>\`,
    ...genres.map((g) => \`<button class="chip px-4 py-1.5 rounded-full text-sm transition-colors duration-200" style="background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423; font-family: var(--font);" data-genre="\${g}" onmouseenter="if(!this.classList.contains('active')) this.style.background='#F5EFE3'" onmouseleave="if(!this.classList.contains('active')) this.style.background='#F8F4EC'">\${I18N.t('categories.' + g)}</button>\`)].join('');

  const booksHost = document.getElementById('author-books');
  const renderGenre = (g) => UI.renderBooks(booksHost, g === 'all' ? books : books.filter((b) => b.category === g));
  filters.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-genre]');
    if (!chip) return;
    filters.querySelectorAll('.chip').forEach((c) => {
        c.classList.remove('active');
        c.style.background = '#F8F4EC';
        c.style.color = '#6B4423';
        c.style.border = '1px solid #DDD0BB';
    });
    chip.classList.add('active');
    chip.style.background = '#6B4423';
    chip.style.color = '#F5EFE3';
    chip.style.border = 'none';
    renderGenre(chip.dataset.genre);
  });
  renderGenre('all');

  window.addEventListener('page:rerender', () => initAuthorDetails());
}`;
    jsContent = jsContent.replace(initAuthorDetailsMatch[0], newInitAuthorDetails);
    fs.writeFileSync(jsFile, jsContent, 'utf8');
    console.log('js/authors.js rewritten successfully');
}
