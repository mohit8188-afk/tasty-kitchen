const PRODUCTS = [
  {
    id: 'makhana-mewa-bites',
    kicker: 'Signature festive sweet',
    name: 'Makhana Mewa Bites',
    tagline: 'Dates, makhana, dry fruits, coconut & ghee in a rich festive bite.',
    description: 'Our signature sweet: soft, nutty and gift-ready, prepared fresh in small batches.',
    basePack: '250g festive box',
    packs: [
      {label:'250g', price:400, preview:false},
      {label:'500g', price:800, preview:false}
    ],
    ingredients: ['Makhana','Dates','Cashew','Almond','Raisins','Desiccated coconut','Ghee','Limited added sugar'],
    delivery: 'Free delivery across India. Prepared fresh after order confirmation; dispatch timing is shared with the confirmed order. ₹50 tasting trial requests are limited to the Ahmedabad + nearby sample route.',
    care: 'Keep the box sealed in a cool, dry place away from direct heat and moisture. For best texture and flavour, enjoy fresh and follow the best-before / use-by guidance printed on the pack.',
    allergens: 'Contains tree nuts (cashew and almond) and milk-derived ghee. Contains coconut. Prepared in a home kitchen where other food allergens may also be handled.',
    gifting: 'Available in 250g and 500g festive boxes. For larger gifting quantities, contact Tasty Kitchen for availability.',
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
      {label:'250g', price:175, preview:false},
      {label:'500g', price:350, preview:false}
    ],
    ingredients: ['Coconut','Cashew','Almond','Raisins','Ghee','Final recipe to be confirmed'],
    delivery: 'Free delivery across India. Prepared fresh after order confirmation; dispatch timing is shared with the confirmed order. ₹50 tasting trial requests are limited to the Ahmedabad + nearby sample route.',
    care: 'Keep sealed in a cool, dry place away from direct heat and moisture. For best taste and texture, enjoy fresh and follow the best-before / use-by guidance printed on the pack.',
    allergens: 'Contains tree nuts (cashew and almond) and milk-derived ghee. Contains coconut. Prepared in a home kitchen where other food allergens may also be handled.',
    gifting: 'Available in 250g and 500g festive boxes. Larger gifting quantities are subject to availability.',
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
    name: 'Jalebi with Rabdi',
    tagline: 'Crisp jalebi paired with rich, creamy rabdi.',
    description: 'Our third festive sweet brings a classic pairing of crisp jalebi with rich, creamy rabdi to the collection.',
    basePack: '250g pack',
    packs: [
      {label:'250g', price:200, preview:false},
      {label:'500g', price:400, preview:false}
    ],
    ingredients: ['Jalebi','Rabdi','Final ingredient and allergen declaration to be confirmed'],
    delivery: 'Free delivery for Jalebi with Rabdi within Ahmedabad and nearby serviceable areas. Prepared fresh for a confirmed local delivery slot; route timing is shared with the order. ₹50 tasting trial requests use the same Ahmedabad + nearby sample route.',
    care: 'Keep the rabdi refrigerated on receipt. For the best experience, enjoy the jalebi and rabdi as fresh as possible and follow the use-by guidance supplied with the pack. Do not leave the rabdi unrefrigerated for extended periods.',
    allergens: 'Contains milk/dairy (rabdi). The final jalebi ingredient declaration will be printed on the pack; if you have a cereal/gluten allergy or another severe food allergy, please confirm with Tasty Kitchen before ordering.',
    gifting: 'Available in 250g and 500g packs for Ahmedabad + nearby serviceable areas.',
    colors: ['#5a210d','#c76a13','#f4c56a'],
    media: [
      'assets/jalebi-1.webp',
      'assets/jalebi-2.webp',
      'assets/jalebi-3.webp'
    ],
    photoLabels: ['Jalebi with Rabdi platter','Festive close-up','Premium festive thali'],
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

const TK_ANALYTICS_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-analytics';
let analyticsSession=sessionStorage.getItem('tkAnalyticsSession');
if(!analyticsSession){
  analyticsSession=(crypto?.randomUUID?.() || ('tk-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
  sessionStorage.setItem('tkAnalyticsSession',analyticsSession);
}
function trackEvent(eventName, extra={}){
  const qs=new URLSearchParams(location.search);
  const payload={
    event_name:eventName,
    session_id:analyticsSession,
    page_path:location.pathname+location.hash,
    product_id:extra.product_id || activeProduct?.id || null,
    metadata:extra.metadata || {},
    utm_source:qs.get('utm_source'),
    utm_medium:qs.get('utm_medium'),
    utm_campaign:qs.get('utm_campaign'),
    utm_content:qs.get('utm_content'),
    referrer:document.referrer || null
  };
  fetch(TK_ANALYTICS_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload),
    keepalive:true
  }).catch(()=>{});
}
window.tkTrackPaymentComplete=(orderRef,total)=>trackEvent('payment_complete',{metadata:{order_ref:orderRef || null,total:Number(total)||0}});
trackEvent('page_view');

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
    return `<img src="${src}" alt="${product.name}" loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 640px) 100vw, (max-width: 979px) 92vw, 33vw">`;
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
  trackEvent('product_open',{product_id:product.id});
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
  requestAnimationFrame(()=>watchPrimaryProductActions());
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
        <img src="${src}" alt="${activeProduct.name} photo ${activeMediaIndex+1}" loading="eager" decoding="async" fetchpriority="high" sizes="(max-width: 900px) 100vw, 52vw">
        <span class="zoom-hint">Tap to enlarge</span>
      </button>
      <p class="gallery-caption" aria-live="polite">${activeMediaIndex+1} / ${activeProduct.media.length} — ${photoLabel(activeMediaIndex)}</p>
      <div class="detail-thumb-strip" aria-label="${activeProduct.name} photo gallery">
        ${activeProduct.media.map((photo,i)=>`
          <button type="button" class="detail-thumb ${i===activeMediaIndex?'active':''}" data-index="${i}" aria-pressed="${i===activeMediaIndex}" aria-label="View photo ${i+1} of ${activeProduct.media.length}">
            <img src="${photo}" alt="${activeProduct.name} thumbnail ${i+1}" loading="lazy" decoding="async" fetchpriority="low" sizes="82px">
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

const mobileActionBar=document.getElementById('mobileActionBar');
const mobileOrderBtn=document.getElementById('mobileOrderBtn');
const mobileSampleBtn=document.getElementById('mobileSampleBtn');
const mobileMedia=window.matchMedia('(max-width:640px)');
let mobileActionObserver=null;

function setMobileActionBar(visible){
  if(!mobileActionBar) return;
  const shouldShow=Boolean(visible && mobileMedia.matches && productLayer.classList.contains('is-open'));
  mobileActionBar.classList.toggle('show',shouldShow);
  mobileActionBar.setAttribute('aria-hidden',String(!shouldShow));
}

function watchPrimaryProductActions(){
  mobileActionObserver?.disconnect();
  setMobileActionBar(false);
  if(!mobileMedia.matches) return;
  const mainActions=productLayer.querySelector('.detail-actions');
  const scroller=productLayer.querySelector('.product-sheet');
  if(!mainActions || !scroller) return;

  mobileActionObserver=new IntersectionObserver(entries=>{
    const entry=entries[0];
    // Show only after the original CTA block has scrolled above the visible product sheet.
    const scrollerTop=scroller.getBoundingClientRect().top;
    const scrolledPast=!entry.isIntersecting && entry.boundingClientRect.bottom <= scrollerTop + 8;
    setMobileActionBar(scrolledPast);
  },{
    root:scroller,
    threshold:[0,0.01,0.5,1]
  });
  mobileActionObserver.observe(mainActions);
}

mobileOrderBtn?.addEventListener('click',()=>document.getElementById('openCheckout')?.click());
mobileSampleBtn?.addEventListener('click',()=>document.getElementById('openSample')?.click());
mobileMedia.addEventListener?.('change',()=>watchPrimaryProductActions());

function closeProduct(push=true){
  if(!productLayer.classList.contains('is-open')) return;
  mobileActionObserver?.disconnect();
  setMobileActionBar(false);
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
    if(key==='delivery') html='<p><strong>Dispatch & delivery</strong><br>'+activeProduct.delivery+'</p>';
    if(key==='care') html='<p><strong>Storage & best use</strong><br>'+activeProduct.care+'</p>';
    if(key==='allergens') html='<p><strong>Allergen information</strong><br>'+activeProduct.allergens+'</p>';
    if(key==='gifting') html='<p><strong>Gifting</strong><br>'+activeProduct.gifting+'</p>';
    if(key==='photos'){
      if(activeProduct.media?.length){
        html='<div class="photo-gallery-head"><strong>Product photos</strong><span>Tap any photo to view it above. Tap the large photo to open full-screen.</span></div><div class="photo-grid">'+activeProduct.media.map((src,i)=>'<button type="button" class="photo-thumb '+(i===0?'active':'')+'" data-photo="'+src+'" aria-label="View '+activeProduct.name+' photo '+(i+1)+'"><img src="'+src+'" alt="'+activeProduct.name+' photo '+(i+1)+'" loading="lazy" decoding="async"></button>').join('')+'</div>';
      }else{
        html='<p><strong>Photos</strong><br>Additional product photos are not available yet.</p>';
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
        <img src="${src}" alt="" loading="lazy" decoding="async" fetchpriority="low" sizes="100vw">
      </button>`).join('');
    box.querySelectorAll('.lightbox-thumb').forEach(btn=>btn.addEventListener('click',()=>showLightboxPhoto(Number(btn.dataset.index))));
  }
  for(const btn of box.querySelectorAll('.lightbox-thumb')){
    const selected=Number(btn.dataset.index)===next;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));
  }
  selectDetailPhoto(next);
}

