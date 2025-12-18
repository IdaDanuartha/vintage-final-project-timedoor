<template>
  <div id="settings" class="page">
    <div class="settings-container">
      <h1 class="settings-title">Settings</h1>

      <div class="settings-layout">
        <!-- Sidebar Menu -->
        <SettingsSidebar 
          :activeMenu="activeMenu" 
          @update:activeMenu="activeMenu = $event" 
        />

        <!-- Content Area -->
        <div class="settings-content">
          <ProfileDetails v-if="activeMenu === 'profile'" />
          <ChangePassword v-if="activeMenu === 'password'" />
          <TransactionHistory v-if="activeMenu === 'transactions'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePassword from '@/components/settings/ChangePassword.vue';
import ProfileDetails from '@/components/settings/ProfileDetails.vue';
import SettingsSidebar from '@/components/settings/SettingsSidebar.vue';
import TransactionHistory from '@/components/settings/TransactionHistory.vue';
import { ref } from 'vue';

const activeMenu = ref('profile');
</script>