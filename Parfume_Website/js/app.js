// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Initial Data
const defaultProducts = [
    {
        id: 1,
        name: "Vanilla Powder",
        brand: "Matiere Premiere",
        price: 32000,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "nouveautes",
        gender: "unisex",
        badge: "New",
        notes: { top: "Pink Pepper, Carrot Seed", heart: "White Musk, Orris", base: "Vanilla, Ambroxan" }
    },
    {
        id: 2,
        name: "Hacivat X",
        brand: "Nishane",
        price: 45000,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "nouveautes",
        gender: "men",
        badge: "New",
        notes: { top: "Bergamot, Pineapple", heart: "Jasmine, Patchouli", base: "Cedarwood, Oakmoss" }
    },
    {
        id: 4,
        name: "Delina Exclusif",
        brand: "Parfums de Marly",
        price: 42000,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "nouveautes",
        gender: "women",
        badge: "New",
        notes: { top: "Pear, Lychee", heart: "Turkish Rose, Incense", base: "Vanilla, Amber" }
    },
    {
        id: 5,
        name: "Pack Ultra Niche Femme",
        brand: "Bundle",
        price: 48000,
        oldPrice: 60000,
        image: "https://images.unsplash.com/photo-1512777576255-a88b72a95b92?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "promotions",
        gender: "women",
        badge: "-20%",
        notes: { top: "Sweet Citrus", heart: "Mixed Florals", base: "Musk, Vanilla" }
    },
    {
        id: 6,
        name: "Oud Candy",
        brand: "Montale",
        price: 15300,
        oldPrice: 18000,
        image: "https://images.unsplash.com/photo-1616999697526-80931536b1ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "promotions",
        gender: "unisex",
        badge: "-15%",
        notes: { top: "Oud, Candy", heart: "Rose, Sugar", base: "Amber, Musk" }
    }
];

// Initialize Storage
products = JSON.parse(localStorage.getItem('products')) || defaultProducts;

if (products.some(p => p.id === 3)) {
    products = products.filter(p => p.id !== 3);
    localStorage.setItem('products', JSON.stringify(products));
}

if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(products));
}

// DOM Elements
const navbar = document.querySelector('.navbar');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const cartBtns = document.querySelectorAll('.fa-shopping-bag, .close-cart, .cart-overlay');

const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modal-title');
const modalBrand = document.getElementById('modal-brand');
const modalPrice = document.getElementById('modal-price');
const modalImg = document.getElementById('modal-img');
const modalThumbnails = document.getElementById('modal-thumbnails');
const sizeBtns = document.querySelectorAll('.size-btn');

let currentProduct = null;
let currentSize = 'default';

// Functionality
function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Votre panier est vide.</div>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name} <span style="font-size:0.7rem; color:#888;">(${item.size || 'Standard'})</span></div>
                    <div class="cart-item-price">${item.quantity} x ${item.price.toLocaleString()} DA</div>
                    <button class="cart-item-remove" data-index="${index}">Retirer</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    cartTotalPriceEl.textContent = `${total.toLocaleString()} DA`;

    // Update count in header
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = count;
    }

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            cart.splice(index, 1);
            updateCart();
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id == product.id && item.size == product.size);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    shakeCartIcon();
    showToast(`${product.name} ajouté au panier`, 'success');
    openCart();
}

function handleAddToCart(e) {
    e.preventDefault();
    if (e.target.id === 'modal-add-btn' && currentProduct) {
        const product = {
            id: currentProduct.id,
            name: currentProduct.name,
            brand: currentProduct.brand,
            price: getSelectedPrice(),
            image: modalImg.src,
            size: currentSize === 'default' ? 'Standard' : currentSize
        };
        addToCart(product);
        closeModal();
    } else {
        const card = e.target.closest('.product-card');
        if (card) {
            const id = card.dataset.id;
            const p = products.find(item => item.id == id);
            if (p) {
                if (!p.price && p.variants) {
                    // No direct base price, must choose variant in modal
                    openModal(id);
                    return;
                }
                addToCart({
                    id: p.id,
                    name: p.name,
                    brand: p.brand,
                    price: p.price,
                    image: p.image,
                    size: 'Standard'
                });
            }
        }
    }
}

function getSelectedPrice() {
    if (currentSize === 'default') {
        return currentProduct.price || (currentProduct.variants && Object.keys(currentProduct.variants).length > 0 ? Object.values(currentProduct.variants)[0] : 0);
    }
    if (currentProduct.variants && currentProduct.variants[currentSize]) {
        return currentProduct.variants[currentSize];
    }
    return currentProduct.price || 0;
}