const TK_SAMPLE_PAYMENT_VERIFY_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-sample-payment-verify';

function openSampleRequest(productId=activeProduct?.id){
  const layer=document.getElementById('sampleLayer');
  const product=PRODUCTS.find(p=>p.id===productId) || PRODUCTS[0];
  const sampleForm=document.getElementById('sampleForm');
  const success=document.getElementById('sampleSuccess');
  sampleForm.hidden=false;
  success.hidden=true;
  document.getElementById('sampleManualPayment').hidden=true;
  success.dataset.sampleRef='';
  success.dataset.mobile='';
  document.getElementById('sampleAddressForm').hidden=true;
  document.getElementById('sampleAddressStatus').textContent='You can close this screen after noting your Sample ID.';
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
document.getElementById('openSample').addEventListener('click',()=>{trackEvent('sample_form_start',{product_id:activeProduct.id});openSampleRequest(activeProduct.id);});
document.getElementById('heroSampleBtn')?.addEventListener('click',()=>{trackEvent('hero_sample_click',{product_id:PRODUCTS[0].id});trackEvent('sample_form_start',{product_id:PRODUCTS[0].id});openSampleRequest(PRODUCTS[0].id);});
document.getElementById('sampleSweet')?.addEventListener('change',e=>{
  const product=PRODUCTS.find(p=>p.id===e.target.value);
  if(product) document.getElementById('sampleProduct').textContent=product.name;
});
document.querySelectorAll('[data-close-sample]').forEach(el=>el.addEventListener('click',()=>{
  const layer=document.getElementById('sampleLayer');
  if(layer.classList.contains('is-open')) setLayer(layer,false);
}));

// Public receiving UPI address confirmed by the founder. UPI URI opening works only on
// browsers / phones with compatible installed UPI apps; never infer payment success from launch.
const TK_RECEIVING_UPI_VPA='mohit8188-1@okicici';
function tkUpiPaymentIntent(data,kind){
  if(data?.upi_uri?.startsWith('upi://pay?'))return data.upi_uri;
  // Restore old pending checkout drafts created before the payee UPI ID was provided.
  if(data?.payee_phone!=='9834621628'||!Number.isFinite(Number(data?.upi_amount))||Number(data.upi_amount)<=0)return null;
  const ref=kind==='sample'?data.sample_ref:data.order_ref;
  if(!/^TK[SO]-[A-Z0-9-]+$/i.test(String(ref||'')))return null;
  return 'upi://pay?'+new URLSearchParams({pa:TK_RECEIVING_UPI_VPA,pn:'Tasty Kitchen',am:Number(data.upi_amount).toFixed(2),cu:'INR',tn:'Tasty Kitchen '+ref});
}
function tkLaunchUpi(data,kind){
  const uri=tkUpiPaymentIntent(data,kind);
  if(!uri){showToast('UPI link is unavailable. Please try payment again.');return false;}
  window.location.href=uri; // Direct user click, so Android can offer compatible UPI apps.
  return true;
}
const TK_MANUAL_SAMPLE_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-manual-sample';
let activeSampleUpi=null;
document.getElementById('sampleForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity())return;
  const form=e.currentTarget,submit=form.querySelector('button[type="submit"]');
  const qs=new URLSearchParams(location.search);
  const payload={
    action:'create',
    name:document.getElementById('sampleName').value.trim(),
    mobile:document.getElementById('samplePhone').value.trim(),
    locality:document.getElementById('sampleArea').value.trim().replace(/\\s+/g,' '),
    preferred_date:document.getElementById('sampleDate').value,
    product_id:document.getElementById('sampleSweet').value,
    client_checkout_id:sessionStorage.getItem('tkManualSampleCheckoutId')||(crypto?.randomUUID?.()||('tks-'+Date.now()+'-'+Math.random().toString(36).slice(2))),
    source:'website',utm_source:qs.get('utm_source'),utm_medium:qs.get('utm_medium'),
    utm_campaign:qs.get('utm_campaign'),utm_content:qs.get('utm_content')
  };
  sessionStorage.setItem('tkManualSampleCheckoutId',payload.client_checkout_id);
  submit.disabled=true;submit.textContent='Reserving unique payment amount…';
  try{
    const res=await fetch(TK_MANUAL_SAMPLE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok)throw Error(data.message||'Could not prepare the sample. Please try again.');
    if(!tkUpiPaymentIntent(data,'sample'))throw Error('UPI payment details could not be prepared.');
    activeSampleUpi={...data,client_checkout_id:payload.client_checkout_id};
    sessionStorage.setItem('tkManualSampleCheckout',JSON.stringify(activeSampleUpi));
    document.getElementById('samplePayAmount').textContent='₹'+Number(data.upi_amount).toFixed(2);
    document.getElementById('samplePayRef').textContent=data.sample_ref;
    document.getElementById('samplePayVpa').textContent=TK_RECEIVING_UPI_VPA;
    document.getElementById('sampleOpenUpi').textContent='Pay ₹'+Number(data.upi_amount).toFixed(2)+' with UPI ↗';
    document.getElementById('sampleCopyUpi').textContent='Copy UPI ID';
    document.getElementById('sampleClaimPaid').hidden=true;
    document.getElementById('sampleManualPayment').hidden=false;
    form.hidden=true;
    document.getElementById('sampleManualPayment').scrollIntoView({block:'start',behavior:reducedMotion.matches?'auto':'smooth'});
  }catch(err){showToast(err.message||'Could not prepare the payment.');}
  finally{submit.disabled=false;submit.textContent='Continue to ₹50 sample payment';}
});
document.getElementById('sampleOpenUpi')?.addEventListener('click',()=>{
  if(!activeSampleUpi)return;
  activeSampleUpi.payment_attempted=true;
  sessionStorage.setItem('tkManualSampleCheckout',JSON.stringify(activeSampleUpi));
  document.getElementById('sampleClaimPaid').hidden=false;
  document.getElementById('sampleClaimStatus').textContent='After approving the payment in your UPI app, return here and tap “I\'ve completed the payment.” We will check the bank credit.';
  tkLaunchUpi(activeSampleUpi,'sample');
});
document.getElementById('sampleCopyUpi')?.addEventListener('click',async()=>{
  if(!activeSampleUpi)return;
  try{await navigator.clipboard.writeText(TK_RECEIVING_UPI_VPA);showToast('UPI ID copied. Confirm the payee and enter the exact amount.');}
  catch{showToast('UPI ID: '+TK_RECEIVING_UPI_VPA);}
});
document.getElementById('sampleClaimPaid')?.addEventListener('click',async()=>{
  if(!activeSampleUpi)return;
  const btn=document.getElementById('sampleClaimPaid'),status=document.getElementById('sampleClaimStatus');
  btn.disabled=true;status.textContent='Saving payment report…';
  try{
    const res=await fetch(TK_MANUAL_SAMPLE_URL,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'claim',sample_ref:activeSampleUpi.sample_ref,client_checkout_id:activeSampleUpi.client_checkout_id})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok)throw Error(data.message||'Please retry or contact us.');
    const success=document.getElementById('sampleSuccess');
    success.dataset.sampleRef=activeSampleUpi.sample_ref;
    success.dataset.clientCheckoutId=activeSampleUpi.client_checkout_id;
    success.dataset.mobile=document.getElementById('samplePhone').value.trim();
    document.getElementById('sampleSuccessRef').textContent=activeSampleUpi.sample_ref;
    document.getElementById('sampleSuccessMessage').textContent='We received your payment report, not proof of bank credit. We will verify the exact ₹'+Number(activeSampleUpi.upi_amount).toFixed(2)+' transfer and then confirm your tasting slot. You can add the delivery address now.';
    success.hidden=false;document.getElementById('sampleManualPayment').hidden=true;
    sessionStorage.removeItem('tkManualSampleCheckoutId');
    sessionStorage.removeItem('tkManualSampleCheckout');
    trackEvent('sample_payment_reported',{metadata:{sample_ref:activeSampleUpi.sample_ref,upi_amount:activeSampleUpi.upi_amount}});
    success.scrollIntoView({block:'start',behavior:reducedMotion.matches?'auto':'smooth'});
  }catch(err){status.textContent=err.message||'Payment report failed';btn.disabled=false;}
});
document.getElementById('sampleAddressToggle').addEventListener('click',()=>{
  const form=document.getElementById('sampleAddressForm');
  form.hidden=!form.hidden;
  if(!form.hidden) document.getElementById('sampleAddress').focus();
});

