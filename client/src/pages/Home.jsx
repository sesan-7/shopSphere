import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  // Simulated Banner Carousel Details
  const promoBanners = [
    {
      title: "BIG BILLION SALES EVENT",
      subtitle: "Unbelievable price cuts on Flagship MacBooks & iPhones",
      tagline: "Up to 30% Off + Instant Bank Discount",
      bg: "from-blue-650 to-indigo-800",
      accent: "text-yellow-400",
    },
    {
      title: "SPORTS & APPAREL DEALS",
      subtitle: "Step up with premium running shoes from Nike & Adidas",
      tagline: "Minimum 15% OFF | Free Shipping Included",
      bg: "from-amber-600 to-red-700",
      accent: "text-white",
    },
    {
      title: "FASHION TRENDS 2026",
      subtitle: "Elevate your look with Zara Blazers & Denim Jackets",
      tagline: "Special Autumn Deals | Flat ₹500 Code: SAVE500",
      bg: "from-purple-700 to-pink-850",
      accent: "text-yellow-300",
    },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch home catalog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    document.title = "ShopSphere - Premium Online Shopping Hub";
    
    // Auto shift promotional banners
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % promoBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter dynamic deals
  const dealsOfTheDay = products.filter((p) => p.discount >= 15).slice(0, 6);
  const electronicsDeals = products.filter((p) => p.category === "Electronics").slice(0, 6);
  const footwearFashion = products.filter((p) => p.category === "Shoes" || p.category === "Fashion").slice(0, 6);

  const categories = [
    { name: "Electronics", icon: "💻", color: "text-blue-500 bg-blue-50" },
    { name: "Fashion", icon: "👕", color: "text-pink-500 bg-pink-50" },
    { name: "Shoes", icon: "👟", color: "text-emerald-500 bg-emerald-50" },
    { name: "Accessories", icon: "🎧", color: "text-purple-500 bg-purple-50" },
  ];

  return (
    <div className="bg-gray-100 pb-20 space-y-6 text-left">
      {/* Category Icons Header Scroller (Flipkart Style Top Bar) */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 flex justify-around items-center overflow-x-auto no-scrollbar whitespace-nowrap gap-6 md:gap-12">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border border-transparent group-hover:border-blue-300 transition duration-300 ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Offer Banner Slider (Flipkart Style Banner) */}
      <section className="mx-auto max-w-7xl px-0 sm:px-6">
        <div className={`rounded-none sm:rounded-2xl bg-gradient-to-r ${promoBanners[activeBanner].bg} px-8 py-16 md:py-20 text-white relative overflow-hidden transition-all duration-700 shadow-sm border border-black/10`}>
          <div className="max-w-xl relative z-10 space-y-4">
            <span className="inline-block rounded bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-300 border border-yellow-300/30">
              Limited Offer
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight m-0 uppercase">
              {promoBanners[activeBanner].title}
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-90 leading-relaxed">
              {promoBanners[activeBanner].subtitle}
            </p>
            <p className={`text-xs font-extrabold ${promoBanners[activeBanner].accent}`}>
              {promoBanners[activeBanner].tagline}
            </p>
            <div className="pt-2">
              <Link to="/products">
                <button className="rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold text-xs uppercase tracking-wider px-6 py-3 shadow transition active:scale-98">
                  Shop Now
                </button>
              </Link>
            </div>
          </div>

          {/* Banner Dot Indicators */}
          <div className="absolute bottom-4 right-8 flex gap-2 z-10">
            {promoBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  activeBanner === idx ? "bg-white scale-120" : "bg-white/40 hover:bg-white/70"
                }`}
              ></button>
            ))}
          </div>

          {/* Background visuals */}
          <div className="absolute top-1/2 right-10 h-72 w-72 -translate-y-1/2 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <Loader />
      ) : (
        <div className="mx-auto max-w-7xl px-0 sm:px-6 space-y-6">
          
          {/* Carousel Block 1: Deals of the Day (Flipkart Style horizontal scroller) */}
          {dealsOfTheDay.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-none sm:rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900 m-0 uppercase tracking-tight flex items-center gap-1.5">
                    <span>⚡</span> Top Deals of the Day
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Maximum discounts on top brand models</p>
                </div>
                <Link to="/products" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                  View All
                </Link>
              </div>

              {/* Horizontal Scroll Deck */}
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x">
                {dealsOfTheDay.map((product) => (
                  <div key={product._id} className="w-64 flex-shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carousel Block 2: Best of Electronics */}
          {electronicsDeals.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-none sm:rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900 m-0 uppercase tracking-tight flex items-center gap-1.5">
                    <span>💻</span> Best of Electronics
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">MacBooks, flagships, hi-fi headphones & accessories</p>
                </div>
                <Link to="/products?category=Electronics" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                  View All
                </Link>
              </div>

              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x">
                {electronicsDeals.map((product) => (
                  <div key={product._id} className="w-64 flex-shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carousel Block 3: Trending Fashion & Footwear */}
          {footwearFashion.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-none sm:rounded-2xl shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900 m-0 uppercase tracking-tight flex items-center gap-1.5">
                    <span>👟</span> Trending Apparel & Footwear
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Nike, Adidas running footwear & stylish jackets</p>
                </div>
                <Link to="/products?category=Shoes" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                  View All
                </Link>
              </div>

              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x">
                {footwearFashion.map((product) => (
                  <div key={product._id} className="w-64 flex-shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Home;