function openModal(id) {
    currentProduct = products.find(p => p.id == id);
    if (!currentProduct) return;

    modalTitle.textContent = currentProduct.name;
    modalBrand.textContent = currentProduct.brand || 'Niche Brand';
    modalImg.src = currentProduct.image;

    // Gallery
    modalThumbnails.innerHTML = '';
    const allImages = currentProduct.images || [currentProduct.image];
    if (allImages.length > 1) {
        allImages.forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = `thumb-img ${idx === 0 ? 'active' : ''}`;
            thumb.onclick = () => {
                modalImg.src = imgUrl;
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
            modalThumbnails.appendChild(thumb);
        });
    }

    // Variants & Default Selection
    const hasBasePrice = currentProduct.price !== null && currentProduct.price !== undefined;
    const variantKeys = currentProduct.variants ? Object.keys(currentProduct.variants) : [];

    if (hasBasePrice) {
        currentSize = 'default';
    } else if (variantKeys.length > 0) {
        currentSize = variantKeys[0]; // Auto-select first variant like 10ml
    } else {
        currentSize = 'default';
    }

    sizeBtns.forEach(btn => {
        const size = btn.dataset.size;
        btn.classList.remove('active', 'disabled');

        if (size === currentSize) {
            btn.classList.add('active');
        }

        const isStandard = size === 'default';
        const isVariantAvailable = currentProduct.variants && currentProduct.variants[size];

        if (isStandard && !hasBasePrice) {
            btn.classList.add('disabled');
        } else if (!isStandard && !isVariantAvailable) {
            btn.classList.add('disabled');
        }

        btn.onclick = () => {
            if (btn.classList.contains('disabled')) return;
            currentSize = size;
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateModalPrice();
        };
    });

    updateModalPrice();

    // Scent Notes display
    const notesContainer = document.querySelector('.modal-notes');
    if (notesContainer) {
        if (currentProduct.notes) {
            notesContainer.innerHTML = `
                <div class="note-item"><strong>Tête:</strong> ${currentProduct.notes.top}</div>
                <div class="note-item"><strong>Cœur:</strong> ${currentProduct.notes.heart}</div>
                <div class="note-item"><strong>Fond:</strong> ${currentProduct.notes.base}</div>
            `;
            notesContainer.style.display = 'block';
        } else {
            notesContainer.style.display = 'none';
        }
    }

    modalOverlay.classList.add('active');
}

function updateModalPrice() {
    const price = getSelectedPrice();
    modalPrice.textContent = `${price.toLocaleString()} DA`;
}

function closeModal() {
    modalOverlay.classList.remove('active');
    currentProduct = null;
    currentSize = 'default';
}

