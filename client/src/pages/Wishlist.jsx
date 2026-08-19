import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { useConfirm } from "../context/ConfirmContext";

const Wishlist = () => {
  const { addToCart } = useCart();
  const { user, setUser } = useAuth();
  const confirm = useConfirm();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/auth/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistItems(response.data.wishlist);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/auth/wishlist/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local wishlist items list
      setWishlistItems(wishlistItems.filter((item) => item._id !== productId));
      
      // Update User object in AuthContext
      if (user) {
        setUser({
          ...user,
          wishlist: response.data.wishlist,
        });
      }
    } catch (err) {
      console.error(err);
      confirm.alert("Error Removing Item", "Failed to remove the item from your wishlist. Please try again.");
    }
  };

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWishlist} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-150 p-12 text-center bg-gray-50">
          <p className="text-lg text-gray-500 font-medium">Your wishlist is empty.</p>
          <p className="text-sm text-gray-400 mt-2">Add products to your wishlist while browsing to save them here.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 transition"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div>
                {/* Image */}
                <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-4 border border-gray-100">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-contain mix-blend-multiply transition group-hover:scale-102"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                  {/* Remove Wishlist Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 rounded-full p-2 border border-gray-200 bg-white text-red-500 hover:bg-red-50 transition shadow-sm"
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>
                </div>

                {/* Info */}
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{product.category}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-gray-500 text-xs">⭐ {product.rating}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                {product.stock > 0 ? (
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full rounded-xl bg-black py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
