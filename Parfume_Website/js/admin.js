// Check Auth
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
});

// Initial Data (if empty)
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
        badge: "New"
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
        badge: "New"
    },
    {
        id: 3,
        name: "Side Effect",
        brand: "Initio Parfums",
        price: 38500,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "nouveautes",
        gender: "men",
        badge: "New"
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
        badge: "New"
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
        badge: "-20%"
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
        badge: "-15%"
    }
];

// Initialize Storage
if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(defaultProducts));
}

let products = JSON.parse(localStorage.getItem('products'));

// Element Refs
const productForm = document.getElementById('product-form');
const productTableBody = document.getElementById('product-table-body');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');

// Inputs
const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const brandInput = document.getElementById('brand');
const priceInput = document.getElementById('price');
const price10Input = document.getElementById('price-10ml');
const price20Input = document.getElementById('price-20ml');
const oldPriceInput = document.getElementById('old-price');
const imageInput = document.getElementById('image');
const image2Input = document.getElementById('image2');
const image3Input = document.getElementById('image3');
const categoryInput = document.getElementById('category');
const badgeInput = document.getElementById('badge');
const genderInput = document.getElementById('gender');

// Render Table
function renderTable() {
    productTableBody.innerHTML = '';
    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${p.image}" class="product-thumb" alt="${p.name}"></td>
            <td>${p.name}</td>
            <td>${p.brand}</td>
            <td>${p.price ? p.price.toLocaleString() + ' DA' : 'Variants Only'}</td>
            <td>${p.category} (${p.gender || 'unisex'})</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${p.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// Add / Update Product
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = idInput.value ? parseInt(idInput.value) : Date.now();

    // Collect Images
    const images = [imageInput.value];
    if (image2Input.value) images.push(image2Input.value);
    if (image3Input.value) images.push(image3Input.value);

    // Collect Variant Prices
    const variants = {};
    if (price10Input.value) variants['10ml'] = parseFloat(price10Input.value);
    if (price20Input.value) variants['20ml'] = parseFloat(price20Input.value);

    const newProduct = {
        id: id,
        name: nameInput.value,
        brand: brandInput.value,
        price: priceInput.value ? parseFloat(priceInput.value) : null,
        oldPrice: oldPriceInput.value ? parseFloat(oldPriceInput.value) : null,
        image: imageInput.value,
        images: images,
        variants: variants,
        category: categoryInput.value,
        gender: genderInput.value,
        badge: badgeInput.value || null
    };

    if (idInput.value) {
        // Update
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) products[index] = newProduct;
    } else {
        // Add
        products.push(newProduct);
    }

    localStorage.setItem('products', JSON.stringify(products));
    renderTable();
    resetForm();
});

// Edit Product
window.editProduct = function (id) {
    const p = products.find(p => p.id === id);
    if (!p) return;

    idInput.value = p.id;
    nameInput.value = p.name;
    brandInput.value = p.brand;
    priceInput.value = p.price;
    oldPriceInput.value = p.oldPrice || '';
    imageInput.value = p.image;
    categoryInput.value = p.category;
    genderInput.value = p.gender || 'unisex';
    badgeInput.value = p.badge || '';

    // Populate New Fields
    if (p.variants) {
        price10Input.value = p.variants['10ml'] || '';
        price20Input.value = p.variants['20ml'] || '';
    }

    if (p.images && p.images.length > 1) {
        image2Input.value = p.images[1] || '';
        image3Input.value = p.images[2] || '';
    } else {
        image2Input.value = '';
        image3Input.value = '';
    }

    formTitle.textContent = 'Edit Product';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo(0, 0);
};

// Delete Product
window.deleteProduct = function (id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderTable();
    }
};

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    productForm.reset();
    idInput.value = '';
    formTitle.textContent = 'Add New Product';
    cancelBtn.style.display = 'none';
}

// Init
renderTable();
