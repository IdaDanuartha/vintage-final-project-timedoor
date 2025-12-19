<template>
  <div id="app">
    <!-- Show loading state while auth is initializing -->
    <div v-if="!authStore.authInitialized" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Show app content after auth is initialized -->
    <template v-else>
      <NavbarHome v-if="!isAuthPage" />
      <main>
        <router-view />
      </main>
      <FooterHome v-if="!isAuthPage" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
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

// Use onBeforeMount instead of onMounted for faster initialization
onBeforeMount(async () => {
  try {    
    await authStore.initAuth();
    
    // Load cart from cookie (available for all users)
    cartStore.loadCart();
    
    // Load wishlist only if authenticated
    if (authStore.isAuthenticated) {
      await productStore.loadWishlist();
    }
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>