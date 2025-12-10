<template>
  <section id="brand-category">
    <div class="container">
      <div class="mb-4">
        <h3>Shop by brand</h3>
      </div>
      <div class="d-flex justify-content-evenly align-items-center gap-4 overflow-auto">
        <a 
          v-for="brand in brands" 
          :key="brand.id" 
          href="#" 
          class="btn-brand-category"
        >
          {{ brand.name }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Brand } from '@/types';

const brands = ref<Brand[]>([
  { id: 1, name: 'Vans', slug: 'vans' },
  { id: 2, name: 'Bohoo', slug: 'bohoo' },
  { id: 3, name: 'Mango', slug: 'mango' },
  { id: 4, name: 'Reebok', slug: 'reebok' },
  { id: 5, name: 'Converse', slug: 'converse' },
  { id: 6, name: 'Sandro', slug: 'sandro' },
  { id: 7, name: 'Nike', slug: 'nike' },
  { id: 8, name: 'Adidas', slug: 'adidas' },
  { id: 9, name: 'Dior', slug: 'dior' },
  { id: 10, name: 'Puma', slug: 'puma' },
  { id: 11, name: 'Zara', slug: 'zara' },
  { id: 12, name: 'Bershka', slug: 'bershka' },
  { id: 13, name: 'American Eagle', slug: 'american-eagle' }
]);
</script>