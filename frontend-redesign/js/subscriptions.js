/* =====================================================================
   subscriptions.js — Plans grid, comparison table, FAQ accordion.
   Plan data comes from SubscriptionService; feature labels are resolved
   from translations (plansFeatures.*) so they stay bilingual.
   ===================================================================== */

async function initSubscriptions() {
  const grid = document.getElementById('plans-grid');
  if (!grid) return;
  const plans = await SubscriptionService.all();

  grid.innerHTML = plans.map((p) => `
    <article class="p-8 rounded relative text-center transition-all duration-300 transform hover:-translate-y-2 reveal" style="background: #FCFAF5; border: 1px solid ${p.featured ? '#B88A3B' : '#DDD0BB'}; box-shadow: 0 8px 40px rgba(90,55,30,.05);">
      ${p.featured ? `<div class="absolute -top-3 inset-x-0 mx-auto px-4 py-1 rounded-full text-xs" style="background: #B88A3B; color: #F5EFE3; font-family: var(--font); width: max-content;" data-i18n="subscriptions.mostPopular">${I18N.t('subscriptions.mostPopular')}</div>` : ''}
      <h3 class="mb-4" style="font-family: var(--font-heading); font-size: 1.6rem; color: #4A2E1A;">${I18N.pick(p.name)}</h3>
      <div class="mb-8" style="color: #6B4423; font-family: var(--font-english); font-size: 2.5rem; font-weight: 700; line-height: 1;">${p.price ? I18N.pick(p.priceLabel) : I18N.pick(p.priceLabel)}<br><span style="font-size: 1rem; color: #8A6848; font-family: var(--font); font-weight: 400;">${I18N.pick(p.period)}</span></div>
      <ul class="text-start space-y-3 mb-8">
        ${p.featureKeys.map((k) => `<li class="flex items-center gap-3 text-sm" style="font-family: var(--font); color: #6A5040;"><div class="w-1.5 h-1.5 rounded-full" style="background: #B88A3B;"></div>${I18N.t('plansFeatures.' + k)}</li>`).join('')}
      </ul>
      <button class="w-full py-3 rounded text-sm transition-colors duration-200" data-plan="${p.id}" data-i18n="subscriptions.subscribe" style="${p.featured ? 'background: #6B4423; color: #F5EFE3;' : 'background: #F8F4EC; border: 1px solid #DDD0BB; color: #6B4423;'} font-family: var(--font);" onmouseenter="this.style.background='${p.featured ? '#B88A3B' : '#F5EFE3'}'" onmouseleave="this.style.background='${p.featured ? '#6B4423' : '#F8F4EC'}'">${I18N.t('subscriptions.subscribe')}</button>
    </article>`).join('');
  UI.observeReveal(grid);

  grid.querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', () => UI.toast(I18N.t('subscriptions.subscribe') + ' ✓')));

  buildComparison(plans);
  buildFaq();
  window.addEventListener('page:rerender', () => initSubscriptions());
}

function buildComparison(plans) {
  const host = document.getElementById('compare-table');
  if (!host) return;
  // Collect the union of all feature keys for table rows
  const allKeys = [...new Set(plans.flatMap((p) => p.featureKeys))];
  const head = `<thead><tr style="border-bottom: 2px solid #DDD0BB;"><th class="p-4 text-start font-bold" style="font-family: var(--font); color: #4A2E1A;" data-i18n="subscriptions.feature">${I18N.t('subscriptions.feature')}</th>${plans.map((p) => `<th class="p-4 text-center font-bold" style="font-family: var(--font-heading); color: #6B4423;">${I18N.pick(p.name)}</th>`).join('')}</tr></thead>`;
  const body = allKeys.map((k) =>
    `<tr style="border-bottom: 1px solid #DDD0BB; background: #FCFAF5;"><td class="p-4 text-start text-sm" style="font-family: var(--font); color: #6A5040;">${I18N.t('plansFeatures.' + k)}</td>${plans.map((p) => `<td class="p-4 text-center">${p.featureKeys.includes(k) ? '<span style="color: #B88A3B; font-size: 1.2rem;">✓</span>' : '<span style="color: #DDD0BB;">—</span>'}</td>`).join('')}</tr>`).join('');
  host.innerHTML = head + `<tbody>${body}</tbody>`;
}

function buildFaq() {
  const host = document.getElementById('faq-list');
  if (!host) return;
  const items = [1, 2, 3, 4];
  host.innerHTML = items.map((i) => `
    <div class="rounded mb-3 transition-colors duration-200" style="background: #FCFAF5; border: 1px solid #DDD0BB;">
      <button class="w-full flex items-center justify-between p-5 outline-none faq-q" aria-expanded="false" style="color: #4A2E1A; font-family: var(--font);">
          <span class="font-bold text-start" data-i18n="faq.q${i}">${I18N.t('faq.q' + i)}</span>
          <span class="faq-icon transition-transform duration-300" style="color: #B88A3B;" aria-hidden="true">＋</span>
      </button>
      <div class="px-5 pb-5 text-sm faq-a overflow-hidden transition-all duration-300" role="region" style="font-family: var(--font); color: #6A5040; display: none;"><p data-i18n="faq.a${i}">${I18N.t('faq.a' + i)}</p></div>
    </div>`).join('');
  host.querySelectorAll('.faq-q').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('div');
    const ans = item.querySelector('.faq-a');
    const icon = item.querySelector('.faq-icon');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if(isOpen) {
        ans.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        icon.style.transform = 'rotate(0deg)';
        item.style.background = '#FCFAF5';
    } else {
        ans.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
        icon.style.transform = 'rotate(45deg)';
        item.style.background = '#F5EFE3';
    }
  }));
}

document.addEventListener('DOMContentLoaded', initSubscriptions);
