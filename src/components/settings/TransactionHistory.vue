<template>
  <div>
    <h2 class="content-title">My Order</h2>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="40" width="60" height="50" rx="8" fill="#17a2b8" opacity="0.3"/>
          <path d="M40 40 L45 30 L75 30 L80 40" stroke="#17a2b8" stroke-width="3" stroke-linecap="round" fill="none"/>
          <circle cx="50" cy="65" r="4" fill="#17a2b8"/>
          <circle cx="70" cy="65" r="4" fill="#17a2b8"/>
          <path d="M55 75 Q60 80 65 75" stroke="#17a2b8" stroke-width="2" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <h3 class="empty-title">No orders yet</h3>
      <p class="empty-text">When you buy an item, your order about it will appear here.</p>
      <button class="btn-shop-now" @click="goToShop">Shop now</button>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-header-left">
            <i class="fas fa-shopping-bag order-icon"></i>
            <span class="order-type">Shopping</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            <span class="order-status-badge" :class="`status-${order.status.toLowerCase()}`">
              {{ capitalizeStatus(order.status) }}
            </span>
            <span class="order-id">{{ order.orderNumber }}</span>
          </div>
        </div>

        <div class="order-body">
          <div class="order-items">
            <!-- Show first item -->
            <div v-if="order.items[0]" class="order-item">
              <img :src="order.items[0].image" :alt="order.items[0].name" class="item-image">
              <div class="item-details">
                <h4 class="item-name">{{ order.items[0].name }}</h4>
                <p class="item-info">
                  {{ order.items[0].quantity }} product × Rp{{ formatPrice(order.items[0].price) }}
                </p>
                <p class="item-size">{{ order.items[0].size }}</p>
              </div>
            </div>
            
            <!-- Show hidden items count -->
            <div v-if="order.items.length > 1" class="more-items">
              + {{ order.items.length - 1 }} more product{{ order.items.length > 2 ? 's' : '' }}
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">Total price</span>
              <span class="total-amount">Rp{{ formatPrice(order.total) }}</span>
            </div>
            <button class="btn-buy-again" @click="buyAgain(order)">
              Buy Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { Order } from '@/types';

const userStore = useUserStore();
const router = useRouter();
const { orders, loading } = storeToRefs(userStore);

onMounted(async () => {
  await userStore.fetchUserOrders();
});

const formatPrice = (price: number): string => {
  return userStore.formatPrice(price);
};

const formatDate = (dateString: string): string => {
  return userStore.formatDate(dateString);
};

const capitalizeStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const goToShop = () => {
  router.push('/products');
};

const buyAgain = async (order: Order) => {
  // Logic to add all items from order back to cart
  console.log('Buy again order:', order);
  
  // You can implement this to add items to cart
  // const cartStore = useCartStore();
  // for (const item of order.items) {
  //   await cartStore.addToCart({
  //     productId: item.productId,
  //     quantity: item.quantity,
  //     size: item.size
  //   });
  // }
  
  router.push('/cart');
};
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #17a2b8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
  max-width: 400px;
}

.btn-shop-now {
  padding: 12px 32px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-shop-now:hover {
  background: #138496;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.order-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.order-icon {
  color: #17a2b8;
  font-size: 18px;
}

.order-type {
  font-weight: 500;
  color: #1a1a1a;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.order-status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.status-done,
.status-completed,
.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-shipped,
.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-id {
  color: #999;
  font-size: 13px;
}

.order-body {
  padding: 20px;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  background: #f5f5f5;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.item-size {
  font-size: 13px;
  color: #999;
}

.more-items {
  font-size: 14px;
  color: #666;
  padding: 12px 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-buy-again {
  padding: 10px 24px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-buy-again:hover {
  background: #138496;
}

@media (max-width: 768px) {
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-buy-again {
    width: 100%;
  }
}
</style>