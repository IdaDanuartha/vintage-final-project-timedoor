import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';
import { setCookie, getCookie, deleteCookie, COOKIE_NAMES, COOKIE_EXPIRY } from '@/utils/cookies';
import type { User, SignupForm, LoginForm } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authInitialized = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  // Cookie Helper Functions
  const saveUserToCookie = (userData: User): void => {
    try {
      const userJson = JSON.stringify(userData);
      setCookie(COOKIE_NAMES.AUTH, userJson, COOKIE_EXPIRY.MEDIUM);
    } catch (err) {
      console.error('Failed to save user to cookie:', err);
    }
  };

  const loadUserFromCookie = (): User | null => {
    try {
      const userJson = getCookie(COOKIE_NAMES.AUTH);
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (err) {
      console.error('Failed to load user from cookie:', err);
    }
    return null;
  };

  const clearUserCookie = (): void => {
    deleteCookie(COOKIE_NAMES.AUTH);
  };

  // Helper function to fetch complete user data from Firestore
  const fetchCompleteUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        // Use Firestore data as primary source
        const firestoreData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firestoreData.email || firebaseUser.email,
          displayName: firestoreData.fullName || firebaseUser.displayName,
          photoURL: firestoreData.photo || firebaseUser.photoURL,
          username: firestoreData.username,
          fullName: firestoreData.fullName,
          photo: firestoreData.photo,
          wishlist: firestoreData.wishlist || [],
          createdAt: firestoreData.createdAt,
          updatedAt: firestoreData.updatedAt
        };
      } else {
        // Fallback to Firebase Auth data if Firestore document doesn't exist
        console.warn('User document not found in Firestore for UID:', firebaseUser.uid);
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
      }
    } catch (err) {
      console.error('Failed to fetch user data from Firestore:', err);
      // Fallback to Firebase Auth data
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
    }
  };

  // Initialize auth state
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      // First, try to load from cookie for instant UI update
      const cachedUser = loadUserFromCookie();
      if (cachedUser) {
        user.value = cachedUser;
      }

      // Then set up Firebase auth listener for real-time updates
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        loading.value = true;
        
        if (firebaseUser) {
          // Fetch complete user data from Firestore
          const userData = await fetchCompleteUserData(firebaseUser);
          
          user.value = userData;
          saveUserToCookie(userData);
          
          console.log('Auth state changed: User signed in with complete data', user.value);
        } else {
          // User is signed out
          user.value = null;
          clearUserCookie();
          console.log('Auth state changed: User signed out');
        }
        
        loading.value = false;
        authInitialized.value = true;
        resolve();
      });

      // Timeout fallback
      setTimeout(() => {
        if (!authInitialized.value) {
          authInitialized.value = true;
          loading.value = false;
          resolve();
        }
      }, 10000);
    });
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (!user.value?.uid) return;

    loading.value = true;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.value.uid));
      
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        const userData: User = {
          uid: user.value.uid,
          email: firestoreData.email || user.value.email,
          displayName: firestoreData.fullName || user.value.displayName,
          photoURL: firestoreData.photo || user.value.photoURL,
          username: firestoreData.username,
          fullName: firestoreData.fullName,
          photo: firestoreData.photo,
          wishlist: firestoreData.wishlist || [],
          createdAt: firestoreData.createdAt,
          updatedAt: firestoreData.updatedAt
        };

        user.value = userData;
        saveUserToCookie(userData);
        
        console.log('User data refreshed from Firestore', user.value);
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    } finally {
      loading.value = false;
    }
  };

  // Sign up with email and password
  const signUp = async (formData: SignupForm) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });

      // Save complete user data to Firestore
      const userDocData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        photo: null,
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: formData.fullName,
        photoURL: null,
        username: formData.username,
        fullName: formData.fullName,
        photo: null,
        wishlist: [],
        createdAt: userDocData.createdAt,
        updatedAt: userDocData.updatedAt
      };

      user.value = userData;
      saveUserToCookie(userData);

      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Sign up error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Sign in with email and password
  const signIn = async (formData: LoginForm) => {
    loading.value = true;
    error.value = null;
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Fetch complete user data from Firestore
      const userData = await fetchCompleteUserData(userCredential.user);

      user.value = userData;
      saveUserToCookie(userData);

      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Sign in error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userDocData = {
          fullName: result.user.displayName || '',
          username: result.user.email?.split('@')[0] || '',
          email: result.user.email || '',
          photo: result.user.photoURL || null,
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', result.user.uid), userDocData);
      }

      // Fetch complete user data from Firestore
      const userData = await fetchCompleteUserData(result.user);

      user.value = userData;
      saveUserToCookie(userData);

      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Google sign in error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const logout = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await signOut(auth);
      user.value = null;
      clearUserCookie();
      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error('Sign out error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    authInitialized,
    initAuth,
    refreshUserData,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
});