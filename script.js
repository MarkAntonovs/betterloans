/* ===== Mobile menu toggle (общий для всех страниц) ===== */
(function(){
  const btn = document.getElementById('menu-toggle');
  const mm  = document.getElementById('mobile-menu');
  if(!btn || !mm) return;
  btn.addEventListener('click', ()=>{
    const open = mm.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mm.setAttribute('aria-hidden', open ? 'false' : 'true');
  });
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    mm.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    mm.setAttribute('aria-hidden','true');
  }));
})();

/* ===== Smooth scroll for in-page TOC ===== */
(function(){
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = decodeURIComponent(a.getAttribute('href')).slice(1);
    const el = document.getElementById(id);
    if(!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();

/* ===== Подсветка активного пункта TOC ===== */
(function(){
  const toc = document.querySelector('.toc');
  if(!toc) return;
  const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
  const map = new Map();
  links.forEach(a=>{
    const id = decodeURIComponent(a.getAttribute('href')).slice(1);
    const el = document.getElementById(id);
    if(el) map.set(el, a);
  });
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      const a = map.get(ent.target);
      if(!a) return;
      if(ent.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        a.classList.add('active');
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px', threshold:[0,1]});
  map.forEach((_, el)=>obs.observe(el));
})();

/* ===== Affiliate link decorator ===== */
(function(){
  const AFF_HOSTS = [
    {host:'clickcrafter.eu', param:'subid'},
    {host:'murtov.com',      param:'subid'}
  ];
  const DEFAULT_PARAM = 'subid';
  const sp = new URLSearchParams(location.search);
  const get = k => sp.get(k);
  function setCookie(name,value,days){
    try{
      const d = new Date(); d.setTime(d.getTime()+days*864e5);
      document.cookie = name+'='+encodeURIComponent(value)+'; path=/; expires='+d.toUTCString()+'; SameSite=Lax';
    }catch(e){}
  }
  function getCookie(name){
    // Экрануем все спецсимволы имени куки
    const esc = name.replace(/([.*+?^${}()|[\]\\\/])/g, '\\$1');
    const m = document.cookie.match(new RegExp('(?:^|; )' + esc + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function store(k,v){ if(v){ try{localStorage.setItem(k,v);}catch(e){} try{sessionStorage.setItem(k,v);}catch(e){} setCookie(k,v,90);} }
  function readStored(k){ return get(k) || getCookie(k) || sessionStorage.getItem(k) || localStorage.getItem(k) || ''; }
  function getAffParamForHost(h){
    const cfg = AFF_HOSTS.find(x => h === x.host || h.endsWith('.'+x.host));
    return cfg ? cfg.param : DEFAULT_PARAM;
  }
  ['gclid','gbraid','wbraid','gclsrc','utm_source','utm_medium','utm_campaign','utm_content','utm_term']
    .forEach(k => { const v=get(k); if(v){ store(k,v); }});
  const CLICK_ID = readStored('gclid') || readStored('gbraid') || readStored('wbraid');

  function decorate(urlStr, overrideParam){
    try{
      const url = new URL(urlStr, location.href);
      const host = url.hostname;
      const isAff = AFF_HOSTS.some(x => host === x.host || host.endsWith('.'+x.host));
      if(!isAff) return urlStr;
      const paramName = overrideParam || getAffParamForHost(host);
      if (CLICK_ID && !url.searchParams.has(paramName)) url.searchParams.set(paramName, CLICK_ID);
      ['gclid','gbraid','wbraid'].forEach(k => {
        const v = readStored(k);
        if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
      });
      const utm = {
        utm_source:   readStored('utm_source')   || 'google',
        utm_medium:   readStored('utm_medium')   || 'cpc',
        utm_campaign: readStored('utm_campaign') || '',
        utm_content:  readStored('utm_content')  || '',
        utm_term:     readStored('utm_term')     || ''
      };
      Object.entries(utm).forEach(([k,v])=>{ if(v && !url.searchParams.has(k)) url.searchParams.set(k,v); });
      return url.toString();
    }catch(e){ return urlStr; }
  }

  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href'); if (!href) return;
    if (!/^https?:/i.test(href)) return;
    const overrideParam = a.getAttribute('data-aff-param') || '';
    const decorated = decorate(href, overrideParam);
    if (decorated !== href) a.setAttribute('href', decorated);
  }, {capture:true, passive:true});
})();