document.getElementById('sampleAddressForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;
  const form=e.currentTarget;
  const success=document.getElementById('sampleSuccess');
  const submit=form.querySelector('button[type="submit"]');
  const address=document.getElementById('sampleAddress').value.trim().replace(/\s+/g,' ');
  const city=document.getElementById('sampleCity').value.trim().replace(/\s+/g,' ');

  if(address.length<8){
    document.getElementById('sampleAddress').setCustomValidity('Please enter enough address detail for delivery confirmation.');
    document.getElementById('sampleAddress').reportValidity();
    document.getElementById('sampleAddress').setCustomValidity('');
    return;
  }

  submit.disabled=true;
  const original=submit.textContent;
  submit.textContent='Saving address…';
  try{
    const res=await fetch(TK_MANUAL_SAMPLE_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        action:'complete_address',
        sample_ref:success.dataset.sampleRef,
        client_checkout_id:success.dataset.clientCheckoutId,
        address,
        city
      })
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const messages={
        address_sample_exists:'A ₹50 tasting trial was already requested recently for this address/locality. Please use the existing request or wait for the tasting window to reopen.',
        invalid_city:'Please enter the delivery city.',
        sample_verification_failed:'We could not verify this Sample ID with the mobile number.'
      };
      showToast(messages[data.error] || data.message || 'We could not save the delivery address. Please try again.');
      return;
    }
    form.hidden=true;
    document.getElementById('sampleAddressToggle').hidden=true;
    document.getElementById('sampleAddressStatus').textContent='Delivery address saved. We’ll use it when confirming your route and sample slot.';
    showToast('Delivery address saved for '+success.dataset.sampleRef+'.');
  }catch{
    showToast('Network issue. Please try saving the delivery address again.');
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
    ? 'Free delivery. Because your cart includes Jalebi with Rabdi, the full order must be deliverable within Ahmedabad + nearby serviceable area.'
    : 'Free delivery. Makhana Mewa Bites and Coconut Mewa Ladoo are available for India-wide delivery.';
}
function openCart(){
  renderCart();
  setLayer(checkoutLayer,true);
  checkoutLayer.querySelector('.checkout-sheet').scrollTop=0;
}
document.getElementById('openCheckout').addEventListener('click',()=>{
  trackEvent('order_click',{product_id:activeProduct.id,metadata:{pack:activePack.label,unit_price:activePack.price}});
  addActiveToCart();
  showToast(activeProduct.name+' added to cart.');
  trackEvent('checkout_start',{metadata:{cart_items:cart.length,subtotal:cartSubtotal()}});
  openCart();
});
document.getElementById('cartBtn')?.addEventListener('click',()=>{trackEvent('checkout_start',{metadata:{cart_items:cart.length,subtotal:cartSubtotal(),source:'cart_button'}});openCart();});

