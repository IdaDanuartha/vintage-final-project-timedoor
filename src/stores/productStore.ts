import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
//   orderBy,
//   limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Product } from '@/types';

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  const currentProduct = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all products
  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (err: any) {
      error.value = err.message;
      console.error('Fetch products error:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch product by ID
  const fetchProductById = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        currentProduct.value = {
          id: docSnap.id,
          ...docSnap.data()
        } as Product;
      } else {
        error.value = 'Product not found';
        currentProduct.value = null;
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Fetch product error:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (category: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      products.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (err: any) {
      error.value = err.message;
      console.error('Fetch products by category error:', err);
    } finally {
      loading.value = false;
    }
  };

  // Add new product
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        uploadedAt: new Date().toISOString()
      });
      
      const newProduct = {
        id: docRef.id,
        ...productData
      } as Product;
      
      products.value.push(newProduct);
      return docRef.id;
    } catch (err: any) {
      error.value = err.message;
      console.error('Add product error:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, productData);
      
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...productData };
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Update product error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      products.value = products.value.filter(p => p.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Delete product error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Get products by price range
  const productsByPriceRange = computed(() => {
    return (min: number, max: number) => {
      return products.value.filter(p => {
        const price = p.price;
        return price >= min && price <= max;
      });
    };
  });

  // Get products by search query
  const searchProducts = computed(() => {
    return (query: string) => {
      const lowerQuery = query.toLowerCase();
      return products.value.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
    };
  });

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    fetchProductsByCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    productsByPriceRange,
    searchProducts
  };
});