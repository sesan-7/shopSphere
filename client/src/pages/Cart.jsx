import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Shopping Cart | ShopSphere Premium";
  }, []);

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  // Calculate pricing values
  const shippingCost = cartTotal > 5000 || cartTotal === 0 ? 0 : 150;
  const taxCost = Math.round(cartTotal * 0.18); // 18% GST
  
  // Calculate retail price total before item-level discounts to display "You Save" details
  const totalRetailPrice = cartItems.reduce((acc, item) => {
    const originalPrice = item.discount > 0 ? Math.round(item.price * (1 + item.discount / 100)) : item.price;
    return acc + originalPrice * item.quantity;
  }, 0);

  const discountSavings = totalRetailPrice - cartTotal;
  const finalTotal = cartTotal + shippingCost + taxCost;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mb-6 text-6xl">🛒</div>
        <h1 className="text-3xl font-extrabold text-gray-900 m-0">Your Shopping Cart is Empty</h1>
        <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Explore our premium collections to start.</p>
        <Link
          to="/products"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white hover:bg-blue-700 transition shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-left">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Shopping Cart ({cartCount} items)</h1>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Cart Items (8-span) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm divide-y divide-gray-100">
          {cartItems.map((item) => {
            const originalPrice = item.discount > 0 ? Math.round(item.price * (1 + item.discount / 100)) : item.price;
            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 first:pt-0 last:pb-0 gap-4"
              >
                {/* Product Image and Details */}
                <div className="flex gap-4 items-center">
                  <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-150 p-2 overflow-hidden">
                    {item.images?.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base hover:text-blue-600 transition">
                      <Link to={`/products/${item._id}`}>{item.name}</Link>
                    </h3>
                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-1">{item.category}</p>
                    
                    {/* Price and Discount Info */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-black text-gray-900">₹{item.price}</span>
                      {item.discount > 0 && (
                        <>
                          <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            {item.discount}% Off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Toggles and Deletion Actions */}
                <div className="flex items-center gap-6 self-end sm:self-auto">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden text-xs">
                    <button
                      onClick={() => decreaseQuantity(item._id)}
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item._id)}
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full border border-transparent hover:border-red-100 transition"
                    title="Remove item"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Flipkart Price Details (4-span) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
              Price Details
            </h2>

            <div className="space-y-4 border-b border-gray-100 pb-4 text-xs font-medium text-gray-700">
              <div className="flex justify-between">
                <span>Price ({cartCount} items)</span>
                <span className="text-gray-900">₹{totalRetailPrice}</span>
              </div>
              {discountSavings > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount Savings</span>
                  <span>- ₹{discountSavings}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Secured GST (18%)</span>
                <span className="text-gray-900">₹{taxCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingCost}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-sm font-black text-gray-900 border-b border-gray-100">
              <span>Total Amount</span>
              <span className="text-lg">₹{finalTotal}</span>
            </div>

            {/* Savings Banner */}
            {discountSavings > 0 && (
              <div className="rounded-xl bg-green-50/50 border border-green-200 px-4 py-3 text-xs font-bold text-green-700 text-center">
                🎉 You will save ₹{discountSavings} on this order!
              </div>
            )}

            <button
              onClick={handleCheckoutRedirect}
              className="w-full mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 uppercase tracking-widest text-xs shadow hover:shadow-md transition active:scale-98"
            >
              {user ? "Place Order" : "Login to Checkout"}
            </button>
          </div>

          {/* Secure transaction badge */}
          <div className="text-center text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1.5">
            <span>🛡️</span>
            <span>Safe and Secure Payments. 100% Authentic products.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
