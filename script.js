const PRODUCTS = [
    {
        id: 1,
        title: "Беспроводные наушники",
        price: 3490,
        image: "https://i.pinimg.com/736x/e9/58/e2/e958e20c8760a8629328244827522fab.jpg"
    },
    {
        id: 2,
        title: "Механическая клавиатура",
        price: 5990,
        image: "https://i.pinimg.com/736x/1e/2f/29/1e2f299e62ea3576460d6e32c737442c.jpg"
    },
    {
        id: 3,
        title: "Игровая мышь",
        price: 2490,
        image: "https://i.pinimg.com/736x/41/21/4a/41214abb5fae3b72a561ee23cc91b67a.jpg"
    },
    {
        id: 4,
        title: "Умные часы",
        price: 7990,
        image: "https://i.pinimg.com/736x/87/6d/7c/876d7c492ac6af567c579b5c9cc51b93.jpg"
    },
    {
        id: 5,
        title: "Рюкзак для ноутбука",
        price: 2990,
        image: "https://i.pinimg.com/736x/5f/aa/ae/5faaae6b30a0d2a38b8c527ab7141a3c.jpg"
    },
    {
        id: 6,
        title: "Портативная колонка",
        price: 4190,
        image: "https://i.pinimg.com/1200x/8a/de/85/8ade853c8e5d4106457ad08f9431c0cc.jpg"
    }
];

const STORAGE_KEY = "shop_cart_data";

let cart = loadCart();

const catalogEl = document.getElementById("catalog-list");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total-price");
const cartCountEl = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");
const orderModal = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const orderForm = document.getElementById("order-form");
const successMsg = document.getElementById("order-success-msg");

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Ошибка чтения localStorage", e);
        return [];
    }
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function renderCatalog() {
    catalogEl.innerHTML = PRODUCTS.map(product => `
        <article class="product-card">
          <img class="product-card__img" src="${product.image}" alt="${product.title}" loading="lazy" />
          <h3 class="product-card__title">${product.title}</h3>
          <div class="product-card__price">${product.price.toLocaleString("ru-RU")} ₽</div>
          <button class="btn btn--primary" type="button" onclick="addToCart(${product.id})">
            Добавить в корзину
          </button>
        </article>
      `).join("");
}

window.addToCart = function(productId) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return;
      cart.push({ ...product, quantity: 1 });
    }
    updateCart();
  
    const cartPanel = document.getElementById("cart-panel");
    if (cartPanel) {
      cartPanel.classList.remove("cart--highlight");
      void cartPanel.offsetWidth;
      cartPanel.classList.add("cart--highlight");
  
      // Если экран узкий, плавно скроллим к ней
      if (window.innerWidth <= 900) {
        cartPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

window.changeQuantity = function (productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    updateCart();
};

window.removeFromCart = function (productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
};

function updateCart() {
    saveCart();

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCountEl.textContent = totalQuantity;
    cartTotalEl.textContent = `${totalPrice.toLocaleString("ru-RU")} ₽`;
    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `<p class="cart__empty">Корзина пуста</p>`;
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item__info">
            <div class="cart-item__title">${item.title}</div>
            <div class="cart-item__price">${item.price.toLocaleString("ru-RU")} ₽ × ${item.quantity}</div>
          </div>
          <div class="cart-item__controls">
            <button class="btn-counter" type="button" onclick="changeQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="btn-counter" type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
            <button class="btn-remove" type="button" onclick="removeFromCart(${item.id})" aria-label="Удалить">&times;</button>
          </div>
        </div>
      `).join("");
}

checkoutBtn.addEventListener("click", () => {
    orderModal.showModal();
    successMsg.hidden = true;
    orderForm.reset();
    orderForm.hidden = false;
});

closeModalBtn.addEventListener("click", () => {
    orderModal.close();
});

orderModal.addEventListener("click", (e) => {
    if (e.target === orderModal) {
        orderModal.close();
    }
});

orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
    }

    // Очищаем корзину после успешного заказа
    cart = [];
    updateCart();

    // Показываем сообщение об успешном оформлении
    orderForm.hidden = true;
    successMsg.hidden = false;

    setTimeout(() => {
        orderModal.close();
    }, 2500);
});

document.getElementById("cart-toggle-btn").addEventListener("click", () => {
    document.getElementById("cart-panel").scrollIntoView({ behavior: "smooth" });
});

renderCatalog();
updateCart();