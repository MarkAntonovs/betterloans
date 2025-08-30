/* ========= Mobile menu (лёгкая логика без лишних перерисовок) ========= */
(function(){
  const btn  = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-hidden','true');
  };
  const openMenu = () => {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-hidden','false');
  };

  btn.addEventListener('click', () => {
    (menu.classList.contains('open') ? closeMenu : openMenu)();
  }, { passive: true });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu, { passive: true }));

  let rAF = 0;
  window.addEventListener('resize', () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }, { passive: true });
})();

/* ========= Affiliate decorator + dataLayer event =========
   Прокидываем subid(gclid/gbraid/wbraid) + utm в партнёрские ссылки
   и шлём событие 'aff_click' в GTM.
*/
(function(){
  // конфиг доменов партнёрок
  const AFF_HOSTS = [
    {host:'clickcrafter.eu', param:'subid'},
    {host:'murtov.com',      param:'subid'}
  ];
  const DEFAULT_PARAM = 'subid';
  const UTM_DEFAULTS = {utm_source:'google', utm_medium:'cpc'};

  const sp = new URLSearchParams(location.search);
  function get(k){ return sp.get(k); }
  function setCookie(name,value,days){
    try{
      const d = new Date(); d.setTime(d.getTime()+days*864e5);
      document.cookie = name+'='+encodeURIComponent(value)+'; path=/; expires='+d.toUTCString()+'; SameSite=Lax';
    }catch(e){}
  }
  function getCookie(name){
    if (!document.cookie) return '';
    const pairs = document.cookie.split('; ');
    for (const p of pairs) {
      const eq = p.indexOf('=');
      const k  = eq === -1 ? p : p.slice(0, eq);
      if (k === name) return decodeURIComponent(eq === -1 ? '' : p.slice(eq + 1));
    }
    return '';
  }
  function store(k,v){ if(v){ try{localStorage.setItem(k,v);}catch(e){} try{sessionStorage.setItem(k,v);}catch(e){} setCookie(k,v,90);} }
  function readStored(k){ return get(k) || getCookie(k) || sessionStorage.getItem(k) || localStorage.getItem(k) || ''; }
  function affParamFor(host){ const c=AFF_HOSTS.find(x=>host===x.host||host.endsWith('.'+x.host)); return c?c.param:DEFAULT_PARAM; }

  // сохраняем идентификаторы клика и utm
  ['gclid','gbraid','wbraid','gclsrc','utm_source','utm_medium','utm_campaign','utm_content','utm_term']
    .forEach(k => { const v=get(k); if(v){ store(k,v); }});
  const CLICK_ID = readStored('gclid') || readStored('gbraid') || readStored('wbraid');

  function decorate(href, overrideParam){
    try{
      const url  = new URL(href, location.href);
      const host = url.hostname;
      const isAff = AFF_HOSTS.some(x => host===x.host || host.endsWith('.'+x.host));
      if(!isAff) return href;

      const paramName = overrideParam || affParamFor(host);
      if (CLICK_ID && !url.searchParams.has(paramName)) url.searchParams.set(paramName, CLICK_ID);
      ['gclid','gbraid','wbraid'].forEach(k => { const v = readStored(k); if(v && !url.searchParams.has(k)) url.searchParams.set(k,v); });

      const utm = {
        utm_source:   readStored('utm_source')   || UTM_DEFAULTS.utm_source,
        utm_medium:   readStored('utm_medium')   || UTM_DEFAULTS.utm_medium,
        utm_campaign: readStored('utm_campaign') || '',
        utm_content:  readStored('utm_content')  || '',
        utm_term:     readStored('utm_term')     || ''
      };
      Object.entries(utm).forEach(([k,v])=>{ if(v && !url.searchParams.has(k)) url.searchParams.set(k,v); });

      return url.toString();
    }catch(e){ return href; }
  }

  // делегируем клик по всем <a>
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href'); if (!href || !/^https?:/i.test(href)) return;

    const decorated = decorate(href, a.getAttribute('data-aff-param') || '');
    if (decorated !== href) a.setAttribute('href', decorated);

    try{
      const u = new URL(decorated, location.href);
      if (AFF_HOSTS.some(x => u.hostname===x.host || u.hostname.endsWith('.'+x.host))) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'aff_click',
          partner_host: u.hostname,
          link_url: u.toString(),
          click_id: CLICK_ID || null,
          link_text: (a.textContent || '').trim()
        });
        a.setAttribute('target','_blank');
        a.setAttribute('rel','nofollow noopener noreferrer sponsored');
      }
    }catch(err){}
  }, {capture:true, passive:true});
})();
// ===== Mobile menu (как на главной)
(function(){
  const btn = document.getElementById('menu-toggle');
  const mm  = document.getElementById('mobile-menu');
  if(!btn || !mm) return;
  btn.addEventListener('click', () => {
    const opened = mm.classList.toggle('open');
    btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    mm.setAttribute('aria-hidden', opened ? 'false' : 'true');
  });
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mm.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    mm.setAttribute('aria-hidden','true');
  }));
})();

// ===== TOC (оглавление) для страниц с .prose
(function(){
  const toc = document.getElementById('toc');
  const article = document.querySelector('.prose');
  if(!toc || !article) return;

  const headings = article.querySelectorAll('h2[id]');
  headings.forEach(h => {
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/^\d+\)\s*/, '');
    toc.appendChild(a);
  });
})();