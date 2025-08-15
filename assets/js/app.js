const STORE = {
  keyCart: 'bb_cart_v1',
  keyTestimonials: 'bb_testimonials_v1',
  keyTheme: 'bb_theme'
};
const formatIDR = (n) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

const products = [
  { id:'bread', name:'Roti Tawar Artisan', price:28000, img:'assets/img/product-bread.svg', desc:'Roti tawar dengan fermentasi alami, tekstur lembut.' },
  { id:'croissant', name:'Croissant Mentega', price:22000, img:'assets/img/product-croissant.svg', desc:'Lapis-lapis renyah dengan butter premium.' },
  { id:'cake', name:'Kue Ulang Tahun', price:180000, img:'assets/img/product-cake.svg', desc:'Kue sponge lembut dengan krim istimewa.' },
  { id:'donut', name:'Donat Cokelat', price:12000, img:'assets/img/product-donut.svg', desc:'Donat klasik dengan taburan cokelat.' },
  { id:'cookie', name:'Cookies Choco Chip', price:15000, img:'assets/img/product-cookie.svg', desc:'Renyaah~ dengan choco chip melimpah.' }
].slice(0,5);

// Theme
function applyTheme(theme){
  const root = document.documentElement;
  if(theme === 'dark'){ root.classList.add('dark'); }
  else { root.classList.remove('dark'); }
  localStorage.setItem(STORE.keyTheme, theme);
  const toggleLabel = document.querySelector('[data-theme-label]');
  if(toggleLabel) toggleLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
}
function toggleTheme(){
  const now = localStorage.getItem(STORE.keyTheme) || 'light';
  applyTheme(now === 'light' ? 'dark' : 'light');
}

// Cart
function getCart(){ try{return JSON.parse(localStorage.getItem(STORE.keyCart))||[]}catch(e){return[]} }
function setCart(c){ localStorage.setItem(STORE.keyCart, JSON.stringify(c)); renderCartPill(); }
function addToCart(pid){
  const found = products.find(p=>p.id===pid);
  if(!found) return;
  const cart = getCart();
  const i = cart.findIndex(x=>x.id===pid);
  if(i>-1){ cart[i].qty+=1; }else{ cart.push({id:pid, name:found.name, price:found.price, qty:1}); }
  setCart(cart);
  toast(`${found.name} ditambahkan ke keranjang`);
}
function renderCartPill(){
  const pill = document.querySelector('[data-cart-pill]');
  const cart = getCart();
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  pill.textContent = totalQty;
}

// Slider
let currentSlide = 0;
function renderSlides(){
  const wrap = document.querySelector('.slides');
  wrap.innerHTML = products.map(p=>`
    <div class="slide">
      <div class="image-wrap"><img src="${p.img}" alt="${p.name}"/></div>
      <div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price">${formatIDR(p.price)}</div>
        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap">
          <button class="button icon" onclick="addToCart('${p.id}')">+ Tambah ke Keranjang</button>
          <a href="checkout.html" class="button secondary icon">Checkout</a>
        </div>
      </div>
    </div>
  `).join('');
  goToSlide(0);
}
function goToSlide(i){
  const max = products.length-1;
  currentSlide = (i<0) ? max : (i>max) ? 0 : i;
  const wrap = document.querySelector('.slides');
  wrap.style.transform = `translateX(-${currentSlide*100}%)`;
}

// Toast
let toastTimer = null;
function toast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id='toast';
    t.style.position='fixed'; t.style.bottom='20px'; t.style.left='50%'; t.style.transform='translateX(-50%)';
    t.style.background='var(--brown)'; t.style.color='var(--cream)'; t.style.padding='10px 14px';
    t.style.borderRadius='999px'; t.style.boxShadow='0 6px 20px rgba(0,0,0,.18)'; t.style.zIndex='9999';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{t.style.opacity='0'}, 1600);
}

// Testimonials
function getTestimonials(){ try{return JSON.parse(localStorage.getItem(STORE.keyTestimonials))||[]}catch(e){return[]} }
function setTestimonials(list){ localStorage.setItem(STORE.keyTestimonials, JSON.stringify(list)); }
function renderTestimonials(){
  const list = getTestimonials();
  const box = document.getElementById('testi-list');
  if(!box) return;
  if(list.length===0){
    box.innerHTML = '<p>Belum ada testimoni. Jadilah yang pertama!</p>';
    return;
  }
  box.innerHTML = list.slice(-6).reverse().map(t=>`
    <div class="card revealable">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${t.nama}</strong>
        <span style="font-size:12px;color:#7b7b7b">${new Date(t.ts).toLocaleString('id-ID')}</span>
      </div>
      <p style="margin:.5rem 0 0">${t.pesan}</p>
    </div>
  `).join('');
  revealObserve();
}
function submitTestimonial(e){
  e.preventDefault();
  const nama = document.getElementById('nama').value.trim();
  const pesan = document.getElementById('pesan').value.trim();
  if(!nama || !pesan){ toast('Lengkapi nama & pesan.'); return; }
  const list = getTestimonials();
  list.push({nama, pesan, ts: Date.now()});
  setTestimonials(list);
  (e.target.reset||function(){})();
  renderTestimonials();
  toast('Terima kasih atas testimoni Anda!');
}

// IntersectionObserver for reveal animations
function revealObserve(){
  const els = document.querySelectorAll('.card:not(.show)');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
    })
  }, {threshold:0.1});
  els.forEach(el=>io.observe(el));
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Theme init
  applyTheme(localStorage.getItem(STORE.keyTheme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  // UI
  renderSlides();
  renderCartPill();
  renderTestimonials();
  // Controls
  document.getElementById('prev').addEventListener('click', ()=>goToSlide(currentSlide-1));
  document.getElementById('next').addEventListener('click', ()=>goToSlide(currentSlide+1));
  const themeBtn = document.querySelector('[data-theme-toggle]');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);
});