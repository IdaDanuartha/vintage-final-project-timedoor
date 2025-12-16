<template>
  <section id="shop-category" class="py-5">
    <div class="container">
      <div class="mb-4">
        <h3>Shop by Category</h3>
      </div>
      <div class="categories-scroll">
        <router-link
          v-for="category in categories" 
          :key="category"
          :to="`/products?category=${encodeURIComponent(category)}`"
          class="btn-category"
        >
          {{ category }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';

const productStore = useProductStore();
const categories = ref<string[]>([]);

// Get unique categories from products
const loadCategories = async () => {
  await productStore.fetchProducts();
  const uniqueCategories = [...new Set(productStore.products.map(p => p.category))];
  categories.value = uniqueCategories.sort();
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.categories-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
}

.categories-scroll::-webkit-scrollbar {
  height: 8px;
}

.categories-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.categories-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.categories-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.btn-category {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #333;
  text-decoration: none;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-category:hover {
  background: #000;
  color: white;
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .btn-category {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>