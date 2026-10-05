const PRODUCTS = [
  {
    id: 'makhana-mewa-bites',
    kicker: 'Signature festive sweet',
    name: 'Makhana Mewa Bites',
    tagline: 'Dates, makhana, dry fruits, coconut & ghee in a rich festive bite.',
    description: 'Our signature launch sweet: soft, nutty and gift-ready. It is prepared fresh after the order is paid and confirmed.',
    basePack: '200g festive box',
    packs: [
      {label:'200g', price:449},
      {label:'400g', price:849, preview:true},
      {label:'800g', price:1599, preview:true}
    ],
    ingredients: ['Makhana','Dates','Cashew','Almond','Raisins','Desiccated coconut','Ghee','Limited added sugar'],
    delivery: 'Initial delivery is planned for selected Ahmedabad societies, with wider Ahmedabad delivery added as capacity allows. Orders are prepaid and production starts after successful payment.',
    gifting: 'Festive and corporate gifting is planned for societies, offices and local businesses. Bulk quantity pricing will be finalized before launch.',
    colors: ['#401015','#7b2d37','#d4a15d'],
    media: [
      'assets/makhana-hero-hires.webp',
      'assets/makhana-close-hires.webp',
      'assets/makhana-platter-hires.webp',
      'assets/makhana-gift-hires.webp',
      'assets/makhana-gift-open-hires.webp'
    ],
    photoLabels: ['Signature bites','A closer look','Ready to share','Festive gifting','Inside the gift box'],
    art: 'bites'
  },
  {
    id: 'coconut-mewa-ladoo',
    kicker: 'New festive addition',
    name: 'Coconut Mewa Ladoo',
    tagline: 'Soft coconut-rich ladoos with mewa and ghee.',
    description: 'A second sweet added for family review. Recipe, pack sizes and prices shown here are preview data and will be replaced after final approval.',
    basePack: '250g festive box • preview',
    packs: [
      {label:'250g', price:399, preview:true},
      {label:'500g', price:749, preview:true},
      {label:'1kg', price:1399, preview:true}
    ],
    ingredients: ['Coconut','Cashew','Almond','Raisins','Ghee','Final recipe to be confirmed'],
    delivery: 'Same prepaid, fresh-production model. Delivery availability will depend on daily production capacity and customer area in Ahmedabad.',
    gifting: 'Planned in premium festive boxes. Final gifting presentation and bulk pricing will be approved after the product itself is finalized.',
    colors: ['#5b241d','#b86e4a','#f1d8a9'],
    art: 'ladoo'
  }
];

let activeProduct = PRODUCTS[0];
let activePack = activeProduct.packs[0];
let activeMediaIndex = 0;

const grid = document.getElementById('productGrid');
const productLayer = document.getElementById('productLayer');
const checkoutLayer = document.getElementById('checkoutLayer');
const detailMedia = document.getElementById('detailMedia');
const detailKicker = document.getElementById('detailKicker');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailPrice = document.getElementById('detailPrice');
const detailPack = document.getElementById('detailPack');
const packOptions = document.getElementById('packOptions');
const infoPanel = document.getElementById('infoPanel');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutTotal = document.getElementById('checkoutTotal');
const quantity = document.getElementById('quantity');
const toast = document.getElementById('toast');

function money(n){ return '₹' + Number(n).toLocaleString('en-IN'); }

