import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const AddEditProduct = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        try {
          setPageLoading(true);
          const response = await api.get(`/products/${id}`);
          const product = response.data.product;

          setName(product.name);
          setDescription(product.description);
          setPrice(product.price.toString());
          setDiscount(product.discount?.toString() || "0");
          setCategory(product.category);
          setStock(product.stock.toString());
          setImageUrl(product.images?.[0] || "");
        } catch (err) {
          console.error(err);
          setError("Failed to load product details for editing");
        } finally {
          setPageLoading(false);
        }
      };

      fetchProductDetails();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !price || !category || !stock) {
      setError("Please complete all required fields");
      return;
    }

    if (Number(price) < 0) {
      setError("Price cannot be negative");
      return;
    }

    if (Number(stock) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    if (Number(discount) < 0 || Number(discount) > 100) {
      setError("Discount must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name,
        description,
        price: Number(price),
        discount: Number(discount),
        category,
        stock: Number(stock),
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
      };

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/products/${id}`, payload, config);
      } else {
        response = await api.post("/products", payload, config);
      }

      if (response.data.success) {
        navigate("/admin/products");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save product details");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
          <Link to="/admin/products" className="text-xs text-gray-500 hover:text-black font-semibold transition block mb-2">
            ← Back to Products List
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Product Profile" : "Create New Product"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode ? "Modify existing attributes of the product" : "Fill details to add item to store catalog"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm max-w-2xl space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MacBook Air"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about specs, dimensions, compatibility, and other highlights..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Price, Stock, Discount */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Initial Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Category *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-black py-4 font-semibold text-white hover:bg-gray-800 transition shadow-md disabled:bg-gray-400 text-center text-sm"
            >
              {loading ? "Saving Details..." : isEditMode ? "Update Product Catalog" : "Publish Product"}
            </button>
            <Link
              to="/admin/products"
              className="rounded-xl border border-gray-300 px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50 transition text-center text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
    </div>
  );
};

export default AddEditProduct;
