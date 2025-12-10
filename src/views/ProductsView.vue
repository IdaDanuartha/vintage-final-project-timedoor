<template>
  <section id="products" class="py-5">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>All Products</h3>
        <div class="d-flex gap-2">
          <select v-model="sortBy" class="form-select" style="width: auto;">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex gap-2 flex-wrap">
            <button 
              v-for="category in categories" 
              :key="category"
              :class="['btn', selectedCategory === category ? 'btn-primary' : 'btn-outline-primary']"
              @click="handleCategoryChange(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
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
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!productStore.loading && filteredProducts.length === 0" class="text-center py-5">
        <p class="text-muted">No products found</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/common/ProductCard.vue';

const productStore = useProductStore();
const selectedCategory = ref('All');
const sortBy = ref('newest');

const categories = ref(['All', 'Dress', 'T-Shirts (Short Sleeves)', 'Hoodies', 'Jackets', 'Pants']);

const filteredProducts = computed(() => {
  let products = [...productStore.products];
  
  // Filter by category
  if (selectedCategory.value !== 'All') {
    products = products.filter(p => p.category === selectedCategory.value);
  }
  
  // Sort
  switch (sortBy.value) {
    case 'price-low':
      products = products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products = products.sort((a, b) => b.price - a.price);
      break;
  }
  
  return products;
});

const handleCategoryChange = async (category: string) => {
  selectedCategory.value = category;
  if (category === 'All') {
    await productStore.fetchProducts();
  } else {
    await productStore.fetchProductsByCategory(category);
  }
};

onMounted(async () => {
  await productStore.fetchProducts();
});
</script>