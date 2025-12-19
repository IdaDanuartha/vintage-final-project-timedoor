<template>
  <div class="sidebar-menu">
    <router-link
      v-for="menu in menuItems" 
      :key="menu.id"
      :to="menu.route"
      class="menu-item"
      active-class="active"
    >
      <i :class="menu.icon"></i>
      <span>{{ menu.label }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
const menuItems = [
  { 
    id: 'profile', 
    label: 'Profile details',
    route: '/profile/details',
    icon: 'fas fa-user'
  },
  { 
    id: 'password', 
    label: 'Change Password',
    route: '/profile/password',
    icon: 'fas fa-lock'
  },
  { 
    id: 'transactions', 
    label: 'Transaction History',
    route: '/profile/transactions',
    icon: 'fas fa-history'
  }
];
</script>

<style scoped>
.sidebar-menu {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #17a2b8;
}

.menu-item.active {
  background: #e7f6f8;
  color: #17a2b8;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar-menu {
    flex-direction: row;
    overflow-x: auto;
    gap: 12px;
  }

  .menu-item {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .menu-item i {
    display: none;
  }
}
</style>