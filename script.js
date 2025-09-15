/* ============================================
   FinSriLanka — Global JS (clean, no Google/GTM)
   - Mobile menu: .open, aria-attrs, close on resize>900
   - Optional affiliate decorator (no GA/GTM/Google deps)
   ============================================ */

/* Mobile menu */
(function(){
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;

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

  btn.addEventListener('click', ()=> {
    const isOpen = menu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }, {passive:true});

  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', closeMenu, {passive:true});
  });

  window.addEventListener('resize', ()=>{
    if (window.innerWidth > 900 && menu.classList.contains('open')) {
      closeMenu();
    }
  }, {passive:true});
})();

/* Affiliate link decorator (optional, NO Google/GTM) */
(function(){
  const AFF_ENABLED = true; // set to false to disable entirely
  if(!AFF_ENABLED) return;

  const AFF_HOSTS=[{host:'clickcrafter.eu',param:'subid'},{host:'murtov.com',param:'subid'}];
  const DEFAULT_PARAM='subid';

  // read current URL params
  const sp=new URLSearchParams(location.search);
  function get(k){return sp.get(k)}

  // simple storage helpers
  function setCookie(n,v,d){
    try{
      const t=new Date(); t.setTime(t.getTime()+d*864e5);
      document.cookie=n+'='+encodeURIComponent(v)+'; path=/; expires='+t.toUTCString()+'; SameSite=Lax';
    }catch(e){}
  }
  function getCookie(name){
    const esc=name.replace(/([.*+?^${}()|[\]\\\/])/g,'\\$1');
    const m=document.cookie.match(new RegExp('(?:^|; )'+esc+'=([^;]*)'));
    return m?decodeURIComponent(m[1]):'';
  }
  function store(k,v){
    if(v){
      try{localStorage.setItem(k,v)}catch(e){}
      try{sessionStorage.setItem(k,v)}catch(e){}
      setCookie(k,v,90);
    }
  }
  function readStored(k){return get(k)||getCookie(k)||sessionStorage.getItem(k)||localStorage.getItem(k)||''}

  // Generate our own lightweight click/session id (not Google)
  function getCid(){
    let cid = readStored('cid');
    if(!cid){
      cid = (Date.now().toString(36) + Math.random().toString(36).slice(2,10)).toUpperCase();
      store('cid', cid);
    }
    return cid;
  }
  const CID = getCid();

  // Only keep generic UTM params (no defaults, no Google IDs)
  const UTM_KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  UTM_KEYS.forEach(k=>{ const v=get(k); if(v){ store(k,v) }});

  function getAffParamForHost(h){
    const cfg=AFF_HOSTS.find(x=>h===x.host||h.endsWith('.'+x.host));
    return cfg?cfg.param:DEFAULT_PARAM;
  }

  function isAffHost(hostname){
    return AFF_HOSTS.some(x=>hostname===x.host||hostname.endsWith('.'+x.host));
  }

  function decorate(urlStr,overrideParam){
    try{
      const url=new URL(urlStr,location.href);
      const host=url.hostname;
      if(!isAffHost(host)) return urlStr;

      const paramName=overrideParam||getAffParamForHost(host);

      // add our own click id if not present
      if(CID && !url.searchParams.has(paramName)) url.searchParams.set(paramName,CID);

      // propagate existing UTM params if present in storage (no defaults)
      UTM_KEYS.forEach(k=>{
        const v = readStored(k);
        if(v && !url.searchParams.has(k)) url.searchParams.set(k,v);
      });

      return url.toString();
    }catch(e){
      return urlStr;
    }
  }

  // On-click decoration (capture phase, passive)
  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href]');
    if(!a) return;
    const href=a.getAttribute('href');
    if(!href) return;
    if(!/^https?:/i.test(href)) return;

    const decorated=decorate(href,a.getAttribute('data-aff-param')||'');
    if(decorated!==href) a.setAttribute('href',decorated);

    // If it's an affiliate host, open safely in new tab (no GTM/GA events here)
    try{
      const u=new URL(decorated,location.href);
      if(isAffHost(u.hostname)){
        a.setAttribute('target','_blank');
        a.setAttribute('rel','nofollow noopener noreferrer sponsored');
      }
    }catch(err){}
  }, {capture:true,passive:true});
})();