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
    menu.classList.contains('open') ? closeMenu() : openMenu();
  }, {passive:true});

  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', closeMenu, {passive:true});
  });

  window.addEventListener('resize', ()=>{
    if (window.innerWidth > 900 && menu.classList.contains('open')) closeMenu();
  }, {passive:true});
})();

/* Loan calculator with offer matcher (SEO-safe, no tracking) */
(function(){
  const offers = [
    { name: "Fino.lk",   min: 3000, max: 150000, link: "https://clickcrafter.eu/fino.lk/9is4591jin" },
    { name: "Oncredit",  min: 2000, max: 100000, link: "https://clickcrafter.eu/oncredit.lk/9is4591jin" },
    { name: "Monigo",    min: 3000, max: 150000, link: "https://clickcrafter.eu/monigo.lk/9is4591jin" },
    { name: "CashX",     min: 5000, max: 200000, link: "https://clickcrafter.eu/cashx.lk/9is4591jin" },
    { name: "LoanPlus",  min: 5000, max: 200000, link: "https://clickcrafter.eu/loanplus.lk/9is4591jin" },
    { name: "Loanme",    min: 8000, max: 80000,  link: "https://clickcrafter.eu/loanme.lk/9is4591jin" },
    { name: "Credify",   min: 5000, max: 200000, link: "https://clickcrafter.eu/credify.lk/9is4591jin" },
    { name: "SOScredit", min: 5000, max: 200000, link: "https://clickcrafter.eu/soscredit.lk/9is4591jin" },
    { name: "SOSO",      min: 5000, max: 200000, link: "https://clickcrafter.eu/soso.lk/9is4591jin" }
  ];

  const btn = document.getElementById("calcBtn");
  if(!btn) return;

  btn.addEventListener("click", ()=>{
    const amountEl = document.getElementById("loanAmount");
    const daysEl   = document.getElementById("loanDays");
    const rateEl   = document.getElementById("loanRate");
    const resultEl = document.getElementById("loanResult");
    const matchWrap= document.getElementById("matchOffers");

    const amount = Number(amountEl?.value || 0);
    const days   = Number(daysEl?.value || 0);
    const rate   = Number(rateEl?.value || 0) / 100;

    if(!amount || !days || !rate){
      resultEl.textContent = "Please fill in all fields.";
      resultEl.style.color = "#dc2626";
      matchWrap.innerHTML = "";
      return;
    }

    const total = amount * Math.pow(1 + rate, days);
    const overpay = total - amount;

    resultEl.innerHTML =
      `💰 <strong>Total to repay:</strong> ${total.toFixed(2)} LKR<br>` +
      `📈 <strong>Interest:</strong> ${overpay.toFixed(2)} LKR<br>` +
      `⏱ <strong>Term:</strong> ${days} days`;
    resultEl.style.color = "#1e3a8a";

    const matched = offers.filter(o => amount >= o.min && amount <= o.max);

    if(matched.length === 0){
      matchWrap.innerHTML = "<p>No matching offers found for that amount.</p>";
      return;
    }

    matchWrap.innerHTML =
      `<h3>Matching Offers (${matched.length})</h3>` +
      `<div class="match-list">` +
      matched.map(o =>
        `<div class="match-card">` +
          `<span>${o.name}</span>` +
          `<a href="${o.link}" target="_blank" rel="nofollow noopener noreferrer sponsored">Apply</a>` +
        `</div>`
      ).join("") +
      `</div>`;
  });
})();