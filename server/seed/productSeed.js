import "dotenv/config";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const products = [
  // Electronics (5 items)
  {
    name: "MacBook Pro M3 Max",
    description: "Supercharged Apple laptop for developers, content creators, and professionals.",
    price: 189999,
    discount: 10,
    category: "Electronics",
    stock: 12,
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
  },
  {
    name: "iPhone 17 Pro Max",
    description: "The ultimate flagship Apple smartphone with titanium frame and advanced telephoto zoom.",
    price: 139999,
    discount: 5,
    category: "Electronics",
    stock: 20,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd"],
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry leading noise-cancelling wireless headphones with top-tier Hi-Fi audio quality.",
    price: 29999,
    discount: 15,
    category: "Electronics",
    stock: 35,
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"],
  },
  {
    name: "Samsung Galaxy Watch Ultra",
    description: "Premium rugged smartwatch built for outdoor adventure athletes and active tracking.",
    price: 34999,
    discount: 12,
    category: "Electronics",
    stock: 15,
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1"],
  },
  {
    name: "iPad Pro M4 (13-inch)",
    description: "Thinnest Apple product ever with stunning Ultra Retina XDR display and M4 performance.",
    price: 119999,
    discount: 8,
    category: "Electronics",
    stock: 18,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0"],
  },

  // Fashion (4 items)
  {
    name: "Levi's Denim Trucker Jacket",
    description: "Classic denim jacket crafted from heavyweight cotton with chest flap pockets.",
    price: 4999,
    discount: 25,
    category: "Fashion",
    stock: 45,
    rating: 4.4,
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0"],
  },
  {
    name: "Zara Slim Fit Textured Blazer",
    description: "Modern textured blazer featuring notched lapels, long sleeves, and double back vents.",
    price: 7999,
    discount: 20,
    category: "Fashion",
    stock: 22,
    rating: 4.5,
    images: ["https://images.unsplash.com/photo-1593030761757-71fae45fa0e7"],
  },
  {
    name: "Ray-Ban Classic Wayfarer",
    description: "Timeless black acetate sunglasses featuring high-quality green polarized protective lenses.",
    price: 9999,
    discount: 10,
    category: "Fashion",
    stock: 30,
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083"],
  },
  {
    name: "Premium Full-Grain Leather Belt",
    description: "Handcrafted belt made from vegetable-tanned full-grain leather with brass buckle.",
    price: 1999,
    discount: 15,
    category: "Fashion",
    stock: 50,
    rating: 4.3,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62"],
  },

  // Shoes (3 items)
  {
    name: "Nike Air Max Running Shoes",
    description: "Responsive cushioning running shoes designed for ultimate training comfort.",
    price: 9999,
    discount: 20,
    category: "Shoes",
    stock: 40,
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
  },
  {
    name: "Adidas Ultraboost Sneakers",
    description: "Premium knit running sneakers built on full-length energy returning Boost midsoles.",
    price: 17999,
    discount: 15,
    category: "Shoes",
    stock: 25,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1587563876167-1826746499a5"],
  },
  {
    name: "Puma Classic Suede Shoes",
    description: "Heritage low-top suede sneakers featuring Puma formstrips and padded collars.",
    price: 5499,
    discount: 10,
    category: "Shoes",
    stock: 30,
    rating: 4.4,
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5"],
  },

  // Accessories (4 items)
  {
    name: "Keychron Mechanical Keyboard",
    description: "Premium hot-swappable tactile mechanical keyboard with RGB backlit and Gateron switches.",
    price: 7999,
    discount: 12,
    category: "Accessories",
    stock: 30,
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3"],
  },
  {
    name: "Logitech Gaming Mouse Superlight",
    description: "Ultra lightweight gaming mouse featuring high precision Hero optical sensors.",
    price: 12999,
    discount: 8,
    category: "Accessories",
    stock: 40,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1527814050087-3793815479db"],
  },
  {
    name: "Anker Power Bank 20000mAh",
    description: "High capacity power bank supporting Power Delivery fast-charge protocols.",
    price: 3999,
    discount: 15,
    category: "Accessories",
    stock: 60,
    rating: 4.5,
    images: ["https://images.unsplash.com/photo-1609592424209-dd169a359179"],
  },
  {
    name: "Elgato Stream Deck MK.2",
    description: "Interactive studio controller containing 15 customizable macro LCD keypads.",
    price: 14999,
    discount: 10,
    category: "Accessories",
    stock: 25,
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1598550476439-6847785fce6e"],
  },
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("Database seeded successfully with 16 premium products!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding products failed:", error);
    process.exit(1);
  }
};

seedProducts();