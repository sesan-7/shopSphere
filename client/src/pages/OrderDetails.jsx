import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const fetchOrderDetails = async () => {
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
      setError(
        err.response?.status === 403
          ? "Unauthorized access: You cannot view another customer's order."
          : err.response?.data?.message || "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      setCancelError("");

      const token = localStorage.getItem("token");
      await api.put(
        `/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh order details upon cancellation
      setShowConfirmCancel(false);
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
      setCancelError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrderDetails} />;
  }

  if (!order) {
    return <ErrorMessage message="No order information was found." onRetry={fetchOrderDetails} />;
  }

  // Tracking milestones helper
  const milestones = ["Pending", "Confirmed", "Shipped", "Delivered"];
  const currentStatusIndex = milestones.indexOf(order.status);

  // If order status is "Cancelled" or "Processing" we adjust status rules
  // "Processing" maps to index 1 (Confirmed) for the horizontal bar
  const getTimelineStepIndex = () => {
    if (order.status === "Cancelled") return -1;
    if (order.status === "Processing") return 1;
    return currentStatusIndex;
  };

  const activeIndex = getTimelineStepIndex();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 text-left space-y-8 relative">
      {/* Back button */}
      <Link to="/orders" className="text-xs font-bold text-gray-500 hover:text-black transition">
        ← Back to My Orders
      </Link>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 m-0">Order Details</h1>
          <p className="text-xs text-gray-400 mt-1">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Cancellation Actions */}
        {order.status === "Cancelled" ? (
          <span className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">
            🚫 Cancelled
          </span>
        ) : (
          (order.status === "Pending" || order.status === "Confirmed" || order.status === "Processing") && (
            <button
              onClick={() => setShowConfirmCancel(true)}
              className="rounded-lg border border-red-200 text-red-500 bg-red-50/50 hover:bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider transition active:scale-98"
            >
              Cancel Order
            </button>
          )
        )}
      </div>

      {/* Visual Tracking Progress Timeline (Flipkart style) */}
      {order.status !== "Cancelled" ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-6">Track Delivery Progress</span>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative gap-6">
            {milestones.map((step, idx) => {
              const isPast = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10 w-full sm:w-auto">
                  {/* Circle Indicator */}
                  <div
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition duration-300 ${
                      isPast
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-green-150" : ""}`}
                  >
                    {isPast ? "✓" : idx + 1}
                  </div>

                  {/* Step Info */}
                  <div className="text-left sm:text-center">
                    <span className={`block font-bold text-xs uppercase tracking-wide ${isPast ? "text-gray-900" : "text-gray-450"}`}>
                      {step === "Pending" ? "Ordered" : step}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-green-600 font-bold block mt-0.5 animate-pulse">
                        Active Stage
                      </span>
                    )}
                  </div>

                  {/* Connecting Line inside scroller */}
                  {idx < milestones.length - 1 && (
                    <div
                      className={`hidden sm:block absolute top-3.5 left-[calc(50%+14px)] w-[calc(100%-28px)] h-0.5 -z-10 transition duration-300 ${
                        idx < activeIndex ? "bg-green-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5 text-xs text-red-700 font-semibold leading-relaxed flex items-center gap-3">
          <span>⚠️</span>
          <span>This order was cancelled. No delivery processes are being tracked.</span>
        </div>
      )}

      {/* Main breakdown details container */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shipping address & methods */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5">
            Shipping Information
          </h3>
          <div className="text-xs font-semibold text-gray-700 leading-relaxed">
            <p className="text-gray-900 font-bold mb-1">Delivery Destination:</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment and Delivery Status Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5">
            Status Summary
          </h3>
          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono text-gray-900 select-all font-bold">{order._id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Option:</span>
              <span className="text-gray-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment State:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  order.isPaid ? "bg-green-50 text-green-700 border border-green-150" : "bg-amber-50 text-amber-700 border border-amber-150"
                }`}
              >
                {order.isPaid ? `Paid (At ${new Date(order.paidAt).toLocaleDateString()})` : "Unpaid"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Delivery Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  order.isDelivered ? "bg-green-50 text-green-700 border border-green-150" : "bg-amber-50 text-amber-700 border border-amber-150"
                }`}
              >
                {order.isDelivered ? `Delivered (At ${new Date(order.deliveredAt).toLocaleDateString()})` : "Not Delivered"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order items listing */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5">
          Items Ordered
        </h3>
        <div className="divide-y divide-gray-100">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="flex py-4 items-center justify-between gap-4 first:pt-0 last:pb-0 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-50 border p-1 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain mix-blend-multiply" />
                  ) : (
                    <span className="text-[8px] text-gray-400">No Image</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 hover:text-blue-600 transition">
                    <Link to={`/products/${item.product}`}>{item.name}</Link>
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {item.quantity} | Price: ₹{item.price} each</p>
                </div>
              </div>
              <span className="font-bold text-gray-950 text-sm">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill calculations summary breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-sm ml-auto space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5">
          Pricing Details
        </h3>
        <div className="space-y-3 text-xs font-semibold text-gray-600">
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span className="text-gray-900">₹{order.itemsPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>GST Tax (18%):</span>
            <span className="text-gray-900">₹{order.taxPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Cost:</span>
            <span className="text-gray-900">{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount ({order.couponCode}):</span>
              <span>- ₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-gray-100 text-sm font-black text-gray-900">
            <span>Grand Total:</span>
            <span>₹{order.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-150 shadow-lg text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-150 text-xl font-bold">
              !
            </div>
            <h3 className="text-base font-bold text-gray-900">Cancel Order Request</h3>
            <p className="text-xs font-semibold text-gray-500">
              Are you sure you want to cancel this order? This action will restore items back to inventory and cannot be undone.
            </p>
            {cancelError && <p className="text-xs font-semibold text-red-650 mt-2">{cancelError}</p>}
            <div className="flex gap-3 justify-center pt-2">
              <button
                disabled={cancelLoading}
                onClick={() => setShowConfirmCancel(false)}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
              >
                No, Keep Order
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleCancelOrder}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-xs font-bold uppercase transition disabled:bg-gray-400 active:scale-98"
              >
                {cancelLoading ? "Processing Cancel..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
