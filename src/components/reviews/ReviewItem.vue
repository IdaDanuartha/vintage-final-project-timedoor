<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import type { Review } from '@/types';

const props = defineProps<{
  review: Review;
}>();

const emit = defineEmits<{
  edit: [review: Review];
  deleted: [];
}>();

const authStore = useAuthStore();
const reviewStore = useReviewStore();

const showMenu = ref(false);
const showDeleteConfirm = ref(false);
const deleting = ref(false);

const isOwner = computed(() => {
  return authStore.user?.uid === props.review.userId;
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleEdit = () => {
  closeMenu();
  emit('edit', props.review);
};

const handleDeleteClick = () => {
  closeMenu();
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};

const confirmDelete = async () => {
  deleting.value = true;
  
  try {
    const success = await reviewStore.deleteReview(props.review.id);
    
    if (success) {
      showDeleteConfirm.value = false;
      emit('deleted');
    } else {
      alert(reviewStore.error || 'Failed to delete review');
    }
  } catch (err) {
    console.error('Delete review error:', err);
    alert('Failed to delete review');
  } finally {
    deleting.value = false;
  }
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.review-menu-container')) {
    closeMenu();
  }
};

// Add/remove event listener
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside);
}
</script>

<template>
  <div class="review-item">
    <div class="review-header">
      <div class="user-info">
        <img 
          :src="review.userPhoto || '/images/default-avatar.png'" 
          :alt="review.userName"
          class="user-avatar"
        >
        <div>
          <h4 class="user-name">{{ review.userName }}</h4>
          <div class="review-stars">
            <svg 
              v-for="star in 5" 
              :key="star"
              class="star-icon"
              :class="{ 'star-filled': star <= review.rating }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="review-meta">
        <span class="review-date">{{ formatDate(review.createdAt) }}</span>
        <span v-if="review.updatedAt && review.updatedAt !== review.createdAt" class="edited-badge">
          (edited)
        </span>
        
        <!-- Menu for owner -->
        <div v-if="isOwner" class="review-menu-container">
          <button class="menu-button" @click.stop="toggleMenu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          
          <div v-if="showMenu" class="menu-dropdown">
            <button class="menu-item" @click="handleEdit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
            <button class="menu-item menu-item-danger" @click="handleDeleteClick">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <p class="review-comment">{{ review.comment }}</p>

    <!-- Review Images -->
    <div v-if="review.images && review.images.length > 0" class="review-images">
      <img 
        v-for="(image, index) in review.images" 
        :key="index"
        :src="image" 
        :alt="`Review image ${index + 1}`"
        class="review-image"
      >
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          
          <h3 class="confirm-title">Delete Review?</h3>
          <p class="confirm-text">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          
          <div class="confirm-actions">
            <button 
              class="btn-confirm btn-cancel" 
              @click="cancelDelete"
              :disabled="deleting"
            >
              Cancel
            </button>
            <button 
              class="btn-confirm btn-delete" 
              @click="confirmDelete"
              :disabled="deleting"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.review-item {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.review-stars {
  display: flex;
  gap: 0.125rem;
}

.star-icon {
  width: 14px;
  height: 14px;
  color: #D1D5DB;
}

.star-icon.star-filled {
  color: #FCD34D;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-date {
  font-size: 0.8125rem;
  color: #6B7280;
}

.edited-badge {
  font-size: 0.75rem;
  color: #9CA3AF;
  font-style: italic;
}

.review-menu-container {
  position: relative;
}

.menu-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #6B7280;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-button:hover {
  background: #F3F4F6;
  color: #1a1a1a;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 10;
  margin-top: 0.25rem;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-item:hover {
  background: #F3F4F6;
}

.menu-item-danger {
  color: #EF4444;
}

.menu-item-danger:hover {
  background: #FEE2E2;
}

.review-comment {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.review-images {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.review-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.review-image:hover {
  transform: scale(1.05);
}

/* Delete Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm-icon {
  margin-bottom: 1rem;
  color: #EF4444;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
}

.confirm-text {
  color: #6B7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-confirm {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: inherit;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: #6B7280;
  border: 1px solid #D1D5DB;
}

.btn-cancel:hover:not(:disabled) {
  background: #F9FAFB;
}

.btn-delete {
  background: #EF4444;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@media (max-width: 576px) {
  .review-item {
    padding: 1rem;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .review-images {
    gap: 0.375rem;
  }

  .review-image {
    width: 70px;
    height: 70px;
  }

  .confirm-modal {
    padding: 1.5rem;
  }

  .confirm-actions {
    flex-direction: column;
  }
}
</style>