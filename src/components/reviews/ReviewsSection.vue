<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useReviewStore } from '@/stores/reviewStore';
import { useAuthStore } from '@/stores/authStore';
import CreateReviewModal from '../modals/CreateReviewModal.vue';
import EditReviewModal from '../modals/EditReviewModal.vue';
import ReviewItem from './ReviewItem.vue'
import type { Product, Review } from '@/types';

const props = defineProps<{
  product: Product;
}>();

const reviewStore = useReviewStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const reviewToEdit = ref<Review | null>(null);
const canReview = ref(false);
const orderId = ref('');
const checkingPermission = ref(false);

const reviews = computed(() => reviewStore.productReviews);

const ratingDistribution = computed(() => {
  return reviewStore.getRatingDistribution(reviews.value);
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const total = reviews.value.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.value.length).toFixed(1));
});

const ratingPercentages = computed(() => {
  const total = reviews.value.length;
  if (total === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  return {
    5: Math.round((ratingDistribution.value[5] / total) * 100),
    4: Math.round((ratingDistribution.value[4] / total) * 100),
    3: Math.round((ratingDistribution.value[3] / total) * 100),
    2: Math.round((ratingDistribution.value[2] / total) * 100),
    1: Math.round((ratingDistribution.value[1] / total) * 100),
  };
});

const checkReviewPermission = async () => {
  if (!authStore.isAuthenticated) {
    canReview.value = false;
    return;
  }

  checkingPermission.value = true;
  
  try {
    const result = await reviewStore.canUserReview(props.product.id);
    console.log(result)
    canReview.value = result.canReview;
    orderId.value = result.orderId || '';
  } catch (err) {
    console.error('Failed to check review permission:', err);
    canReview.value = false;
  } finally {
    checkingPermission.value = false;
  }
};

const handleWriteReview = () => {
  if (!authStore.isAuthenticated) {
    // Redirect to login or show message
    alert('Please login to write a review');
    return;
  }
  
  showCreateModal.value = true;
};

const handleEditReview = (review: Review) => {
  reviewToEdit.value = review;
  showEditModal.value = true;
};

const handleReviewCreated = async () => {
  showCreateModal.value = false;
  await loadReviews();
  await checkReviewPermission();
};

const handleReviewUpdated = async () => {
  showEditModal.value = false;
  reviewToEdit.value = null;
  await loadReviews();
};

const handleReviewDeleted = async () => {
  await loadReviews();
  await checkReviewPermission();
};

const loadReviews = async () => {
  await reviewStore.getProductReviews(props.product.id);
};

onMounted(async () => {
  await loadReviews();
  await checkReviewPermission();
});
</script>

<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h3 class="section-title">Customer Reviews</h3>
      <button 
        v-if="canReview" 
        class="btn-write-review"
        @click="handleWriteReview"
        :disabled="checkingPermission"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Write a Review
      </button>
    </div>

    <!-- Rating Summary -->
    <div v-if="reviews.length > 0" class="rating-summary">
      <div class="rating-overview">
        <div class="average-rating">
          <span class="rating-number">{{ averageRating }}</span>
          <div class="rating-stars-large">
            <svg 
              v-for="star in 5" 
              :key="star"
              class="star-icon"
              :class="{ 'star-filled': star <= Math.round(averageRating) }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p class="review-count">Based on {{ reviews.length }} {{ reviews.length === 1 ? 'review' : 'reviews' }}</p>
        </div>

        <div class="rating-bars">
          <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar-row">
            <span class="rating-label">{{ rating }}</span>
            <svg class="star-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div class="rating-bar">
              <div 
                class="rating-bar-fill" 
                :style="{ width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%` }"
              ></div>
            </div>
            <span class="rating-percentage">{{ ratingPercentages[rating as keyof typeof ratingPercentages] }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-if="reviewStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading reviews...</p>
      </div>

      <div v-else-if="reviews.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <h4>No reviews yet</h4>
        <p v-if="canReview">Be the first to review this product!</p>
        <p v-else-if="!authStore.isAuthenticated">Login to write a review</p>
        <p v-else>Purchase this product to leave a review</p>
        <button 
          v-if="canReview" 
          class="btn-write-first"
          @click="handleWriteReview"
        >
          Write First Review
        </button>
      </div>

      <div v-else class="reviews-container">
        <ReviewItem
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          @edit="handleEditReview"
          @deleted="handleReviewDeleted"
        />
      </div>
    </div>

    <!-- Modals -->
    <CreateReviewModal
      v-if="showCreateModal"
      :product="product"
      :order-id="orderId"
      @close="showCreateModal = false"
      @success="handleReviewCreated"
    />

    <EditReviewModal
      v-if="showEditModal && reviewToEdit"
      :review="reviewToEdit"
      :product="product"
      @close="showEditModal = false"
      @success="handleReviewUpdated"
    />
  </div>
</template>

<style scoped>
.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #E5E7EB;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.btn-write-review {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #14B8A6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-write-review:hover:not(:disabled) {
  background: #0F9D8E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-write-review:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Rating Summary */
.rating-summary {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #F9FAFB;
  border-radius: 12px;
}

.rating-overview {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
}

.average-rating {
  text-align: center;
  padding-right: 2rem;
  border-right: 2px solid #E5E7EB;
}

.rating-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.rating-stars-large {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.rating-stars-large .star-icon {
  width: 24px;
  height: 24px;
  color: #D1D5DB;
}

.rating-stars-large .star-icon.star-filled {
  color: #FCD34D;
}

.review-count {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar-row {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
  width: 12px;
}

.star-small {
  width: 14px;
  height: 14px;
  color: #FCD34D;
}

.rating-bar {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background: #FCD34D;
  transition: width 0.3s ease;
}

.rating-percentage {
  font-size: 0.8125rem;
  color: #6B7280;
  min-width: 36px;
  text-align: right;
}

/* Reviews List */
.reviews-list {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6B7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top-color: #14B8A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6B7280;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #9CA3AF;
}

.empty-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
}

.btn-write-first {
  padding: 0.75rem 1.5rem;
  background: #14B8A6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-write-first:hover {
  background: #0F9D8E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.reviews-container {
  border-top: 1px solid #E5E7EB;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reviews-section {
    padding: 1.5rem;
  }

  .reviews-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .btn-write-review {
    width: 100%;
    justify-content: center;
  }

  .rating-overview {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .average-rating {
    padding-right: 0;
    padding-bottom: 1.5rem;
    border-right: none;
    border-bottom: 2px solid #E5E7EB;
  }

  .rating-number {
    font-size: 2.5rem;
  }
}

@media (max-width: 576px) {
  .reviews-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .rating-summary {
    padding: 1rem;
  }

  .rating-number {
    font-size: 2rem;
  }

  .rating-stars-large .star-icon {
    width: 20px;
    height: 20px;
  }
}
</style>