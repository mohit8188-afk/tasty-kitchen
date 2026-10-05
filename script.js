const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
let raf = null;
function updateParallax(){
  const vh = window.innerHeight;
  parallaxEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const strength = Number(el.dataset.parallax || 0.04);
    const centerDelta = (rect.top + rect.height/2) - vh/2;
    el.style.transform = `translate3d(0, ${centerDelta * -strength}px, 0)`;
  });
  raf = null;
}
window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(updateParallax); }, { passive:true });
updateParallax();

const productEl = document.getElementById('product');
const qtyEl = document.getElementById('qty');
const totalEl = document.getElementById('orderTotal');
const payButtonAmount = document.getElementById('payButtonAmount');
const orderForm = document.getElementById('orderForm');
const formStatus = document.getElementById('formStatus');
const paymentModal = document.getElementById('paymentModal');
const modalAmount = document.getElementById('modalAmount');
const demoPayNow = document.getElementById('demoPayNow');
const successToast = document.getElementById('successToast');

function currentOrder(){
  const opt = productEl?.options[productEl.selectedIndex];
  const price = Number(opt?.dataset.price || 0);
  const qty = Math.max(1, Number(qtyEl?.value || 1));
  return { price, qty, total: price * qty, label: opt?.dataset.name || opt?.textContent?.trim() || '' };
}
function money(n){ return `₹${n.toLocaleString('en-IN')}`; }
function updateCheckout(){
  const o = currentOrder();
  if(totalEl) totalEl.textContent = money(o.total);
  if(payButtonAmount) payButtonAmount.textContent = money(o.total);
  if(modalAmount) modalAmount.textContent = money(o.total);
}
productEl?.addEventListener('change', updateCheckout);
qtyEl?.addEventListener('input', updateCheckout);
updateCheckout();

function openPayment(){
  updateCheckout();
  paymentModal?.classList.add('open');
  paymentModal?.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function closePayment(){
  paymentModal?.classList.remove('open');
  paymentModal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
document.querySelectorAll('[data-close-payment]').forEach(el => el.addEventListener('click', closePayment));

document.querySelectorAll('.payment-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.payment-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-panel="${tab.dataset.method}"]`)?.classList.add('active');
  });
});

orderForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if(!orderForm.reportValidity()) return;
  formStatus.textContent = 'Opening secure payment preview…';
  openPayment();
});

demoPayNow?.addEventListener('click', () => {
  demoPayNow.disabled = true;
  demoPayNow.textContent = 'Processing demo payment…';
  setTimeout(() => {
    closePayment();
    formStatus.textContent = 'Demo payment successful — order confirmed automatically.';
    if(successToast){
      successToast.classList.add('show');
      setTimeout(() => successToast.classList.remove('show'), 3800);
    }
    demoPayNow.disabled = false;
    demoPayNow.textContent = 'Complete demo payment';
  }, 800);
});