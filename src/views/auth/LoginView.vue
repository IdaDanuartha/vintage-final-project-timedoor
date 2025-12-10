<template>
  <div id="login" class="page active">
    <div class="auth-container">
      <h1 class="page-title">Login</h1>
      <p class="page-subtitle">Enter your details below</p>

      <div v-if="authStore.error" class="alert alert-danger">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Email <span class="required">*</span></label>
          <input 
            v-model="form.email" 
            type="email" 
            class="form-control" 
            placeholder="Enter your email"
            required
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Password <span class="required">*</span></label>
          <div class="password-field">
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter your password"
              required
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100 cursor-pointer py-3"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Loading...' : 'Continue' }}
        </button>
      </form>

      <div class="divider my-4">
        <span>OR</span>
      </div>

      <button 
        @click="handleGoogleLogin"
        class="btn btn-outline-primary w-100 cursor-pointer py-3"
        :disabled="authStore.loading"
      >
        <i class="fab fa-google me-2"></i>
        Continue with Google
      </button>

      <p class="text-center mt-3">
        Don't have an account? 
        <router-link to="/signup">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { LoginForm } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);
const form = ref<LoginForm>({
  email: '',
  password: ''
});

const handleLogin = async () => {
  const success = await authStore.signIn(form.value);
  if (success) {
    router.push('/');
  }
};

const handleGoogleLogin = async () => {
  const success = await authStore.signInWithGoogle();
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  text-align: center;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 10px;
  color: #666;
  font-size: 14px;
}
</style>