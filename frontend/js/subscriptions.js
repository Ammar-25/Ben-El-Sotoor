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
    <article class="plan-card ${p.featured ? 'featured' : ''} reveal">
      ${p.featured ? `<span class="plan-tag" data-i18n="subscriptions.mostPopular">${I18N.t('subscriptions.mostPopular')}</span>` : ''}
      <h3>${I18N.pick(p.name)}</h3>
      <div class="plan-price">${p.price ? I18N.pick(p.priceLabel) : I18N.pick(p.priceLabel)}<br><small>${I18N.pick(p.period)}</small></div>
      <ul class="plan-features">
        ${p.featureKeys.map((k) => `<li>${I18N.t('plansFeatures.' + k)}</li>`).join('')}
      </ul>
      <button class="btn ${p.featured ? 'btn-primary' : 'btn-outline'} btn-block" data-plan="${p.id}" data-i18n="subscriptions.subscribe">${I18N.t('subscriptions.subscribe')}</button>
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
  const head = `<thead><tr><th data-i18n="subscriptions.feature">${I18N.t('subscriptions.feature')}</th>${plans.map((p) => `<th>${I18N.pick(p.name)}</th>`).join('')}</tr></thead>`;
  const body = allKeys.map((k) =>
    `<tr><td>${I18N.t('plansFeatures.' + k)}</td>${plans.map((p) => `<td>${p.featureKeys.includes(k) ? '<span class="yes">✓</span>' : '<span class="no">—</span>'}</td>`).join('')}</tr>`).join('');
  host.innerHTML = head + `<tbody>${body}</tbody>`;
}

function buildFaq() {
  const host = document.getElementById('faq-list');
  if (!host) return;
  const items = [1, 2, 3, 4];
  host.innerHTML = items.map((i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false"><span data-i18n="faq.q${i}">${I18N.t('faq.q' + i)}</span><span class="faq-icon" aria-hidden="true">＋</span></button>
      <div class="faq-a" role="region"><p data-i18n="faq.a${i}">${I18N.t('faq.a' + i)}</p></div>
    </div>`).join('');
  host.querySelectorAll('.faq-q').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  }));
}

document.addEventListener('DOMContentLoaded', initSubscriptions);