function bitesSvg(id=''){
  return `<svg viewBox="0 0 760 860" aria-hidden="true" data-art="${id}">
    <defs>
      <linearGradient id="bg-${id}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7c2c36"/><stop offset="1" stop-color="#2b0a10"/></linearGradient>
      <linearGradient id="b-${id}" x1="0" x2="1"><stop stop-color="#a76537"/><stop offset="1" stop-color="#573022"/></linearGradient>
      <filter id="s-${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dy="24" stdDeviation="22" flood-opacity=".35"/></filter>
    </defs>
    <rect width="760" height="860" fill="url(#bg-${id})"/>
    <circle cx="610" cy="140" r="220" fill="#d8a65f" opacity=".13"/>
    <circle cx="100" cy="700" r="260" fill="#d8a65f" opacity=".08"/>
    <g filter="url(#s-${id})">
      <ellipse cx="380" cy="492" rx="280" ry="178" fill="#f2dfc5"/>
      <ellipse cx="380" cy="475" rx="248" ry="149" fill="#fff9ef"/>
      ${[[260,390,75],[390,350,78],[520,405,72],[310,505,74],[455,520,76]].map(([x,y,r])=>`
        <g transform="translate(${x} ${y})">
          <circle r="${r}" fill="url(#b-${id})"/><circle r="${r-9}" fill="none" stroke="#f3e5cf" stroke-width="10"/>
          <ellipse cx="-20" cy="-24" rx="15" ry="7" fill="#e3caa4" transform="rotate(-24)"/>
          <ellipse cx="19" cy="-18" rx="14" ry="7" fill="#c99e61" transform="rotate(23)"/>
          <circle cx="2" cy="8" r="5" fill="#7d9b54"/>
        </g>`).join('')}
    </g>
    <g fill="#e6bc78" opacity=".8"><circle cx="125" cy="180" r="5"/><circle cx="650" cy="265" r="6"/><circle cx="610" cy="690" r="4"/></g>
  </svg>`;
}

function ladooSvg(id=''){
  return `<svg viewBox="0 0 760 860" aria-hidden="true" data-art="${id}">
    <defs>
      <linearGradient id="lbg-${id}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#76382a"/><stop offset=".55" stop-color="#4a1a17"/><stop offset="1" stop-color="#2b0b0d"/></linearGradient>
      <radialGradient id="ladoo-${id}"><stop offset="0" stop-color="#fffaf0"/><stop offset=".72" stop-color="#f2ddba"/><stop offset="1" stop-color="#d7b47d"/></radialGradient>
      <filter id="ls-${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dy="22" stdDeviation="20" flood-opacity=".34"/></filter>
    </defs>
    <rect width="760" height="860" fill="url(#lbg-${id})"/>
    <circle cx="590" cy="160" r="210" fill="#f4c984" opacity=".12"/>
    <g filter="url(#ls-${id})">
      <ellipse cx="380" cy="520" rx="285" ry="175" fill="#d9a96d"/>
      <ellipse cx="380" cy="500" rx="250" ry="145" fill="#f7ead4"/>
      ${[[265,420,78],[390,370,82],[515,435,76],[330,535,77],[455,550,80]].map(([x,y,r])=>`
        <g transform="translate(${x} ${y})">
          <circle r="${r}" fill="url(#ladoo-${id})"/>
          <circle cx="-23" cy="-18" r="7" fill="#b98552"/><circle cx="17" cy="-30" r="7" fill="#8a9d54"/><circle cx="26" cy="6" r="6" fill="#c99866"/>
          <path d="M-45 20 Q0 40 42 17" fill="none" stroke="#fff" stroke-opacity=".58" stroke-width="4" stroke-linecap="round"/>
        </g>`).join('')}
    </g>
  </svg>`;
}

function artSvg(product, suffix='card'){
  if(product.media?.length){
    const src = suffix === 'detail' ? product.media[0] : product.media[0];
    return `<img src="${src}" alt="${product.name}" loading="lazy" decoding="async">`;
  }
  return product.art === 'ladoo' ? ladooSvg(product.id+'-'+suffix) : bitesSvg(product.id+'-'+suffix);
}

