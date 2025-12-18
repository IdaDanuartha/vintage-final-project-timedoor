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
        <button class="btn-choose" @click="choosePhoto">Choose</button>
        <span class="photo-info">JPG, JPEG or PNG, 1 MB max.</span>
        <button class="btn-delete" @click="deletePhoto" :disabled="!profileForm.photo">
          <i class="far fa-trash-alt"></i>
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

// Load user data
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

  console.log(profileForm.value)
});

// Watch for user data changes
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
    
    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      error.value = 'File size must be less than 1MB';
      return;
    }
    
    // Convert to base64 for preview (in production, upload to storage)
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
    
    // Refresh auth store data
    await authStore.refreshUserData();
    
    successMessage.value = result.message;
    
    // Clear success message after 3 seconds
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

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: #999;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>