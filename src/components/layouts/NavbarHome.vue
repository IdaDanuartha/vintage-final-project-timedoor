<template>
  <nav class="px-4 py-2">
    <div class="container d-flex justify-content-between align-items-center gap-4">
      <div class="d-flex align-items-center gap-4 w-100">
        <router-link class="d-flex align-items-center navbar-brand" to="/">
          <img 
            src="/images/brands/logo.png" 
            alt="Vintage Logo" 
            width="50" 
            height="50" 
            class="d-inline-block align-text-top"
          >
          Vintage
        </router-link>
        <div class="w-100 d-flex align-items-center search-bar">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search..." 
            class="form-control"
            @keyup.enter="handleSearch"
          >
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-2 nav-right">
        <div v-if="!authStore.isAuthenticated" class="d-flex">
          <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
          <router-link to="/signup" class="btn btn-primary">Sign Up</router-link>
        </div>
        <div v-else class="d-flex align-items-center gap-3">
          <router-link to="/cart" class="position-relative">
            <i class="fa-solid fa-shopping-cart"></i>
            <span v-if="cartStore.totalItems > 0" class="badge bg-danger position-absolute top-0 start-100 translate-middle">
              {{ cartStore.totalItems }}
            </span>
          </router-link>
          <div class="dropdown">
            <button class="btn btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <img 
                v-if="authStore.user?.photoURL" 
                :src="authStore.user.photoURL" 
                alt="Profile" 
                width="32" 
                height="32"
                class="rounded-circle"
              >
              <img width="32" height="32" v-else src="https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-blue-user-icon-profile-and-account-vector-design-vector-sign-vector-png-image_46129432.jpg" alt="">
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="handleLogout">Logout</a></li>
            </ul>
          </div>
        </div>
        <div>
          <select v-model="selectedLang" class="form-select">
            <option value="en">EN</option>
            <option value="id">ID</option>
            <option value="jpn">JPN</option>
          </select>
        </div>
      </div>
      <div class="hamburger-btn" @click="toggleMenu">
        <i class="fa-solid fa-bars"></i>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const searchQuery = ref('');
const selectedLang = ref('en');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'products', query: { search: searchQuery.value } });
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const toggleMenu = () => {
  console.log('Toggle menu');
};
</script>