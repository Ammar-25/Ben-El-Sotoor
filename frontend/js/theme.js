/* =====================================================================
   theme.js — Light/Dark theme engine.
   Applies data-theme to <html>, persists in localStorage, respects the
   OS preference on first visit. Wires any [data-theme-toggle] button.
   Runs early (inline-included before paint where possible) to avoid FOUC.
   ===================================================================== */

const Theme = (() => {
  const LS_KEY = 'bayn_theme';

  function preferred() {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_KEY, theme);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  function toggle() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
  }

  function init() {
    apply(preferred());
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-theme-toggle]')) toggle();
    });
  }

  // Apply immediately to minimize flash; wiring waits for DOM.
  apply(preferred());
  document.addEventListener('DOMContentLoaded', init);

  return { apply, toggle, init };
})();

window.Theme = Theme;
