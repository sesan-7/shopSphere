import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Secure Checkout | ShopSphere Premium";
  }, []);

  // Accordion Steps: 1 = Delivery Address, 2 = Order Summary, 3 = Payment Options
  const [activeStep, setActiveStep] = useState(1);

  // Address Fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [addressSubmitted, setAddressSubmitted] = useState(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState("Card");

  // Mock Card Details Fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Coupon Info
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingCost = cartTotal > 5000 || cartTotal === 0 ? 0 : 150;
  const taxCost = Math.round(cartTotal * 0.18);
  const finalTotalBeforeDiscount = cartTotal + shippingCost + taxCost;
  const finalTotal = Math.max(0, finalTotalBeforeDiscount - discountAmount);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      const token = localStorage.getItem("token");
      const response = await api.post(
        "/coupons/apply",
        { code: couponCode, itemsPrice: cartTotal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppliedCoupon(response.data.coupon);
      setDiscountAmount(response.data.discountAmount);
      setCouponSuccess(response.data.message);
    } catch (err) {
      console.error(err);
      setCouponError(err.response?.data?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Address Submit
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (address.trim() && city.trim() && postalCode.trim() && country.trim()) {
      // Basic validations
      if (postalCode.trim().length !== 6 || isNaN(postalCode.trim())) {
        setError("Invalid PIN / ZIP code (must be exactly 6 numeric digits)");
        return;
      }
      setAddressSubmitted(true);
      setActiveStep(2);
      setError("");
    } else {
      setError("Please complete all shipping address fields");
    }
  };

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode || !country) {
      setError("Address details are incomplete");
      return;
    }

    if (paymentMethod === "Card") {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCVV.trim()) {
        setError("Please complete all card credentials for secure payment");
        return;
      }
      const rawCard = cardNumber.replace(/\s/g, "");
      if (rawCard.length !== 16 || isNaN(rawCard)) {
        setError("Invalid credit card number (must be 16 digits)");
        return;
      }
      if (cardCVV.length !== 3 || isNaN(cardCVV)) {
        setError("Invalid CVV number (must be 3 digits)");
        return;
      }
    }

    try {
      if (paymentMethod === "Card") {
        setPaymentProcessing(true);
        setError("");
        // Simulate payment authorization delay of 2.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setPaymentProcessing(false);
      }

      setLoading(true);
      setError("");

      const orderItemsPayload = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images?.length > 0 ? item.images[0] : "",
      }));

      const token = localStorage.getItem("token");
      const response = await api.post(
        "/orders",
        {
          orderItems: orderItemsPayload,
          shippingAddress: { address, city, postalCode, country },
          paymentMethod,
          itemsPrice: cartTotal,
          taxPrice: taxCost,
          shippingPrice: shippingCost,
          totalPrice: finalTotal,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        clearCart();
        navigate(`/order-success/${response.data.order._id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order");
      setPaymentProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty. Cannot checkout.</h1>
        <Link to="/products" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-left space-y-8 relative">
      {/* Payment Processing Overlay Spinner */}
      {paymentProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-white text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent shadow-md"></div>
          <h3 className="text-lg font-bold">Contacting banking network...</h3>
          <p className="text-xs opacity-75 max-w-xs font-semibold leading-relaxed">
            Please do not close this tab or navigate away. We are processing your mock purchase transaction securely.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Accordion (8-span) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Step 1: Login Check */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">1</span>
                <div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wide">Login details</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{user?.name} ({user?.email})</p>
                </div>
              </div>
              <span className="text-green-600 font-bold text-[10px] uppercase">✓ Verified</span>
            </div>
          </div>

          {/* Step 2: Shipping Address Accordion */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">2</span>
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">Delivery Address</h3>
              </div>
              {addressSubmitted && activeStep !== 1 && (
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 1 ? (
              <form onSubmit={handleAddressSubmit} className="p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat, House no., Building, Company, Street"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">PIN / Zip Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="6-digit ZIP code"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 shadow transition active:scale-98"
                >
                  Deliver to this Address
                </button>
              </form>
            ) : (
              addressSubmitted && (
                <div className="p-5 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>{address}</p>
                  <p>{city}, {postalCode}</p>
                  <p>{country}</p>
                </div>
              )
            )}
          </div>

          {/* Step 3: Order Summary Accordion */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">3</span>
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">Order Summary</h3>
              </div>
              {activeStep > 2 && (
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Review
                </button>
              )}
            </div>

            {activeStep === 2 && (
              <div className="p-5 space-y-4">
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex py-3 justify-between items-center gap-4 first:pt-0 last:pb-0 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-50 border p-1 rounded overflow-hidden">
                          {item.images?.length > 0 ? (
                            <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain mix-blend-multiply" />
                          ) : (
                            <span className="text-[8px] text-gray-400">No Image</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 truncate max-w-[200px]">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveStep(3)}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 shadow transition active:scale-98"
                >
                  Continue Checkout
                </button>
              </div>
            )}
          </div>

          {/* Step 4: Payment Options Accordion */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-5 py-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">4</span>
                <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs">Payment Options</h3>
              </div>
            </div>

            {activeStep === 3 && (
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 transition border-gray-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={() => setPaymentMethod("Card")}
                      className="accent-black h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 text-sm block">Credit / Debit Card</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Instant checkout verification</span>
                    </div>
                  </label>

                  {/* Card details sub-form */}
                  {paymentMethod === "Card" && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cardholder Name *</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Card Number *</label>
                        <input
                          type="text"
                          required
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          placeholder="1234 5678 1234 5678"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Expiry Date *</label>
                          <input
                            type="text"
                            required
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 2) {
                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            placeholder="MM/YY"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">CVV Security Code *</label>
                          <input
                            type="password"
                            required
                            maxLength="3"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50 transition border-gray-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="accent-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Pay with cash upon delivery</span>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || paymentProcessing}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 uppercase tracking-widest text-xs shadow hover:shadow-md disabled:bg-gray-400 active:scale-98 transition"
                >
                  {paymentProcessing
                    ? "Securing Mock Transaction..."
                    : loading
                    ? "Completing Order Transaction..."
                    : `Confirm Payment & Place Order (₹${finalTotal})`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Pricing and Coupons (4-span) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5 mb-3">Apply Coupon Code</h2>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="WELCOME10, SAVE500"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black uppercase font-bold"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition disabled:bg-gray-450"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="mt-2 text-xs font-semibold text-red-650">{couponError}</p>}
            {couponSuccess && <p className="mt-2 text-xs font-semibold text-green-600">{couponSuccess}</p>}
            {appliedCoupon && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-green-50/50 px-3 py-2 border border-green-200">
                <span className="text-xs font-bold text-green-800">Applied: {appliedCoupon.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setDiscountAmount(0);
                    setCouponCode("");
                    setCouponSuccess("");
                  }}
                  className="text-xs font-bold text-green-700 hover:text-green-900 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Pricing Details Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2.5 mb-3">Summary details</h2>
            <div className="space-y-4 border-b border-gray-100 pb-4 text-xs font-medium text-gray-700">
              <div className="flex justify-between">
                <span>Items ({cartCount})</span>
                <span className="text-gray-900">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Secured GST (18%)</span>
                <span className="text-gray-900">₹{taxCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fees</span>
                <span>{shippingCost === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingCost}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 text-sm font-black text-gray-900">
              <span>Final Total</span>
              <span className="text-lg">₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
