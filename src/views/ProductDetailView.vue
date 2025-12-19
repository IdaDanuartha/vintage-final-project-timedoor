<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import ProductCard from '@/components/common/ProductCard.vue';
import ReviewsSection from '@/components/reviews/ReviewsSection.vue';
import { formatPrice } from '@/utils';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const selectedImage = ref('');
const showSuccessModal = ref(false);
const addingToCart = ref(false);
const error = ref<string | null>(null);

const product = computed(() => productStore.currentProduct);

const isWishlisted = computed(() => {
  if (!product.value) return false;
  return productStore.isProductWishlisted(product.value.id);
});

const otherProducts = computed(() => {
  if (!product.value) return [];
  return productStore.products
    .filter(p => p.category === product.value?.category && p.id !== product.value?.id)
    .slice(0, 8);
});

watch(product, (newProduct) => {
  if (newProduct) {
    selectedImage.value = newProduct.images?.[0] || newProduct.image;
  }
}, { immediate: true });

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadProductData(newId as string);
  }
});

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
    addingToCart.value = true;
    error.value = null;
    
    try {
      await cartStore.addItem(product.value);
      router.push('/checkout');
    } catch (err: any) {
      console.error('Buy now error:', err);
      error.value = err.message || 'Failed to add item to cart';
      alert('Failed to add item to cart. Please try again.');
    } finally {
      addingToCart.value = false;
    }
  }
};

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (product.value) {
    addingToCart.value = true;
    error.value = null;
    
    try {
      await cartStore.addItem(product.value);
      showSuccessModal.value = true;
    } catch (err: any) {
      console.error('Add to cart error:', err);
      error.value = err.message || 'Failed to add item to cart';
      alert('Failed to add item to cart. Please try again.');
    } finally {
      addingToCart.value = false;
    }
  }
};

const closeModal = () => {
  showSuccessModal.value = false;
};

const goToCart = () => {
  showSuccessModal.value = false;
  router.push('/cart');
};

const loadProductData = async (productId: string) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  try {
    await productStore.fetchProductById(productId);
    
    if (authStore.isAuthenticated) {
      await productStore.loadWishlist();
    }
    
    if (product.value?.category) {
      await productStore.fetchProductsByCategory(product.value.category);
    }
  } catch (err) {
    console.error('Failed to load product:', err);
  }
};

onMounted(async () => {
  const productId = route.params.id as string;
  await loadProductData(productId);
  
  if (authStore.isAuthenticated) {
    await cartStore.loadCart();
  }
});
</script>

