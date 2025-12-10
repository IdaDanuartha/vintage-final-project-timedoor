import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue')
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: () => import('@/views/ProductDetailView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.name === 'login' || to.name === 'signup') && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;