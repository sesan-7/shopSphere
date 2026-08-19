import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { useConfirm } from "../context/ConfirmContext";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const confirm = useConfirm();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch all orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const hasConfirmed = await confirm(
        "Cancel Order Confirmation",
        "Are you sure you want to mark this order as Cancelled? This action will restore items back to inventory."
      );
      if (!hasConfirmed) return;
    } else if (newStatus === "Delivered") {
      const hasConfirmed = await confirm(
        "Deliver Order Confirmation",
        "Are you sure you want to mark this order as Delivered? This will automatically mark it as paid."
      );
      if (!hasConfirmed) return;
    }

    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(`Order status updated to "${newStatus}"`);
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus, isDelivered: newStatus === "Delivered" } : o)));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-250";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-250";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-250";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-250";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-250";
      default:
        return "bg-gray-150 text-gray-800 border-gray-250";
    }
  };

  const getSelectStyle = (status) => {
    switch (status) {
      case "Pending":
        return "border-amber-300 text-amber-700 dark:text-amber-400 bg-amber-500/5";
      case "Processing":
        return "border-blue-300 text-blue-700 dark:text-blue-400 bg-blue-500/5";
      case "Shipped":
        return "border-purple-300 text-purple-700 dark:text-purple-400 bg-purple-500/5";
      case "Delivered":
        return "border-green-300 text-green-700 dark:text-green-400 bg-green-500/5";
      case "Cancelled":
        return "border-red-300 text-red-700 dark:text-red-400 bg-red-500/5";
      default:
        return "border-gray-300 text-gray-700 dark:text-gray-300";
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchLower) ||
      (order.user?.name || "").toLowerCase().includes(searchLower) ||
      (order.user?.email || "").toLowerCase().includes(searchLower) ||
      (order.shippingAddress?.city || "").toLowerCase().includes(searchLower) ||
      (order.shippingAddress?.address || "").toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <Loader />;
  }

  if (error && orders.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="space-y-6 text-left">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Customer Orders</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monitor order transactions, shipping details, and modify delivery statuses</p>
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

        {/* Quick Order Stats Banner */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-xs transition hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1.5">{orders.length}</p>
              </div>
              <span className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">📦</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-xs transition hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending Orders</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">{orders.filter(o => o.status === "Pending").length}</p>
              </div>
              <span className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">⏳</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-xs transition hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">In Processing</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">{orders.filter(o => o.status === "Processing" || o.status === "Shipped").length}</p>
              </div>
              <span className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">⚙️</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-xs transition hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completed Orders</span>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1.5">{orders.filter(o => o.status === "Delivered").length}</p>
              </div>
              <span className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-sm">✅</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-gray-50/50 dark:bg-[#16171d]/20 border border-gray-150 dark:border-[#2e303a] rounded-2xl p-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, email or city..."
              className="w-full rounded-lg border border-gray-300 dark:border-[#2e303a] bg-white dark:bg-[#16171d] px-3.5 py-2 text-xs outline-none focus:border-black dark:focus:border-white transition text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex flex-row overflow-x-auto no-scrollbar whitespace-nowrap gap-1.5 pb-2 md:pb-0">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                  statusFilter === status
                    ? "bg-black dark:bg-[#f3f4f6] text-white dark:text-black border-black dark:border-white shadow-xs"
                    : "bg-white dark:bg-[#16171d] border-gray-250 dark:border-[#2e303a] text-gray-650 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No customer orders match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e303a] bg-gray-50/50 dark:bg-[#16171d]/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Address</th>
                    <th className="py-4 px-4 text-center">Items</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2e303a] font-medium text-gray-700 dark:text-gray-350">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition">
                      <td className="py-4 px-6">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline select-all"
                        >
                          {order._id}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 block truncate max-w-[120px] sm:max-w-none">{order.user?.name || "Deleted User"}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[125px] sm:max-w-[170px] block" title={order.user?.email || ""}>
                          {order.user?.email || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate text-xs text-gray-500 dark:text-gray-400" title={`${order.shippingAddress?.address}, ${order.shippingAddress?.city}`}>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-gray-100">
                        {order.orderItems?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900 dark:text-gray-100">₹{order.totalPrice}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-semibold bg-white dark:bg-[#16171d] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition cursor-pointer ${getSelectStyle(order.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="inline-block rounded-lg border border-gray-250 dark:border-[#2e303a] bg-white dark:bg-[#16171d] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs"
                          >
                             View
                          </Link>
                        </div>
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

export default AdminOrders;
