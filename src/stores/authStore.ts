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
import type { User, SignupForm, LoginForm } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  // Initialize auth state listener
  const initAuthListener = () => {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user.value.username = userData.username;
        }
      } else {
        user.value = null;
      }
    });
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

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: formData.fullName,
        photoURL: null,
        username: formData.username
      };

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

      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      };

      // Get username from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        user.value.username = userDoc.data().username;
      }

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
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName: result.user.displayName || '',
          username: result.user.email?.split('@')[0] || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }

      user.value = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        username: userDoc.exists() ? userDoc.data().username : result.user.email?.split('@')[0]
      };

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
    initAuthListener,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
});