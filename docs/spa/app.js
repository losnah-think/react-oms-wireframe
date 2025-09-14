// Minimal SPA router for hash-based pages
const SPA = (function(){
  const pages = [
    '01-orders-list.html','02-orders-detail.html','03-products-list.html','04-products-detail.html',
    '05-malls.html','06-categories.html','07-vendors.html','08-settings-integrations.html','09-pages-index.html'
  ];
  const navLabelsKR = ['01. 주문','02. 주문 상세','03. 제품','04. 제품 상세','05. 몰','06. 카테고리','07. 공급사','08. 설정','09. 인덱스'];
  const navLabelsEN = ['01. Orders','02. Orders detail','03. Products','04. Product detail','05. Malls','06. Categories','07. Vendors','08. Settings','09. Index'];

  const root = document.getElementById('app');
  const main = document.getElementById('app-main');
  const nav = document.getElementById('app-nav');
  const title = document.getElementById('app-title');

  function buildNav(){
    nav.innerHTML = '';
    const labels = (typeof I18N !== 'undefined' && I18N.current === 'en') ? navLabelsEN : navLabelsKR;
    pages.forEach((p,i)=>{
      const a = document.createElement('a'); a.href = `#${p}`; a.textContent = labels[i]; a.addEventListener('click', e=>{ e.preventDefault(); location.hash = p; });
      nav.appendChild(a);
    });
    // language toggle
    const div = document.createElement('span'); div.className='lang-toggle';
    const kr = document.createElement('button'); kr.textContent='KR'; kr.addEventListener('click', ()=>{ I18N.setLocale('kr'); render(location.hash.slice(1)); buildNav(); });
    const en = document.createElement('button'); en.textContent='EN'; en.addEventListener('click', ()=>{ I18N.setLocale('en'); render(location.hash.slice(1)); buildNav(); });
    div.appendChild(kr); div.appendChild(en); nav.appendChild(div);
  }

  async function fetchPage(p){
    try{ const res = await fetch(`./pages/${p}`); return await res.text(); }catch(e){ return `<div class="card"><div class="card-inner"><h2>Load error</h2><p>${(typeof I18N!=='undefined')?I18N.t('loadError'):'Unable to load'}</p></div></div>` }
  }

  async function render(p){
    if(!p || pages.indexOf(p)===-1) p = pages[0];
    const html = await fetchPage(p);
    main.innerHTML = `<div class="card"><div class="card-inner" tabindex="0">${html}</div></div>`;
    // set focus to main for keyboard navigation
    main.focus();
  }

  function init(){
    buildNav();
    window.addEventListener('hashchange', ()=>{ render(location.hash.slice(1)) });
    // initial render
    render(location.hash.slice(1));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', ()=>{ SPA.init(); });
