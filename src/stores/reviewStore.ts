import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from './authStore';
import type { Review, CreateReviewData, UpdateReviewData } from '@/types';

export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([]);
  const productReviews = ref<Review[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Check if user can review a product
  const canUserReview = async (productId: string): Promise<{ canReview: boolean; orderId?: string; message?: string }> => {
    if (!authStore.user) {
      return { canReview: false, message: 'User must be authenticated' };
    }

    try {
      // Check if user has ordered this product
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', authStore.user.uid),
        where('status', 'in', ['delivered', 'shipped'])
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      let hasOrdered = false;
      let orderId = '';

      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        const hasProduct = orderData.items?.some((item: any) => item.id === productId);
        if (hasProduct && !hasOrdered) {
          hasOrdered = true;
          orderId = doc.id;
        }
      });

      if (!hasOrdered) {
        return { canReview: false, message: 'You must purchase this product first to leave a review' };
      }

      // Check if user has already reviewed this product
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', authStore.user.uid),
        where('productId', '==', productId)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      if (!reviewsSnapshot.empty) {
        return { canReview: false, message: 'You have already reviewed this product' };
      }

      return { canReview: true, orderId };
    } catch (err) {
      console.error('Check review permission error:', err);
      return { canReview: false, message: 'Failed to check review permission' };
    }
  };

  // Create review
  const createReview = async (reviewData: CreateReviewData): Promise<Review | null> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      // Validate if user can review
      const permission = await canUserReview(reviewData.productId);
      if (!permission.canReview) {
        error.value = permission.message || 'Cannot create review';
        return null;
      }

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid));
      const userData = userDoc.data();

      const now = new Date().toISOString();

      const newReview = {
        productId: reviewData.productId,
        userId: authStore.user.uid,
        orderId: reviewData.orderId,
        userName: userData?.fullName || userData?.username || authStore.user.email || 'Anonymous',
        userPhoto: userData?.photo || authStore.user.photoURL || null,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        createdAt: now,
        updatedAt: now
      };

      const reviewRef = await addDoc(collection(db, 'reviews'), newReview);

      // Update product rating
      await updateProductRating(reviewData.productId);

      const review: Review = {
        id: reviewRef.id,
        ...newReview
      };

      reviews.value.unshift(review);
      productReviews.value.unshift(review);

      return review;
    } catch (err) {
      console.error('Create review error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create review';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update review
  const updateReview = async (reviewId: string, updateData: UpdateReviewData): Promise<boolean> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        error.value = 'Review not found';
        return false;
      }

      const reviewData = reviewDoc.data();
      
      // Check if user owns this review
      if (reviewData.userId !== authStore.user.uid) {
        error.value = 'You can only edit your own reviews';
        return false;
      }

      const now = new Date().toISOString();
      const updates = {
        rating: updateData.rating,
        comment: updateData.comment,
        images: updateData.images || [],
        updatedAt: now
      };

      await updateDoc(reviewRef, updates);

      // Update product rating
      await updateProductRating(reviewData.productId);

      // Update local state
      const updateLocalReview = (reviewsList: Review[]) => {
        const index = reviewsList.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          reviewsList[index] = {
            ...reviewsList[index],
            ...updates
          };
        }
      };

      updateLocalReview(reviews.value);
      updateLocalReview(productReviews.value);

      return true;
    } catch (err) {
      console.error('Update review error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to update review';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        error.value = 'Review not found';
        return false;
      }

      const reviewData = reviewDoc.data();
      
      // Check if user owns this review
      if (reviewData.userId !== authStore.user.uid) {
        error.value = 'You can only delete your own reviews';
        return false;
      }

      const productId = reviewData.productId;

      await deleteDoc(reviewRef);

      // Update product rating
      await updateProductRating(productId);

      // Update local state
      reviews.value = reviews.value.filter(r => r.id !== reviewId);
      productReviews.value = productReviews.value.filter(r => r.id !== reviewId);

      return true;
    } catch (err) {
      console.error('Delete review error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to delete review';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Update product rating (recalculate average)
  const updateProductRating = async (productId: string): Promise<void> => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      let totalRating = 0;
      let totalReviews = 0;

      reviewsSnapshot.forEach((doc) => {
        const review = doc.data();
        totalRating += review.rating;
        totalReviews++;
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      // Update product document
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews
      });
    } catch (err) {
      console.error('Update product rating error:', err);
    }
  };

  // Get reviews by product ID
  const getProductReviews = async (productId: string): Promise<Review[]> => {
    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviewsList: Review[] = [];

      querySnapshot.forEach((doc) => {
        reviewsList.push({
          id: doc.id,
          ...doc.data()
        } as Review);
      });

      productReviews.value = reviewsList;
      return reviewsList;
    } catch (err) {
      console.error('Get product reviews error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to get reviews';
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Get user reviews
  const getUserReviews = async (): Promise<Review[]> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviewsList: Review[] = [];

      querySnapshot.forEach((doc) => {
        reviewsList.push({
          id: doc.id,
          ...doc.data()
        } as Review);
      });

      reviews.value = reviewsList;
      return reviewsList;
    } catch (err) {
      console.error('Get user reviews error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to get reviews';
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Get review rating distribution
  const getRatingDistribution = (reviews: Review[]): { [key: number]: number } => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return distribution;
  };

  return {
    reviews,
    productReviews,
    loading,
    error,
    canUserReview,
    createReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews,
    getRatingDistribution
  };
});