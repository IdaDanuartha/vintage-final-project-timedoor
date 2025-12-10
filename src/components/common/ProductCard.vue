<template>
  <router-link :to="`/detail/${product.id}`" class="card">
    <img :src="product.image" class="card-img-top" :alt="product.name">
    <div class="card-body">
      <p class="card-price">Rp{{ formatPrice(product.price) }}</p>
      <h5 class="card-title">{{ product.name }}</h5>
      <div class="d-flex justify-content-between align-items-center">
        <p>{{ product.size }}</p>
        <div class="d-flex align-items-center gap-1 wishlist-item">
          <i class="fa-regular fa-heart"></i>
          <p>{{ product.wishlistCount }}</p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { Product } from '@/types';

interface Props {
  product: Product;
}

defineProps<Props>();

const formatPrice = (price: number): string => {
  return price.toLocaleString('id-ID');
};
</script>

<style scoped>
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
</style>