function closeCheckout(){
  if(!checkoutLayer.classList.contains('is-open')) return;
  closePayment();setLayer(checkoutLayer,false);
}
document.querySelectorAll('[data-close-checkout]').forEach(el=>el.addEventListener('click',closeCheckout));

const date=new Date();date.setDate(date.getDate()+1);
document.getElementById('deliveryDate').min=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const TK_PAYMENT_CREATE_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-manual-upi';
const TK_PAYMENT_VERIFY_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-payment-verify';
let pendingCheckoutPayload=null;
let preparedPayment=null;
let preparePaymentPromise=null;
let razorpayScriptPromise=null;

function loadRazorpayCheckout(){
  if(window.Razorpay) return Promise.resolve();
  if(razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://checkout.razorpay.com/v1/checkout.js';
    script.async=true;
    script.onload=()=>window.Razorpay?resolve():reject(new Error('razorpay_unavailable'));
    script.onerror=()=>reject(new Error('razorpay_load_failed'));
    document.head.appendChild(script);
  });
  return razorpayScriptPromise;
}

function buildServerCart(){
  return cart.map(item=>({
    product_id:item.productId,
    pack_grams:Number(String(item.pack).replace(/\D/g,'')),
    quantity:Number(item.quantity)
  }));
}

function checkoutAttribution(){
  const qs=new URLSearchParams(location.search);
  return {
    utm_source:qs.get('utm_source'),
    utm_medium:qs.get('utm_medium'),
    utm_campaign:qs.get('utm_campaign'),
    utm_content:qs.get('utm_content')
  };
}


