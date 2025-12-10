import { adminDB } from '../config/firebaseAdmin.ts';

const products = [
  {
    category: "Dress",
    color: "Pink",
    description: "Smooth, comfortable dress with an elegant cut suitable for business wear.",
    image: "https://image.uniqlo.com/UQ/ST3/id/imagesgoods/462587/item/idgoods_11_462587.jpg?width=750",
    name: "AIRism Ultra Stretch Sleeveless Dress",
    price: "399000",
    shipping: "20000",
    size: "S"
  },
  {
    category: "T-Shirts (Short Sleeves)",
    color: "Purple",
    description: "Smooth 'AIRism' cotton-look fabric. The loose-fitting cut and slightly shorter length make this stand out.",
    image: "https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/457939/sub/goods_457939_sub14.jpg?width=750",
    name: "AIRism Cotton Short Sleeve T-Shirt",
    price: "199000",
    shipping: "20000",
    size: "L"
  },
  {
    category: "Hoodies",
    color: "Grey",
    description: "Comfortable vintage style hoodie with drop shoulder design.",
    image: "https://hourscollection.com/cdn/shop/files/DropShoulderHoodie-VintageGrey-ClipTag2_800x.png?v=1735840181",
    name: "Vintage Drop Shoulder Hoodie",
    price: "450000",
    shipping: "20000",
    size: "M"
  },
  {
    category: "T-Shirts (Short Sleeves)",
    color: "Yellow",
    description: "Vintage sun design t-shirt perfect for casual wear.",
    image: "https://img.freepik.com/premium-vector/sun-t-shirt-design_1138274-707.jpg?semt=ais_hybrid&w=740&q=80",
    name: "Vintage Sun T-Shirt",
    price: "180000",
    shipping: "20000",
    size: "M"
  },
  {
    category: "T-Shirts (Short Sleeves)",
    color: "White",
    description: "Vintage collage design t-shirt with unique print.",
    image: "https://shop.dollyparton.com/cdn/shop/files/dolly-vintage-collage-tee-t-shirt-175.png?v=1716659308&width=1445",
    name: "Vintage Collage Tee",
    price: "220000",
    shipping: "20000",
    size: "L"
  },
  {
    category: "Jackets",
    color: "Black",
    description: "Classic vintage leather jacket with modern comfort.",
    image: "https://img.freepik.com/free-photo/black-leather-jacket_1203-7918.jpg",
    name: "Vintage Leather Jacket",
    price: "850000",
    shipping: "25000",
    size: "L"
  },
  {
    category: "Dress",
    color: "Blue",
    description: "Elegant blue midi dress perfect for any occasion.",
    image: "https://image.uniqlo.com/UQ/ST3/id/imagesgoods/462588/item/idgoods_65_462588.jpg?width=750",
    name: "AIRism Midi Dress",
    price: "420000",
    shipping: "20000",
    size: "M"
  },
  {
    category: "Pants",
    color: "Beige",
    description: "Comfortable vintage wide leg pants.",
    image: "https://image.uniqlo.com/UQ/ST3/id/imagesgoods/462589/item/idgoods_30_462589.jpg?width=750",
    name: "Vintage Wide Leg Pants",
    price: "380000",
    shipping: "20000",
    size: "L"
  },
  {
    category: "T-Shirts (Short Sleeves)",
    color: "Green",
    description: "Vintage graphic print t-shirt with retro design.",
    image: "https://img.freepik.com/free-photo/green-t-shirt_1203-7919.jpg",
    name: "Vintage Graphic Tee",
    price: "195000",
    shipping: "20000",
    size: "M"
  },
  {
    category: "Hoodies",
    color: "Navy",
    description: "Classic navy hoodie with vintage wash.",
    image: "https://www.iloveugly.com/cdn/shop/files/1_cd7f6906-3e0b-4459-a11d-5ccbc5af4893.jpg?v=1723005065&width=2048",
    name: "Vintage Navy Hoodie",
    price: "480000",
    shipping: "20000",
    size: "XL"
  }
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...');

  try {
    let count = 0;
    for (const product of products) {
      const docRef = await adminDB.collection('products').add({
        ...product,
        uploadedAt: new Date().toISOString()
      });
      count++;
      console.log(`✅ ${count}. ${product.name} (ID: ${docRef.id})`);
    }

    console.log(`🎉 Done seeding ${count} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seed function
seedProducts();