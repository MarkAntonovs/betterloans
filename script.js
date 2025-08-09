// Mobile menu
const btn  = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');

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

// close on link click
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu, { passive: true }));

// debounce resize to avoid layout thrash
let rAF = 0;
window.addEventListener('resize', () => {
  if (rAF) cancelAnimationFrame(rAF);
  rAF = requestAnimationFrame(() => {
    if (window.innerWidth >= 768) closeMenu();
  });
}, { passive: true });