async function prepareManualPayment(){
  const btn=document.getElementById('payNowBtn'),status=document.getElementById('paymentStatus');
  if(!pendingCheckoutPayload||!cart.length)throw Error('checkout_not_ready');
  if(preparedPayment)return preparedPayment;
  if(preparePaymentPromise)return preparePaymentPromise;
  btn.disabled=true;status.textContent='Reserving your unique UPI payment amount…';
  const id=sessionStorage.getItem('tkManualOrderCheckoutId')||(crypto?.randomUUID?.()||('tk-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
  sessionStorage.setItem('tkManualOrderCheckoutId',id);
  const payload={...pendingCheckoutPayload,client_checkout_id:id,items:buildServerCart(),attribution:checkoutAttribution(),action:'create'};
  preparePaymentPromise=(async()=>{
    const res=await fetch(TK_PAYMENT_CREATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok)throw Error(data.message||'UPI checkout is temporarily unavailable.');
    if(Number(data.total_amount)!==cartSubtotal())throw Error('Cart prices changed. Please reopen checkout.');
    if(!tkUpiPaymentIntent(data,'order'))throw Error('Could not prepare a UPI payment link.');
    preparedPayment={created:data,payload,serverTotal:Number(data.total_amount)};
    sessionStorage.setItem('tkManualOrderCheckout',JSON.stringify(preparedPayment));
    const adjusted=Number(data.upi_amount)-Number(data.total_amount);
    status.innerHTML='<strong>Pay exactly ₹'+Number(data.upi_amount).toFixed(2)+'</strong><span>Includes ₹'+adjusted.toFixed(2)+' bank-matching adjustment. Choose your UPI app below. We will verify the bank credit after you pay.</span>';
    btn.disabled=false;btn.textContent='Pay ₹'+Number(data.upi_amount).toFixed(2)+' with UPI ↗';
    document.getElementById('orderClaimPaid').hidden=true;
    document.getElementById('orderUpiHelp').hidden=false;
    document.getElementById('orderPayVpa').textContent=TK_RECEIVING_UPI_VPA;
    return preparedPayment;
  })().catch(err=>{status.innerHTML='<strong>Unable to prepare payment</strong><span>'+escapeHtml(err.message)+'</span>';btn.disabled=false;btn.textContent='Try again';throw err;})
    .finally(()=>{preparePaymentPromise=null;});
  return preparePaymentPromise;
}
function startManualPayment(){
  if(!preparedPayment){prepareManualPayment().catch(()=>{});return;}
  preparedPayment.payment_attempted=true;
  sessionStorage.setItem('tkManualOrderCheckout',JSON.stringify(preparedPayment));
  document.getElementById('orderClaimPaid').hidden=false;
  tkLaunchUpi(preparedPayment.created,'order');
}
document.getElementById('copyOrderUpi')?.addEventListener('click',async()=>{
  if(!preparedPayment?.created)return;
  try{await navigator.clipboard.writeText(TK_RECEIVING_UPI_VPA);showToast('UPI ID copied. Confirm the payee and enter the exact amount.');}
  catch{showToast('UPI ID: '+TK_RECEIVING_UPI_VPA);}
});
document.getElementById('orderClaimPaid')?.addEventListener('click',async()=>{
  if(!preparedPayment)return;
  const btn=document.getElementById('orderClaimPaid'),status=document.getElementById('paymentStatus');
  btn.disabled=true;status.textContent='Saving your payment report…';
  try{
    const d=preparedPayment;
    const r=await fetch(TK_PAYMENT_CREATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'claim',client_checkout_id:d.payload.client_checkout_id,order_ref:d.created.order_ref})});
    const result=await r.json().catch(()=>({}));
    if(!r.ok||!result.ok)throw Error(result.message||'Could not save your payment report.');
    status.innerHTML='<strong>Payment report received • '+escapeHtml(d.created.order_ref)+'</strong><span>Waiting for bank credit verification. This order is not confirmed yet. Please do not pay twice.</span>';
    btn.hidden=true;document.getElementById('payNowBtn').hidden=true;
    sessionStorage.removeItem('tkManualOrderCheckoutId');
    sessionStorage.removeItem('tkManualOrderCheckout');
    cart=[];saveCart();renderCart();
    trackEvent('order_payment_reported',{metadata:{order_ref:d.created.order_ref,total:d.created.upi_amount}});
  }catch(err){status.textContent=err.message||'Report failed. Please retry.';btn.disabled=false;}
});

