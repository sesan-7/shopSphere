import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { useConfirm } from "../context/ConfirmContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      document.title = `${response.data.product.name} | ShopSphere Premium`;

      if (user && user.wishlist) {
        setWishlisted(user.wishlist.includes(response.data.product._id));
      }
    } catch (error) {
      console.error("Product details error:", error);
      setError(error.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, user]);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setAdding(false);
    }, 800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleToggleWishlist = async () => {
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

  // Submit new or updated review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Please provide a comment.");
      return;
    }

    try {
      setReviewSubmitLoading(true);
      setReviewError("");
      setReviewSuccess("");

      const token = localStorage.getItem("token");
      const payload = {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      };

      let response;
      if (isEditingReview) {
        response = await api.put(`/products/${product._id}/reviews`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviewSuccess("Review updated successfully!");
      } else {
        response = await api.post(`/products/${product._id}/reviews`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviewSuccess("Review submitted successfully!");
      }

      // Update product status locally
      setProduct({
        ...product,
        rating: response.data.rating,
        reviews: response.data.reviews,
      });

      // Clear input states
      setReviewComment("");
      setReviewRating(5);
      setIsEditingReview(false);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  // Delete review
  const handleReviewDelete = async () => {
    const hasConfirmed = await confirm(
      "Delete Review",
      "Are you sure you want to delete your review? This action cannot be undone."
    );
    if (!hasConfirmed) return;

    try {
      setReviewSubmitLoading(true);
      setReviewError("");
      setReviewSuccess("");

      const token = localStorage.getItem("token");
      const response = await api.delete(`/products/${product._id}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProduct({
        ...product,
        rating: response.data.rating,
        reviews: response.data.reviews,
      });

      setReviewSuccess("Review deleted successfully!");
      setReviewComment("");
      setReviewRating(5);
      setIsEditingReview(false);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || "Failed to delete review");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleEditClick = (userReview) => {
    setIsEditingReview(true);
    setReviewRating(userReview.rating);
    setReviewComment(userReview.comment);
    setReviewError("");
    setReviewSuccess("");
  };

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProduct} />;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" onRetry={fetchProduct} />;
  }

  // Check if current user has already reviewed
  const userReview = user
    ? product.reviews?.find((r) => r.user === user._id)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-left space-y-8">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition animate-fade-in"
      >
        ← Back to Products Catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-12 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        {/* Left Column: Image Gallery & Buy Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative flex h-[350px] items-center justify-center rounded-2xl bg-gray-50/50 border border-gray-100 p-6">
            {product.images?.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="max-h-[300px] object-contain mix-blend-multiply"
              />
            ) : (
              <span className="text-gray-400">No Image Available</span>
            )}

            {/* Wishlist Heart */}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`absolute top-4 right-4 rounded-full p-2.5 border shadow-sm transition ${
                wishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-gray-200 text-gray-400 hover:text-black"
              }`}
            >
              <span className="text-lg leading-none">
                {wishlisted ? "❤️" : "🤍"}
              </span>
            </button>
          </div>

          {/* Action Buy Buttons */}
          {product.stock > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow transition-all ${
                  adding
                    ? "bg-green-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white active:scale-98"
                }`}
              >
                {adding ? "✓ Added To Cart" : "🛒 Add To Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold uppercase tracking-wider text-xs shadow rounded-xl py-4 active:scale-98 transition-all"
              >
                ⚡ Buy Now
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-450 font-bold uppercase text-xs rounded-xl py-4 cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          )}
        </div>

        {/* Right Column: Details & Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-650 block mb-1">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 m-0 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-green-600 text-white font-extrabold px-2 py-0.5 rounded flex items-center gap-0.5">
              {product.rating ? Number(product.rating).toFixed(1) : "0.0"} ★
            </span>
            <span className="text-gray-400 font-medium">
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price details */}
          <div className="flex items-baseline gap-3 border-b border-gray-100 pb-4">
            <span className="text-3xl font-black text-gray-950">
              ₹{product.price}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-sm text-gray-405 line-through">
                  ₹{Math.round(product.price * (1 + product.discount / 100))}
                </span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Available Offers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Available Offers
            </h3>
            <ul className="text-xs space-y-2 text-gray-700 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-green-600">🏷️</span>
                <span>
                  <span className="font-bold text-gray-900">Promo Discount:</span>{" "}
                  Apply code <span className="font-bold text-blue-600">WELCOME10</span>{" "}
                  at checkout to save 10% on your cart.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">🏷️</span>
                <span>
                  <span className="font-bold text-gray-900">Fixed Discount:</span>{" "}
                  Save ₹500 using code <span className="font-bold text-blue-600">SAVE500</span>{" "}
                  (minimum cart: ₹2000).
                </span>
              </li>
            </ul>
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-xs font-semibold">
              <span className="text-gray-500">Delivery Qty</span>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <button
                  onClick={handleDecreaseQuantity}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Product Highlights */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider">
              Product Highlights
            </h3>
            <p className="text-gray-650 leading-relaxed font-semibold">
              {product.description}
            </p>
          </div>

          {/* Specs Table */}
          <div className="border-t border-gray-100 pt-4 space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider">
              Specifications
            </h3>
            <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-150">
              <div className="grid grid-cols-3 p-3 bg-gray-50/50">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  Brand
                </span>
                <span className="col-span-2 text-gray-800 font-semibold">
                  ShopSphere Elite
                </span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  Category
                </span>
                <span className="col-span-2 text-gray-800 font-semibold">
                  {product.category}
                </span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-gray-50/50">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  Stock Status
                </span>
                <span
                  className={`col-span-2 font-bold ${
                    product.stock > 0 ? "text-green-650" : "text-red-500"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} items remaining` : "Sold Out"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-8 text-xs font-semibold text-gray-700">
        <h2 className="text-lg font-black text-gray-950 uppercase tracking-tight m-0">
          Customer Reviews
        </h2>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Sub-column: Reviews Feed */}
          <div className="lg:col-span-8 space-y-6 divide-y divide-gray-100">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-gray-450 italic py-4">Be the first to review this product.</p>
            ) : (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">
                      {rev.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1.5 text-xs text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    {rev.comment}
                  </p>
                  {user && rev.user === user._id && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleEditClick(rev)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        Edit Review
                      </button>
                      <button
                        onClick={handleReviewDelete}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline"
                      >
                        Delete Review
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Sub-column: Add/Edit Form */}
          <div className="lg:col-span-4 bg-gray-50/50 border border-gray-150 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 m-0 uppercase tracking-wider">
              {isEditingReview ? "Edit Your Review" : "Write a Review"}
            </h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <p className="text-red-650 font-bold leading-relaxed">{reviewError}</p>
                )}
                {reviewSuccess && (
                  <p className="text-green-600 font-bold leading-relaxed">{reviewSuccess}</p>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Product Rating
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map((val) => (
                      <option key={val} value={val}>
                        {val} Star{val > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Your Comment
                  </label>
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your user experience with this item..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={reviewSubmitLoading}
                    className="flex-1 rounded-lg bg-black hover:bg-gray-800 text-white font-bold py-2.5 uppercase text-[10px] tracking-wider disabled:bg-gray-450 active:scale-98 transition"
                  >
                    {isEditingReview ? "Update Review" : "Submit Review"}
                  </button>
                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingReview(false);
                        setReviewComment("");
                        setReviewRating(5);
                      }}
                      className="rounded-lg border border-gray-350 bg-white text-gray-700 px-3 py-2.5 font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <p className="text-gray-450 italic leading-relaxed">
                Please{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  log in
                </Link>{" "}
                to submit or edit ratings and reviews.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;