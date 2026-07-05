const fs = require('fs');

// 1. Rewrite quiz.html
const htmlFile = 'd:/bayna-al-sutoor/frontend-redesign/quiz.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

const mainMatch = htmlContent.match(/<main id="main">([\s\S]*?)<\/main>/);
if (mainMatch) {
    const newMain = `<main id="main" class="min-h-screen pt-28 pb-20" style="background: #F5EFE3; background-image: var(--paper-texture);">
      <div class="max-w-4xl mx-auto px-6">
        <!-- Header -->
        <div class="mb-10 text-center">
            <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px w-16" style="background: linear-gradient(to right, transparent, #B88A3B)"></div>
                <div style="color: #B88A3B; font-size: 1.2rem;">✦</div>
                <div class="h-px w-16" style="background: linear-gradient(to left, transparent, #B88A3B)"></div>
            </div>
            <h1 class="mb-2" style="font-family: var(--font-heading); font-size: clamp(1.8rem,4vw,3rem); color: #4A2E1A;" data-i18n="quiz.title">اكتشف كتابك المثالي</h1>
            <p style="font-family: var(--font); color: #8A6848; font-size: 1.1rem;" data-i18n="quiz.subtitle">أجب عن الأسئلة التالية</p>
        </div>

        <div id="quiz-root" aria-live="polite"><div class="spinner mx-auto"></div></div>
      </div>
  </main>`;
    htmlContent = htmlContent.replace(mainMatch[0], newMain);
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    console.log('quiz.html rewritten successfully');
}

// 2. Rewrite js/quiz.js
const jsFile = 'd:/bayna-al-sutoor/frontend-redesign/js/quiz.js';
let jsContent = fs.readFileSync(jsFile, 'utf8');

// Replace render() logic
const renderMatch = jsContent.match(/function render\(\) \{[\s\S]*?\}\)\;\n  \}/);
if (renderMatch) {
    const newRender = `function render() {
    questions = I18N.t('quiz.questions');
    if (step >= questions.length) return renderResult();

    const q = questions[step];
    const progress = (step / questions.length) * 100;
    root.innerHTML = \`
      <div class="rounded p-8 md:p-12" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 8px 40px rgba(90,55,30,.05);">
        <div class="w-full h-1 rounded-full mb-8 overflow-hidden" style="background: rgba(184,138,59,.2);">
            <div class="h-full transition-all duration-500" style="background: #B88A3B; width: \${progress}%;"></div>
        </div>
        <div class="text-center mb-8">
            <span style="font-family: 'Lato', sans-serif; font-size: .85rem; color: #8A6848; letter-spacing: .1em;" data-i18n="common.page">\${I18N.t('common.page')} \${step + 1} / \${questions.length}</span>
            <h2 class="mt-4" style="font-family: var(--font-heading); font-size: 1.6rem; color: #2A1A0E;">\${q.q}</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          \${q.a.map((opt, i) => \`
            <button class="quiz-option text-start p-4 rounded transition-all duration-200" style="\${answers[step] === i ? 'background: rgba(184,138,59,.1); border: 1px solid #B88A3B; color: #4A2E1A; font-weight: 700;' : 'background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423;'}" data-opt="\${i}" onmouseenter="if(this.dataset.opt != answers[step]) this.style.background='#F5EFE3'" onmouseleave="if(this.dataset.opt != answers[step]) this.style.background='#F8F4EC'">
                <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style="border: 1px solid \${answers[step] === i ? '#B88A3B' : '#DDD0BB'};">
                        \${answers[step] === i ? '<div class="w-2.5 h-2.5 rounded-full" style="background: #B88A3B;"></div>' : ''}
                    </div>
                    <span style="font-family: var(--font); font-size: .95rem;">\${opt}</span>
                </div>
            </button>
          \`).join('')}
        </div>
        <div class="flex items-center justify-between pt-6" style="border-top: 1px solid #DDD0BB;">
          <button id="quiz-prev" class="px-6 py-2.5 rounded text-sm transition-colors duration-200" \${step === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed; border: 1px solid #DDD0BB; color: #8A6848;"' : 'style="border: 1px solid #DDD0BB; color: #6B4423; background: #FCFAF5;" onmouseenter="this.style.background=\\'#F5EFE3\\'" onmouseleave="this.style.background=\\'#FCFAF5\\'"'} data-i18n="quiz.prev">\${I18N.t('quiz.prev')}</button>
          <button id="quiz-next" class="px-8 py-2.5 rounded text-sm transition-colors duration-200" \${answers[step] == null ? 'disabled style="opacity: 0.5; cursor: not-allowed; background: #8A6848; color: #F5EFE3;"' : 'style="background: #6B4423; color: #F5EFE3;" onmouseenter="this.style.background=\\'#B88A3B\\'" onmouseleave="this.style.background=\\'#6B4423\\'"'} data-i18n="quiz.next">\${I18N.t('quiz.next')}</button>
        </div>
      </div>\`;

    root.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
      answers[step] = Number(b.dataset.opt);
      render(); // re-render to update selection visual
    }));
    root.querySelector('#quiz-prev').addEventListener('click', () => { step--; render(); });
    root.querySelector('#quiz-next').addEventListener('click', () => { step++; render(); });
  }`;
    jsContent = jsContent.replace(renderMatch[0], newRender);
}

