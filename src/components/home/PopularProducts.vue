<template>
  <section id="populer-product" class="py-5">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>Popular Items</h3>
        <router-link to="/products">See all</router-link>
      </div>

      <!-- Loading State -->
      <div v-if="productStore.loading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="row g-4">
        <div 
          v-for="product in displayProducts" 
          :key="product.id" 
          class="col-4 col-md-3 col-lg-2"
        >
          <ProductCard :product="product" />
        </div>
        <div class="col-4 col-md-3 col-lg-2">
          <router-link to="/products" class="card see-all-card">
            <h5>See All Product</h5>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/common/ProductCard.vue';

const productStore = useProductStore();

// Get first 5 products for popular section
const displayProducts = computed(() => {
  return productStore.products.slice(0, 5);
});

onMounted(async () => {
  if (productStore.products.length === 0) {
    await productStore.fetchProducts();
  }
});
</script>