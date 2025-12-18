export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  category: string;
  condition?: string;
  color: string;
  location?: string;
  uploadedAt?: string;
  shipping: string;
  description: string;
  sellerId?: string;
  wishlistCount?: number;
  images?: string[];
  wishlistDocId?: string;
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
  displayName?: string | null;
  photoURL?: string | null;
  
  // Additional Firestore fields
  username?: string;
  fullName?: string;
  photo?: string | null;
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
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

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem {
  id?: string; // Firestore document ID
  userId: string;
  productId: string;
  addedAt: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  protectionFee: number;
  shippingFee: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  phone?: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface DeliveryMethod {
  name: string;
  price: number;
  estimatedTime: string;
}

export interface PaymentMethod {
  type: string;
  last4?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  holderName?: string;
}