<template>
  <section id="cart-page" class="container py-5">
    <!-- Loading State -->
    <div v-if="cartStore.loading && !cartStore.items.length" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Cart with Items -->
    <div v-else-if="cartStore.items.length > 0" class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="cart-header">
          <h2 class="cart-title">Cart</h2>
          <span class="item-count">{{ cartStore.totalItems }} Items</span>
        </div>

        <!-- Shipping Info -->
        <div class="shipping-info">
          <i class="fas fa-map-marker-alt"></i>
          <span>Shipping to <strong>{{ shippingLocation }}</strong></span>
        </div>

        <!-- Cart Items -->
        <div class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <img :src="item.image || item.images?.[0]" :alt="item.name">
            </div>

            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-meta">
                <span class="item-size">{{ item.size }}</span>
              </div>
              <div class="item-price">Rp{{ formatPrice(item.price) }}</div>
            </div>

            <div class="item-actions">
              <button 
                class="remove-btn" 
                @click="removeItem(item.id)"
                :disabled="removing === item.id"
              >
                {{ removing === item.id ? 'Removing...' : 'Remove' }}
              </button>

              <div class="quantity-controls">
                <button 
                  class="qty-btn" 
                  @click="decreaseQuantity(item)"
                  :disabled="updating === item.id || item.quantity <= 1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg>
                </button>
                <input 
                  type="number" 
                  class="qty-input" 
                  :value="item.quantity"
                  @input="handleQuantityInput($event, item)"
                  @blur="handleQuantityBlur(item)"
                  :disabled="updating === item.id"
                  min="1"
                  max="99"
                >
                <button 
                  class="qty-btn" 
                  @click="increaseQuantity(item)"
                  :disabled="updating === item.id"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="col-12 col-lg-4">
        <div class="order-summary">
          <h3 class="summary-title">Order Summary</h3>
          
          <div class="summary-row">
            <span class="summary-label">{{ cartStore.totalItems }} Items</span>
            <span class="summary-value">Rp{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <div class="summary-note">
            Not include shipping fee
          </div>

          <div class="summary-total">
            <span class="total-label">Total</span>
            <span class="total-value">Rp{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <button 
            class="checkout-btn" 
            @click="goToCheckout"
            :disabled="cartStore.loading"
          >
            Checkout({{ cartStore.items.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="empty-cart">
      <div class="empty-icon">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="20" y="35" width="80" height="60" rx="8" fill="#17A2B8" opacity="0.1"/>
          <rect x="30" y="45" width="60" height="40" rx="6" fill="#17A2B8" opacity="0.2"/>
          <circle cx="45" cy="85" r="8" fill="#17A2B8"/>
          <circle cx="75" cy="85" r="8" fill="#17A2B8"/>
          <path d="M35 35L45 65H85L95 35" stroke="#17A2B8" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <h2 class="empty-title">Your cart still empty</h2>
      <p class="empty-description">
        Find your favorite items and add to cart<br>before check out.
      </p>

      <button class="find-products-btn" @click="router.push('/products')">
        Find Products
      </button>
    </div>

    <!-- Other Products Section -->
    <div class="other-products-section mt-5">
      <h3 class="section-title mb-4">Other Product</h3>
      <div class="row g-4">
        <div 
          v-for="product in otherProducts" 
          :key="product.id"
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="delete-modal" @click.stop>
          <div class="modal-icon-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          
          <h3 class="modal-title">Remove Item?</h3>
          <p class="modal-text">
            Are you sure you want to remove "{{ itemToDelete?.name }}" from your cart?
          </p>
          
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeDeleteModal" :disabled="removing !== null">
              Cancel
            </button>
            <button class="btn-delete" @click="confirmDelete" :disabled="removing !== null">
              {{ removing ? 'Removing...' : 'Yes, Remove' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/common/ProductCard.vue';
import type { CartItem } from '@/types';

const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();

const removing = ref<string | null>(null);
const updating = ref<string | null>(null);
const shippingLocation = ref('PT. Timedoor Indonesia');
const showDeleteModal = ref(false);
const itemToDelete = ref<CartItem | null>(null);
const pendingQuantity = ref<{ [key: string]: number }>({});

const otherProducts = computed(() => {
  return productStore.products.slice(0, 6);
});

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return numPrice.toLocaleString('id-ID');
};

const removeItem = (productId: string) => {
  const item = cartStore.items.find(i => i.id === productId);
  if (item) {
    itemToDelete.value = item;
    showDeleteModal.value = true;
  }
};

const closeDeleteModal = () => {
  if (removing.value) return; // Prevent closing while removing
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  
  removing.value = itemToDelete.value.id;
  try {
    await cartStore.removeItem(itemToDelete.value.id);
    showDeleteModal.value = false;
    itemToDelete.value = null;
  } catch (error) {
    console.error('Failed to remove item:', error);
    alert('Failed to remove item. Please try again.');
  } finally {
    removing.value = null;
  }
};

const increaseQuantity = async (item: CartItem) => {
  updating.value = item.id;
  try {
    await cartStore.updateQuantity(item.id, item.quantity + 1);
  } catch (error) {
    console.error('Failed to update quantity:', error);
    alert('Failed to update quantity. Please try again.');
  } finally {
    updating.value = null;
  }
};

const decreaseQuantity = async (item: CartItem) => {
  if (item.quantity > 1) {
    updating.value = item.id;
    try {
      await cartStore.updateQuantity(item.id, item.quantity - 1);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      updating.value = null;
    }
  }
};

const handleQuantityInput = (event: Event, item: CartItem) => {
  const input = event.target as HTMLInputElement;
  const value = parseInt(input.value);
  
  // Store pending value
  if (!isNaN(value) && value > 0 && value <= 99) {
    pendingQuantity.value[item.id] = value;
  }
};

const handleQuantityBlur = async (item: CartItem) => {
  const newQuantity = pendingQuantity.value[item.id];
  
  if (newQuantity && newQuantity !== item.quantity) {
    updating.value = item.id;
    try {
      await cartStore.updateQuantity(item.id, newQuantity);
      delete pendingQuantity.value[item.id];
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
      // Reset input to current quantity
      const input = document.querySelector(`input[value="${newQuantity}"]`) as HTMLInputElement;
      if (input) input.value = item.quantity.toString();
    } finally {
      updating.value = null;
    }
  }
};

const goToCheckout = () => {
  router.push('/checkout');
};

onMounted(async () => {
  // Check if user is authenticated
  
  // if (!authStore.isAuthenticated) {
  //   router.push('/login');
  //   return;
  // }

  // Load cart and products
  await cartStore.loadCart();
  await productStore.fetchProducts();
});
</script>

<style scoped>
#cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 70vh;
}

/* Cart Header */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cart-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.item-count {
  font-size: 1rem;
  color: #6b7280;
}

/* Shipping Info */
.shipping-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #374151;
}

.shipping-info i {
  color: #17A2B8;
}

.shipping-info strong {
  color: #111827;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.item-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-size {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #6b7280;
}

.item-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin-top: auto;
}

/* Item Actions */
.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.3s ease;
  font-weight: 500;
}

.remove-btn:hover:not(:disabled) {
  color: #dc2626;
  text-decoration: underline;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quantity Controls */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.25rem;
  background: white;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.qty-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  text-align: center;
  border: none;
  font-weight: 600;
  color: #111827;
  background: transparent;
  font-size: 0.95rem;
  padding: 0.25rem;
}

.qty-input:focus {
  outline: none;
  background: #f9fafb;
  border-radius: 4px;
}

/* Remove spinner from number input */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input[type=number] {
  -moz-appearance: textfield;
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 100px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-label {
  color: #6b7280;
  font-size: 0.95rem;
}

.summary-value {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
}

.summary-note {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-bottom: 1.5rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.total-label {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #17A2B8;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkout-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.empty-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.find-products-btn {
  padding: 1rem 2rem;
  background: #17A2B8;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.find-products-btn:hover {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Other Products Section */
.other-products-section {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

/* Delete Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.delete-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-icon-warning {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-warning svg {
  font-size: 2rem;
  color: #ef4444;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.modal-text {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel, .btn-delete {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-cancel:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 991px) {
  .cart-item {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 576px) {
  .cart-title {
    font-size: 1.5rem;
  }

  .item-image {
    width: 80px;
    height: 80px;
  }

  .item-name {
    font-size: 0.95rem;
  }

  .item-price {
    font-size: 1rem;
  }

  .empty-cart {
    padding: 3rem 1rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>