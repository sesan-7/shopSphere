import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [navSearch, setNavSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xl font-black tracking-tight text-blue-600">Shop</span>
          <span className="text-2xl font-black tracking-tight text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">Sphere</span>
        </Link>

        {/* Dynamic Search Bar (Flipkart Style) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden sm:flex items-center relative">
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search for products, brands and more"
            className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-300 px-4 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button type="submit" className="absolute right-3 text-gray-400 hover:text-blue-600 transition">
            🔍
          </button>
        </form>

        {/* Actions Menu */}
        <div className="flex items-center gap-4 flex-shrink-0 text-sm font-semibold">
          <Link to="/products" className="text-gray-700 hover:text-blue-600 transition hidden md:inline">
            Explore All
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="rounded-lg border border-blue-600 px-5 py-2 font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3.5">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 group-hover:border-blue-500 transition">
                  {user.name[0]?.toUpperCase()}
                </div>
                <span className="text-gray-700 group-hover:text-blue-600 transition hidden lg:inline max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>

              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="hidden md:inline-block bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition">
                  🛠️ Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 hover:text-black transition"
              >
                Logout
              </button>
            </div>
          )}

          {/* Cart with Indicator */}
          <Link to="/cart" className="relative flex items-center p-2 text-gray-700 hover:text-blue-600 transition">
            <span className="text-xl">🛒</span>
            <span className="hidden md:inline ml-1.5 font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-0.5 md:right-11 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar (Only visible on mobile screens) */}
      <div className="px-6 pb-3.5 sm:hidden">
        <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full">
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search for products, brands and more..."
            className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-300 px-4 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button type="submit" className="absolute right-3 text-gray-400 hover:text-blue-600 transition">
            🔍
          </button>
        </form>
      </div>

      {/* Sub navigation bar for quick categories */}
      <div className="border-t border-gray-100 bg-gray-50/50 py-2.5 text-xs font-semibold text-gray-600 overflow-x-auto no-scrollbar whitespace-nowrap">
        <div className="mx-auto max-w-7xl px-6 flex gap-6 md:gap-10">
          <Link to="/products?category=Electronics" className="hover:text-blue-600 transition">💻 Electronics</Link>
          <Link to="/products?category=Fashion" className="hover:text-blue-600 transition">👕 Fashion</Link>
          <Link to="/products?category=Shoes" className="hover:text-blue-600 transition">👟 Shoes & Apparel</Link>
          <Link to="/products?category=Accessories" className="hover:text-blue-600 transition">🎧 Accessories</Link>
          {user && (
            <>
              <Link to="/orders" className="hover:text-blue-600 transition ml-auto">📦 Track Orders</Link>
              <Link to="/wishlist" className="hover:text-blue-600 transition">❤️ My Wishlist</Link>
              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="md:hidden text-slate-650 font-bold">Admin Panel</Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;