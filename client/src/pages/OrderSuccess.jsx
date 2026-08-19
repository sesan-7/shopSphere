import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await api.get(`/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrder(response.data.order);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch order summary details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderSummary();
    }
  }, [id]);

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrderSummary} />;
  }

  if (!order) {
    return <ErrorMessage message="No order record found." onRetry={fetchOrderSummary} />;
  }

  // Calculate delivery date estimate (e.g. 4 business days after order)
  const getEstimatedDeliveryDate = () => {
    const orderDate = new Date(order.createdAt);
    orderDate.setDate(orderDate.getDate() + 4);
    return orderDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center space-y-6 text-left">
      {/* Visual Success Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl text-green-600 border border-green-200 shadow-sm">
        ✓
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight m-0">Order Placed!</h1>
        <p className="mt-4 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Thank you for shopping with us. Your purchase request has been verified and is now entering our full packaging queue.
        </p>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5">
          Order Confirmation Details
        </h3>
        
        <div className="space-y-3 text-xs font-semibold">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Order Reference:</span>
            <span className="font-mono text-gray-950 font-bold select-all">{order._id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Price Paid:</span>
            <span className="text-gray-900 text-sm font-black">₹{order.totalPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Payment Option:</span>
            <span className="text-gray-900">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Payment State:</span>
            <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
              {order.isPaid ? "Processed Successfully" : "Pending Verification (COD)"}
            </span>
          </div>
          <div className="flex flex-col pt-3 border-t border-gray-100 text-left gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Delivery Date</span>
            <span className="text-gray-900 font-bold">{getEstimatedDeliveryDate()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/orders/${order._id}`}
          className="rounded-xl bg-blue-650 hover:bg-blue-700 px-6 py-3 text-xs font-bold text-white uppercase tracking-wider transition shadow active:scale-98 text-center"
        >
          View Order details
        </Link>
        <Link
          to="/products"
          className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider transition text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
