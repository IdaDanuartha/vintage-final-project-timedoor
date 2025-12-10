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
import NavbarHome from '@/components/layouts/NavbarHome.vue';
import FooterHome from '@/components/layouts/FooterHome.vue';

const route = useRoute();

const isAuthPage = computed(() => {
  return route.meta.layout === 'auth';
});
</script>