const paymentLayer=document.getElementById('paymentLayer');
function closePayment(){if(paymentLayer.classList.contains('is-open')) setLayer(paymentLayer,false);}
document.querySelectorAll('[data-close-payment]').forEach(el=>el.addEventListener('click',closePayment));
document.getElementById('payNowBtn')?.addEventListener('click',startManualPayment);

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
  pendingCheckoutPayload={
    name:document.getElementById('customerName').value.trim(),
    mobile:document.getElementById('customerPhone').value.trim(),
    address:document.getElementById('customerAddress').value.trim().replace(/\s+/g,' '),
    pincode:pin,
    delivery_date:document.getElementById('deliveryDate').value
  };
  document.getElementById('paymentSummary').innerHTML=`
    <div class="payment-summary-top"><span>Order summary</span><strong>${money(subtotal)}</strong></div>
    <div class="payment-lines">${lines}</div>
    <div class="payment-meta"><span>Delivery <b>FREE</b></span><span>PIN <b>${pin}</b></span></div>`;
  preparedPayment=null;
  preparePaymentPromise=null;
  const status=document.getElementById('paymentStatus');
  const payBtn=document.getElementById('payNowBtn');
  status.dataset.state='loading';
  status.textContent='Reserving your unique UPI amount…';
  payBtn.disabled=true;
  payBtn.textContent='Preparing UPI payment…';
  setLayer(paymentLayer,true);
  document.getElementById('payNowBtn').hidden=false;
  document.getElementById('orderClaimPaid').hidden=true;
  document.getElementById('orderUpiHelp').hidden=true;
  prepareManualPayment().catch(()=>{});
});



