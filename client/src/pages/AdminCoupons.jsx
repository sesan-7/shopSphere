import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { useConfirm } from "../context/ConfirmContext";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/coupons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoupons(response.data.coupons);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coupon codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!code || !discountValue || !expirationDate) {
      setError("Please fill out all required fields");
      return;
    }

    if (discountType === "percentage" && (Number(discountValue) < 0 || Number(discountValue) > 100)) {
      setError("Percentage discount must be between 0 and 100");
      return;
    }

    if (Number(discountValue) <= 0) {
      setError("Discount value must be greater than 0");
      return;
    }

    if (minOrderAmount && Number(minOrderAmount) < 0) {
      setError("Minimum order amount cannot be negative");
      return;
    }

    if (new Date(expirationDate) <= new Date()) {
      setError("Expiration date must be in the future");
      return;
    }

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await api.post(
        "/coupons",
        {
          code,
          discountType,
          discountValue: Number(discountValue),
          expirationDate,
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess("Coupon code created successfully!");
        setCoupons([response.data.coupon, ...coupons]);
        setCode("");
        setDiscountValue("");
        setExpirationDate("");
        setMinOrderAmount("");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create coupon code");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    const hasConfirmed = await confirm(
      "Delete Coupon",
      "Are you sure you want to delete this coupon? This action cannot be undone."
    );
    if (!hasConfirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await api.delete(`/coupons/${couponId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSuccess("Coupon deleted successfully!");
        setCoupons(coupons.filter((c) => c._id !== couponId));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete coupon code");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && coupons.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCoupons} />;
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Discount Coupons</h1>
          <p className="text-xs text-gray-505 dark:text-gray-400">Create, view, and delete promotional coupon codes for customer discounts</p>
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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Coupon Form */}
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Create Coupon Code</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Cash Discount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount Value *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "10" : "200"}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Min Order Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] px-3 py-2.5 text-sm bg-white dark:bg-[#16171d] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full rounded-xl bg-black dark:bg-[#f3f4f6] py-3 font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white transition shadow-sm text-sm disabled:bg-gray-400 dark:disabled:bg-gray-700 cursor-pointer"
              >
                {formLoading ? "Creating..." : "Save Coupon"}
              </button>
            </form>
          </div>

          {/* Coupon Codes List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 p-6 border-b border-gray-100 dark:border-[#2e303a] bg-gray-50/50 dark:bg-[#16171d]/50">Active Promo Codes</h2>
            {coupons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No active coupons created.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#2e303a] bg-gray-50/50 dark:bg-[#16171d]/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-4">Discount Value</th>
                      <th className="py-4 px-4">Expires</th>
                      <th className="py-4 px-4">Min. Spend</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2e303a] font-medium text-gray-700 dark:text-gray-350">
                    {coupons.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition">
                        <td className="py-4 px-6 font-mono text-sm font-bold text-gray-900 dark:text-gray-100">{item.code}</td>
                        <td className="py-4 px-4">
                          {item.discountType === "percentage" ? `${item.discountValue}% Off` : `₹${item.discountValue} Off`}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {new Date(item.expirationDate).toLocaleDateString()}
                          {new Date(item.expirationDate) < new Date() && (
                            <span className="ml-2 font-bold text-red-500 dark:text-red-400 text-[10px] uppercase bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded border border-red-100 dark:border-red-900/30">Expired</span>
                          )}
                        </td>
                        <td className="py-4 px-4">₹{item.minOrderAmount}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(item._id)}
                            className="rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-[#16171d] px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 transition cursor-pointer"
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
    </div>
  );
};

export default AdminCoupons;
