<template>
  <section id="checkout-page" class="container py-5">
    <div class="row g-4">
      <!-- Left Column: Order Details -->
      <div class="col-12 col-lg-7">
        <!-- Order Items -->
        <div class="section-card">
          <h2 class="section-title">Order</h2>
          
          <div class="order-items">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="order-item"
            >
              <div class="item-image">
                <img :src="item.image || item.images?.[0]" :alt="item.name">
              </div>
              
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-size">{{ item.size }}</p>
                <p class="item-price">Rp{{ formatPrice(item.price) }}</p>
              </div>
              
              <div class="item-quantity">
                x{{ item.quantity }}
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="section-card">
          <h2 class="section-title">Address</h2>
          
          <div class="address-card">
            <div class="address-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="address-content">
              <h3 class="address-name">{{ shippingAddress.name }}</h3>
              <p class="address-detail">{{ shippingAddress.address }}</p>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="section-card">
          <h2 class="section-title">Delivery details</h2>
          
          <div class="delivery-card">
            <div class="delivery-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck-icon lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
            <div class="delivery-content">
              <h3 class="delivery-name">{{ deliveryMethod.name }}</h3>
              <p class="delivery-price">Rp{{ formatPrice(deliveryMethod.price) }}</p>
              <p class="delivery-time">
                <i class="far fa-clock"></i>
                {{ deliveryMethod.estimatedTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="section-card">
          <h2 class="section-title">Payment Method</h2>
          
          <div class="payment-card">
            <div class="payment-icon">
              <img src="/images/visa.png" alt="VISA" class="visa-logo">
            </div>
            <div class="payment-content">
              <p class="card-number">{{ paymentMethod.cardNumber }}</p>
              <div class="card-details">
                <span>{{ paymentMethod.expiry }}</span>
                <span>{{ paymentMethod.cvv }}</span>
              </div>
              <p class="card-holder">
                <i class="far fa-credit-card"></i>
                {{ paymentMethod.holderName }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="col-12 col-lg-5">
        <div class="summary-card sticky-summary">
          <h3 class="summary-title">Order summary</h3>
          
          <div class="summary-row">
            <span class="summary-label">Order</span>
            <span class="summary-value">Rp{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Protection fee</span>
            <span class="summary-value">Rp{{ formatPrice(protectionFee) }}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Shipping</span>
            <span class="summary-value">Rp{{ formatPrice(deliveryMethod.price) }}</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-total">
            <span class="total-label">Total to pay</span>
            <span class="total-value">Rp{{ formatPrice(totalToPay) }}</span>
          </div>

          <button 
            class="order-btn" 
            @click="placeOrder"
            :disabled="orderStore.loading"
          >
            {{ orderStore.loading ? 'Processing...' : 'Order Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="success-modal" @click.stop>
          <div class="success-icon">
            <img src="/images/payment-success.png" alt="Payment Success" width="120" height="120">
          </div>
          
          <h3 class="success-title">Order #{{ orderNumber }} placed successfully</h3>
          <p class="success-text">
            Thank you for do online shopping at Vintage.<br>
            You can track and see your order on transaction history menu.
          </p>
          
          <div class="success-actions">
            <button class="btn-continue" @click="continueShopping">
              Continue shopping
            </button>
            <button class="btn-history" @click="goToHistory">
              Go to History Transaction
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
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();

const showSuccessModal = ref(false);
const orderNumber = ref('');

// Shipping Address (mock data - should come from user profile)
const shippingAddress = ref({
  name: 'PT. Timedoor Indonesia',
  address: 'Jl. Tukad Yeh Aya IX No.46, Renon, Denpasar Selatan, Kota Denpasar, Bali 80226'
});

// Delivery Method (mock data)
const deliveryMethod = ref({
  name: 'Fedex Express Shipping',
  price: 15000,
  estimatedTime: 'Home delivery in 1-3 working days'
});

// Payment Method (mock data - should come from user profile)
const paymentMethod = ref({
  cardNumber: '0819283210323',
  expiry: '23/12',
  cvv: '123',
  holderName: 'Jack Daniel Arya'
});

// Fees
const protectionFee = ref(20000);

// Computed
const totalToPay = computed(() => {
  return cartStore.totalPrice + protectionFee.value + deliveryMethod.value.price;
});

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return numPrice.toLocaleString('id-ID');
};

const placeOrder = async () => {
  try {
    const orderData = {
      items: cartStore.items,
      shippingAddress: shippingAddress.value,
      deliveryMethod: deliveryMethod.value,
      paymentMethod: {
        type: 'credit_card',
        last4: paymentMethod.value.cardNumber.slice(-4)
      },
      subtotal: cartStore.totalPrice,
      protectionFee: protectionFee.value,
      shippingFee: deliveryMethod.value.price,
      total: totalToPay.value
    };

    const order = await orderStore.createOrder(orderData);
    
    if (order) {
      orderNumber.value = order.orderNumber;
      showSuccessModal.value = true;
      
      // Clear cart after successful order
      cartStore.clearCart();
    }
  } catch (error) {
    console.error('Order failed:', error);
    alert('Failed to place order. Please try again.');
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

const continueShopping = () => {
  showSuccessModal.value = false;
  router.push('/products');
};

const goToHistory = () => {
  showSuccessModal.value = false;
  router.push('/profile/transactions');
};

onMounted(() => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  // Check if cart is empty
  if (cartStore.items.length === 0) {
    router.push('/cart');
    return;
  }
});
</script>

<style scoped>
#checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 70vh;
}

/* Section Cards */
.section-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.item-image {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.item-size {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.item-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.item-quantity {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
}

/* Address Card */
.address-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.address-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(23, 162, 184, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-icon svg {
    color: #17A2B8;
    width: 20px;
    height: 20px;
}

.address-content {
  flex: 1;
}

.address-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.address-detail {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Delivery Card */
.delivery-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.delivery-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(23, 162, 184, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delivery-icon svg {
    color: #17A2B8;
    width: 20px;
    height: 20px;
}

.delivery-content {
  flex: 1;
}

.delivery-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.delivery-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.delivery-time {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Payment Card */
.payment-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.payment-icon {
  flex-shrink: 0;
  width: 60px;
  height: 40px;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}

.visa-logo {
  width: 40px;
  height: auto;
}

.payment-content {
  flex: 1;
}

.card-number {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.5px;
}

.card-details {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.card-holder {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Order Summary */
.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.sticky-summary {
  position: sticky;
  top: 100px;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-label {
  font-size: 0.95rem;
  color: #6b7280;
}

.summary-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.order-btn {
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

.order-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success Modal */
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

.success-modal {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.success-icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.success-text {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-continue, .btn-history {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-continue {
  background: transparent;
  border: 2px solid #17A2B8;
  color: #17A2B8;
}

.btn-continue:hover {
  background: #f0f9f9;
}

.btn-history {
  background: #17A2B8;
  color: white;
}

.btn-history:hover {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Responsive */
@media (max-width: 991px) {
  .sticky-summary {
    position: static;
  }
}

@media (max-width: 576px) {
  .section-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .order-item {
    padding: 0.75rem;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  .success-modal {
    padding: 2rem 1.5rem;
  }

  .success-title {
    font-size: 1.1rem;
  }
}
</style>