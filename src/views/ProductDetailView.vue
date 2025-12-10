<template>
  <section id="product-detail" class="container">
    <div v-if="productStore.loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="product" class="row g-4">
      <!-- Images -->
      <div class="col-12 col-lg-6 col-xl-7">
        <div class="image-gallery-v2">
          <div class="item item1">
            <img 
              :src="product.image" 
              alt="Product" 
              class="thumbnail"
            >
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="col-12 col-lg-6 col-xl-5">
        <div class="product-info position-relative">
          <button class="wishlist-btn" @click="toggleWishlist">
            <i :class="isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>

          <div class="price">Rp{{ formatPrice(product.price) }}</div>
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="meta-info">
            <span class="meta-item">{{ product.size }}</span>
            <span class="meta-item">{{ product.color }}</span>
          </div>

          <div class="section-title">Item Description</div>
          <p class="description">{{ product.description }}</p>

          <div class="detail-row">
            <span class="detail-label">Category</span>
            <span class="detail-value">{{ product.category }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Size</span>
            <span class="detail-value">{{ product.size }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Color</span>
            <span class="detail-value">{{ product.color }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Shipping</span>
            <span class="detail-value">Rp{{ formatPrice(product.shipping) }}</span>
          </div>

          <div class="mt-4">
            <button class="btn btn-buy" @click="buyNow">Buy Now</button>
            <button class="btn btn-cart" @click="addToCart">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <p class="text-muted">Product not found</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const isWishlisted = ref(false);

const product = computed(() => productStore.currentProduct);

const formatPrice = (price: number): string => {
  return price.toLocaleString('id-ID');
};

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value;
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
    alert('Product added to cart!');
  }
};

onMounted(async () => {
  const productId = route.params.id as string;
  await productStore.fetchProductById(productId);
});
</script>