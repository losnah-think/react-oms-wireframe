// lightweight passthrough to reuse existing i18n
const I18N = (function(){
  const locales = { kr: 'kr', en: 'en' };
  let current = localStorage.getItem('fdd_locale') || 'kr';
  function t(k){ return (typeof window !== 'undefined' && window.I18N && window.I18N.t) ? window.I18N.t(k) : (k === 'loadError' ? 'Unable to load document.' : k) }
  function setLocale(l){ current = l; localStorage.setItem('fdd_locale', l); document.documentElement.lang = (l==='kr')?'ko':'en'; }
  return { setLocale, t, current };
})();

document.addEventListener('DOMContentLoaded', ()=>{ if(window.I18N) window.I18N.apply(); });
