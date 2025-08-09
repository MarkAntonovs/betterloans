// ===== Mobile menu =====
const btn = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');

function closeMenu(){
  menu.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-hidden','true');
}
function openMenu(){
  menu.classList.add('open');
  btn.setAttribute('aria-expanded','true');
  menu.setAttribute('aria-hidden','false');
}
btn?.addEventListener('click', () => {
  const isOpen = menu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });

// ===== Lazy GTM/GA =====
// Готовим dataLayer на случай ранних пушей
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

function loadGTM(){
  if (window.__gtmLoaded) return;
  window.__gtmLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-P3JBMP5M';
  document.head.appendChild(s);
}

// Загружаем, когда браузер простаивает или при первой интеракции
if ('requestIdleCallback' in window){
  requestIdleCallback(loadGTM, {timeout: 2000});
} else {
  setTimeout(loadGTM, 1200);
}
['click','scroll','keydown','mousemove','touchstart'].forEach(ev=>{
  window.addEventListener(ev, loadGTM, {once:true, passive:true});
});