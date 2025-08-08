// Mobile menu
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
btn.addEventListener('click', () => {
  const isOpen = menu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});
// close on link click
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
// close when resizing to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) closeMenu();
});