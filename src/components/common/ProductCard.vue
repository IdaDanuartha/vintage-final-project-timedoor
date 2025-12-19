<template>
  <router-link :to="`/detail/${product.id}`" class="card">
    <img :src="product.image" class="card-img-top" :alt="product.name">
    <div class="card-body">
      <p class="card-price">Rp{{ formatPrice(product.price) }}</p>
      <h5 class="card-title">{{ product.name }}</h5>
      <div class="d-flex justify-content-between align-items-center">
        <p>{{ product.size }}</p>
        <div class="d-flex align-items-center gap-1 wishlist-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
          <p>{{ product.wishlistCount ?? 0 }}</p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Product } from '@/types';
import { formatPrice } from '@/utils';

interface Props {
  product: Product;
}

defineProps<Props>();
</script>

<style scoped>
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
  .lucide-heart {
    position: relative;
    top: -8px;
    opacity: 0.8;
  }
</style>