function renderCards(){
  grid.innerHTML = PRODUCTS.map((p,i)=>`
    <button class="product-card" data-product="${p.id}" aria-label="View ${p.name}">
      <div class="product-art" data-card-media="${p.id}">${artSvg(p,'card')}</div>
      <div class="product-shade"></div>
      <div class="product-card-content">
        <span class="product-kicker">${p.kicker}</span>
        <h3>${p.name}</h3>
        <div class="card-bottom">
          <div><strong>From ${money(p.packs[0].price)}</strong><span>${p.packs[0].label}${p.packs[0].preview?' • preview':''}</span></div>
          <span class="card-arrow">↗</span>
        </div>
      </div>
    </button>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card=>{
    card.addEventListener('click',()=>openProduct(card.dataset.product, card));
  });
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let pendingTransition = null;
let productTrigger = null;
const focusReturns = new WeakMap();

function transition(update, cleanup=()=>{}){
  pendingTransition?.skipTransition();
  if(reducedMotion.matches || !document.startViewTransition){ update(); cleanup(); return; }
  const current = document.startViewTransition(update);
  pendingTransition = current;
  current.ready.catch(()=>{});
  current.finished.catch(()=>{}).finally(()=>{
    cleanup();
    if(pendingTransition===current) pendingTransition=null;
  });
}

function setLayer(layer, open, returnFocus=true){
  if(open) focusReturns.set(layer, document.activeElement);
  layer.classList.toggle('is-open',open);
  layer.setAttribute('aria-hidden',String(!open));
  layer.inert=!open;
  syncLayers();
  if(open) layer.querySelector('button, input')?.focus({preventScroll:true});
  else if(returnFocus) focusReturns.get(layer)?.focus({preventScroll:true});
}

function syncLayers(){
  const photo = document.getElementById('photoLightbox');
  const payment = document.getElementById('paymentLayer');
  const photoOpen = photo?.classList.contains('open');
  const checkoutOpen = checkoutLayer.classList.contains('is-open');
  const paymentOpen = payment.classList.contains('is-open');
  const productOpen = productLayer.classList.contains('is-open');
  productLayer.inert = !productOpen || checkoutOpen || photoOpen;
  checkoutLayer.inert = !checkoutOpen || paymentOpen;
  for(const el of document.querySelectorAll('body > header, body > main, body > footer, #whatsappFab')) el.inert=productOpen;
  document.body.classList.toggle('modal-open',productOpen);
}

function openProduct(id, sourceCard, push=true){
  const product = PRODUCTS.find(p=>p.id===id);
  if(!product) return;
  if(productLayer.classList.contains('is-open') && activeProduct===product) return;
  activeProduct = product;
  activePack = product.packs[0];
  productTrigger=sourceCard || document.querySelector(`[data-product="${id}"]`);
  const sourceMedia = sourceCard?.querySelector('[data-card-media]');
  pendingTransition?.skipTransition();
  document.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.viewTransitionName='');
  if(sourceMedia) sourceMedia.style.viewTransitionName='product-media';
  transition(()=>{
    if(sourceMedia) sourceMedia.style.viewTransitionName='';
    fillProduct();
    setLayer(productLayer,true);
    detailMedia.style.viewTransitionName=sourceMedia?'product-media':'';
  },()=>{ if(sourceMedia) sourceMedia.style.viewTransitionName=''; detailMedia.style.viewTransitionName=''; });
  if(push) history.pushState({product:id},'', '#product/'+id);
}

let galleryRequest = 0;
function animatePhoto(img, direction=1){
  if(!reducedMotion.matches) img.animate([
    {opacity:.25,transform:`translateX(${direction*12}px) scale(1.018)`},
    {opacity:1,transform:'translateX(0) scale(1)'}
  ],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
}

async function selectDetailPhoto(index){
  const media=activeProduct.media || [];
  if(!media.length) return;
  const next=(index+media.length)%media.length;
  const direction=next>=activeMediaIndex?1:-1;
  activeMediaIndex=next;
  const request=++galleryRequest;
  const image=new Image(); image.src=media[next];
  try { await image.decode(); } catch { return; }
  if(request!==galleryRequest) return;
  const img=detailMedia.querySelector('.detail-photo-button img');
  if(!img) return;
  img.src=media[next]; img.alt=`${activeProduct.name} photo ${next+1}`;
  detailMedia.querySelector('.detail-photo-button').setAttribute('aria-label',`Open ${activeProduct.name} photo ${next+1} full screen`);
  detailMedia.querySelector('.gallery-caption').textContent=`${next+1} / ${media.length} — ${photoLabel(next)}`;
  for(const thumb of detailMedia.querySelectorAll('.detail-thumb')){
    const selected=Number(thumb.dataset.index)===next;
    thumb.classList.toggle('active',selected); thumb.setAttribute('aria-pressed',String(selected));
  }
  animatePhoto(img,direction);
}

function photoLabel(index){ return activeProduct.photoLabels?.[index] || `Photo ${index+1}`; }

function bindSwipe(surface, onSwipe){
  let start=null;
  surface.addEventListener('touchstart',e=>{
    start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;
  },{passive:true});
  surface.addEventListener('touchend',e=>{
    if(!start) return;
    const dx=e.changedTouches[0].clientX-start.x, dy=e.changedTouches[0].clientY-start.y;
    if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3){ onSwipe(dx<0?1:-1); }
    start=null;
  },{passive:true});
  surface.addEventListener('touchcancel',()=>start=null,{passive:true});
}

function renderDetailGallery(index=0){
  ++galleryRequest;
  activeMediaIndex = Math.max(0, Math.min(index, (activeProduct.media?.length || 1)-1));
  if(!activeProduct.media?.length){
    detailMedia.innerHTML = artSvg(activeProduct,'detail');
    return;
  }
  const src = activeProduct.media[activeMediaIndex];
  detailMedia.innerHTML = `
    <div class="detail-gallery">
      <button class="detail-photo-button" type="button" aria-label="Open ${activeProduct.name} photo ${activeMediaIndex+1} full screen">
        <img src="${src}" alt="${activeProduct.name} photo ${activeMediaIndex+1}" decoding="async">
        <span class="zoom-hint">Tap to enlarge</span>
      </button>
      <p class="gallery-caption" aria-live="polite">${activeMediaIndex+1} / ${activeProduct.media.length} — ${photoLabel(activeMediaIndex)}</p>
      <div class="detail-thumb-strip" aria-label="${activeProduct.name} photo gallery">
        ${activeProduct.media.map((photo,i)=>`
          <button type="button" class="detail-thumb ${i===activeMediaIndex?'active':''}" data-index="${i}" aria-pressed="${i===activeMediaIndex}" aria-label="View photo ${i+1} of ${activeProduct.media.length}">
            <img src="${photo}" alt="${activeProduct.name} thumbnail ${i+1}" loading="lazy" decoding="async">
          </button>`).join('')}
      </div>
    </div>`;
  bindSwipe(detailMedia.querySelector('.detail-photo-button'),delta=>selectDetailPhoto(activeMediaIndex+delta));
  detailMedia.querySelector('.detail-photo-button')?.addEventListener('click',()=>openPhotoLightbox(activeMediaIndex));
  detailMedia.querySelectorAll('.detail-thumb').forEach(btn=>btn.addEventListener('click',()=>{
    selectDetailPhoto(Number(btn.dataset.index));
  }));
}

function fillProduct(){
  detailKicker.textContent = activeProduct.kicker;
  detailMedia.scrollTop=0;
  productLayer.querySelector('.product-sheet').scrollTop=0;
  productLayer.querySelector('.detail-content').scrollTop=0;
  detailTitle.textContent = activeProduct.name;
  detailDescription.textContent = activeProduct.description;
  activeMediaIndex = 0;
  renderDetailGallery(0);
  renderPacks();
  infoPanel.className='info-panel';
  infoPanel.innerHTML='';
  document.querySelectorAll('.info-card').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','infoPanel');});
}

function renderPacks(){
  detailPrice.textContent = money(activePack.price);
  detailPack.textContent = activePack.label + (activePack.preview?' • preview price':'');
  packOptions.innerHTML = activeProduct.packs.map((p,i)=>`<button type="button" class="pack-chip ${p.label===activePack.label?'active':''}" data-pack="${i}" aria-pressed="${p.label===activePack.label}">${p.label} • ${money(p.price)}${p.preview?'*':''}</button>`).join('');
  packOptions.querySelectorAll('.pack-chip').forEach(btn=>{
    btn.addEventListener('click',()=>{
      activePack=activeProduct.packs[Number(btn.dataset.pack)];
      renderPacks();
      pulse(detailPrice);
    });
  });
}

function pulse(el){
  if(reducedMotion.matches) return;
  el.animate([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
}

function closeProduct(push=true){
  if(!productLayer.classList.contains('is-open')) return;
  closePhotoLightbox(); closePayment(); closeCheckout();
  const target=productTrigger?.querySelector('[data-card-media]');
  const visible=target && target.getBoundingClientRect().top<innerHeight && target.getBoundingClientRect().bottom>0;
  if(visible) detailMedia.style.viewTransitionName='product-media';
  transition(()=>{
    detailMedia.style.viewTransitionName='';
    setLayer(productLayer,false);
    if(visible) target.style.viewTransitionName='product-media';
  },()=>{detailMedia.style.viewTransitionName='';if(target) target.style.viewTransitionName='';});
  if(push && location.hash.startsWith('#product/')) history.pushState({},'',location.pathname+location.search+'#collection');
}

document.querySelectorAll('[data-close-product]').forEach(el=>el.addEventListener('click',()=>closeProduct()));

document.querySelectorAll('.info-card').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const key=btn.dataset.info;
    const same=btn.classList.contains('active');
    document.querySelectorAll('.info-card').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','infoPanel');});
    if(same){ infoPanel.className='info-panel'; return; }
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    let html='';
    if(key==='ingredients') html='<p><strong>Ingredients</strong></p><ul>'+activeProduct.ingredients.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
    if(key==='delivery') html='<p><strong>Delivery</strong><br>'+activeProduct.delivery+'</p>';
    if(key==='gifting') html='<p><strong>Gifting</strong><br>'+activeProduct.gifting+'</p>';
    if(key==='photos'){
      if(activeProduct.media?.length){
        html='<div class="photo-gallery-head"><strong>Product photos</strong><span>Tap any photo to view it above. Tap the large photo to open full-screen.</span></div><div class="photo-grid">'+activeProduct.media.map((src,i)=>'<button type="button" class="photo-thumb '+(i===0?'active':'')+'" data-photo="'+src+'" aria-label="View '+activeProduct.name+' photo '+(i+1)+'"><img src="'+src+'" alt="'+activeProduct.name+' photo '+(i+1)+'" loading="lazy" decoding="async"></button>').join('')+'</div>';
      }else{
        html='<p><strong>Photos</strong><br>Product photography will be added after the Coconut Mewa Ladoo is finalized.</p>';
      }
    }
    infoPanel.innerHTML=html;
    infoPanel.className='info-panel show'+(key==='photos'?' photos-open':'');
    if(key==='photos'){
      infoPanel.querySelectorAll('.photo-thumb').forEach(btn=>btn.addEventListener('click',()=>{
        const idx = activeProduct.media.indexOf(btn.dataset.photo);
        selectDetailPhoto(idx < 0 ? 0 : idx);
        infoPanel.querySelectorAll('.photo-thumb').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
      }));
    }
  });
});

let lightboxRequest=0;
let zoomed=false;
function closePhotoLightbox(){
  const box=document.getElementById('photoLightbox');
  if(!box?.classList.contains('open')) return;
  box.classList.remove('open'); box.inert=true; box.setAttribute('aria-hidden','true');
  ++lightboxRequest; syncLayers(); focusReturns.get(box)?.focus({preventScroll:true});
}
function openPhotoLightbox(index=0){
  if(!activeProduct.media?.length) return;
  let box=document.getElementById('photoLightbox');
  if(!box){
    box=document.createElement('div'); box.id='photoLightbox'; box.className='photo-lightbox';
    box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Product photos');
    box.innerHTML=`
      <button type="button" class="photo-lightbox-close" aria-label="Close image">×</button>
      <button type="button" class="lightbox-zoom" aria-label="Zoom photo" aria-pressed="false">Zoom +</button>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous photo">‹</button>
      <div class="lightbox-stage"><img alt="" decoding="async"><div class="lightbox-count" aria-live="polite"></div></div>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Next photo">›</button>
      <div class="lightbox-thumbs"></div>`;
    document.body.appendChild(box);
    box.querySelector('.photo-lightbox-close').addEventListener('click',closePhotoLightbox);
    box.addEventListener('click',e=>{if(e.target===box) closePhotoLightbox();});
    box.querySelector('.lightbox-prev').addEventListener('click',()=>showLightboxPhoto(activeMediaIndex-1));
    box.querySelector('.lightbox-next').addEventListener('click',()=>showLightboxPhoto(activeMediaIndex+1));
    box.querySelector('.lightbox-zoom').addEventListener('click',()=>setZoom(!zoomed));
    box.querySelector('.lightbox-stage img').addEventListener('dblclick',()=>setZoom(!zoomed));
    bindSwipe(box.querySelector('.lightbox-stage'),delta=>{if(!zoomed) showLightboxPhoto(activeMediaIndex+delta);});
  }
  focusReturns.set(box,document.activeElement);
  box.inert=false; box.setAttribute('aria-hidden','false'); box.classList.add('open');
  syncLayers(); showLightboxPhoto(index); box.querySelector('.photo-lightbox-close').focus();
}
function setZoom(on){
  zoomed=on;
  const box=document.getElementById('photoLightbox'); if(!box) return;
  box.classList.toggle('is-zoomed',on);
  const btn=box.querySelector('.lightbox-zoom');btn.textContent=on?'Zoom −':'Zoom +';btn.setAttribute('aria-pressed',String(on));
  if(!on){const stage=box.querySelector('.lightbox-stage');stage.scrollTop=0;stage.scrollLeft=0;}
}
async function showLightboxPhoto(index){
  const media=activeProduct.media || []; if(!media.length) return;
  const next=(index+media.length)%media.length;
  const direction=next>=activeMediaIndex?1:-1;
  const request=++lightboxRequest;
  const box=document.getElementById('photoLightbox'); if(!box) return;
  activeMediaIndex=next;setZoom(false);
  const img=box.querySelector('.lightbox-stage img');
  const preload=new Image();preload.src=media[next];
  try{await preload.decode();}catch{return;}
  if(request!==lightboxRequest) return;
  img.src=media[next];img.alt=`${activeProduct.name} — ${photoLabel(next)}`;
  animatePhoto(img,direction);
  box.querySelector('.lightbox-count').textContent=`${next+1} / ${media.length} — ${photoLabel(next)}`;
  if(box.dataset.product!==activeProduct.id){
    box.dataset.product=activeProduct.id;
    box.querySelector('.lightbox-thumbs').innerHTML=media.map((src,i)=>`
      <button type="button" class="lightbox-thumb" data-index="${i}" aria-label="Open photo ${i+1}">
        <img src="${src}" alt="" loading="lazy" decoding="async">
      </button>`).join('');
    box.querySelectorAll('.lightbox-thumb').forEach(btn=>btn.addEventListener('click',()=>showLightboxPhoto(Number(btn.dataset.index))));
  }
  for(const btn of box.querySelectorAll('.lightbox-thumb')){
    const selected=Number(btn.dataset.index)===next;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));
  }
  selectDetailPhoto(next);
}

document.getElementById('openCheckout').addEventListener('click',()=>{
  checkoutSummary.innerHTML=`<div class="checkout-product-art">${artSvg(activeProduct,'checkout')}</div><div><strong>${activeProduct.name} — ${activePack.label}</strong><span>${money(activePack.price)} each${activePack.preview?' • preview price':''} • 100% advance</span></div>`;
  quantity.value=1;
  updateTotal();
  setLayer(checkoutLayer,true);
  checkoutLayer.querySelector('.checkout-sheet').scrollTop=0;
});

function closeCheckout(){
  if(!checkoutLayer.classList.contains('is-open')) return;
  closePayment();setLayer(checkoutLayer,false);
}
document.querySelectorAll('[data-close-checkout]').forEach(el=>el.addEventListener('click',closeCheckout));

function updateTotal(){
  const q=Math.max(1,Math.min(20,Math.trunc(Number(quantity.value)||1)));
  checkoutTotal.textContent=money(activePack.price*q);
}
quantity.addEventListener('input',updateTotal);
quantity.addEventListener('change',()=>{quantity.value=Math.max(1,Math.min(20,Math.trunc(Number(quantity.value)||1)));updateTotal();});
const date=new Date();date.setDate(date.getDate()+1);
document.getElementById('deliveryDate').min=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const paymentLayer=document.getElementById('paymentLayer');
function closePayment(){if(paymentLayer.classList.contains('is-open')) setLayer(paymentLayer,false);}
document.querySelectorAll('[data-close-payment]').forEach(el=>el.addEventListener('click',closePayment));

document.getElementById('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;
  document.getElementById('paymentSummary').innerHTML=`<strong>${activeProduct.name} — ${activePack.label}</strong><span>${quantity.value} box(es) • ${checkoutTotal.textContent}${activePack.preview?' • preview price':''}</span>`;
  setLayer(paymentLayer,true);
});

document.getElementById('whatsappFab').addEventListener('click',e=>{
  e.preventDefault();
  showToast('WhatsApp + AI assistant will be connected before launch.');
});

function showToast(message){
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);
}

window.addEventListener('keydown',e=>{
  const photo=document.getElementById('photoLightbox');
  const photoOpen=photo?.classList.contains('open');
  if(e.key==='Escape'){
    if(photoOpen) closePhotoLightbox();
    else if(paymentLayer.classList.contains('is-open')) closePayment();
    else if(checkoutLayer.classList.contains('is-open')) closeCheckout();
    else closeProduct();
  }
  if(photoOpen && ['ArrowRight','ArrowLeft'].includes(e.key)){
    e.preventDefault();showLightboxPhoto(activeMediaIndex+(e.key==='ArrowRight'?1:-1));
  }
  if(e.key==='Tab'){
    const layer=photoOpen?photo:paymentLayer.classList.contains('is-open')?paymentLayer:checkoutLayer.classList.contains('is-open')?checkoutLayer:productLayer.classList.contains('is-open')?productLayer:null;
    if(!layer) return;
    const items=[...layer.querySelectorAll('button,a[href],input,textarea')].filter(el=>!el.disabled && el.getClientRects().length);
    const first=items[0],last=items.at(-1);
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
  }
});

function syncRoute(){
  closePhotoLightbox();closeCheckout();
  const match=location.hash.match(/^#product\/(.+)$/);
  if(match && PRODUCTS.some(p=>p.id===match[1])) openProduct(match[1],null,false);
  else closeProduct(false);
}
window.addEventListener('popstate',syncRoute);
window.addEventListener('hashchange',syncRoute);
document.querySelector('.hero-order-link').addEventListener('click',e=>{
  e.preventDefault();openProduct(PRODUCTS[0].id,e.currentTarget);
});

renderCards();syncRoute();

// One observer drives entry reveals and pauses ambient motion outside the viewport.
const hero=document.querySelector('.hero');
const revealTargets=document.querySelectorAll('.section-head,.product-card,.future-note');
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.target===hero) hero.classList.toggle('motion-paused',!entry.isIntersecting || document.hidden);
    else if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
  }),{threshold:.12});
  observer.observe(hero);
  revealTargets.forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el);});
}
let scrollFrame=0;
function updateDepth(){
  scrollFrame=0;
  const rect=hero.getBoundingClientRect();
  if(reducedMotion.matches || rect.bottom<=0 || document.hidden) return;
  hero.style.setProperty('--scroll-depth',`${Math.min(45,Math.max(0,-rect.top)*.065)}px`);
}
window.addEventListener('scroll',()=>{if(!scrollFrame) scrollFrame=requestAnimationFrame(updateDepth);},{passive:true});
document.addEventListener('visibilitychange',()=>hero.classList.toggle('motion-paused',document.hidden || hero.getBoundingClientRect().bottom<=0));
reducedMotion.addEventListener('change',()=>{
  hero.style.setProperty('--scroll-depth','0px');
  if(reducedMotion.matches){pendingTransition?.skipTransition();document.getAnimations().forEach(a=>{if(a.effect?.getTiming().iterations!==Infinity) a.finish();else a.cancel();});}
});
