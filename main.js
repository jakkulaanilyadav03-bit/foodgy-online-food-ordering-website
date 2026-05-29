// main.js (replace your existing file with this)

// ---------- DOM ELEMENTS ----------
// ---------- DOM ELEMENTS (will be assigned on DOMContentLoaded) ----------
let cartIcon = null;
let cartTab = null;
let closeBtn = null;
let cardList = null;
let cartList = null;
let cartTotal = null;
let cartValue = null;

let hamburger = null;
let mobileMenu = null;
let bars = null;

let subscribeBtn = null;
let emailInput = null;

let signInButtons = null; // header and mobile "Sign in"
let desktopAction = null;

// ---------- APP STATE ----------
let productList = [];
let cartProducts = []; // array of { id, _id?, name, price (number), image, qty }
const STORAGE_CART_KEY = 'checkoutCart';
const STORAGE_USER_KEY = 'userAccount';
const STORAGE_SUBSCRIBERS = 'subscribers';

// ---------- UTILITIES ----------
function q(selector) { return document.querySelector(selector); }
function formatPrice(n) { return `$${n.toFixed(2)}`; } // used on index page
function formatINR(n) { return `₹${n.toFixed(2)}`; } // used on order page if needed

// Small debug/banner helper to show product loading status on page
function showDebugBanner(message, level = 'info') {
    let banner = document.getElementById('debugBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'debugBanner';
        banner.style.position = 'fixed';
        banner.style.left = '1rem';
        banner.style.bottom = '1rem';
        banner.style.zIndex = 99999;
        banner.style.padding = '0.6rem 1rem';
        banner.style.borderRadius = '8px';
        banner.style.fontSize = '0.95rem';
        banner.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
        document.body.appendChild(banner);
    }
    banner.textContent = message;
    banner.style.background = level === 'error' ? '#F87171' : '#10B981';
    banner.style.color = '#fff';
}

