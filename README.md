# vintage-final-project

Aplikasi web **e-commerce sederhana** berbasis **Vue 3** yang menggunakan **Firebase** sebagai backend dan **Pinia** sebagai state management.  
Project ini dibuat untuk memenuhi kriteria aplikasi web modern yang mencakup autentikasi pengguna, CRUD data, proteksi halaman, dan pengelolaan state.

---

## 🚀 Tech Stack

- **Vue 3** (Composition API)
- **Vite**
- **Pinia** (State Management)
- **Firebase**
  - Firebase Authentication
  - Cloud Firestore
- **TypeScript**
- CSS / Bootstrap

---

## ✨ Fitur Aplikasi

### 🔐 Autentikasi Pengguna
- Register
- Login
- Logout
- Proteksi halaman (hanya bisa diakses setelah login)

### 👤 Manajemen Akun
- Update profile
- Change password

### 🛍️ Produk
- Menampilkan daftar produk dari Firebase
- Filter produk
- Searching produk
- Favorite / wishlist produk

### 🛒 Cart & Checkout
- Tambah produk ke cart
- Update jumlah item di cart
- Hapus item dari cart
- Checkout produk
- Penyimpanan data transaksi ke Firebase

### 📦 Transaksi
- Transaction history (riwayat pembelian)
- Detail transaksi per pengguna

### ⭐ Rating & Review
- Memberi rating & review produk
- Validasi user (hanya pengguna yang sudah membeli produk)
- Menampilkan daftar review per produk

---

## 📂 State Management (Pinia)

Aplikasi ini menggunakan **Pinia** untuk mengelola state, meliputi:
- Auth / user state
- Produk
- Cart
- Wishlist
- Review & rating
- Transaksi

Struktur store berada di folder:

```txt
src/stores/
```

---

## 🔒 Proteksi Halaman

- Halaman tertentu hanya dapat diakses oleh pengguna yang sudah login
- Menggunakan **Vue Router + Firebase Authentication**
- Route Guard diterapkan untuk menjaga keamanan halaman

---

## 🔥 Firebase & Environment Variables

Project ini menggunakan **Firebase** sebagai sumber data utama.

### 📄 File `.env`

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

⚠️ **Catatan:**  
File `.env` tidak boleh di-commit ke repository publik.

---

### 📄 Firebase Config (`src/config/firebase.ts`)

```ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
```

---

## ⚙️ Project Setup

### Install Dependencies
```sh
pnpm install
```

### Development
```sh
pnpm dev
```

### Build Production
```sh
pnpm build
```

---

## 👨‍💻 Author

Vintage Final Project  
Vue 3 • Pinia • Firebase
