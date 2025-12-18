<template>
  <nav class="modern-navbar">
    <div class="navbar-container">
      <!-- Left Side: Logo + Search -->
      <div class="navbar-left">
        <router-link class="navbar-brand" to="/">
          <img 
            src="/images/brands/logo.png" 
            alt="Vintaqe Logo" 
            class="brand-logo"
          >
          <span class="brand-name">Vintage</span>
        </router-link>
        
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search for items" 
            class="search-input"
            @keyup.enter="handleSearch"
          >
        </div>
      </div>

      <!-- Right Side: Actions -->
      <div class="navbar-right">
        <!-- Unauthenticated State -->
        <div v-if="!authStore.isAuthenticated" class="auth-buttons">
          <router-link to="/login" class="btn-login">Login</router-link>
          <router-link to="/signup" class="btn-signup">Sign Up</router-link>
        </div>

        <!-- Authenticated State -->
        <div v-else class="user-actions">
          <!-- Cart Icon -->
          <router-link to="/cart" class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span v-if="cartStore.totalItems > 0" class="badge-count">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- Wishlist Icon -->
          <router-link to="/wishlist" class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
            <span v-if="wishlistCount > 0" class="badge-count">
              {{ wishlistCount }}
            </span>
          </router-link>

          <!-- User Profile Dropdown -->
          <div class="user-dropdown" ref="dropdownRef">
            <button 
              class="user-profile-btn" 
              @click="toggleDropdown"
            >
              <img 
                :src="authStore.user?.photoURL || defaultAvatar" 
                alt="Profile" 
                class="user-avatar"
              >
              <i class="fas fa-chevron-down dropdown-arrow"></i>
            </button>

            <div v-if="showDropdown" class="dropdown-menu-custom">
              <div class="dropdown-header">
                <img 
                  :src="authStore.user?.photoURL || defaultAvatar" 
                  alt="Profile" 
                  class="dropdown-avatar"
                >
                <div class="dropdown-user-info">
                  <p class="user-name">{{ authStore.user?.displayName || 'User' }}</p>
                  <p class="user-email">{{ authStore.user?.email }}</p>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-user"></i>
                Profile Settings
              </router-link>
              <router-link to="/wishlist" class="dropdown-item" @click="closeDropdown">
                <i class="far fa-heart"></i>
                My Wishlist
              </router-link>
              <router-link to="/orders" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-shopping-bag"></i>
                My Orders
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item logout" @click.prevent="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                Logout
              </a>
            </div>
          </div>
        </div>

        <!-- Language Selector -->
        <div class="language-selector">
          <select v-model="selectedLang" class="lang-select">
            <option value="en">EN</option>
            <option value="id">ID</option>
            <option value="jpn">JPN</option>
          </select>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="hamburger-btn" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <div class="mobile-search">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search for items" 
          class="search-input"
          @keyup.enter="handleSearch"
        >
      </div>
      
      <div v-if="authStore.isAuthenticated" class="mobile-user-info">
        <img 
          :src="authStore.user?.photoURL || defaultAvatar" 
          alt="Profile" 
          class="mobile-avatar"
        >
        <div>
          <p class="mobile-name">{{ authStore.user?.displayName || 'User' }}</p>
          <p class="mobile-email">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <div class="mobile-menu-items">
        <router-link to="/profile" class="mobile-menu-item" @click="closeMobileMenu">
          <i class="fas fa-user"></i>
          Profile
        </router-link>
        <router-link to="/cart" class="mobile-menu-item" @click="closeMobileMenu">
          <i class="fas fa-shopping-cart"></i>
          Cart
          <span v-if="cartStore.totalItems > 0" class="mobile-badge">{{ cartStore.totalItems }}</span>
        </router-link>
        <router-link to="/wishlist" class="mobile-menu-item" @click="closeMobileMenu">
          <i class="far fa-heart"></i>
          Wishlist
          <span v-if="wishlistCount > 0" class="mobile-badge">{{ wishlistCount }}</span>
        </router-link>
        <router-link to="/orders" class="mobile-menu-item" @click="closeMobileMenu">
          <i class="fas fa-shopping-bag"></i>
          Orders
        </router-link>
        <a href="#" class="mobile-menu-item logout" @click.prevent="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useProductStore } from '@/stores/productStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const productStore = useProductStore();

