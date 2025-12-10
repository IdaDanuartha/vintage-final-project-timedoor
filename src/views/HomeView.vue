<template>
  <div>
    <HeroSection />
    <PopularProducts />
    <BrandCategory />
    <LatestProducts />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue';
import PopularProducts from '@/components/home/PopularProducts.vue';
import BrandCategory from '@/components/home/BrandCategory.vue';
import LatestProducts from '@/components/home/LatestProducts.vue';
</script>