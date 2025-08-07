
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 6;

const productsDiv = document.getElementById('products');
const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');
const categoryFilter = document.getElementById('categoryFilter');
const sortPrice = document.getElementById('sortPrice');
const clearCartBtn = document.getElementById('clearCart');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMore');
const toast = document.getElementById('toast');
const toggleTheme = document.getElementById('toggleTheme');

const modal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalCategory = document.getElementById('modalCategory');

fetch('product.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts();
  });

showCart();


//This function is responsible for defining how the products will be displayed on the screen.
// It determines how many products will appear and what message will be shown if no products are available.
// The images are properly placed, and in case any image fails to load, a default fallback image is displayed.
// Below each image, the product title, price, and an "Add to Cart" button are shown.
// When the button is clicked, the selected product is added to the cart.

function renderProducts() {
  const filtered = applyFilters(products);
  const paginated = filtered.slice(0, currentPage * PRODUCTS_PER_PAGE);

  productsDiv.innerHTML = '';

  if (paginated.length === 0) {
    productsDiv.innerHTML = '<p style="color:red; font-size:17px; font-weight:bold;">No products found.</p>';
    return;
  }

  paginated.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';

    const img = document.createElement('img');
    img.src = p.image;
    img.width = 100;
    img.alt = p.title;
    img.onerror = () => img.src = 'default.jpg';
    img.addEventListener('click', () => openModal(p));

    const title = document.createElement('b');
    title.className = 'b';
    title.textContent = p.title;

    const price = document.createElement('p');
    price.className = 'p';
    price.textContent = `$${p.price}`;

    const button = document.createElement('button');
    button.className = 'button';
    button.textContent = 'Add to Cart';
    button.addEventListener('click', () => {
      addToCart(p.id);
      showToast(`${p.title} added to cart`);
    });

    div.appendChild(img);
    div.appendChild(document.createElement('br'));
    div.appendChild(title);
    div.appendChild(price);
    div.appendChild(button);

    productsDiv.appendChild(div);
  });

  loadMoreBtn.style.display = (filtered.length > paginated.length) ? 'block' : 'none';

}

// This function handles the case when no products are added to the cart.
// It ensures the cart appears empty and the total price is shown as zero.
// If a product is added to the cart, two buttons are displayed: "Increase" and "Decrease".
// Clicking the "Increase" button increments the product quantity one by one.
// Clicking the "Decrease" button reduces the quantity by one each time.
// The total price is dynamically updated based on the current quantity.