function showToast(message, type = 'success', duration = 2500) {
    const toast = document.createElement('div');
    toast.className = `mini-toast ${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.right = '1rem';
    toast.style.bottom = '1rem';
    toast.style.padding = '0.6rem 1rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    toast.style.zIndex = 2000;
    toast.style.background = (type === 'success') ? '#10B981' : '#F87171';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.95rem';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    toast.style.transform = 'translateY(8px)';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ---------- RESPONSIVE MENU ----------
// ---------- RESPONSIVE MENU ----------
function bindResponsiveMenu() {
    if (!hamburger) return;
    hamburger.addEventListener('click', () => {
        if (!mobileMenu || !bars) return;
        mobileMenu.classList.toggle('mobile-menu-active');
        bars.classList.toggle('fa-xmark');
    });
}

// ---------- CART DRAW / PERSIST ----------
function saveCart() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartProducts));
}

function loadCart() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
    cartProducts = Array.isArray(stored) ? stored : [];
    renderCartList();
}

function updateTotalsAndBadge() {
    let totalPrice = 0;
    let totalQty = 0;
    cartProducts.forEach(item => {
        totalQty += item.qty || 0;
        totalPrice += (item.priceNum || 0) * (item.qty || 0);
    });

    if (cartTotal) cartTotal.textContent = formatPrice(totalPrice);
    if (cartValue) cartValue.textContent = totalQty;
}

// Render the right-hand cart tab list
function renderCartList() {
    if (!cartList) return;
    cartList.innerHTML = '';

    if (cartProducts.length === 0) {
        cartList.innerHTML = `<div style="text-align:center;padding:1.2rem;color:#555">Your cart is empty.</div>`;
        updateTotalsAndBadge();
        return;
    }

    cartProducts.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.dataset.id = item.id || item._id || '';

        const priceTotal = (item.priceNum || 0) * (item.qty || 0);

        itemEl.innerHTML = `
            <div class="item-image">
                <img src="${item.image}">
            </div>
            <div class="detail">
                <h4>${item.name}</h4>
                <h4 class="item-total">${formatPrice(priceTotal)}</h4>
            </div>
            <div class="flex">
                <h4 class="quantity-value">${item.qty}</h4>
                <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
                <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
                <a href="#" class="quantity-btn remove" title="Remove" style="margin-left:8px;background:#ef4444;">
                    <i class="fa-solid fa-trash"></i>
                </a>
            </div>
        `;

        cartList.appendChild(itemEl);

        // Attach handlers
        const plusBtn = itemEl.querySelector('.plus');
        const minusBtn = itemEl.querySelector('.minus');
        const removeBtn = itemEl.querySelector('.remove');
        const qtyValueEl = itemEl.querySelector('.quantity-value');
        const itemTotalEl = itemEl.querySelector('.item-total');

        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            item.qty = (item.qty || 0) + 1;
            qtyValueEl.textContent = item.qty;
            itemTotalEl.textContent = formatPrice(item.priceNum * item.qty);
            updateTotalsAndBadge();
            saveCart();
        });

        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.qty > 1) {
                item.qty--;
                qtyValueEl.textContent = item.qty;
                itemTotalEl.textContent = formatPrice(item.priceNum * item.qty);
                updateTotalsAndBadge();
                saveCart();
            } else {
                // remove
                cartProducts = cartProducts.filter(i => (i.id || i._id) !== (item.id || item._id));
                itemEl.remove();
                updateTotalsAndBadge();
                saveCart();
            }
        });

        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartProducts = cartProducts.filter(i => (i.id || i._id) !== (item.id || item._id));
            itemEl.remove();
            updateTotalsAndBadge();
            saveCart();
        });
    });

    updateTotalsAndBadge();
}

// ---------- SHOW DYNAMIC CARDS ----------
function showCards() {
    cardList.innerHTML = "";
    productList.forEach((product, index) => {
        const card = document.createElement('div');
        card.classList.add('order-card');
        card.classList.add('reveal');

        // price shown as string in product data; convert to number for calculation
        const priceStr = String(product.price || '');
        // strip currency symbols and commas
        const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

        // Generate random rating for display (4-5 stars)
        const stars = 4 + Math.floor(Math.random() * 2);
        const starHTML = '<i class="fa-solid fa-star" style="color:#FF6B35;font-size:0.75rem;"></i>'.repeat(stars)
                       + '<i class="fa-regular fa-star" style="color:#FF6B35;font-size:0.75rem;"></i>'.repeat(5 - stars);

        card.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div style="margin-bottom:0.3rem;">${starHTML}</div>
            <h4>${product.name}</h4>
            <h4 class="price">${product.price}</h4>
            <a href="#" class="btn add-btn">Add to cart</a>
        `;

        // Stagger animation
        card.style.animationDelay = `${index * 0.05}s`;

        cardList.appendChild(card);

        // Trigger reveal
        setTimeout(() => card.classList.add('active'), 100 + index * 80);

        // ADD TO CART BTN
        card.querySelector('.add-btn').addEventListener('click', (e) => {
            e.preventDefault();
            // include priceNum for internal use
            addToCart({
                ...product,
                priceNum
            });
        });
    });
}

// ---------- ADD TO CART (allow multiple qty of same item) ----------
function addToCart(product) {
    const idKey = product.id || product._id;
    // find existing
    let existing = cartProducts.find(p => (p.id || p._id) === idKey);

    if (existing) {
        // increment qty
        existing.qty = (existing.qty || 0) + 1;
    } else {
        const itemObj = {
            id: product.id,
            _id: product._id,
            name: product.name,
            image: product.image,
            priceNum: product.priceNum || parseFloat(String(product.price || '').replace(/[^0-9.]/g, '')) || 0,
            qty: 1
        };
        cartProducts.push(itemObj);
    }

    cartTab.classList.add('cart-tab-active');
    renderCartList();
    saveCart();
    showToast('Added to cart', 'success');
}

// ---------- FETCH PRODUCTS ----------
async function initApp() {
    try {
        // fetch local file: products.json (same place as your current code)
        const res = await fetch("products.json");
        if (!res.ok) throw new Error('Failed to fetch products.json: ' + res.status);
        const data = await res.json();
        productList = data;
        showCards();
        showDebugBanner(`Loaded ${productList.length} products`);
    } catch (err) {
        console.log("Error loading products:", err);
        showDebugBanner('Error loading products.json — open console for details', 'error');
    }
}

