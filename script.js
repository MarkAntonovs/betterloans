/* INP-first script: lazy GTM + cheap outbound clicks + passive listeners */
(() => {
  // util: addEventListener с поддержкой passive
  const supportsPassive = (() => {
    let p=false; try{ const o=Object.defineProperty({},"passive",{get(){p=true}});
    window.addEventListener("t",null,o);}catch(_){}
    return p;
  })();
  const on = (el,ev,fn,opts={}) =>
    el && el.addEventListener(ev,fn,supportsPassive ? {...opts} : false);

  /* ===== Mobile menu (без layout-тика) ===== */
  const btn = document.getElementById('menu-toggle');
  const mm  = document.getElementById('mobile-menu');
  if (btn && mm){
    on(btn,'click', () => {
      const open = mm.style.display === 'block';
      mm.style.display = open ? 'none' : 'block';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      mm.setAttribute('aria-hidden',  open ? 'true'  : 'false');
    }, {passive:true});
    mm.querySelectorAll('a').forEach(a =>
      on(a,'click',() => {
        mm.style.display='none';
        btn.setAttribute('aria-expanded','false');
        mm.setAttribute('aria-hidden','true');
      }, {passive:true})
    );
  }

  /* ===== Cookie utils (лёгкая версия) ===== */
  function getCookie(name){
    const m = document.cookie.match(new RegExp('(?:^|; )'+
      name.replace(/([.$?*|{}()[\]\\/+^])/g,'\\$1')+'=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* ===== Декорация партнёрских ссылок (чистая функция) ===== */
  function decorateHref(href, extraParam){
    try{
      const u = new URL(href, location.href);
      const gclid = getCookie('gclid') || getCookie('_gcl_aw') || getCookie('_gcl_au');
      const utm   = getCookie('utm_source');
      if (extraParam) u.searchParams.set('aff_param', extraParam);
      if (gclid && !u.searchParams.has('gclid')) u.searchParams.set('gclid', gclid);
      if (utm   && !u.searchParams.has('utm_source')) u.searchParams.set('utm_source', utm);
      return u.toString();
    }catch(_){ return href; }
  }

  /* ===== Пред-декорируем outbound-ссылки, чтобы клик был дешёвым ===== */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[data-outbound], a.apply, a[data-aff]').forEach(a => {
      const p = a.getAttribute('data-aff-param') || '';
      a.href = decorateHref(a.getAttribute('href'), p);
      a.setAttribute('rel','nofollow noopener noreferrer sponsored');
      a.setAttribute('target','_blank'); // остаёмся на странице -> событие не теряется
    });
  });

  /* ===== Очень лёгкий делегированный обработчик кликов ===== */
  on(document,'click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a');
    if (!a) return;

    // отсеиваем внутри-сайтовые
    try{
      const u = new URL(a.href, location.href);
      if (u.origin === location.origin) return;
    }catch(_){ return; }

    // пушим событие — не блокируя навигацию
    (window.dataLayer = window.dataLayer || []).push({
      event: 'outbound_click',
      link_url: a.href,
      ts: Date.now()
    });
  }, {passive:true});

  /* ===== Lazy-GTM: после первого действия или через 3000 мс ===== */
  function loadGTM(){
    if (loadGTM._done) return; loadGTM._done = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-P3JBMP5M';
    document.head.appendChild(s);
    (window.dataLayer = window.dataLayer || []).push({event:'gtm.lazy'});
  }
  const first = () => { loadGTM(); };
  ['pointerdown','keydown','scroll','touchstart']
    .forEach(ev => window.addEventListener(ev, first, {passive:true, once:true}));
  setTimeout(loadGTM, 3000);

  /* ===== Убираем 300 мс задержки тапа на iOS/Android ===== */
  document.documentElement.style.touchAction = 'manipulation';

  /* (необязательно) Помощник для отладки длинных задач */
  setTimeout(() => {
    if ('PerformanceObserver' in window) {
      try{
        const po = new PerformanceObserver(list => {
          for (const e of list.getEntries())
            if (e.duration > 120) console.debug('[LongTask]', Math.round(e.duration)+'ms', e.name||'');
        });
        po.observe({entryTypes:['longtask']});
      }catch(_){}
    }
  }, 4000);
})();