/* =====================================================================
   language.js — Bilingual (AR/RTL ↔ EN/LTR) internationalization engine.
   ---------------------------------------------------------------------
   • Loads translations/<lang>.json and caches it.
   • Applies strings to any element with:
       data-i18n="group.key"                 -> textContent
       data-i18n-attr="placeholder:group.key" -> attribute(s), comma list
   • Sets <html dir> and <html lang>, persists choice in localStorage.
   • Emits window event 'i18n:changed' so dynamic page scripts re-render.

   PUBLIC API (window.I18N):
       I18N.lang            current language code ('ar' | 'en')
       I18N.t('a.b')        translated string by dotted key
       I18N.pick(obj)       obj[lang] helper for bilingual data fields
       I18N.set('en')       switch language
       I18N.ready           Promise resolved after first load
   ===================================================================== */

const I18N = (() => {
  const LS_KEY = 'bayn_lang';
  const DEFAULT = 'ar';
  let lang = localStorage.getItem(LS_KEY) || DEFAULT;
  let dict = {};

  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

  function t(key) {
    const val = get(dict, key);
    return val == null ? key : val;
  }

  /** Pick the right side of a bilingual data field: {ar, en}. */
  function pick(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] ?? obj.ar ?? obj.en ?? '';
  }

  function apply(root = document) {
    // Text nodes
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    // Attributes — format: "placeholder:key, aria-label:key2"
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  async function load(code) {
    dict = await DataClient.fetchJson(`translations/${code}.json`);
    return dict;
  }

  function applyDocumentMeta() {
    const dir = dict.dir || (lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }

  async function set(code) {
    lang = code;
    localStorage.setItem(LS_KEY, code);
    await load(code);
    applyDocumentMeta();
    apply();
    // Update language switcher pressed state if present
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.langBtn === code));
    });
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }

  // Initial load
  const ready = set(lang);

  return { get lang() { return lang; }, t, pick, set, apply, ready };
})();

window.I18N = I18N;
