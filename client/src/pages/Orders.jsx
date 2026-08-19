import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await api.get("/orders/myorders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 text-left">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-150 p-12 text-center bg-gray-50">
          <p className="text-lg text-gray-500 font-medium">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Header Info */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between border-b border-gray-100 text-xs text-gray-500 font-medium">
                <div>
                  <span className="block uppercase text-[10px] font-bold text-gray-400">Order Placed</span>
                  <span className="text-gray-700 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block uppercase text-[10px] font-bold text-gray-400">Total Price</span>
                  <span className="text-gray-900 font-bold">₹{order.totalPrice}</span>
                </div>
                <div>
                  <span className="block uppercase text-[10px] font-bold text-gray-400">Payment</span>
                  <span className="text-gray-700 font-semibold">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="block uppercase text-[10px] font-bold text-gray-400">Status</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 px-6 py-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex py-4 items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-50 border border-gray-150 p-1.5 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">No Image</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm hover:text-purple-600 transition">
                          <Link to={`/products/${item.product}`}>{item.name}</Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} | ₹{item.price} each</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Address Panel & Actions */}
              <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-xs">
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Shipping To</span>
                  <span className="text-gray-700 font-semibold">
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </span>
                </div>
                <Link
                  to={`/orders/${order._id}`}
                  className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 font-bold uppercase tracking-wider text-[10px] transition active:scale-98"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