// Restore checkout after returning from a UPI app; no payment claim is inferred.
try{
  const savedSample=JSON.parse(sessionStorage.getItem('tkManualSampleCheckout')||'null');
  const savedOrder=JSON.parse(sessionStorage.getItem('tkManualOrderCheckout')||'null');
  if(savedSample?.client_checkout_id && savedSample?.sample_ref && savedSample?.upi_amount){
    activeSampleUpi=savedSample;
    document.getElementById('sampleForm').hidden=true;
    document.getElementById('sampleSuccess').hidden=true;
    document.getElementById('sampleManualPayment').hidden=false;
    document.getElementById('samplePayRef').textContent=savedSample.sample_ref;
    document.getElementById('samplePayAmount').textContent='₹'+Number(savedSample.upi_amount).toFixed(2);
    document.getElementById('samplePayVpa').textContent=savedSample.upi_vpa||('UPI number +91 '+savedSample.payee_phone);
    document.getElementById('sampleOpenUpi').textContent=savedSample.upi_uri?'Open UPI app':'Copy receiving UPI number';
    document.getElementById('sampleCopyUpi').textContent=savedSample.upi_vpa?'Copy UPI ID':'Copy exact amount';
    setLayer(document.getElementById('sampleLayer'),true);
  }else if(savedOrder?.created?.order_ref && savedOrder?.created?.upi_amount && savedOrder?.payload?.client_checkout_id){
    preparedPayment=savedOrder;pendingCheckoutPayload=savedOrder.payload;
    const data=savedOrder.created;
    document.getElementById('paymentSummary').innerHTML='<div class="payment-summary-top"><span>Saved order '+escapeHtml(data.order_ref)+'</span><strong>₹'+Number(data.upi_amount).toFixed(2)+'</strong></div>';
    document.getElementById('paymentStatus').innerHTML='<strong>Payment not automatically verified</strong><span>Pay exactly ₹'+Number(data.upi_amount).toFixed(2)+' to '+escapeHtml(data.upi_vpa||data.payee_phone)+'. If you already paid, tap I\'ve paid once. Do not send a second transfer.</span>';
    document.getElementById('payNowBtn').disabled=false;
    document.getElementById('payNowBtn').textContent=data.upi_uri?'Open UPI app':'Copy UPI number to pay';
    document.getElementById('payNowBtn').hidden=false;
    document.getElementById('orderClaimPaid').hidden=false;
    document.getElementById('copyOrderUpi').hidden=false;
    document.getElementById('copyOrderUpi').textContent=data.upi_vpa?'Copy receiving UPI ID':'Copy exact amount';
    setLayer(checkoutLayer,true);setLayer(paymentLayer,true);
  }
}catch{sessionStorage.removeItem('tkManualOrderCheckout');sessionStorage.removeItem('tkManualSampleCheckout');}

const TK_REVIEW_SUBMIT_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-review-submit';
const TK_PUBLIC_REVIEWS_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-public-reviews';

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

