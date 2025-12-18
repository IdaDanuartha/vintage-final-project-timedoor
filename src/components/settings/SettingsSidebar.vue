<template>
  <div class="sidebar-menu">
    <div 
      v-for="menu in menuItems" 
      :key="menu.id"
      :class="['menu-item', { active: activeMenu === menu.id }]"
      @click="$emit('update:activeMenu', menu.id)"
    >
      {{ menu.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeMenu: string;
}

defineProps<Props>();
defineEmits<{
  'update:activeMenu': [value: string]
}>();

const menuItems = [
  { id: 'profile', label: 'Profile details' },
  { id: 'password', label: 'Change Password' },
  { id: 'transactions', label: 'Transaction History' }
];
</script>