import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get("/orders", config),
        api.get("/products", config),
        api.get("/auth/users", config),
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];
      const users = usersRes.data.users || [];

      // Calculate total sales from delivered/paid orders
      const sales = orders.reduce((sum, order) => sum + (order.isPaid ? order.totalPrice : 0), 0);

      setStats({
        totalSales: sales,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard Overview</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">Summary of your store performance indicators</p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-sm">
            <span className="text-2xl">💰</span>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3">Total Revenue</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">₹{stats.totalSales}</p>
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block mt-1">From paid orders</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-sm">
            <span className="text-2xl">🛍️</span>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3">Total Orders</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{stats.totalOrders}</p>
            <span className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold block mt-1">Placed all-time</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-sm">
            <span className="text-2xl">📦</span>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3">Active Items</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{stats.totalProducts}</p>
            <span className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold block mt-1">Items in inventory</span>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-5 shadow-sm">
            <span className="text-2xl">👥</span>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3">Registered Users</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{stats.totalUsers}</p>
            <span className="text-[10px] text-gray-455 dark:text-gray-500 font-semibold block mt-1">Customer profiles</span>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Sales Activity</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent orders placed</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e303a] text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2e303a] font-medium">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="text-gray-750 dark:text-gray-300">
                      <td className="py-3 pr-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="font-mono text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline select-all"
                        >
                          {order._id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{order.user?.name || "Deleted User"}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">₹{order.totalPrice}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800 border-green-250"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800 border-red-250"
                            : "bg-amber-100 text-amber-800 border-amber-250"
                        }`}>
                          {order.status}
                        </span>
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

export default AdminDashboard;
