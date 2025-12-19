<template>
  <div id="settings" class="page">
    <div class="settings-container">
      <h1 class="settings-title">Settings</h1>

      <div class="settings-layout">
        <!-- Sidebar Menu -->
        <SettingsSidebar />

        <!-- Content Area - Router Outlet -->
        <div class="settings-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsSidebar from '@/components/settings/SettingsSidebar.vue';
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 20px;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 32px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

.settings-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .settings-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .settings-content {
    padding: 20px;
  }
}
</style>