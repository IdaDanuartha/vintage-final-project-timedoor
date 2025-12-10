import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from './authStore';
import type { Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);

  const authStore = useAuthStore();

  // Total items in cart
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Total price
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (parseInt(item.price) * item.quantity);
    }, 0);
  });

  // Load cart from Firestore
  const loadCart = async () => {
    if (!authStore.user) return;
    
    loading.value = true;
    try {
      const cartDoc = await getDoc(doc(db, 'carts', authStore.user.uid));
      if (cartDoc.exists()) {
        items.value = cartDoc.data().items || [];
      }
    } catch (err) {
      console.error('Load cart error:', err);
    } finally {
      loading.value = false;
    }
  };

  // Save cart to Firestore
  const saveCart = async () => {
    if (!authStore.user) return;
    
    try {
      await setDoc(doc(db, 'carts', authStore.user.uid), {
        items: items.value,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Save cart error:', err);
    }
  };

  // Add item to cart
  const addItem = async (product: Product) => {
    const existingItem = items.value.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
    
    await saveCart();
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    items.value = items.value.filter(item => item.id !== productId);
    await saveCart();
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        await removeItem(productId);
      } else {
        await saveCart();
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    items.value = [];
    await saveCart();
  };

  return {
    items,
    loading,
    totalItems,
    totalPrice,
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
});