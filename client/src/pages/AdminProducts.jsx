import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { useConfirm } from "../context/ConfirmContext";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const confirm = useConfirm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/products");
      setProducts(response.data.products);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const hasConfirmed = await confirm(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!hasConfirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSuccess("Product deleted successfully!");
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Products Management</h1>
            <p className="text-xs text-gray-505 dark:text-gray-400">Add, edit, or delete items in the storefront inventory</p>
          </div>
          <Link
            to="/admin/products/new"
            className="rounded-xl bg-black dark:bg-[#f3f4f6] px-5 py-3 font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white transition shadow-sm text-sm"
          >
            + Add New Product
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No products found in the catalog.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e303a] bg-gray-50/50 dark:bg-[#16171d]/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                    <th className="py-4 px-6">Product Image</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4 text-center">Stock</th>
                    <th className="py-4 px-4 text-center">Discount</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2e303a] font-medium text-gray-700 dark:text-gray-350">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition">
                      <td className="py-3 px-6">
                        <div className="h-12 w-12 flex items-center justify-center rounded bg-gray-50 dark:bg-[#16171d] border border-gray-150 dark:border-[#2e303a] p-1 overflow-hidden">
                          {product.images?.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-[9px] text-gray-400 dark:text-gray-500">No Image</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                        <Link to={`/products/${product._id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition">
                          {product.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{product.category}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">₹{product.price}</td>
                      <td className={`py-3 px-4 text-center ${product.stock === 0 ? "text-red-500 font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {product.discount > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20 font-bold">
                            {product.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right space-x-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="inline-block rounded-lg border border-gray-250 dark:border-[#2e303a] bg-white dark:bg-[#16171d] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-[#16171d] px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 transition cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminProducts;