<template>
  <section id="product-detail" class="container py-4">
    <div v-if="productStore.loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="product" class="row g-4">
      <!-- Left Column - Image -->
      <div class="col-12 col-lg-7">
        <div class="product-image-container">
          <img 
            :src="selectedImage" 
            alt="Product" 
            class="product-main-image"
          >
        </div>
      </div>

      <!-- Right Column - Product Info -->
      <div class="col-12 col-lg-5">
        <div class="product-details-card">
          <!-- Price & Wishlist -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h2 class="product-price">Rp{{ formatPrice(product.price) }}</h2>
            <button 
              class="wishlist-button" 
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
          </div>

          <!-- Product Title -->
          <h1 class="product-name">{{ product.name }}</h1>

          <!-- Rating Display -->
          <div v-if="product.averageRating && product.totalReviews" class="product-rating-badge">
            <div class="rating-stars">
              <svg 
                v-for="star in 5" 
                :key="star"
                class="star-icon"
                :class="{ 'star-filled': star <= Math.round(product.averageRating) }"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="rating-text">{{ product.averageRating.toFixed(1) }} ({{ product.totalReviews }} reviews)</span>
          </div>

          <!-- Quick Info Tags -->
          <div class="quick-info-tags mb-3">
            <span class="info-tag">{{ product.size }}</span>
            <span class="info-tag">{{ product.condition || 'Very Good' }}</span>
            <span class="info-tag">{{ product.location || 'Denpasar' }}</span>
          </div>

          <!-- Item Description Section -->
          <div class="info-section">
            <h3 class="info-section-title">Item Description</h3>
            <p class="info-section-text">{{ product.description }}</p>
          </div>

          <!-- Product Details Grid -->
          <div class="product-info-grid">
            <div class="info-row">
              <span class="info-label">Category</span>
              <span class="info-value">{{ product.category }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Size</span>
              <span class="info-value">{{ product.size }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Condition</span>
              <span class="info-value">{{ product.condition || 'Very Good' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Color</span>
              <span class="info-value">{{ product.color }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Uploaded</span>
              <span class="info-value">{{ formatUploadTime(product.uploadedAt) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Shipping</span>
              <span class="info-value">Rp{{ formatPrice(product.shipping) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons-group">
            <button 
              class="btn-action btn-buy-now" 
              @click="buyNow"
              :disabled="addingToCart"
            >
              {{ addingToCart ? 'Processing...' : 'Buy Now' }}
            </button>
            <button 
              class="btn-action btn-add-cart" 
              @click="addToCart"
              :disabled="addingToCart"
            >
              {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="col-12">
        <ReviewsSection :product="product" />
      </div>
    </div>

    <!-- Other Products Section -->
    <div v-if="product && otherProducts.length > 0" class="other-products-section">
      <h3 class="section-heading">Other Product</h3>
      <div class="products-grid">
        <div 
          v-for="otherProduct in otherProducts" 
          :key="otherProduct.id"
          class="product-grid-item"
        >
          <ProductCard :product="otherProduct" />
        </div>
      </div>
    </div>

    <div v-else-if="!productStore.loading" class="text-center py-5">
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
            <button class="btn-modal btn-continue" @click="closeModal">
              Continue shopping
            </button>
            <button class="btn-modal btn-go-cart" @click="goToCart">
              Go to cart
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
/* Main Container */
#product-detail {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Product Image Section */
.product-image-container {
  width: 100%;
  background: #F5F5F5;
  border-radius: 8px;
  overflow: hidden;
}

.product-main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  display: block;
}

/* Product Details Card */
.product-details-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  height: 100%;
}

/* Price */
.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* Wishlist Button */
.wishlist-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.wishlist-button:hover:not(:disabled) {
  transform: scale(1.1);
}

.wishlist-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.heart-filled {
  color: #ef4444;
}

.heart-outline {
  color: #9ca3af;
}

/* Product Name */
.product-name {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

/* Product Rating Badge */
.product-rating-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.rating-stars .star-icon {
  width: 16px;
  height: 16px;
  color: #D1D5DB;
}

.rating-stars .star-icon.star-filled {
  color: #FCD34D;
}

.rating-text {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

/* Quick Info Tags */
.quick-info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.info-tag {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: #F3F4F6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 400;
}

/* Info Section */
.info-section {
  margin-bottom: 1.5rem;
}

.info-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.info-section-text {
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
}

/* Product Info Grid */
.product-info-grid {
  background: white;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #F3F4F6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 400;
}

.info-value {
  font-size: 0.875rem;
  color: #1a1a1a;
  font-weight: 500;
  text-align: right;
}

/* Action Buttons */
.action-buttons-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-action {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-buy-now {
  background: #14B8A6;
  color: white;
}

.btn-buy-now:hover:not(:disabled) {
  background: #0F9D8E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-add-cart {
  background: white;
  color: #14B8A6;
  border: 2px solid #14B8A6;
}

.btn-add-cart:hover:not(:disabled) {
  background: #F0FDFA;
  transform: translateY(-2px);
}

/* Seller Info */
.seller-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding-top: 1.5rem;
  border-top: 1px solid #F3F4F6;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.seller-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  font-size: 0.875rem;
  color: #FCD34D;
}

.rating-count {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Other Products Section */
.other-products-section {
  margin-top: 4rem;
}

.section-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.product-grid-item {
  width: 100%;
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
  from { opacity: 0; }
  to { opacity: 1; }
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
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.modal-text {
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 0.9375rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-modal {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9375rem;
  font-family: inherit;
}

.btn-continue {
  background: white;
  border: 2px solid #14B8A6;
  color: #14B8A6;
}

.btn-continue:hover {
  background: #F0FDFA;
}

.btn-go-cart {
  background: #14B8A6;
  color: white;
}

.btn-go-cart:hover {
  background: #0F9D8E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

/* Loading Spinner */
.spinner-border {
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid #E5E7EB;
  border-right-color: #14B8A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive Design */
@media (max-width: 991px) {
  .product-main-image {
    max-height: 450px;
  }
  
  .product-details-card {
    margin-top: 1rem;
  }
  
  .product-price {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .action-buttons-group {
    flex-direction: column;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 576px) {
  #product-detail {
    padding: 1rem 0.75rem;
  }
  
  .product-details-card {
    padding: 1rem;
  }
  
  .product-price {
    font-size: 1.5rem;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .quick-info-tags {
    gap: 0.375rem;
  }
  
  .info-tag {
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .success-modal {
    padding: 2rem 1.5rem;
    width: 95%;
  }
}
</style>