export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  size: number;
  category: string;
  condition?: string;
  color: string;
  location?: string;
  uploadedAt?: string;
  shipping: string;
  description: string;
  wishlistCount?: number;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string;
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  photo?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Shipped' | 'Cancelled';
}