import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { db, auth } from '@/config/firebase';
import type { User, Order } from '@/types';
import { useAuthStore } from './authStore';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authStore = useAuthStore();

  // Computed
  const userId = computed(() => authStore.user?.uid);
  const userEmail = computed(() => authStore.user?.email);

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!userId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const userRef = doc(db, 'users', userId.value);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firestoreData = userSnap.data();
        currentUser.value = {
          uid: userSnap.id,
          email: firestoreData.email,
          displayName: firestoreData.fullName,
          photoURL: firestoreData.photo,
          username: firestoreData.username,
          fullName: firestoreData.fullName,
          photo: firestoreData.photo,
          wishlist: firestoreData.wishlist || [],
          createdAt: firestoreData.createdAt,
          updatedAt: firestoreData.updatedAt
        } as User;
      }
    } catch (e: any) {
      error.value = e.message;
      console.error('Error fetching user:', e);
    } finally {
      loading.value = false;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    if (!userId.value) throw new Error('No user logged in');
    
    loading.value = true;
    error.value = null;
    
    try {
      const userRef = doc(db, 'users', userId.value);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      if (currentUser.value) {
        currentUser.value = {
          ...currentUser.value,
          ...data
        };
      }
      
      return { success: true, message: 'Profile updated successfully!' };
    } catch (e: any) {
      error.value = e.message;
      console.error('Error updating profile:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');
    
    loading.value = true;
    error.value = null;
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true, message: 'Password changed successfully!' };
    } catch (e: any) {
      error.value = e.message;
      if (e.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw new Error('Failed to change password');
    } finally {
      loading.value = false;
    }
  };

  // Fetch user orders
  const fetchUserOrders = async () => {
    if (!userId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId.value));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      
      orders.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort by date (newest first)
      orders.value.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log(orders.value);
    } catch (e: any) {
      error.value = e.message;
      console.error('Error fetching orders:', e);
    } finally {
      loading.value = false;
    }
  };

  // Get order status color
  const getOrderStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger',
      'completed': 'success'
    };
    return statusMap[status.toLowerCase()] || 'secondary';
  };

  // Format price
  const formatPrice = (price: number): string => {
    return price.toLocaleString('id-ID');
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Reset store
  const reset = () => {
    currentUser.value = null;
    orders.value = [];
    error.value = null;
  };

  return {
    // State
    currentUser,
    orders,
    loading,
    error,
    userId,
    userEmail,
    
    // Actions
    fetchUserProfile,
    updateProfile,
    changePassword,
    fetchUserOrders,
    getOrderStatusColor,
    formatPrice,
    formatDate,
    reset
  };
});