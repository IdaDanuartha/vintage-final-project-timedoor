import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from './authStore';
import type { Product } from '@/types';

export interface CartItem extends Product {
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Total items in cart
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Total price
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseInt(item.price) : item.price;
      return sum + (price * item.quantity);
    }, 0);
  });

  // Load cart from Firestore
  const loadCart = async () => {
    if (!authStore.user) {
      items.value = [];
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const cartRef = doc(db, 'carts', authStore.user.uid);
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        const cartData = cartDoc.data();
        items.value = cartData.items || [];
      } else {
        items.value = [];
      }
    } catch (err: any) {
      console.error('Load cart error:', err);
      error.value = err.message || 'Failed to load cart';
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Save cart to Firestore
  const saveCart = async () => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }
    
    try {
      const cartRef = doc(db, 'carts', authStore.user.uid);
      await setDoc(cartRef, {
        items: items.value,
        updatedAt: new Date().toISOString(),
        userId: authStore.user.uid
      }, { merge: true });
    } catch (err: any) {
      console.error('Save cart error:', err);
      error.value = err.message || 'Failed to save cart';
      throw err;
    }
  };

  // Add item to cart
  const addItem = async (product: Product) => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }

    loading.value = true;
    error.value = null;
    
    try {
      const existingItem = items.value.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        items.value.push({ 
          ...product, 
          quantity: 1 
        });
      }
      
      await saveCart();
    } catch (err: any) {
      console.error('Add item error:', err);
      error.value = err.message || 'Failed to add item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }

    loading.value = true;
    error.value = null;
    
    try {
      items.value = items.value.filter(item => item.id !== productId);
      await saveCart();
    } catch (err: any) {
      console.error('Remove item error:', err);
      error.value = err.message || 'Failed to remove item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }

    loading.value = true;
    error.value = null;
    
    try {
      const item = items.value.find(item => item.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          await removeItem(productId);
        } else {
          item.quantity = quantity;
          await saveCart();
        }
      }
    } catch (err: any) {
      console.error('Update quantity error:', err);
      error.value = err.message || 'Failed to update quantity';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }

    loading.value = true;
    error.value = null;
    
    try {
      items.value = [];
      await saveCart();
    } catch (err: any) {
      console.error('Clear cart error:', err);
      error.value = err.message || 'Failed to clear cart';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return items.value.some(item => item.id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId: string): number => {
    const item = items.value.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    items,
    loading,
    error,
    totalItems,
    totalPrice,
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };
});