async function loadPublicReviews(){
  const grid=document.getElementById('reviewsGrid');
  if(!grid) return;
  try{
    const res=await fetch(TK_PUBLIC_REVIEWS_URL,{headers:{'Accept':'application/json'}});
    const data=await res.json().catch(()=>({reviews:[]}));
    const reviews=Array.isArray(data.reviews)?data.reviews:[];
    if(!res.ok || !reviews.length){
      grid.hidden=true;
      grid.innerHTML='';
      return;
    }
    grid.innerHTML=reviews.map(r=>`
      <article class="review-card">
        <div class="review-stars" aria-label="${Number(r.rating)||0} out of 5 stars">${'★'.repeat(Number(r.rating)||0)}${'☆'.repeat(Math.max(0,5-(Number(r.rating)||0)))}</div>
        <blockquote>“${escapeHtml(r.review_text)}”</blockquote>
        <p><strong>${escapeHtml(r.display_name)}</strong>${r.city?' • '+escapeHtml(r.city):''}<span>Verified ${r.source_type==='order'?'buyer':'sample recipient'}</span></p>
      </article>`).join('');
    grid.hidden=false;
  }catch{
    grid.hidden=true;
  }
}

document.getElementById('reviewForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  if(!form.reportValidity()) return;
  const submit=form.querySelector('button[type="submit"]');
  const status=document.getElementById('reviewStatus');
  const payload={
    source_ref:document.getElementById('reviewRef').value.trim(),
    mobile:document.getElementById('reviewMobile').value.trim(),
    display_name:document.getElementById('reviewName').value.trim(),
    rating:Number(document.getElementById('reviewRating').value),
    review_text:document.getElementById('reviewText').value.trim(),
    consent_to_publish:document.getElementById('reviewConsent').checked
  };
  submit.disabled=true;
  const original=submit.textContent;
  submit.textContent='Verifying…';
  try{
    const res=await fetch(TK_REVIEW_SUBMIT_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const messages={
        invalid_reference:'Please enter a valid TKS or TKO reference.',
        verification_failed:'We could not match this reference with the mobile number used for the request.',
        not_eligible_yet:'Feedback opens after the sample or order has been marked delivered.',
        review_exists:'Feedback has already been submitted for this reference.'
      };
      status.textContent=messages[data.error] || data.message || 'We could not submit your feedback. Please check the details and try again.';
      return;
    }
    form.reset();
    status.textContent='Thank you. Your verified feedback has been received and will be reviewed before any public display.';
  }catch{
    status.textContent='Network issue. Please try again.';
  }finally{
    submit.disabled=false;
    submit.textContent=original;
  }
});

loadPublicReviews();


const TK_GIFTING_URL='https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-gifting-inquiry';

document.getElementById('giftingForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  if(!form.reportValidity()) return;

  const selected=[...document.querySelectorAll('input[name="giftingProduct"]:checked')].map(x=>x.value);
  const status=document.getElementById('giftingStatus');
  if(!selected.length){
    status.textContent='Please choose at least one product you are considering.';
    return;
  }

  const qs=new URLSearchParams(location.search);
  const payload={
    name:document.getElementById('giftingName').value.trim(),
    mobile:document.getElementById('giftingMobile').value.trim(),
    business_name:document.getElementById('giftingBusiness').value.trim(),
    city:document.getElementById('giftingCity').value.trim(),
    quantity_range:document.getElementById('giftingQuantity').value,
    product_interest:selected,
    requirement_notes:document.getElementById('giftingNotes').value.trim(),
    source:'website',
    utm_source:qs.get('utm_source'),
    utm_medium:qs.get('utm_medium'),
    utm_campaign:qs.get('utm_campaign'),
    utm_content:qs.get('utm_content')
  };

  const submit=form.querySelector('button[type="submit"]');
  const original=submit.textContent;
  submit.disabled=true;
  submit.textContent='Sending enquiry…';

  try{
    const res=await fetch(TK_GIFTING_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      status.textContent=data.message || 'We could not submit the gifting enquiry. Please check the details and try again.';
      return;
    }
    trackEvent('gifting_submit_success',{metadata:{gifting_ref:data.gifting_ref,quantity_range:payload.quantity_range,products:selected}});
    form.reset();
    status.innerHTML='Enquiry received. Reference: <strong>'+escapeHtml(data.gifting_ref)+'</strong>. We’ll confirm capacity, packaging and delivery feasibility before sharing a quote.';
    showToast('Corporate gifting enquiry received: '+data.gifting_ref);
  }catch{
    status.textContent='Network issue. Please try again or contact us on WhatsApp.';
  }finally{
    submit.disabled=false;
    submit.textContent=original;
  }
});

document.getElementById('whatsappFab').addEventListener('click',()=>{
  // Direct WhatsApp entry; AI automation will be layered onto the same business number later.
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
const revealTargets=document.querySelectorAll('.section-head,.product-card,.future-note,.trust-copy,.trust-card,.origin-card,.review-capture,.gifting-inner');
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
