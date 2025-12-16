<template>
  <section id="products" class="py-5">
    <div class="container">
      <!-- Header with Search -->
      <div class="products-header mb-4">
        <h3>All Products</h3>
        <div class="header-actions">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search for items"
              class="search-input"
            >
            <button 
              v-if="searchQuery"
              @click="resetSearch"
              class="clear-search"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <select v-model="sortBy" class="form-select sort-select">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="category-filters mb-4">
        <button 
          v-for="category in categories" 
          :key="category"
          :class="['btn-filter', { active: selectedCategory === category }]"
          @click="handleCategoryChange(category)"
        >
          {{ category }}
        </button>
      </div>

      <!-- Active Filters Display -->
      <div v-if="searchQuery || selectedCategory !== 'All'" class="active-filters mb-3">
        <span class="filter-label">Filtered by:</span>
        <span v-if="selectedCategory !== 'All'" class="filter-tag">
          {{ selectedCategory }}
          <i class="fas fa-times ms-2" @click="selectedCategory = 'All'"></i>
        </span>
        <span v-if="searchQuery" class="filter-tag">
          "{{ searchQuery }}"
          <i class="fas fa-times ms-2" @click="searchQuery = ''"></i>
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="productStore.loading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="filteredProducts.length > 0" class="row g-4">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <img src="/images/bag-cross.png" alt="Product Not Found" width="120" height="120">
        </div>
        <h4 class="empty-title">Product not found</h4>
        <p class="empty-text">
          We cannot find what you looking for, try to<br>
          use other keywords or reset keyword.
        </p>
        <button class="btn-reset" @click="resetFilters">
          Reset Keyword
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/common/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

const searchQuery = ref('');
const selectedCategory = ref('All');
const sortBy = ref('newest');

const categories = ref<string[]>(['All']);

// Load categories from products
const loadCategories = () => {
  const uniqueCategories = [...new Set(productStore.products.map(p => p.category))];
  categories.value = ['All', ...uniqueCategories.sort()];
};

// Watch for products changes to update categories
watch(() => productStore.products, () => {
  loadCategories();
}, { immediate: true });

// Filtered products with search and category
const filteredProducts = computed(() => {
  let products = [...productStore.products];
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.color.toLowerCase().includes(query)
    );
  }
  
  // Filter by category
  if (selectedCategory.value !== 'All') {
    products = products.filter(p => p.category === selectedCategory.value);
  }
  
  // Sort products
  switch (sortBy.value) {
    case 'price-low':
      products = products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products = products.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      products = products.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0).getTime();
        const dateB = new Date(b.uploadedAt || 0).getTime();
        return dateB - dateA;
      });
      break;
  }
  
  return products;
});

const handleCategoryChange = (category: string) => {
  selectedCategory.value = category;
  
  // Build query object
  const query: Record<string, string> = {};
  
  if (category !== 'All') {
    query.category = category;
  }
  
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value;
  }
  
  // Update URL
  router.push({ query });
};

const resetSearch = () => {
  searchQuery.value = '';
  
  // Update URL to remove search param
  const query: Record<string, string> = {};
  if (selectedCategory.value !== 'All') {
    query.category = selectedCategory.value;
  }
  router.push({ query });
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'All';
  router.push({ query: {} });
};

// Watch search query changes and update URL
watch(searchQuery, (newValue) => {
  const query: Record<string, string> = {};
  
  if (newValue.trim()) {
    query.search = newValue;
  }
  
  if (selectedCategory.value !== 'All') {
    query.category = selectedCategory.value;
  }
  
  // Update URL without triggering navigation
  router.push({ query });
});

// Watch for URL query changes
watch(() => route.query, (newQuery) => {
  // Handle search query from URL
  if (newQuery.search) {
    searchQuery.value = newQuery.search as string;
  } else if (!newQuery.search && searchQuery.value) {
    // Clear search if not in URL
    searchQuery.value = '';
  }
  
  // Handle category from URL
  if (newQuery.category) {
    selectedCategory.value = newQuery.category as string;
  } else if (!newQuery.category) {
    selectedCategory.value = 'All';
  }
}, { immediate: true });

onMounted(async () => {
  await productStore.fetchProducts();
  loadCategories();
  
  // Check URL queries on mount
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
  }
  
  if (route.query.category) {
    selectedCategory.value = route.query.category as string;
  }
});
</script>

<style scoped>
/* Header Section */
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.products-header h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 600px;
}

/* Search Box */
.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i.fa-search {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.3s ease;
}

.clear-search:hover {
  color: #333;
}

.sort-select {
  width: auto;
  min-width: 180px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.sort-select:focus {
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

/* Category Filters */
.category-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-filter {
  padding: 0.6rem 1.25rem;
  background: white;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-filter:hover {
  border-color: #000;
  color: #000;
}

.btn-filter.active {
  background: #000;
  color: white;
  border-color: #000;
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
  transition: background 0.3s ease;
}

.filter-tag:hover {
  background: #e0e0e0;
}

.filter-tag i {
  cursor: pointer;
  font-size: 0.75rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.empty-icon svg {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.empty-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-reset {
  padding: 0.75rem 2rem;
  background: #1A9B9B;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #158080;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 155, 155, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    max-width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .category-filters {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .btn-filter {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }

  .empty-icon svg {
    width: 80px;
    height: 80px;
  }

  .empty-title {
    font-size: 1.25rem;
  }
}
</style>