// ---------- SUBSCRIBE ----------
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function bindSubscribe() {
    if (!subscribeBtn || !emailInput) return;
    subscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email) {
            showToast('Please enter an email address', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        let stored = JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS) || '[]');
        if (stored.includes(email)) {
            showToast('You are already subscribed', 'error');
            return;
        }
        stored.push(email);
        localStorage.setItem(STORAGE_SUBSCRIBERS, JSON.stringify(stored));
        localStorage.setItem("subscriberEmail", email);
        emailInput.value = '';
        showToast('Subscribed successfully ✅', 'success');
    });
}

// ---------- SIGN IN (modal) ----------
function createSignInModal() {
    // if modal exists return it
    if (document.getElementById('signinModal')) return document.getElementById('signinModal');

    const modal = document.createElement('div');
    modal.id = 'signinModal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 3000;

    modal.innerHTML = `
        <div style="width:100%;max-width:420px;background:#fff;padding:1.5rem;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
                <h3 style="margin:0">Sign in / Create account</h3>
                <button id="closeSignIn" style="background:#eee;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;">✕</button>
            </div>
            <p style="color:#555;margin:0 0 1rem 0;font-size:0.95rem;">Quickly create an account so we can fill details at checkout.</p>
            <form id="signinForm" style="display:flex;flex-direction:column;gap:0.6rem;">
                <input id="si_name" required placeholder="Full name" style="padding:10px;border-radius:8px;border:1px solid #ddd;">
                <input id="si_email" required placeholder="Email" type="email" style="padding:10px;border-radius:8px;border:1px solid #ddd;">
                <input id="si_phone" placeholder="Phone (optional)" style="padding:10px;border-radius:8px;border:1px solid #ddd;">
                <div style="display:flex;gap:8px;margin-top:6px;">
                    <button type="submit" class="btn" style="flex:1;">Create account</button>
                    <button id="si_cancel" type="button" style="flex:1;background:#ef4444;color:#fff;border:none;border-radius:8px;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // handlers
    modal.querySelector('#closeSignIn').addEventListener('click', () => modal.remove());
    modal.querySelector('#si_cancel').addEventListener('click', () => modal.remove());

    modal.querySelector('#signinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = modal.querySelector('#si_name').value.trim();
        const email = modal.querySelector('#si_email').value.trim();
        const phone = modal.querySelector('#si_phone').value.trim();

        if (!name || !email) {
            showToast('Please enter name and email', 'error');
            return;
        }
        if (!isValidEmail(email)) {
            showToast('Enter a valid email', 'error');
            return;
        }

       const account = { name, email, phone, createdAt: new Date().toISOString() };
localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(account));

updateUserUI();  // <------- NEW
showToast(`Welcome, ${name.split(' ')[0]}!`, 'success');

modal.remove();

    });

    return modal;
}

function updateSignInUI() {
    let isAuthenticated = false;
    let userName = '';

    // Check Firebase first, fallback to localStorage
    if (typeof auth !== 'undefined' && auth && auth.currentUser) {
        isAuthenticated = true;
        userName = auth.currentUser.displayName || auth.currentUser.email.split('@')[0] || 'User';
    } else {
        const stored = JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null');
        if (stored && stored.name) {
            isAuthenticated = true;
            userName = stored.name;
        }
    }

    // find header sign-in button (the desktop one is inside .desktop-action and had .btn; mobile also)
    const desktopBtn = document.querySelector('.desktop-action a.btn');
    const mobileBtn = document.querySelector('.mobile-menu a.btn');

    if (isAuthenticated) {
        const shortName = userName.split(' ')[0];
        if (desktopBtn) {
            desktopBtn.innerHTML = `${shortName} &nbsp; <i class="fa-solid fa-user"></i>`;
            desktopBtn.classList.add('signed-in');
            desktopBtn.href = 'profile.html'; // Link to profile page
        }
        if (mobileBtn) {
            mobileBtn.innerHTML = `${shortName} &nbsp; <i class="fa-solid fa-user"></i>`;
            mobileBtn.classList.add('signed-in');
            mobileBtn.href = 'profile.html';
        }
        // show dashboard/order links
        const navDash = document.getElementById('navDashboardLink');
        const navOrders = document.getElementById('navOrdersLink');
        const mNavDash = document.getElementById('mobileDashboardLink');
        const mNavOrders = document.getElementById('mobileOrdersLink');
        if (navDash) navDash.style.display = 'inline-block';
        if (navOrders) navOrders.style.display = 'inline-block';
        if (mNavDash) mNavDash.style.display = 'block';
        if (mNavOrders) mNavOrders.style.display = 'block';
    } else {
        if (desktopBtn) desktopBtn.innerHTML = `Sign in &nbsp; <i class="fa-solid fa-arrow-right-from-bracket"></i>`;
        if (mobileBtn) mobileBtn.innerHTML = `Sign in &nbsp; <i class="fa-solid fa-arrow-right-from-bracket"></i>`;
        if (desktopBtn) desktopBtn.classList.remove('signed-in');
        if (mobileBtn) mobileBtn.classList.remove('signed-in');
        // hide dashboard/order links
        const navDash = document.getElementById('navDashboardLink');
        const navOrders = document.getElementById('navOrdersLink');
        const mNavDash = document.getElementById('mobileDashboardLink');
        const mNavOrders = document.getElementById('mobileOrdersLink');
        if (navDash) navDash.style.display = 'none';
        if (navOrders) navOrders.style.display = 'none';
        if (mNavDash) mNavDash.style.display = 'none';
        if (mNavOrders) mNavOrders.style.display = 'none';
    }
}

// Alias for compatibility
function updateUserUI() {
    updateSignInUI();
}

function initSignInHandlers() {
    const desktopBtn = document.querySelector('.desktop-action a.btn');
    const mobileBtn = document.querySelector('.mobile-menu a.btn');

    if (desktopBtn) {
        desktopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // if signed-in, follow the link (profile), otherwise open modal
            if (desktopBtn.classList.contains('signed-in') || desktopBtn.href.includes('profile.html')) {
                window.location.href = desktopBtn.href;
                return;
            }
            
            const fbModal = document.getElementById('authModal');
            if (fbModal) {
                fbModal.style.display = 'flex';
            } else {
                createSignInModal();
            }
        });
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // if signed-in, follow the link (profile), otherwise open modal
            if (mobileBtn.classList.contains('signed-in') || mobileBtn.href.includes('profile.html')) {
                window.location.href = mobileBtn.href;
                if (mobileMenu && mobileMenu.classList.contains('mobile-menu-active')) {
                    mobileMenu.classList.remove('mobile-menu-active');
                    if (bars) bars.classList.remove('fa-xmark');
                }
                return;
            }
            
            const fbModal = document.getElementById('authModal');
            if (fbModal) {
                fbModal.style.display = 'flex';
            } else {
                createSignInModal();
            }
            
            if (mobileMenu && mobileMenu.classList.contains('mobile-menu-active')) {
                mobileMenu.classList.remove('mobile-menu-active');
                if (bars) bars.classList.remove('fa-xmark');
            }
        });
    }
}

// ---------- CHECKOUT (go to order.html) ----------
function bindCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (!checkoutBtn) return;
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!cartProducts || cartProducts.length === 0) {
            showToast("Cart is empty!", "error");
            return;
        }
        saveCart();
        window.location.href = 'order.html';
    });
}

// ---------- CART TAB OPEN / CLOSE ----------
function bindCartTab() {
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (cartTab) cartTab.classList.add('cart-tab-active');
            document.body.classList.add('cart-open');
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cartTab) cartTab.classList.remove('cart-tab-active');
            document.body.classList.remove('cart-open');
        });
    }
}

// Initialize DOM-dependent bindings after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // assign DOM elements
    cartIcon = document.querySelector('.cart-icon');
    cartTab = document.querySelector('.cart-tab');
    closeBtn = document.querySelector('.close-btn');
    cardList = document.querySelector('.card-list');
    cartList = document.querySelector('.cart-list');
    cartTotal = document.querySelector('.cart-total');
    cartValue = document.querySelector('.cart-value');

    hamburger = document.querySelector('.hamburger');
    mobileMenu = document.querySelector('.mobile-menu');
    bars = document.querySelector('.fa-bars');

    subscribeBtn = document.getElementById('subscribeBtn');
    emailInput = document.getElementById('email');

    desktopAction = document.querySelector('.desktop-action');
    signInButtons = document.querySelectorAll('a.btn');

    // bind handlers
    bindResponsiveMenu();
    bindSubscribe();
    initSignInHandlers();
    bindCheckout();
    bindCartTab();

    // load saved cart and products
    loadCart();
    updateSignInUI();
    initApp();
});