function showCart() {
  cartDiv.innerHTML = '';
  if (cart.length === 0) {
    cartDiv.innerHTML = '<p style="color:red; font-size:17px; font-weight:bold;">Your cart is empty.</p>';
    totalDiv.textContent = 'Total: $0';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';

    div.innerHTML = `
      <b>${item.title}</b><br>
      $${item.price} x ${item.qty} = $${item.price * item.qty}
    `;

    const inc = document.createElement('button');
    inc.innerHTML = '<i class="fa-solid fa-plus"></i>';
    inc.onclick = () => {
      item.qty++;
      saveCart();
      showCart();
    };

    const dec = document.createElement('button');
    dec.innerHTML = '<i class="fa-solid fa-minus"></i>';
    dec.onclick = () => {
      if (item.qty > 1) {
        item.qty--;
      } else {
        cart = cart.filter(i => i.id !== item.id);
      }
      saveCart();
      showCart();
    };

    div.appendChild(document.createElement('br'));
    div.appendChild(inc);
    div.appendChild(dec);

    cartDiv.appendChild(div);
    total += item.price * item.qty;
  });

  totalDiv.textContent = `Total: $${total}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// This function resets the product image to its original size and repositions it to the center.
// It ensures the zoom level is normalized and the image is displayed properly in its intended location.

function openModal(product) {
  zoomScale = 1;
  modalImage.style.transform = 'scale(1)';
  modalImage.style.transformOrigin = 'center center';

  modalImage.src = product.image;
  modalTitle.textContent = product.title;
  modalPrice.textContent = `Price: $${product.price}`;
  modalCategory.textContent = `Category: ${product.category}`;
  modal.style.display = 'block';
}
// These variables are used to control the zoom and pan behavior of the image.
//
// 'zoomScale = 1' means the image is in its default (non-zoomed) state.
//
// 'offsetX' and 'offsetY' represent the horizontal and vertical shift when the image is zoomed in,
// allowing the user to move (pan) the image left or right, and up or down.

let zoomScale = 1;
let offsetX = 0;
let offsetY = 0;


// This function handles the zoom behavior in a detailed and dynamic way.
// It calculates where the zoom should start based on the position of the mouse
// and the dimensions (height and width) of the product image.
//
// When the user starts zooming from a specific point, the zoom will originate exactly from that location,
// ensuring a natural and smooth zooming experience.
//
// Additionally, the image will move (pan) in real-time as the mouse moves,
// allowing the user to shift the zoomed image in any direction — left, right, up, or down.

modalImage.addEventListener('mousemove', function (e) {
  if (zoomScale === 1) return;  // This means that mouse movement will have no effect when the image is not zoomed in.

  const rect = modalImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const percentX = x / rect.width;
  const percentY = y / rect.height;

  offsetX = (percentX * (zoomScale - 1)) * 100;
  offsetY = (percentY * (zoomScale - 1)) * 100;

  modalImage.style.transformOrigin = `${percentX * 100}% ${percentY * 100}%`;
  modalImage.style.transform = `scale(${zoomScale})`;
});

// This function enables zooming the product image using the mouse wheel.
//
// It prevents the default scroll behavior so that zooming only affects the image.
// Based on the scroll direction (up or down), the zoom level is increased or decreased.
//
// The zoom scale is clamped between 1 (no zoom) and 5 (maximum zoom)
// to prevent excessive zoom in or out that could break the layout.
//
// Finally, the zoom is applied smoothly using CSS transform on the image.

modalImage.addEventListener('wheel', function (e) {
  e.preventDefault();

  const scaleAmount = 0.1;

  if (e.deltaY < 0) {
    zoomScale += scaleAmount;
  } else {
    zoomScale -= scaleAmount;
  }

  zoomScale = Math.min(Math.max(1, zoomScale), 5);

  modalImage.style.transform = `scale(${zoomScale})`;
});

modalImage.addEventListener('click', () => {
  zoomScale = 1;
  modalImage.style.transform = 'scale(1)';
  modalImage.style.transformOrigin = 'center center';
});

// When the close button is clicked, the toast notification will be dismissed.
// The toast will also close automatically if the user clicks anywhere outside the toast (on the window).

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Each time the "Add to Cart" button is clicked, one instance of the product is added to the cart.

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}


/*
  This function filters and displays products based on user interaction:

  - When the user types in the search input, it shows only the products 
    whose titles match the entered keyword.

  - When a category button is clicked and a category is selected, 
    it displays only the products that belong to that selected category.

  - The sort functionality allows the user to sort products by price, 
    either from low to high or high to low, based on their selection.
*/

function applyFilters(list) {
  let filtered = [...list];

  const search = searchInput.value.toLowerCase();
  if (search) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(search));
  }

  const cat = categoryFilter.value;
  if (cat !== 'all') {
    filtered = filtered.filter(p => p.category === cat);
  }

  const sort = sortPrice.value;
  if (sort === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

categoryFilter.addEventListener('change', () => {
  currentPage = 1;
  renderProducts();
});

sortPrice.addEventListener('change', () => {
  currentPage = 1;
  renderProducts();
});

searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderProducts();
});

loadMoreBtn.addEventListener('click', (e) => {
  e.preventDefault();
  currentPage++;
  renderProducts();

});

clearCartBtn.addEventListener('click', () => {
  cart = [];
  saveCart();
  showCart();
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleTheme.innerHTML = document.body.classList.contains('dark') ? '<i class="fa-solid fa-sun"></i> Light Mode' : '<i class="fa-solid fa-moon"></i> Dark Mode';
});


