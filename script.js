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
    return `<img src="${src}" alt="${product.name}" loading="${suffix==='card'?'eager':'lazy'}" decoding="async">`;
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

function transition(fn){
  if(document.startViewTransition) document.startViewTransition(fn);
  else fn();
}

function openProduct(id, sourceCard){
  const product = PRODUCTS.find(p=>p.id===id);
  if(!product) return;
  activeProduct = product;
  activePack = product.packs[0];

  const sourceMedia = sourceCard?.querySelector('[data-card-media]');
  if(sourceMedia) sourceMedia.style.viewTransitionName='product-media';

  transition(()=>{
    fillProduct();
    productLayer.classList.add('is-open');
    productLayer.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    detailMedia.style.viewTransitionName='product-media';
  });

  setTimeout(()=>{
    if(sourceMedia) sourceMedia.style.viewTransitionName='';
    detailMedia.style.viewTransitionName='';
  },650);

  history.pushState({product:id},'', '#product/'+id);
}

function fillProduct(){
  detailKicker.textContent = activeProduct.kicker;
  detailTitle.textContent = activeProduct.name;
  detailDescription.textContent = activeProduct.description;
  detailMedia.innerHTML = artSvg(activeProduct,'detail');
  renderPacks();
  infoPanel.className='info-panel';
  infoPanel.innerHTML='';
  document.querySelectorAll('.info-card').forEach(b=>b.classList.remove('active'));
}

function renderPacks(){
  detailPrice.textContent = money(activePack.price);
  detailPack.textContent = activePack.label + (activePack.preview?' • preview price':'');
  packOptions.innerHTML = activeProduct.packs.map((p,i)=>`<button type="button" class="pack-chip ${p.label===activePack.label?'active':''}" data-pack="${i}">${p.label} • ${money(p.price)}${p.preview?'*':''}</button>`).join('');
  packOptions.querySelectorAll('.pack-chip').forEach(btn=>{
    btn.addEventListener('click',()=>{
      activePack=activeProduct.packs[Number(btn.dataset.pack)];
      renderPacks();
      pulse(detailPrice);
    });
  });
}

function pulse(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
}

function closeProduct(push=true){
  if(!productLayer.classList.contains('is-open')) return;
  transition(()=>{
    productLayer.classList.remove('is-open');
    productLayer.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  });
  if(push && location.hash.startsWith('#product/')) history.pushState({},'',location.pathname+location.search+'#collection');
}

document.querySelectorAll('[data-close-product]').forEach(el=>el.addEventListener('click',()=>closeProduct()));

document.querySelectorAll('.info-card').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const key=btn.dataset.info;
    const same=btn.classList.contains('active');
    document.querySelectorAll('.info-card').forEach(b=>b.classList.remove('active'));
    if(same){ infoPanel.className='info-panel'; return; }
    btn.classList.add('active');
    let html='';
    if(key==='ingredients') html='<p><strong>Ingredients</strong></p><ul>'+activeProduct.ingredients.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
    if(key==='delivery') html='<p><strong>Delivery</strong><br>'+activeProduct.delivery+'</p>';
    if(key==='gifting') html='<p><strong>Gifting</strong><br>'+activeProduct.gifting+'</p>';
    if(key==='photos'){
      if(activeProduct.media?.length){
        html='<div class="photo-grid">'+activeProduct.media.map((src,i)=>'<img src="'+src+'" alt="'+activeProduct.name+' photo '+(i+1)+'" loading="lazy">').join('')+'</div>';
      }else{
        html='<p><strong>Photos</strong><br>Product photography will be added after the Coconut Mewa Ladoo is finalized.</p>';
      }
    }
    infoPanel.innerHTML=html;
    infoPanel.className='info-panel show';
  });
});

document.getElementById('openCheckout').addEventListener('click',()=>{
  checkoutSummary.innerHTML=`<strong>${activeProduct.name} — ${activePack.label}</strong><span>${money(activePack.price)} each • prepaid order</span>`;
  quantity.value=1;
  updateTotal();
  checkoutLayer.classList.add('is-open');
  checkoutLayer.setAttribute('aria-hidden','false');
});

function closeCheckout(){
  checkoutLayer.classList.remove('is-open');
  checkoutLayer.setAttribute('aria-hidden','true');
}
document.querySelectorAll('[data-close-checkout]').forEach(el=>el.addEventListener('click',closeCheckout));

function updateTotal(){
  const q=Math.max(1,Number(quantity.value||1));
  checkoutTotal.textContent=money(activePack.price*q);
}
quantity.addEventListener('input',updateTotal);

document.getElementById('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!e.currentTarget.reportValidity()) return;
  showToast('Payment preview complete — live gateway will be connected before launch.');
  closeCheckout();
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
  if(e.key==='Escape'){
    if(checkoutLayer.classList.contains('is-open')) closeCheckout();
    else closeProduct();
  }
});

window.addEventListener('popstate',()=>{
  const match=location.hash.match(/^#product\/(.+)$/);
  if(match){
    const p=PRODUCTS.find(x=>x.id===match[1]);
    if(p){ activeProduct=p; activePack=p.packs[0]; fillProduct(); productLayer.classList.add('is-open'); productLayer.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); }
  }else{
    productLayer.classList.remove('is-open'); productLayer.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
  }
});

renderCards();
const direct=location.hash.match(/^#product\/(.+)$/);
if(direct){
  const p=PRODUCTS.find(x=>x.id===direct[1]);
  if(p){activeProduct=p;activePack=p.packs[0];fillProduct();productLayer.classList.add('is-open');productLayer.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');}
}
