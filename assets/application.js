// Translation Earbud Store - Main JavaScript

// ===== THEME INITIALIZATION ===== 
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  initializeCart();
  initializeLazyLoading();
  initializeAnimations();
});

// ===== THEME FUNCTIONS =====
function initializeTheme() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.setAttribute('aria-expanded', 
        this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
      );
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

// ===== CART FUNCTIONALITY =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function initializeCart() {
  updateCartDisplay();
  
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', handleAddToCart);
  });

  // Cart modal controls
  const cartIcon = document.querySelector('.cart-icon');
  const cartModal = document.querySelector('.cart-modal');
  const cartClose = document.querySelector('.cart-close');
  
  if (cartIcon && cartModal) {
    cartIcon.addEventListener('click', () => {
      cartModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      trapFocus(cartModal);
    });
  }
  
  if (cartClose) {
    cartClose.addEventListener('click', closeCart);
  }
  
  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        closeCart();
      }
    });
  }

  // Escape key to close cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartModal.classList.contains('active')) {
      closeCart();
    }
  });
}

function handleAddToCart(e) {
  e.preventDefault();
  
  const productCard = e.target.closest('.product-showcase, .product-card');
  if (!productCard) return;
  
  const product = {
    id: 'translator-earbuds',
    title: 'AI Translation Earbuds',
    price: 99.99,
    image: productCard.querySelector('img')?.src || '',
    quantity: parseInt(productCard.querySelector('.quantity-input')?.value || 1)
  };
  
  addToCart(product);
  
  // Show success feedback
  showNotification('Product added to cart!', 'success');
}

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push({...product});
  }
  
  saveCart();
  updateCartDisplay();
  renderCartItems();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartDisplay();
  renderCartItems();
  showNotification('Item removed from cart', 'info');
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      saveCart();
      updateCartDisplay();
      renderCartItems();
    }
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
  const cartCount = document.querySelector('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function renderCartItems() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotal = document.querySelector('.cart-total-amount');
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    if (cartTotal) cartTotal.textContent = '$0.00';
    return;
  }
  
  const cartHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="quantity-controls">
          <button class="quantity-btn quantity-decrease" aria-label="Decrease quantity">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" aria-label="Quantity">
          <button class="quantity-btn quantity-increase" aria-label="Increase quantity">+</button>
          <button class="remove-item" aria-label="Remove item">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
  
  cartItemsContainer.innerHTML = cartHTML;
  
  // Add event listeners for cart controls
  cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('.cart-item').dataset.id;
      const item = cart.find(item => item.id === productId);
      if (item) updateQuantity(productId, item.quantity - 1);
    });
  });
  
  cartItemsContainer.querySelectorAll('.quantity-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('.cart-item').dataset.id;
      const item = cart.find(item => item.id === productId);
      if (item) updateQuantity(productId, item.quantity + 1);
    });
  });
  
  cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = e.target.closest('.cart-item').dataset.id;
      const newQuantity = parseInt(e.target.value);
      updateQuantity(productId, newQuantity);
    });
  });
  
  cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('.cart-item').dataset.id;
      removeFromCart(productId);
    });
  });
  
  // Update total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function closeCart() {
  const cartModal = document.querySelector('.cart-modal');
  if (cartModal) {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
    removeFocusTrap();
  }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 3000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove notification
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.spec-card, .product-showcase, .feature-item').forEach(el => {
    observer.observe(el);
  });
}

// ===== ACCESSIBILITY HELPERS =====
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
  
  firstElement.focus();
}

function removeFocusTrap() {
  // Focus trap will be removed when modal is closed
}

// ===== CHECKOUT SIMULATION =====
function simulateCheckout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!', 'error');
    return;
  }
  
  showNotification('Redirecting to checkout...', 'info');
  
  // Simulate checkout process
  setTimeout(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Order total: $${total.toFixed(2)} - This is a demo!`, 'success');
  }, 1500);
}

// ===== FORM VALIDATION =====
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    const errorElement = field.nextElementSibling;
    
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = 'This field is required';
      }
    } else {
      field.classList.remove('error');
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
      }
    }
  });
  
  return isValid;
}

// ===== PRODUCT QUANTITY CONTROLS =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.quantity-controls').forEach(controls => {
    const decreaseBtn = controls.querySelector('.quantity-decrease');
    const increaseBtn = controls.querySelector('.quantity-increase');
    const input = controls.querySelector('.quantity-input');
    
    if (decreaseBtn && increaseBtn && input) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        if (currentValue > 1) {
          input.value = currentValue - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
      
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        input.value = currentValue + 1;
        input.dispatchEvent(new Event('change'));
      });
    }
  });
});

// ===== GLOBAL FUNCTIONS =====
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.simulateCheckout = simulateCheckout;
window.showNotification = showNotification; 