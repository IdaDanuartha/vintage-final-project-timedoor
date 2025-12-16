<template>
  <section id="product-detail" class="container py-5">
    <div v-if="productStore.loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="product" class="row g-4">
      <!-- Images -->
      <div class="col-12 col-lg-6">
        <div class="image-container">
          <img 
            :src="selectedImage" 
            alt="Product" 
            class="main-image"
          >
          
          <!-- Thumbnail images if multiple images exist -->
          <div v-if="product.images && product.images.length > 1" class="thumbnails mt-3">
            <div class="row g-2">
              <div 
                v-for="(image, index) in product.images" 
                :key="index"
                class="col-3"
              >
                <img 
                  :src="image" 
                  alt="Thumbnail"
                  class="thumbnail-image"
                  :class="{ 'active': selectedImage === image }"
                  @click="selectedImage = image"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="col-12 col-lg-6">
        <div class="product-info">
          <button 
            class="wishlist-btn" 
            @click="toggleWishlist"
            :disabled="!authStore.isAuthenticated"
            :title="authStore.isAuthenticated ? (isWishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to add to wishlist'"
          >
            <svg 
              :class="isWishlisted ? 'heart-filled' : 'heart-outline'" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              :fill="isWishlisted ? 'currentColor' : 'none'" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>

          <div class="price">Rp{{ formatPrice(product.price) }}</div>
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="meta-info">
            <span class="meta-item">{{ product.size }}</span>
            <span class="meta-item">{{ product.condition || 'Very Good' }}</span>
            <span class="meta-item">{{ product.location || 'Denpasar' }}</span>
          </div>

          <div class="section-title">Item Description</div>
          <p class="description">{{ product.description }}</p>

          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Category</span>
              <span class="detail-value">{{ product.category }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Size</span>
              <span class="detail-value">{{ product.size }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Condition</span>
              <span class="detail-value">{{ product.condition || 'Very Good' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Color</span>
              <span class="detail-value">{{ product.color }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Uploaded</span>
              <span class="detail-value">{{ formatUploadTime(product.uploadedAt) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Shipping</span>
              <span class="detail-value">Rp{{ formatPrice(product.shipping) }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              class="btn btn-buy" 
              @click="buyNow"
              :disabled="cartStore.loading"
            >
              {{ cartStore.loading ? 'Processing...' : 'Buy Now' }}
            </button>
            <button 
              class="btn btn-cart" 
              @click="addToCart"
              :disabled="cartStore.loading"
            >
              {{ cartStore.loading ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Products Section -->
    <div v-if="product" class="other-products-section mt-5">
      <h3 class="section-title mb-4">Other Product</h3>
      <div class="row g-4">
        <div 
          v-for="otherProduct in otherProducts" 
          :key="otherProduct.id"
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <ProductCard :product="otherProduct" />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <div class="empty-state">
        <i class="fas fa-box-open fa-4x mb-3 text-muted"></i>
        <p class="text-muted mb-3">Product not found</p>
        <button class="btn btn-primary" @click="router.push('/products')">
          <i class="fas fa-arrow-left me-2"></i>
          Browse Products
        </button>
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
            "{{ product?.name }}" successfully added to cart. Check now on the cart or continue shopping.
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import ProductCard from '@/components/common/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const selectedImage = ref('');
const showSuccessModal = ref(false);
// const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=1a9b9b&color=fff';

const product = computed(() => productStore.currentProduct);

const isWishlisted = computed(() => {
  if (!product.value) return false;
  return productStore.isProductWishlisted(product.value.id);
});

// Get other products from same category
const otherProducts = computed(() => {
  if (!product.value) return [];
  return productStore.products
    .filter(p => p.category === product.value?.category && p.id !== product.value?.id)
    .slice(0, 8);
});

// Set initial selected image when product loads
watch(product, (newProduct) => {
  if (newProduct) {
    selectedImage.value = newProduct.images?.[0] || newProduct.image;
  }
}, { immediate: true });

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return numPrice.toLocaleString('id-ID');
};

const formatUploadTime = (uploadedAt?: string): string => {
  if (!uploadedAt) return '5 hours ago';
  
  const now = new Date();
  const uploaded = new Date(uploadedAt);
  const diffMs = now.getTime() - uploaded.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return uploaded.toLocaleDateString('id-ID');
};

const toggleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (product.value) {
    const success = await productStore.toggleWishlist(product.value.id);
    if (success) {
      await productStore.fetchProductById(product.value.id);
    }
  }
};

const buyNow = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (product.value) {
    await cartStore.addItem(product.value);
    router.push('/checkout');
  }
};

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (product.value) {
    await cartStore.addItem(product.value);
    showSuccessModal.value = true;
  }
};

const closeModal = () => {
  showSuccessModal.value = false;
};

const goToCart = () => {
  showSuccessModal.value = false;
  router.push('/cart');
};

onMounted(async () => {
  const productId = route.params.id as string;
  await productStore.fetchProductById(productId);
  
  // Load wishlist if user is authenticated
  if (authStore.isAuthenticated) {
    await productStore.loadWishlist();
  }
  
  // Fetch products for "Other Products" section
  if (product.value?.category) {
    await productStore.fetchProductsByCategory(product.value.category);
  }
});
</script>

<style scoped>
/* Container */
#product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Image Section */
.image-container {
  position: relative;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.thumbnails {
  margin-top: 1rem;
}

.thumbnail-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail-image:hover {
  transform: scale(1.05);
  border-color: #ddd;
}

.thumbnail-image.active {
  border-color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Product Info Section */
.product-info {
  position: relative;
  padding: 1rem;
}

.wishlist-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  border: none;
  /* background: white; */
  /* padding: 12px; */
  border-radius: 50%;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 10;
}

.wishlist-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.wishlist-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.5rem;
}

.product-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.meta-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
}

.wishlist-count {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
}

.description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Details Grid */
.details-grid {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-buy {
  background: #000;
  color: #fff;
}

.btn-buy:hover:not(:disabled) {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-cart {
  background: #fff;
  color: #000;
  border: 2px solid #000;
}

.btn-cart:hover:not(:disabled) {
  background: #000;
  color: #fff;
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

/* Alert Notification */
.alert-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 300px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Seller Info */
.seller-info {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.seller-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.seller-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.seller-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #FFA500;
  font-size: 0.9rem;
}

.seller-rating span {
  color: #6b7280;
  margin-left: 0.5rem;
}

/* Other Products Section */
.other-products-section {
  margin-top: 4rem;
}

.other-products-section .section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
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

.modal-icon svg {
  filter: drop-shadow(0 4px 6px rgba(255, 165, 0, 0.3));
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

/* Heart Animation */
.heart-filled {
  color: #ef4444;
  animation: heartBeat 0.3s ease;
}

.heart-outline {
  color: #6b7280;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive Design */
@media (max-width: 991px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .main-image {
    max-height: 400px;
  }
  
  .price {
    font-size: 1.5rem;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .success-modal {
    padding: 2rem;
  }
}

@media (max-width: 576px) {
  .meta-info {
    gap: 0.5rem;
  }
  
  .meta-item {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .thumbnail-image {
    height: 70px;
  }
  
  .modal-title {
    font-size: 1.1rem;
  }
  
  .modal-text {
    font-size: 0.9rem;
  }
}
</style>