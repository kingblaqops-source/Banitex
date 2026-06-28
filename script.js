// ============================================
// PRODUCT DATA (pulled from DOM data attributes)
// ============================================
const cart = []; // { id, name, price, qty }

// ============================================
// MOBILE NAV TOGGLE
// ============================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// ============================================
// CART DRAWER OPEN / CLOSE
// ============================================
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

function openCart() {
  cartDrawer.classList.add('is-open');
  cartOverlay.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartOverlay.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ============================================
// CONTACT FORM (Formspree submission via fetch)
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formStatus.textContent = "Message sent — we'll get back to you soon.";
        formStatus.classList.add('is-success');
        contactForm.reset();
      } else {
        formStatus.textContent = 'Something went wrong. Try again or email us directly.';
        formStatus.classList.add('is-error');
      }
    } catch (error) {
      formStatus.textContent = 'Network error. Check your connection and try again.';
      formStatus.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE →';
    }
  });
}

// ============================================
// SHOP PAGE — CATEGORY FILTER (only runs if filter bar exists)
// ============================================
const filterBar = document.getElementById('filterBar');

if (filterBar) {
  const filterButtons = filterBar.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.section[data-category]');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      categorySections.forEach(section => {
        if (filter === 'all' || section.dataset.category === filter) {
          section.classList.remove('is-hidden');
        } else {
          section.classList.add('is-hidden');
        }
      });
    });
  });
}

// ============================================
// ADD TO CART
// ============================================
const addButtons = document.querySelectorAll('[data-add]');

addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price, 10);

    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }

    renderCart();
    openCart();

    // Quick visual feedback on the button
    const originalText = btn.textContent;
    btn.textContent = 'ADDED ✓';
    setTimeout(() => { btn.textContent = originalText; }, 1000);
  });
});

// ============================================
// RENDER CART CONTENTS
// ============================================
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

function renderCart() {
  // Update cart count badge
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalQty;

  // Empty state
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Go grab something.</p>';
    cartTotalEl.textContent = formatNaira(0);
    return;
  }

  // Render each item
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-cart-id="${item.id}">
      <div class="cart-item__info">
        <h4>${item.name}</h4>
        <p>${formatNaira(item.price)}</p>
        <div class="cart-item__qty">
          <button data-decrease="${item.id}" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button data-increase="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-remove="${item.id}">remove</button>
    </div>
  `).join('');

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = formatNaira(total);

  // Wire up the new buttons (increase/decrease/remove)
  cartItemsEl.querySelectorAll('[data-increase]').forEach(b => {
    b.addEventListener('click', () => changeQty(b.dataset.increase, 1));
  });
  cartItemsEl.querySelectorAll('[data-decrease]').forEach(b => {
    b.addEventListener('click', () => changeQty(b.dataset.decrease, -1));
  });
  cartItemsEl.querySelectorAll('[data-remove]').forEach(b => {
    b.addEventListener('click', () => removeItem(b.dataset.remove));
  });
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  renderCart();
}

function removeItem(id) {
  const index = cart.findIndex(i => i.id === id);
  if (index > -1) cart.splice(index, 1);
  renderCart();
}

// ============================================
// CHECKOUT (placeholder — wire up to real payment later)
// ============================================
const checkoutBtn = document.getElementById('checkoutBtn');

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty — add something first.');
    return;
  }
  alert('Checkout is not connected to a payment provider yet. This is a demo cart.');
});

// Initial render
renderCart();
