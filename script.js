/* ============================================
   FinSriLanka — Global JS
   - Mobile menu: class .open, aria-attrs, close on resize>900
   - Optional affiliate decorator (can disable via AFF_ENABLED)
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

/* Affiliate link decorator (optional) */
(function(){
  const AFF_ENABLED = true; // set to false to disable
  if(!AFF_ENABLED) return;

  const AFF_HOSTS=[{host:'clickcrafter.eu',param:'subid'},{host:'murtov.com',param:'subid'}];
  const DEFAULT_PARAM='subid';
  const UTM_DEFAULTS={utm_source:'google',utm_medium:'cpc'};

  const sp=new URLSearchParams(location.search);
  function get(k){return sp.get(k)}
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
      setCookie(k,v,90)
    }
  }
  function readStored(k){return get(k)||getCookie(k)||sessionStorage.getItem(k)||localStorage.getItem(k)||''}
  function getAffParamForHost(h){const cfg=AFF_HOSTS.find(x=>h===x.host||h.endsWith('.'+x.host));return cfg?cfg.param:DEFAULT_PARAM}

  ['gclid','gbraid','wbraid','gclsrc','utm_source','utm_medium','utm_campaign','utm_content','utm_term']
    .forEach(k=>{const v=get(k); if(v){store(k,v)}});

  const CLICK_ID=readStored('gclid')||readStored('gbraid')||readStored('wbraid');

  function decorate(urlStr,overrideParam){
    try{
      const url=new URL(urlStr,location.href);
      const host=url.hostname;
      const isAff=AFF_HOSTS.some(x=>host===x.host||host.endsWith('.'+x.host));
      if(!isAff) return urlStr;

      const paramName=overrideParam||getAffParamForHost(host);
      if(CLICK_ID && !url.searchParams.has(paramName)) url.searchParams.set(paramName,CLICK_ID);

      ['gclid','gbraid','wbraid'].forEach(k=>{const v=readStored(k); if(v && !url.searchParams.has(k)) url.searchParams.set(k,v)});
      const utm={
        utm_source:readStored('utm_source')||UTM_DEFAULTS.utm_source,
        utm_medium:readStored('utm_medium')||UTM_DEFAULTS.utm_medium,
        utm_campaign:readStored('utm_campaign')||'',
        utm_content:readStored('utm_content')||'',
        utm_term:readStored('utm_term')||''
      };
      Object.entries(utm).forEach(([k,v])=>{if(v && !url.searchParams.has(k)) url.searchParams.set(k,v)});
      return url.toString();
    }catch(e){return urlStr}
  }

  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href]');
    if(!a) return;
    const href=a.getAttribute('href');
    if(!href) return;
    if(!/^https?:/i.test(href)) return;

    const decorated=decorate(href,a.getAttribute('data-aff-param')||'');
    if(decorated!==href) a.setAttribute('href',decorated);

    try{
      const u=new URL(decorated,location.href);
      if(AFF_HOSTS.some(x=>u.hostname===x.host||u.hostname.endsWith('.'+x.host))){
        window.dataLayer=window.dataLayer||[];
        window.dataLayer.push({event:'aff_click',partner_host:u.hostname,link_url:u.toString(),click_id:CLICK_ID||null,link_text:(a.textContent||'').trim()});
        a.setAttribute('target','_blank');a.setAttribute('rel','nofollow noopener noreferrer sponsored');
      }
    }catch(err){}
  }, {capture:true,passive:true});
})();