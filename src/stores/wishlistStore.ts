import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from './authStore';
import type { Product } from '@/types';

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Computed
  const wishlistCount = computed(() => items.value.length);
  
  const isInWishlist = (productId: string): boolean => {
    return items.value.some(item => item.id === productId);
  };

  // Load wishlist from Firestore (user document with wishlist array)
  const loadWishlist = async (): Promise<void> => {
    if (!authStore.user) {
      items.value = [];
      loadFromLocalStorage();
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Get user document
      const userDocRef = doc(db, 'users', authStore.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const wishlistIds = userData.wishlist || [];

        // Fetch product details for each wishlist item
        const wishlistItems: Product[] = [];
        
        for (const productId of wishlistIds) {
          try {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              wishlistItems.push({
                id: productSnap.id,
                ...productSnap.data()
              } as Product);
            }
          } catch (err) {
            console.error(`Failed to fetch product ${productId}:`, err);
          }
        }

        items.value = wishlistItems;
        saveToLocalStorage();
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          email: authStore.user.email,
          fullName: authStore.user.displayName || '',
          username: authStore.user.email?.split('@')[0] || '',
          createdAt: new Date().toISOString(),
          wishlist: []
        });
        items.value = [];
      }
    } catch (err) {
      console.error('Load wishlist error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load wishlist';
      
      // Fallback to localStorage if Firestore fails
      loadFromLocalStorage();
    } finally {
      loading.value = false;
    }
  };

  // Add to wishlist
  const addToWishlist = async (product: Product): Promise<boolean> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      // Add to localStorage for non-authenticated users
      addToLocalStorage(product);
      return false;
    }

    // Check if already in wishlist
    if (isInWishlist(product.id)) {
      error.value = 'Product already in wishlist';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      // Add product ID to user's wishlist array
      const userDocRef = doc(db, 'users', authStore.user.uid);
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(product.id)
      });

      // Add to local state
      items.value.unshift(product);

      // Sync to localStorage
      saveToLocalStorage();

      return true;
    } catch (err) {
      console.error('Add to wishlist error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to add to wishlist';
      
      // Fallback to localStorage
      addToLocalStorage(product);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    const item = items.value.find(item => item.id === productId);
    
    if (!item) {
      error.value = 'Product not in wishlist';
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      // Remove product ID from user's wishlist array
      if (authStore.user) {
        const userDocRef = doc(db, 'users', authStore.user.uid);
        await updateDoc(userDocRef, {
          wishlist: arrayRemove(productId)
        });
      }

      // Remove from local state
      items.value = items.value.filter(i => i.id !== productId);

      // Sync to localStorage
      saveToLocalStorage();

      return true;
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      
      // Still remove from local state even if Firestore fails
      items.value = items.value.filter(i => i.id !== productId);
      saveToLocalStorage();
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (product: Product): Promise<boolean> => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Clear wishlist
  const clearWishlist = async (): Promise<void> => {
    if (authStore.user) {
      try {
        // Clear wishlist array in user document
        const userDocRef = doc(db, 'users', authStore.user.uid);
        await updateDoc(userDocRef, {
          wishlist: []
        });
      } catch (err) {
        console.error('Clear wishlist error:', err);
      }
    }

    items.value = [];
    localStorage.removeItem('wishlist');
  };

  // LocalStorage fallback methods
  const saveToLocalStorage = (): void => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items.value));
    } catch (err) {
      console.error('Save to localStorage error:', err);
    }
  };

  const loadFromLocalStorage = (): void => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        items.value = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Load from localStorage error:', err);
      items.value = [];
    }
  };

  const addToLocalStorage = (product: Product): void => {
    if (!isInWishlist(product.id)) {
      items.value.unshift(product);
      saveToLocalStorage();
    }
  };

  return {
    items,
    loading,
    error,
    wishlistCount,
    isInWishlist,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist
  };
});