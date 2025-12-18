<template>
  <section id="wishlist-page" class="container py-5">
    <div class="header">
      <h1 class="title">Favorite items</h1>
      <span v-if="wishlistStore.items.length > 0" class="item-count">
        {{ wishlistStore.items.length }} Items
      </span>
      <span v-else class="empty-subtitle">
        You don't have any favorite item yet
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="wishlistStore.items.length === 0" class="empty-state">
      <div class="empty-icon">
        <img src="/images/empty-wishlist.png" alt="">
      </div>
      
      <h2 class="empty-title">No favorite items yet</h2>
      <p class="empty-description">
        When add item to favorite, the item will appear<br/>on the favorite list.
      </p>
      
      <button class="find-products-btn" @click="goToProducts">
        Find Products
      </button>
    </div>

    <!-- Wishlist Grid -->
    <div v-else class="wishlist-grid">
      <div
        v-for="item in wishlistStore.items"
        :key="item.id"
        class="product-card"
        @mouseenter="hoveredItem = item.id"
        @mouseleave="hoveredItem = null"
      >
        <div class="image-container">
          <img
            :src="item.image || item.images?.[0]"
            :alt="item.name"
            class="product-image"
            @click="router.push(`/detail/${item.id}`)"
          />
          
          <button
            class="wishlist-btn"
            :class="{ 'wishlist-btn-hover': hoveredItem === item.id }"
            @click="removeFromWishlist(item.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>

          <button
            v-if="hoveredItem === item.id"
            class="add-to-cart-btn"
            @click="addToCart(item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            Add to Cart
          </button>
        </div>

        <div class="card-content" @click="router.push(`/detail/${item.id}`)">
          <p class="price">Rp{{ formatPrice(item.price) }}</p>
          <h3 class="product-name">{{ item.name }}</h3>
          
          <div class="card-footer">
            <span class="size">{{ item.size }} / {{ item.category?.charAt(0) || 'M' }}</span>
            <div class="wishlist-count">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              <span>{{ item.wishlistCount || 12 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
        <div class="success-modal" @click.stop>
          <div class="modal-icon">
            <img src="/images/add-to-cart.png" alt="Add to Cart" width="100" height="100">
          </div>
          
          <h3 class="modal-title">Product successfully added to cart</h3>
          <p class="modal-text">
            Product successfully added to cart. Check now on the cart or continue shopping.
          </p>
          
          <div class="modal-actions">
            <button class="btn-continue" @click="closeModal">
              Continue shopping
            </button>
            <button class="btn-cart-go" @click="goToCart">
              Go to cart
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';

const router = useRouter();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const showSuccessModal = ref(false);
const addingToCart = ref(false);

const hoveredItem = ref<string | null>(null);

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return numPrice.toLocaleString('id-ID');
};

const removeFromWishlist = (productId: string): void => {
  wishlistStore.removeFromWishlist(productId);
};

const addToCart = async (product: Product) => {
  addingToCart.value = true;

  try {
      await cartStore.addItem(product);
      showSuccessModal.value = true;
    } catch (err: any) {
      console.error('Add to cart error:', err);
    } finally {
      addingToCart.value = false;
    }
};

const goToProducts = (): void => {
  router.push('/products');
};

const closeModal = () => {
  showSuccessModal.value = false;
};

const goToCart = () => {
  showSuccessModal.value = false;
  router.push('/cart');
};

onMounted(() => {
  // Load wishlist items when component mounts
  wishlistStore.loadWishlist();
});
</script>

<style scoped>
#wishlist-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  min-height: 70vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.item-count {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.find-products-btn {
  padding: 0.875rem 2rem;
  background: #17A2B8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.find-products-btn:hover {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Wishlist Grid */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}

/* Product Card */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f9fafb;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 2;
}

.wishlist-btn:hover,
.wishlist-btn-hover {
  transform: scale(1.1);
}

.add-to-cart-btn {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  padding: 10px;
  background: #17A2B8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideUp 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #138496;
  transform: translateY(-2px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card Content */
.card-content {
  padding: 1rem;
}

.price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

.wishlist-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .empty-state {
    min-height: 400px;
  }

  .empty-icon svg {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 576px) {
  #wishlist-page {
    padding: 1.5rem 1rem;
  }

  .wishlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-content {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.8125rem;
    height: 36px;
  }

  .price {
    font-size: 1rem;
  }
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.success-modal {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

.modal-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.modal-text {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-continue, .btn-cart-go {
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
  border: 2px solid #1A9B9B;
  color: #1A9B9B;
}

.btn-continue:hover {
  background: #f0f9f9;
}

.btn-cart-go {
  background: #1A9B9B;
  color: white;
}

.btn-cart-go:hover {
  background: #158080;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 155, 155, 0.3);
}
</style>