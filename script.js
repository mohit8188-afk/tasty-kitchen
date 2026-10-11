const PRODUCTS = [
  {
    id: 'makhana-mewa-bites',
    kicker: 'Signature festive sweet',
    name: 'Makhana Mewa Bites',
    tagline: 'Dates, makhana, dry fruits, coconut & ghee in a rich festive bite.',
    description: 'Our signature sweet: soft, nutty and gift-ready, prepared fresh in small batches.',
    basePack: '250g festive box',
    packs: [
      {label:'250g', price:385, preview:false},
      {label:'500g', price:770, preview:false}
    ],
    ingredients: ['Makhana','Dates','Cashew','Almond','Raisins','Desiccated coconut','Ghee','Limited added sugar'],
    delivery: 'Free delivery across India. Free sample requests are limited to the Ahmedabad + nearby sample route. Dispatch timing is confirmed with the order.',
    gifting: 'Available for festive and corporate gifting in 250g and 500g boxes. Bulk pricing will be finalized before marketing launch.',
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
    kicker: 'Coconut & mewa',
    name: 'Coconut Mewa Ladoo',
    tagline: 'Soft coconut-rich ladoos with mewa and ghee.',
    description: 'A coconut-forward festive ladoo made for gifting and sharing, presented with a premium homemade finish.',
    basePack: '250g festive box',
    packs: [
      {label:'250g', price:190, preview:false},
      {label:'500g', price:380, preview:false}
    ],
    ingredients: ['Coconut','Cashew','Almond','Raisins','Ghee','Final recipe to be confirmed'],
    delivery: 'Free delivery across India. Free sample requests are limited to the Ahmedabad + nearby sample route.',
    gifting: 'Planned in premium 250g and 500g festive boxes. Final gifting presentation and bulk pricing will be approved before marketing launch.',
    colors: ['#5b241d','#b86e4a','#f1d8a9'],
    media: [
      'assets/coconut-1.webp',
      'assets/coconut-2.webp',
      'assets/coconut-3.webp'
    ],
    photoLabels: ['Festive platter','Close product view','Premium gift presentation'],
    art: 'ladoo'
  },
  {
    id: 'jalebi-with-rabdi',
    kicker: 'Fresh festive indulgence',
    name: 'Desi Ghee Jalebi with Rabdi',
    tagline: 'Crisp desi ghee jalebi paired with rich, creamy rabdi.',
    description: 'Our third festive sweet brings a classic pairing of crisp desi ghee jalebi with rich, creamy rabdi to the collection.',
    basePack: '250g pack',
    packs: [
      {label:'250g', price:470, preview:false},
      {label:'500g', price:940, preview:false}
    ],
    ingredients: ['Desi ghee jalebi','Rabdi','Final ingredient and allergen declaration to be confirmed'],
    delivery: 'Free delivery for Desi Ghee Jalebi with Rabdi within Ahmedabad and nearby serviceable areas. Free sample requests use the same Ahmedabad + nearby sample route.',
    gifting: '250g and 500g packaging is planned. Final presentation and delivery method are still under testing.',
    colors: ['#5a210d','#c76a13','#f4c56a'],
    media: [
      'assets/jalebi-1.webp',
      'assets/jalebi-2.webp',
      'assets/jalebi-3.webp'
    ],
    photoLabels: ['Desi Ghee Jalebi with Rabdi platter','Festive close-up','Premium festive thali'],
    art: 'jalebi'
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
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutDelivery = document.getElementById('checkoutDelivery');
const checkoutGrandTotal = document.getElementById('checkoutGrandTotal');
const checkoutEstimate = document.getElementById('checkoutEstimate');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const toast = document.getElementById('toast');

let cart = [];
try{
  const saved=JSON.parse(localStorage.getItem('tkCart') || '[]');
  if(Array.isArray(saved)) cart=saved.filter(x=>x && x.productId && x.pack && Number(x.quantity)>0);
}catch{}
function saveCart(){
  localStorage.setItem('tkCart',JSON.stringify(cart));
  cartCount.textContent=String(cart.reduce((n,x)=>n+x.quantity,0));
}
saveCart();

function money(n){ return n==null ? '' : '₹' + Number(n).toLocaleString('en-IN'); }

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

function jalebiSvg(id=''){
  return `<svg viewBox="0 0 760 860" aria-hidden="true" data-art="${id}">
    <defs>
      <linearGradient id="jbg-${id}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#6b2310"/><stop offset=".55" stop-color="#42100b"/><stop offset="1" stop-color="#23090a"/></linearGradient>
      <linearGradient id="jal-${id}" x1="0" x2="1"><stop stop-color="#ffb52e"/><stop offset=".55" stop-color="#ef7d12"/><stop offset="1" stop-color="#c24f0a"/></linearGradient>
      <filter id="js-${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dy="20" stdDeviation="18" flood-opacity=".35"/></filter>
    </defs>
    <rect width="760" height="860" fill="url(#jbg-${id})"/>
    <circle cx="600" cy="150" r="220" fill="#ffc65e" opacity=".12"/>
    <g filter="url(#js-${id})">
      <ellipse cx="380" cy="530" rx="285" ry="170" fill="#ead5b1"/>
      <ellipse cx="380" cy="510" rx="250" ry="140" fill="#fff4dd"/>
      <ellipse cx="385" cy="500" rx="130" ry="78" fill="#f6dfaa"/>
      <g fill="none" stroke="url(#jal-${id})" stroke-width="32" stroke-linecap="round">
        <path d="M210 410c65-70 150 8 83 65s-130-12-69-67 143-8 102 64"/>
        <path d="M380 390c72-72 158 13 88 69s-140-16-70-72 149-4 96 72"/>
        <path d="M280 520c65-62 145 4 84 57s-129-5-74-58 142-9 101 58"/>
      </g>
      <ellipse cx="520" cy="565" rx="85" ry="48" fill="#f4e2b7"/>
      <g fill="#7b9b52"><circle cx="500" cy="552" r="6"/><circle cx="540" cy="575" r="5"/></g>
    </g>
  </svg>`;
}

function artSvg(product, suffix='card'){
  if(product.media?.length){
    const src = suffix === 'detail' ? product.media[0] : product.media[0];
    return `<img src="${src}" alt="${product.name}" loading="lazy" decoding="async">`;
  }
  return product.art === 'ladoo' ? ladooSvg(product.id+'-'+suffix) : product.art === 'jalebi' ? jalebiSvg(product.id+'-'+suffix) : bitesSvg(product.id+'-'+suffix);
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
          <div><strong>${p.packs[0].price==null?'':'From '+money(p.packs[0].price)}</strong><span>250g & 500g${p.packs[0].preview?' • preview':''}</span></div>
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
  const sample=document.getElementById('sampleLayer');
  const sampleOpen=sample?.classList.contains('is-open');
  const paymentOpen = payment.classList.contains('is-open');
  const productOpen = productLayer.classList.contains('is-open');
  productLayer.inert = !productOpen || checkoutOpen || photoOpen || sampleOpen;
  checkoutLayer.inert = !checkoutOpen || paymentOpen;
  for(const el of document.querySelectorAll('body > header, body > main, body > footer, #whatsappFab')) el.inert=productOpen;
  document.body.classList.toggle('modal-open',productOpen || sampleOpen);
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
  packOptions.innerHTML = activeProduct.packs.map((p,i)=>`<button type="button" class="pack-chip ${p.label===activePack.label?'active':''}" data-pack="${i}" aria-pressed="${p.label===activePack.label}">${p.label}${p.price==null?' • price soon':' • '+money(p.price)}${p.preview?'*':''}</button>`).join('');
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
  closePhotoLightbox(); closePayment(); closeCheckout(); const sample=document.getElementById('sampleLayer'); if(sample?.classList.contains('is-open')) setLayer(sample,false,false);
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
        html='<p><strong>Photos</strong><br>Product photography will be added after this sweet is finalized.</p>';
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

function openSampleRequest(productId=activeProduct?.id){
  const layer=document.getElementById('sampleLayer');
  const product=PRODUCTS.find(p=>p.id===productId) || PRODUCTS[0];
  document.getElementById('sampleProduct').textContent=product.name;
  document.getElementById('sampleSweet').value=product.id;

  const sampleDate=document.getElementById('sampleDate');
  const today=new Date();
  const minDate=new Date(today);
  minDate.setDate(minDate.getDate()+1);
  const maxDate=new Date(today);
  maxDate.setDate(maxDate.getDate()+14);
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  sampleDate.min=fmt(minDate);
  sampleDate.max=fmt(maxDate);
  if(!sampleDate.value || sampleDate.value<sampleDate.min || sampleDate.value>sampleDate.max){
    sampleDate.value=sampleDate.min;
  }

  setLayer(layer,true);
  layer.querySelector('.sample-sheet').scrollTop=0;
}
document.getElementById('openSample').addEventListener('click',()=>openSampleRequest(activeProduct.id));
document.getElementById('heroSampleBtn')?.addEventListener('click',()=>openSampleRequest(PRODUCTS[0].id));
document.getElementById('sampleSweet')?.addEventListener('change',e=>{
  const product=PRODUCTS.find(p=>p.id===e.target.value);
  if(product) document.getElementById('sampleProduct').textContent=product.name;
});
document.querySelectorAll('[data-close-sample]').forEach(el=>el.addEventListener('click',()=>{
  const layer=document.getElementById('sampleLayer');
  if(layer.classList.contains('is-open')) setLayer(layer,false);
}));
document.getElementById('sampleForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;

  const form=e.currentTarget;
  const submit=form.querySelector('button[type="submit"]');
  const phone=document.getElementById('samplePhone').value.trim();
  const address=document.getElementById('sampleAddress').value.trim().replace(/\s+/g,' ');
  const area=document.getElementById('sampleArea').value.trim().replace(/\s+/g,' ');
  const pin=document.getElementById('samplePin').value.trim();
  const date=document.getElementById('sampleDate').value;

  if(area.length<3){
    document.getElementById('sampleArea').setCustomValidity('Please enter your Ahmedabad locality.');
    document.getElementById('sampleArea').reportValidity();
    document.getElementById('sampleArea').setCustomValidity('');
    return;
  }
  if(address.length<8){
    document.getElementById('sampleAddress').setCustomValidity('Please enter enough address detail for sample confirmation.');
    document.getElementById('sampleAddress').reportValidity();
    document.getElementById('sampleAddress').setCustomValidity('');
    return;
  }

  const qs=new URLSearchParams(location.search);
  const payload={
    name:document.getElementById('sampleName').value.trim(),
    mobile:phone,
    address,
    locality:area,
    pincode:pin,
    preferred_date:date,
    product_id:document.getElementById('sampleSweet').value,
    source:'website',
    utm_source:qs.get('utm_source'),
    utm_medium:qs.get('utm_medium'),
    utm_campaign:qs.get('utm_campaign'),
    utm_content:qs.get('utm_content')
  };

  submit.disabled=true;
  const original=submit.textContent;
  submit.textContent='Checking availability…';

  try{
    const res=await fetch('https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-sample-request',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const messages={
        active_sample_exists:'A sample request is already active for this mobile number.',
        address_sample_exists:'A sample request is already active for this address/locality.',
        outside_service_area:'This PIN code is not currently in our Ahmedabad sample route.',
        date_closed:'Sample requests are closed for this date.',
        date_full:'Sample slots are full for this date. Please choose another date.'
      };
      showToast(messages[data.error] || data.message || 'We could not submit the sample request. Please try again.');
      return;
    }

    sessionStorage.removeItem('tkSampleDraft');
    form.reset();
    showToast('Sample request received. We will confirm the route and delivery slot before delivery.');
    setLayer(document.getElementById('sampleLayer'),false);
  }catch{
    sessionStorage.setItem('tkSampleDraft',JSON.stringify({...payload,createdAt:Date.now()}));
    showToast('Network issue. Your details are kept on this device; please try again.');
  }finally{
    submit.disabled=false;
    submit.textContent=original;
  }
});

function cartKey(productId,pack){ return productId+'|'+pack; }
function addActiveToCart(){
  const key=cartKey(activeProduct.id,activePack.label);
  const existing=cart.find(x=>cartKey(x.productId,x.pack)===key);
  if(existing) existing.quantity=Math.min(20,existing.quantity+1);
  else cart.push({productId:activeProduct.id,pack:activePack.label,unitPrice:activePack.price,quantity:1});
  saveCart();
}
function cartSubtotal(){
  return cart.reduce((sum,item)=>sum+(Number(item.unitPrice)||0)*item.quantity,0);
}
function cartHasJalebi(){
  return cart.some(item=>item.productId==='jalebi-with-rabdi');
}
function renderCart(){
  if(!cart.length){
    cartItemsEl.innerHTML='<div class="cart-empty">Your cart is empty. Add a sweet to continue.</div>';
    checkoutSummary.innerHTML='<div><strong>Your festive cart</strong><span>Add one or more products before checkout.</span></div>';
    checkoutSubtotal.textContent=money(0);
    checkoutDelivery.textContent='FREE';
    checkoutGrandTotal.textContent=money(0);
    checkoutTotal.textContent=money(0);
    return;
  }
  checkoutSummary.innerHTML=`<div><strong>Your festive cart</strong><span>${cart.length} item type${cart.length===1?'':'s'} • Free delivery • 100% advance</span></div>`;
  cartItemsEl.innerHTML=cart.map((item,index)=>{
    const product=PRODUCTS.find(p=>p.id===item.productId);
    return `<div class="cart-line" data-cart-index="${index}">
      <div class="cart-line-main"><strong>${product?.name || item.productId}</strong><span>${item.pack} • ${money(item.unitPrice)} each</span></div>
      <div class="cart-qty" aria-label="Quantity controls">
        <button type="button" data-cart-action="minus" aria-label="Decrease quantity">−</button>
        <b>${item.quantity}</b>
        <button type="button" data-cart-action="plus" aria-label="Increase quantity">+</button>
        <button class="cart-remove" type="button" data-cart-action="remove">Remove</button>
      </div>
      <strong class="cart-line-total">${money(item.unitPrice*item.quantity)}</strong>
    </div>`;
  }).join('');
  cartItemsEl.querySelectorAll('[data-cart-action]').forEach(btn=>btn.addEventListener('click',()=>{
    const line=btn.closest('[data-cart-index]');
    const idx=Number(line.dataset.cartIndex);
    const action=btn.dataset.cartAction;
    if(action==='plus') cart[idx].quantity=Math.min(20,cart[idx].quantity+1);
    if(action==='minus') cart[idx].quantity=Math.max(1,cart[idx].quantity-1);
    if(action==='remove') cart.splice(idx,1);
    saveCart();renderCart();
  }));
  const subtotal=cartSubtotal();
  checkoutSubtotal.textContent=money(subtotal);
  checkoutDelivery.textContent='FREE';
  checkoutGrandTotal.textContent=money(subtotal);
  checkoutTotal.textContent=money(subtotal);
  checkoutEstimate.textContent=cartHasJalebi()
    ? 'Free delivery. Because your cart includes Desi Ghee Jalebi with Rabdi, the full order must be deliverable within Ahmedabad + nearby serviceable area.'
    : 'Free delivery. Makhana Mewa Bites and Coconut Mewa Ladoo are available for India-wide delivery.';
}
function openCart(){
  renderCart();
  setLayer(checkoutLayer,true);
  checkoutLayer.querySelector('.checkout-sheet').scrollTop=0;
}
document.getElementById('openCheckout').addEventListener('click',()=>{
  addActiveToCart();
  showToast(activeProduct.name+' added to cart.');
  openCart();
});
document.getElementById('cartBtn')?.addEventListener('click',openCart);

function closeCheckout(){
  if(!checkoutLayer.classList.contains('is-open')) return;
  closePayment();setLayer(checkoutLayer,false);
}
document.querySelectorAll('[data-close-checkout]').forEach(el=>el.addEventListener('click',closeCheckout));

const date=new Date();date.setDate(date.getDate()+1);
document.getElementById('deliveryDate').min=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const paymentLayer=document.getElementById('paymentLayer');
function closePayment(){if(paymentLayer.classList.contains('is-open')) setLayer(paymentLayer,false);}
document.querySelectorAll('[data-close-payment]').forEach(el=>el.addEventListener('click',closePayment));

document.getElementById('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;
  if(!cart.length){ showToast('Your cart is empty. Please add a sweet first.'); return; }
  const subtotal=cartSubtotal();
  const pin=document.getElementById('customerPin').value.trim();
  const lines=cart.map(item=>{
    const product=PRODUCTS.find(p=>p.id===item.productId);
    return `<span>${product?.name || item.productId} • ${item.pack} × ${item.quantity} = ${money(item.unitPrice*item.quantity)}</span>`;
  }).join('');
  document.getElementById('paymentSummary').innerHTML=`
    <strong>${cart.length} product type${cart.length===1?'':'s'} in your order</strong>
    ${lines}
    <span>Delivery: FREE</span>
    <span><b>Total payable: ${money(subtotal)}</b></span>
    <span>Delivery PIN: ${pin}</span>`;
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
    else if(document.getElementById('sampleLayer')?.classList.contains('is-open')) setLayer(document.getElementById('sampleLayer'),false);
    else if(paymentLayer.classList.contains('is-open')) closePayment();
    else if(checkoutLayer.classList.contains('is-open')) closeCheckout();
    else closeProduct();
  }
  if(photoOpen && ['ArrowRight','ArrowLeft'].includes(e.key)){
    e.preventDefault();showLightboxPhoto(activeMediaIndex+(e.key==='ArrowRight'?1:-1));
  }
  if(e.key==='Tab'){
    const sample=document.getElementById('sampleLayer');
    const layer=photoOpen?photo:paymentLayer.classList.contains('is-open')?paymentLayer:sample?.classList.contains('is-open')?sample:checkoutLayer.classList.contains('is-open')?checkoutLayer:productLayer.classList.contains('is-open')?productLayer:null;
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

renderCards();

document.querySelectorAll('[data-hero-product]').forEach(card=>{
  card.addEventListener('click',()=>{
    const id=card.dataset.heroProduct;
    const productCard=document.querySelector('[data-product="'+id+'"]');
    openProduct(id,productCard || null);
  });
});syncRoute();

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