// UI Polish Tools
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container') || document.createElement('div');
    if (!container.parentElement) {
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function shakeCartIcon() {
    const icon = document.querySelector('.cart-icon');
    if (icon) {
        icon.classList.add('shake');
        setTimeout(() => icon.classList.remove('shake'), 500);
    }
}

// Rendering
function renderProducts() {
    const nGrid = document.getElementById('nouveautes-grid');
    const pGrid = document.getElementById('promotions-grid');
    const categoryGrid = document.getElementById('category-grid');
    const pageCategory = document.body.dataset.category; // e.g., 'men', 'women', 'unisex'

    if (nGrid) nGrid.innerHTML = '';
    if (pGrid) pGrid.innerHTML = '';
    if (categoryGrid) categoryGrid.innerHTML = '';

    products.forEach(p => {
        const badge = p.badge ? `<span class="badge">${p.badge}</span>` : '';
        const oldPrice = p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString()} DA</span>` : '';

        let displayPrice = p.price;
        if (!displayPrice && p.variants) {
            displayPrice = Object.values(p.variants)[0];
        }
        const priceString = displayPrice ? displayPrice.toLocaleString() + ' DA' : 'Contact us';

        const html = `
            <div class="product-card" data-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}">
                    ${badge}
                    <div class="product-overlay">
                        <button class="btn btn-secondary add-to-cart-btn">Acheter</button>
                        <button class="btn btn-white quick-view-btn"><i class="far fa-eye"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="brand">${p.brand}</p>
                    <p class="price">${oldPrice} ${priceString}</p>
                </div>
            </div>
        `;

        // If on a specific category page
        if (pageCategory) {
            if (p.gender === pageCategory && categoryGrid) {
                categoryGrid.insertAdjacentHTML('beforeend', html);
            }
        } else {
            // Main page logic
            if (p.category === 'nouveautes' && nGrid) nGrid.insertAdjacentHTML('beforeend', html);
            else if (p.category === 'promotions' && pGrid) pGrid.insertAdjacentHTML('beforeend', html);
        }
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => btn.onclick = handleAddToCart);
    document.querySelectorAll('.quick-view-btn').forEach(btn => btn.onclick = (e) => {
        const id = e.target.closest('.product-card').dataset.id;
        openModal(id);
    });
}

// Events
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    const hero = document.querySelector('.hero');
    if (hero) hero.style.backgroundPositionY = `${window.pageYOffset * 0.5}px`;
});

cartBtns.forEach(btn => btn.onclick = (e) => {
    if (e.target.closest('.fa-shopping-bag')) openCart();
    else closeCart();
});

if (closeModalBtn) closeModalBtn.onclick = closeModal;
if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
if (document.getElementById('modal-add-btn')) document.getElementById('modal-add-btn').onclick = handleAddToCart;

// WhatsApp Order with Customer Info
const whatsappBtn = document.querySelector('.checkout-btn');
const customerInfoOverlay = document.getElementById('customer-info-overlay');
const customerInfoForm = document.getElementById('customer-info-form');
const closeCustomerInfo = document.getElementById('close-customer-info');

if (whatsappBtn) {
    whatsappBtn.onclick = () => {
        if (cart.length > 0) {
            customerInfoOverlay.classList.add('active');
        } else {
            showToast('Votre panier est vide', 'error');
        }
    };
}

if (closeCustomerInfo) {
    closeCustomerInfo.onclick = () => {
        customerInfoOverlay.classList.remove('active');
    };
}

if (customerInfoForm) {
    customerInfoForm.onsubmit = (e) => {
        e.preventDefault();

        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const address = document.getElementById('customer-address').value;

        let message = '🛍️ *Nouvelle Commande*\n\n';
        message += '👤 *Informations Client*\n';
        message += `Nom: ${name}\n`;
        message += `Tél: ${phone}\n`;
        message += `Adresse: ${address}\n\n`;
        message += '📦 *Produits Commandés*\n';

        cart.forEach(item => {
            message += `\n• *${item.name}*\n`;
            message += `  Marque: ${item.brand}\n`;
            message += `  Quantité: ${item.quantity}\n`;
            message += `  Prix: ${item.price.toLocaleString()} DA\n`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n💰 *Total: ${total.toLocaleString()} DA*`;

        const whatsappUrl = `https://wa.me/213660484552?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        customerInfoOverlay.classList.remove('active');
        customerInfoForm.reset();
        showToast('Redirection vers WhatsApp...', 'success');

        setTimeout(() => {
            cart = [];
            updateCart();
            closeCart();
            localStorage.setItem('cart', JSON.stringify([]));
        }, 1000);
    };
}

// Search Functionality
const searchIcon = document.querySelector('.search-icon');
const searchOverlay = document.getElementById('search-overlay');
const closeSearchBtn = document.getElementById('close-search-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

const toggleSearch = (show) => {
    if (show) {
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    } else {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
        document.body.style.overflow = 'auto';
    }
};

if (searchIcon) {
    searchIcon.onclick = (e) => {
        e.preventDefault();
        toggleSearch(true);
    };
}

if (closeSearchBtn) closeSearchBtn.onclick = () => toggleSearch(false);

// Close on escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        toggleSearch(false);
    }
});

if (searchInput) {
    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.brand && p.brand.toLowerCase().includes(query))
        );

        renderSearchResults(filtered);
    };
}

function renderSearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Aucun résultat trouvé.</p>';
        return;
    }

    searchResults.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="openSearchResult(${p.id})">
            <img src="${p.image}" class="search-result-img">
            <div class="search-result-info">
                <h4>${p.name}</h4>
                <p>${p.brand || ''}</p>
                <p><strong>${(p.price || (p.variants ? Object.values(p.variants)[0] : 0)).toLocaleString()} DA</strong></p>
            </div>
        </div>
    `).join('');
}

window.openSearchResult = (id) => {
    toggleSearch(false);
    openModal(id);
};

const nForm = document.querySelector('.newsletter-form');
if (nForm) nForm.onsubmit = (e) => {
    e.preventDefault();
    const mail = e.target.querySelector('input').value;
    if (mail) { showToast(`Inscrit: ${mail}`, 'success'); e.target.reset(); }
};

// Sidebar Functionality
const hamburger = document.querySelector('.hamburger');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarLinks = document.querySelectorAll('.sidebar-links a');

const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
};

const quitSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scroll
};

if (hamburger) hamburger.onclick = openSidebar;
if (closeSidebar) closeSidebar.onclick = quitSidebar;
if (sidebarOverlay) sidebarOverlay.onclick = quitSidebar;

sidebarLinks.forEach(link => {
    link.onclick = quitSidebar;
});

// Init
window.onload = () => {
    const loader = document.getElementById('preloader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 1000);
    }
    renderProducts();
    renderCart();
};
