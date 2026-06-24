/* =====================================================================
   quiz.js — Reading-personality quiz.
   Questions/answers come from translations (quiz.questions). Each answer
   maps to a category bucket; the most-picked bucket decides the reader's
   "personality" and recommended books (via BookService).
   ===================================================================== */

// Answer index -> category bucket. The 4 options of every question map to
// the same 4 buckets in order, so we can tally by option index.
const BUCKETS = ['science', 'novels', 'self-development', 'poetry'];

async function initQuiz() {
  const root = document.getElementById('quiz-root');
  if (!root) return;

  let step = 0;
  const answers = [];
  let questions = I18N.t('quiz.questions');

  function render() {
    questions = I18N.t('quiz.questions'); // refresh on language change
    if (step >= questions.length) return renderResult();

    const q = questions[step];
    const progress = (step / questions.length) * 100;
    root.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress"><span style="width:${progress}%"></span></div>
        <p class="quiz-step">${I18N.t('common.page')} ${step + 1} / ${questions.length}</p>
        <h2 class="quiz-q">${q.q}</h2>
        <div class="quiz-options">
          ${q.a.map((opt, i) => `<button class="quiz-option ${answers[step] === i ? 'selected' : ''}" data-opt="${i}">${opt}</button>`).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-ghost" id="quiz-prev" ${step === 0 ? 'disabled' : ''} data-i18n="quiz.prev">${I18N.t('quiz.prev')}</button>
          <button class="btn btn-primary" id="quiz-next" ${answers[step] == null ? 'disabled' : ''} data-i18n="quiz.next">${I18N.t('quiz.next')}</button>
        </div>
      </div>`;

    root.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
      answers[step] = Number(b.dataset.opt);
      root.querySelectorAll('.quiz-option').forEach((o) => o.classList.toggle('selected', o === b));
      root.querySelector('#quiz-next').disabled = false;
    }));
    root.querySelector('#quiz-prev').addEventListener('click', () => { step--; render(); });
    root.querySelector('#quiz-next').addEventListener('click', () => { step++; render(); });
  }

  async function renderResult() {
    // Tally buckets
    const tally = {};
    answers.forEach((i) => { const b = BUCKETS[i]; tally[b] = (tally[b] || 0) + 1; });
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    const personality = I18N.t('quiz.personalities')[winner];
    const emoji = { science: '🔭', novels: '🗺️', 'self-development': '🌱', poetry: '🪶' }[winner];

    const recs = await BookService.byCategory(winner);
    root.innerHTML = `
      <div class="quiz-card quiz-result">
        <div class="quiz-progress"><span style="width:100%"></span></div>
        <div class="result-emoji">${emoji}</div>
        <p class="quiz-step" data-i18n="quiz.result">${I18N.t('quiz.result')}</p>
        <h2>${personality}</h2>
        <h3 style="margin:1.5rem 0 1rem" data-i18n="quiz.recommended">${I18N.t('quiz.recommended')}</h3>
        <div class="grid grid-books" id="quiz-recs"></div>
        <button class="btn btn-outline" id="quiz-restart" style="margin-top:1.5rem" data-i18n="quiz.restart">${I18N.t('quiz.restart')}</button>
      </div>`;
    UI.renderBooks(document.getElementById('quiz-recs'), recs.slice(0, 4));
    root.querySelector('#quiz-restart').addEventListener('click', () => { step = 0; answers.length = 0; render(); });
  }

  render();
  // Re-render current step in the new language
  window.addEventListener('page:rerender', () => { if (step < I18N.t('quiz.questions').length) render(); });
}

document.addEventListener('DOMContentLoaded', initQuiz);
