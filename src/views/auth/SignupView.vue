<template>
  <div id="signup" class="page">
    <div class="auth-container">
      <h1 class="page-title">Sign up</h1>
      <p class="page-subtitle">Enter your details below</p>

      <div v-if="authStore.error" class="alert alert-danger">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSignup">
        <div class="mb-3">
          <label class="form-label">Full name <span class="required">*</span></label>
          <input 
            v-model="form.fullName"
            type="text" 
            class="form-control" 
            placeholder="Enter your fullname"
            required
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Username <span class="required">*</span></label>
          <input 
            v-model="form.username"
            type="text" 
            class="form-control" 
            placeholder="Enter your username"
            required
          >
        </div>

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

        <div class="mb-3">
          <label class="form-label">Confirmation Password <span class="required">*</span></label>
          <div class="password-field">
            <input 
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Enter your password"
              required
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="terms-checkbox">
          <input 
            v-model="form.agreeToTerms"
            type="checkbox" 
            id="terms"
            required
          >
          <label for="terms" class="terms-text">
            By clicking sign up, I hereby agree and consent to <a href="#">Term & Conditions</a>; I confirm that I have read <a href="#">Privacy policy</a>.
          </label>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100 cursor-pointer py-3 mt-4"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Loading...' : 'Sign up' }}
        </button>
      </form>

      <div class="divider my-4">
        <span>OR</span>
      </div>

      <button 
        @click="handleGoogleSignup"
        class="btn btn-outline-primary w-100 cursor-pointer py-3"
        :disabled="authStore.loading"
      >
        <i class="fab fa-google me-2"></i>
        Sign up with Google
      </button>

      <p class="text-center mt-3">
        Already have an account? 
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import type { SignupForm } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const form = ref<SignupForm>({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
});

const handleSignup = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  const success = await authStore.signUp(form.value);
  if (success) {
    router.push('/');
  }
};

const handleGoogleSignup = async () => {
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