const renderResultMatch = jsContent.match(/async function renderResult\(\) \{[\s\S]*?\}\)\;\n  \}/);
if (renderResultMatch) {
    const newRenderResult = `async function renderResult() {
    const tally = {};
    answers.forEach((i) => { const b = BUCKETS[i]; tally[b] = (tally[b] || 0) + 1; });
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    const personality = I18N.t('quiz.personalities')[winner];
    const emoji = { science: '🔭', novels: '🗺️', 'self-development': '🌱', poetry: '🪶' }[winner];

    const recs = await BookService.byCategory(winner);
    root.innerHTML = \`
      <div class="rounded p-8 md:p-12 text-center" style="background: #FCFAF5; border: 1px solid #DDD0BB; box-shadow: 0 8px 40px rgba(90,55,30,.05);">
        <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style="background: rgba(184,138,59,.15); font-size: 2.5rem;">\${emoji}</div>
        <p style="font-family: var(--font); color: #8A6848; font-size: 1rem; margin-bottom: .5rem;" data-i18n="quiz.result">\${I18N.t('quiz.result')}</p>
        <h2 style="font-family: var(--font-heading); font-size: 2.2rem; color: #4A2E1A; margin-bottom: 3rem;">\${personality}</h2>
        
        <h3 class="mb-6 flex items-center justify-center gap-4">
            <div class="h-px w-12" style="background: linear-gradient(to right, transparent, #DDD0BB)"></div>
            <span style="font-family: var(--font); color: #6B4423; font-size: 1.1rem;" data-i18n="quiz.recommended">\${I18N.t('quiz.recommended')}</span>
            <div class="h-px w-12" style="background: linear-gradient(to left, transparent, #DDD0BB)"></div>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start mb-8" id="quiz-recs"></div>
        <button id="quiz-restart" class="px-8 py-3 rounded text-sm transition-colors duration-200" style="border: 1px solid #6B4423; color: #6B4423; background: transparent; font-family: var(--font);" onmouseenter="this.style.background='#6B4423'; this.style.color='#F5EFE3'" onmouseleave="this.style.background='transparent'; this.style.color='#6B4423'" data-i18n="quiz.restart">\${I18N.t('quiz.restart')}</button>
      </div>\`;
    UI.renderBooks(document.getElementById('quiz-recs'), recs.slice(0, 4));
    root.querySelector('#quiz-restart').addEventListener('click', () => { step = 0; answers.length = 0; render(); });
  }`;
    jsContent = jsContent.replace(renderResultMatch[0], newRenderResult);
    fs.writeFileSync(jsFile, jsContent, 'utf8');
    console.log('js/quiz.js rewritten successfully');
}
