<template>
  <div id="settings" class="page">
    <div class="settings-container">
      <h1 class="settings-title">Settings</h1>

      <div class="settings-layout">
        <!-- Sidebar Menu -->
        <div class="sidebar-menu">
          <div 
            v-for="menu in menuItems" 
            :key="menu.id"
            :class="['menu-item', { active: activeMenu === menu.id }]"
            @click="activeMenu = menu.id"
          >
            {{ menu.label }}
          </div>
        </div>

        <!-- Content Area -->
        <div class="settings-content">
          <!-- Profile Details -->
          <div v-if="activeMenu === 'profile'">
            <h2 class="content-title">Edit Profile</h2>

            <div class="photo-upload">
              <span class="photo-label">Photo</span>
              <div class="photo-avatar">
                <img v-if="profileForm.photo" :src="profileForm.photo" alt="Profile">
                <i v-else class="fas fa-user"></i>
              </div>
              <button class="btn-choose" @click="choosePhoto">Choose</button>
              <span class="photo-info">JPG, JPEG or PNG, 1 MB max.</span>
              <button class="btn-delete" @click="deletePhoto">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>

            <form @submit.prevent="updateProfile">
              <div class="mb-4">
                <label class="form-label">Full name</label>
                <input 
                  v-model="profileForm.fullName"
                  type="text" 
                  class="form-control"
                >
              </div>

              <div class="mb-4">
                <label class="form-label">Username</label>
                <input 
                  v-model="profileForm.username"
                  type="text" 
                  class="form-control"
                >
              </div>

              <div class="mb-4">
                <label class="form-label">Email</label>
                <input 
                  v-model="profileForm.email"
                  type="email" 
                  class="form-control"
                >
              </div>

              <button type="submit" class="btn btn-primary cursor-pointer px-4 py-3">
                Update Profile
              </button>
            </form>
          </div>

          <!-- Change Password -->
          <div v-if="activeMenu === 'password'">
            <h2 class="content-title">Change Password</h2>
            <form @submit.prevent="changePassword">
              <div class="mb-4">
                <label class="form-label">Current Password</label>
                <input 
                  v-model="passwordForm.currentPassword"
                  type="password" 
                  class="form-control"
                >
              </div>

              <div class="mb-4">
                <label class="form-label">New Password</label>
                <input 
                  v-model="passwordForm.newPassword"
                  type="password" 
                  class="form-control"
                >
              </div>

              <div class="mb-4">
                <label class="form-label">Confirm New Password</label>
                <input 
                  v-model="passwordForm.confirmPassword"
                  type="password" 
                  class="form-control"
                >
              </div>

              <button type="submit" class="btn btn-primary cursor-pointer px-4 py-3">
                Change Password
              </button>
            </form>
          </div>

          <!-- Transaction History -->
          <div v-if="activeMenu === 'transactions'">
            <h2 class="content-title">Transaction History</h2>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in transactions" :key="transaction.id">
                    <td>{{ transaction.id }}</td>
                    <td>{{ transaction.product }}</td>
                    <td>{{ transaction.date }}</td>
                    <td>Rp{{ formatPrice(transaction.total) }}</td>
                    <td>
                      <span :class="`badge bg-${getStatusColor(transaction.status)}`">
                        {{ transaction.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UserProfile } from '@/types';

const activeMenu = ref('profile');

const menuItems = [
  { id: 'profile', label: 'Profile details' },
  { id: 'password', label: 'Change Password' },
  { id: 'transactions', label: 'Transaction History' }
];

const profileForm = ref<UserProfile>({
  fullName: 'Jack Daniel',
  username: 'jackdaniel',
  email: 'jack@email.com',
  photo: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const transactions = ref([
  { id: 'ORD-001', product: 'Vintage Hoodie', date: '2024-01-15', total: 200000, status: 'Completed' },
  { id: 'ORD-002', product: 'Vintage T-Shirt', date: '2024-01-14', total: 150000, status: 'Pending' },
  { id: 'ORD-003', product: 'Vintage Jacket', date: '2024-01-10', total: 350000, status: 'Shipped' }
]);

const formatPrice = (price: number): string => {
  return price.toLocaleString('id-ID');
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Completed': 'success',
    'Pending': 'warning',
    'Shipped': 'info',
    'Cancelled': 'danger'
  };
  return colors[status] || 'secondary';
};

const choosePhoto = () => {
  // Implementasi upload photo
  console.log('Choose photo');
};

const deletePhoto = () => {
  profileForm.value.photo = '';
};

const updateProfile = () => {
  console.log('Update profile:', profileForm.value);
};

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  console.log('Change password');
};
</script>