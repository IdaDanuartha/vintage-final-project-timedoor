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
      redirect: '/profile/details',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'details',
          name: 'profile-details',
          component: () => import('@/components/settings/ProfileDetails.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'password',
          name: 'profile-password',
          component: () => import('@/components/settings/ChangePassword.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'transactions',
          name: 'profile-transactions',
          component: () => import('@/components/settings/TransactionHistory.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
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

// Navigation guard with proper auth check
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (!authStore.authInitialized) {
    console.log('Router guard: Waiting for auth initialization...');
    
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (authStore.authInitialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('Auth initialization timeout in router guard');
        resolve();
      }, 10000);
    });
  }

  console.log('Navigation Guard:', {
    to: to.name,
    from: from.name,
    authInitialized: authStore.authInitialized,
    isAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.user
  });

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } 
  else if ((to.name === 'login' || to.name === 'signup') && authStore.isAuthenticated) {
    next('/');
  } 
  else {
    next();
  }
});

export default router;