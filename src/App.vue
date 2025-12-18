<template>
  <div id="app">
    <NavbarHome v-if="!isAuthPage" />
    <main>
      <router-view />
    </main>
    <FooterHome v-if="!isAuthPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';
import NavbarHome from '@/components/layouts/NavbarHome.vue';
import FooterHome from '@/components/layouts/FooterHome.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const productStore = useProductStore();

const route = useRoute();

const isAuthPage = computed(() => {
  return route.meta.layout === 'auth';
});

onMounted(async () => {
  try {
    // Initialize authentication
    await authStore.initAuth();
    
    // Load cart from cookie
    cartStore.loadCart();
    
    // Load wishlist if authenticated
    if (authStore.isAuthenticated) {
      await productStore.loadWishlist();
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});

</script>