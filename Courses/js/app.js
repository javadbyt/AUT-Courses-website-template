// header.js
document.addEventListener('DOMContentLoaded', () => {

//open drawer
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerClose = document.getElementById('drawerClose');
const drawerBackdrop = mobileDrawer?.querySelector('.drawer-backdrop');
const drawerAuthBtn = document.getElementById('drawerAuthBtn');

const btnAuthDesktop = document.getElementById('btnAuthDesktop');
const btnAuthMobile = document.getElementById('btnAuthMobile');
const authModal = document.getElementById('authModal');
const modalBackdrops = document.querySelectorAll('[data-close]');
const authForm = document.getElementById('authForm');

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

//function drawer
function openDrawer(){
  if(!mobileDrawer) return;
  mobileDrawer.setAttribute('aria-hidden','false');
  mobileMenuBtn.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
  //focus
  const firstFocusable = mobileDrawer.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();
  // don't scroll
  document.documentElement.style.touchAction = 'none';
}

function closeDrawer(){
  if(!mobileDrawer) return;
  mobileDrawer.setAttribute('aria-hidden','true');
  mobileMenuBtn.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
  mobileMenuBtn.focus();
  document.documentElement.style.touchAction = '';
}

  function openAuthModal(){
    authModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    //focus on first field
    authModal.querySelector('input')?.focus();
  }
  function closeAuthModal(){
    authModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  //drawer
  mobileMenuBtn?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
mobileDrawer?.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') {
    closeDrawer();
    return;
  }
  if(e.key === 'Tab') {
    //focus trap
    const focusable = Array.from(mobileDrawer.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled'));
    if(focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if(!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

//auth open
btnAuthDesktop?.addEventListener('click', openAuthModal);
  btnAuthMobile?.addEventListener('click', openAuthModal);
  drawerAuthBtn?.addEventListener('click', () => { closeDrawer(); openAuthModal(); });

  modalBackdrops.forEach(el => el.addEventListener('click', () => {
    const parent = el.closest('[aria-hidden]');
    if(parent) parent.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }));

  //close with escape
  authModal?.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeAuthModal();
  });

  //auth form
  authForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authForm.email.value.trim();
    if(!email) return;
    //local storage
    localStorage.setItem('daneshyar_user', JSON.stringify({ email, created: Date.now() }));
    closeAuthModal();
    btnAuthDesktop.textContent = 'پروفایل';
    btnAuthMobile.textContent = 'پروفایل';
  });

  //search
  function debounce(fn, delay = 250){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const sampleCourses = [
    { id:1, title:'مبانی HTML و CSS' },
    { id:2, title:'جاوااسکریپت برای مبتدیان' },
    { id:3, title:'مقدمه‌ای بر مهندسی پزشکی' },
    { id:4, title:'طراحی رابط کاربری' }
  ];

  function renderSearchResults(items){
    if(!searchResults) return;
    if(!items.length){
      searchResults.innerHTML = `<div class="search-empty" role="option">نتیجه‌ای یافت نشد</div>`;
      searchResults.hidden = false;
      return;
    }
    searchResults.innerHTML = items.map(i => `<div class="search-item" role="option" data-id="${i.id}" tabindex="0">${escapeHtml(i.title)}</div>`).join('');
    searchResults.hidden = false;
  }

  function doSearch(q){
    const ql = String(q || '').trim().toLowerCase();
    if(!ql){ searchResults.hidden = true; searchResults.innerHTML = ''; return; }
    const matched = sampleCourses.filter(c => c.title.toLowerCase().includes(ql));
    renderSearchResults(matched);
  }

  const debouncedSearch = debounce(e => doSearch(e.target.value), 200);
  searchInput?.addEventListener('input', debouncedSearch);

  //click on search result
  searchResults?.addEventListener('click', (e) => {
    const item = e.target.closest('.search-item');
    if(!item) return;
    const id = item.dataset.id;
    alert('انتخاب شد: ' + item.textContent);
    searchResults.hidden = true;
  });

  searchResults?.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      e.target.click();
    }
  });

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
});


// slider
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");

  let index = 0;
  let timer = null;

  function showSlide(i) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  }

  // Auto slide
  function startAuto() {
    timer = setInterval(nextSlide, 5000);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  next.addEventListener("click", () => {
    nextSlide();
    resetAuto();
  });

  prev.addEventListener("click", () => {
    prevSlide();
    resetAuto();
  });

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      index = parseInt(dot.dataset.index);
      showSlide(index);
      resetAuto();
    });
  });

  showSlide(index);
  startAuto();
});



// submenu open/close
document.addEventListener("DOMContentLoaded", () => {

  const toggles = document.querySelectorAll(".drawer-toggle");

  toggles.forEach(btn => {
    btn.addEventListener("click", () => {

      const submenu = document.querySelector(btn.dataset.target);
      const isOpen = submenu.classList.contains("open");

      document.querySelectorAll(".drawer-submenu").forEach(s => {
        s.classList.remove("open");
        s.style.maxHeight = null;
      });

      document.querySelectorAll(".drawer-toggle").forEach(b => {
        b.classList.remove("active");
      });

      if (!isOpen) {
        submenu.classList.add("open");
        btn.classList.add("active");

        submenu.style.maxHeight = submenu.scrollHeight + "px";
      }
    });
  });

});

