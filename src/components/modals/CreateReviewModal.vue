<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReviewStore } from '@/stores/reviewStore'
import type { Product } from '@/types'

const props = defineProps<{
  product: Product
  orderId: string
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const reviewStore = useReviewStore()

// ✅ INIT MANUAL (PENTING)
const rating = ref(0)
const comment = ref('')
const hoveredRating = ref(0)
const submitting = ref(false)
const errorMessage = ref('')

const isValid = computed(() => {
  return rating.value > 0 && comment.value.trim().length >= 10
})

const setRating = (value: number) => {
  rating.value = value
}

const setHoverRating = (value: number) => {
  hoveredRating.value = value
}

const clearHoverRating = () => {
  hoveredRating.value = 0
}

const displayRating = computed(() => hoveredRating.value || rating.value)

const submitCreate = async () => {
  if (!isValid.value) {
    errorMessage.value = 'Please provide a rating and at least 10 characters for your review'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const review = await reviewStore.createReview({
      productId: props.product.id,
      orderId: props.orderId,
      rating: rating.value,
      comment: comment.value.trim(),
      images: []
    })

    if (review) {
      emit('success')
      emit('close')
    } else {
      errorMessage.value = reviewStore.error || 'Failed to submit review'
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to submit review'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    emit('close')
  }
}
</script>


<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="review-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Write a Review</h3>
        <button class="close-button" @click="closeModal" :disabled="submitting">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <!-- Product Info -->
        <div class="product-info">
          <img :src="product.image" :alt="product.name" class="product-image">
          <div class="product-details">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-size">Size: {{ product.size }}</p>
          </div>
        </div>

        <!-- Rating -->
        <div class="rating-section">
          <label class="section-label">Your Rating *</label>
          <div class="star-rating">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-button"
              @click="setRating(star)"
              @mouseenter="setHoverRating(star)"
              @mouseleave="clearHoverRating"
              :disabled="submitting"
            >
              <svg
                class="star-icon"
                :class="{ 'star-filled': star <= displayRating }"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>

          <p v-if="rating > 0" class="rating-text">
            {{
              rating === 5 ? 'Excellent!' :
              rating === 4 ? 'Great!' :
              rating === 3 ? 'Good' :
              rating === 2 ? 'Fair' : 'Poor'
            }}
          </p>
        </div>

        <!-- Comment -->
        <div class="comment-section">
          <label class="section-label">Your Review *</label>
          <textarea
            v-model="comment"
            class="comment-textarea"
            placeholder="Share your experience with this product (minimum 10 characters)"
            rows="5"
            :disabled="submitting"
          />
          <p
            class="character-count"
            :class="{ 'text-danger': comment.length < 10 && comment.length > 0 }"
          >
            {{ comment.length }} / 10 minimum characters
          </p>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-modal btn-cancel" @click="closeModal" :disabled="submitting">
            Cancel
          </button>
          <button
            class="btn-modal btn-submit"
            @click="submitCreate"
            :disabled="!isValid || submitting"
          >
            {{ submitting ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
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

.review-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6B7280;
  transition: color 0.2s;
}

.close-button:hover:not(:disabled) {
  color: #1a1a1a;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.product-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.product-size {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.rating-section,
.comment-section {
  margin-bottom: 1.5rem;
}

.section-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.star-button:hover:not(:disabled) {
  transform: scale(1.1);
}

.star-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.star-icon {
  width: 32px;
  height: 32px;
  color: #D1D5DB;
  transition: color 0.2s;
}

.star-icon.star-filled {
  color: #FCD34D;
}

.rating-text {
  font-size: 0.875rem;
  color: #14B8A6;
  font-weight: 500;
  margin: 0;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #14B8A6;
}

.comment-textarea:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.character-count {
  font-size: 0.8125rem;
  color: #6B7280;
  margin: 0.5rem 0 0 0;
  text-align: right;
}

.character-count.text-danger {
  color: #EF4444;
}

.error-message {
  padding: 0.75rem;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 6px;
  color: #DC2626;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.info-message {
  padding: 0.75rem;
  background: #DBEAFE;
  border: 1px solid #93C5FD;
  border-radius: 6px;
  color: #1E40AF;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-modal {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: inherit;
}

.btn-modal:disabled {
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

.btn-submit {
  background: #14B8A6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #0F9D8E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

@media (max-width: 576px) {
  .review-modal {
    max-width: 100%;
    margin: 0.5rem;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }

  .star-icon {
    width: 28px;
    height: 28px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-modal {
    width: 100%;
  }
}
</style>