const searchQuery = ref('');
const selectedLang = ref('en');
const showDropdown = ref(false);
const showMobileMenu = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=1a9b9b&color=fff';

const wishlistCount = computed(() => productStore.wishlist.length);

// Watch for authentication changes to reload data
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await Promise.all([
      cartStore.loadCart(),
      productStore.loadWishlist()
    ]);
  } else {
    // Clear data when logged out
    cartStore.items = [];
    productStore.wishlist = [];
  }
});

// Watch route changes to update search query from URL
watch(() => route.query.search, (newSearch) => {
  if (newSearch && route.name === 'products') {
    searchQuery.value = newSearch as string;
  } else {
    searchQuery.value = '';
  }
}, { immediate: true });

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      name: 'products', 
      query: { search: searchQuery.value.trim() } 
    });
    closeMobileMenu();
  }
};

const handleLogout = async () => {
  await authStore.logout();
  closeDropdown();
  closeMobileMenu();
  router.push('/');
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  // FIX: Load cart and wishlist with await if authenticated
  if (authStore.isAuthenticated) {
    try {
      await Promise.all([
        cartStore.loadCart(),
        productStore.loadWishlist()
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Main Navbar */
.modern-navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

/* Left Side */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #1a9b9b;
  font-weight: 600;
  font-size: 1.5rem;
  white-space: nowrap;
}

.brand-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.brand-name {
  font-weight: 600;
}

/* Search Bar */
.search-bar {
  position: relative;
  flex: 1;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #1a9b9b;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 155, 155, 0.1);
}

/* Right Side */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-login, .btn-signup {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-login {
  color: #1a9b9b;
  background: transparent;
  border: 2px solid #1a9b9b;
}

.btn-login:hover {
  background: #1a9b9b;
  color: white;
}

.btn-signup {
  background: #1a9b9b;
  color: white;
  border: 2px solid #1a9b9b;
}

.btn-signup:hover {
  background: #158080;
  border-color: #158080;
}

/* User Actions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.action-icon {
  position: relative;
  color: #374151;
  font-size: 1.25rem;
  transition: color 0.3s ease;
  cursor: pointer;
}

.action-icon:hover {
  color: #1a9b9b;
}

.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* User Dropdown */
.user-dropdown {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.3s ease;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.user-profile-btn:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu-custom {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  padding: 0.5rem;
  animation: slideDown 0.3s ease;
  z-index: 100;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item i {
  width: 18px;
  text-align: center;
  color: #6b7280;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #1a9b9b;
}

.dropdown-item:hover i {
  color: #1a9b9b;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

/* Language Selector */
.lang-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.lang-select:focus {
  outline: none;
  border-color: #1a9b9b;
}

/* Hamburger Menu */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  padding: 1rem 2rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.mobile-search {
  position: relative;
  margin-bottom: 1rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.mobile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-name {
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.mobile-email {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.mobile-menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s ease;
  position: relative;
}

.mobile-menu-item:hover {
  background: #f3f4f6;
}

.mobile-menu-item.logout {
  color: #ef4444;
}

.mobile-badge {
  margin-left: auto;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 992px) {
  .navbar-container {
    padding: 1rem;
  }

  .navbar-left {
    flex: 1;
  }

  .search-bar {
    display: none;
  }

  .auth-buttons, .user-actions, .language-selector {
    display: none;
  }

  .hamburger-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
  }
}

@media (max-width: 576px) {
  .brand-name {
    display: none;
  }

  .navbar-container {
    gap: 1rem;
  }
}
</style>