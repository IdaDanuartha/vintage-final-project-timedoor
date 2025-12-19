<template>
  <div>
    <h2 class="content-title">Edit Profile</h2>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <template v-else>
      <div class="photo-upload">
        <span class="photo-label">Photo</span>
        <div class="photo-avatar">
          <img v-if="profileForm.photo" :src="profileForm.photo" alt="Profile">
          <i v-else class="fas fa-user"></i>
        </div>
        <button type="button" class="btn-choose" @click="choosePhoto">Choose</button>
        <span class="photo-info">JPG, JPEG or PNG, 1 MB max.</span>
        <button type="button" class="btn-delete" @click="deletePhoto" :disabled="!profileForm.photo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      <form @submit.prevent="handleUpdateProfile">
        <div class="mb-4">
          <label class="form-label">Full name</label>
          <input 
            v-model="profileForm.fullName"
            type="text" 
            class="form-control"
            required
          >
        </div>

        <div class="mb-4">
          <label class="form-label">Username</label>
          <input 
            v-model="profileForm.username"
            type="text" 
            class="form-control"
            required
          >
        </div>

        <div class="mb-4">
          <label class="form-label">Email</label>
          <input 
            v-model="profileForm.email"
            type="email" 
            class="form-control"
            disabled
          >
          <small class="form-text">Email cannot be changed</small>
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary cursor-pointer px-4 py-3"
          :disabled="updateLoading"
        >
          <span v-if="updateLoading">
            <i class="fas fa-spinner fa-spin"></i> Updating...
          </span>
          <span v-else>Update Profile</span>
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const authStore = useAuthStore();
const { currentUser, loading } = storeToRefs(userStore);

const profileForm = ref({
  fullName: '',
  username: '',
  email: '',
  photo: ''
});

const updateLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

onMounted(async () => {
  await userStore.fetchUserProfile();
  if(currentUser.value) {
    profileForm.value = {
      fullName: currentUser.value.fullName || currentUser.value.displayName || '',
      username: currentUser.value.username || '',
      email: currentUser.value.email || '',
      photo: currentUser.value.photo || currentUser.value.photoURL || ''
    };
  }
});

watch(currentUser, (user) => {
  if (user) {
    profileForm.value = {
      fullName: user.fullName || user.displayName || '',
      username: user.username || '',
      email: user.email || '',
      photo: user.photo || user.photoURL || ''
    };
  }
}, { immediate: true });

const choosePhoto = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/jpg,image/png';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      error.value = 'File size must be less than 1MB';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      profileForm.value.photo = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  input.click();
};

const deletePhoto = () => {
  profileForm.value.photo = '';
};

const handleUpdateProfile = async () => {
  updateLoading.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    const result = await userStore.updateProfile({
      fullName: profileForm.value.fullName,
      username: profileForm.value.username,
      photo: profileForm.value.photo
    });
    
    await authStore.refreshUserData();
    
    successMessage.value = result.message;
    
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (e: any) {
    error.value = e.message || 'Failed to update profile';
  } finally {
    updateLoading.value = false;
  }
};
</script>

<style scoped>
.content-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 32px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #17a2b8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.photo-upload {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #eee;
}

.photo-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.photo-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-avatar i {
  font-size: 32px;
  color: #999;
}

.btn-choose {
  padding: 8px 20px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-choose:hover {
  background: #138496;
}

.photo-info {
  font-size: 13px;
  color: #999;
}

.btn-delete {
  padding: 4px 8px;
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #dc3545;
  color: #fff;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mb-4 {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #17a2b8;
}

.form-control:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #999;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  max-width: 500px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-primary {
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #138496;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .photo-upload {
    flex-wrap: wrap;
  }

  .form-control {
    max-width: 100%;
  }

  .alert {
    max-width: 100%;
  }
}
</style>