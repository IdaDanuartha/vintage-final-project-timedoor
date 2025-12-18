import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from './authStore';
import type { CartItem } from './cartStore';

export interface ShippingAddress {
  name: string;
  address: string;
}

export interface DeliveryMethod {
  name: string;
  price: number;
  estimatedTime: string;
}

export interface PaymentMethod {
  type: string;
  last4: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  protectionFee: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  protectionFee: number;
  shippingFee: number;
  total: number;
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Generate order number
  const generateOrderNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };

  // Create new order
  const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const orderNumber = generateOrderNumber();
      const now = new Date().toISOString();

      const newOrder = {
        orderNumber,
        userId: authStore.user.uid,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        deliveryMethod: orderData.deliveryMethod,
        paymentMethod: orderData.paymentMethod,
        subtotal: orderData.subtotal,
        protectionFee: orderData.protectionFee,
        shippingFee: orderData.shippingFee,
        total: orderData.total,
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), newOrder);

      const order: Order = {
        id: docRef.id,
        ...newOrder
      };

      currentOrder.value = order;
      orders.value.unshift(order);

      return order;
    } catch (err) {
      console.error('Create order error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create order';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get order by ID
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const order: Order = {
          id: docSnap.id,
          ...data
        } as Order;

        currentOrder.value = order;
        return order;
      } else {
        error.value = 'Order not found';
        return null;
      }
    } catch (err) {
      console.error('Get order error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to get order';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get user orders
  const getUserOrders = async (): Promise<Order[]> => {
    if (!authStore.user) {
      error.value = 'User must be authenticated';
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userOrders: Order[] = [];

      querySnapshot.forEach((doc) => {
        userOrders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });

      orders.value = userOrders;
      return userOrders;
    } catch (err) {
      console.error('Get user orders error:', err);
      error.value = err instanceof Error ? err.message : 'Failed to get orders';
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Clear current order
  const clearCurrentOrder = (): void => {
    currentOrder.value = null;
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    getOrderById,
    getUserOrders,
    clearCurrentOrder
  };
});