import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../services/api";
import { useConfirm } from "../context/ConfirmContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user, setUser } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.includes(product._id) || false
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const confirm = useConfirm();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => {
      setAdding(false);
    }, 800);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      confirm.alert("Authentication Required", "Please log in to add products to your wishlist.");
      return;
    }

    try {
      setWishlistLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/auth/wishlist/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWishlisted(!wishlisted);
      setUser({
        ...user,
        wishlist: response.data.wishlist,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-150 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div>
        {/* Image Container */}
        <div className="relative mb-4 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-gray-50/50 border border-gray-100 p-4">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-gray-400 text-sm font-medium">No Image</span>
          )}

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-green-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
              {product.discount}% OFF
            </span>
          )}

          {/* Wishlist Toggle Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 rounded-full p-2 border shadow-sm transition ${
              wishlisted
                ? "bg-red-50 border-red-155 text-red-500"
                : "bg-white border-gray-200 text-gray-450 hover:text-black hover:scale-105"
            }`}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span className="text-xs leading-none">{wishlisted ? "❤️" : "🤍"}</span>
          </button>
        </div>

        {/* Category & Title */}
        <div className="text-left space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-650 mb-0.5">
            {product.category}
          </p>
          <Link to={`/products/${product._id}`}>
            <h3 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition truncate text-sm m-0">
              {product.name}
            </h3>
          </Link>

          {/* Rating Badge */}
          <div className="pt-1 flex items-center gap-2">
            <span className="bg-green-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5">
              {product.rating ? Number(product.rating).toFixed(1) : "0.0"} ★
            </span>
            <span className={`text-[10px] font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `In Stock` : "Sold Out"}
            </span>
          </div>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="text-base font-black text-gray-950">₹{product.price}</span>

        {product.stock > 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`rounded-lg py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white transition active:scale-98 shadow-sm ${
              adding
                ? "bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {adding ? "✓ Added" : "Add to Cart"}
          </button>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
