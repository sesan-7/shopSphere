import { Link } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";

const Footer = () => {
  const confirm = useConfirm();

  const showPolicyAlert = (policyTitle, policyBody) => {
    confirm.alert(policyTitle, policyBody);
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      {/* Upper Footer: Brand Info and Newsletter */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-800 text-left">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <Link to="/" className="text-2xl font-bold text-white tracking-tight block">
            ShopSphere
          </Link>
          <p className="text-sm max-w-sm text-gray-400 leading-relaxed">
            Experience premium curated products, secure payments, and worldwide lightning-fast shipping. Smart products for modern living.
          </p>
          <div className="flex gap-3 text-lg pt-2">
            <span className="cursor-pointer hover:text-white transition">🐦</span>
            <span className="cursor-pointer hover:text-white transition">📸</span>
            <span className="cursor-pointer hover:text-white transition">📘</span>
            <span className="cursor-pointer hover:text-white transition">👔</span>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4 col-span-1 md:col-span-2 text-left">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Connected</h4>
          <p className="text-xs text-gray-400">Subscribe to receive exclusive deals, collections drops, and extra discounts.</p>
          <form onSubmit={(e) => { e.preventDefault(); confirm.alert("Newsletter Subscription", "Successfully subscribed to the ShopSphere newsletter!"); }} className="flex gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-gray-200 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Mid Footer: Quick Links (Removed Company and Legal) */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left text-xs">
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">Shop Categories</h4>
          <ul className="space-y-3 font-semibold flex flex-col">
            <li><Link to="/products?category=Electronics" className="hover:text-white transition">💻 Electronics</Link></li>
            <li><Link to="/products?category=Fashion" className="hover:text-white transition">👕 Fashion</Link></li>
            <li><Link to="/products?category=Shoes" className="hover:text-white transition">👟 Shoes & Apparel</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-white transition">🎧 Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-3 font-semibold flex flex-col items-start">
            <li>
              <a href="mailto:support@shopsphere.com?subject=ShopSphere%20Customer%20Support" className="hover:text-white transition">
                ✉️ Contact Support
              </a>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white transition">
                📦 Track Order
              </Link>
            </li>
            <li>
              <button
                onClick={() =>
                  showPolicyAlert(
                    "🚚 Shipping Policy",
                    "- Dispatch within 24 hours of successful payment.\n- Standard delivery across India in 2-5 business days.\n- Fast air-shipping available for metro cities.\n- Free shipping on subtotals above ₹5,000."
                  )
                }
                className="hover:text-white transition text-left cursor-pointer p-0 bg-transparent border-0 font-semibold"
              >
                🚚 Shipping Policy
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  showPolicyAlert(
                    "🛡️ Returns & Exchange Policy",
                    "- Hassle-free 7-day easy return policy.\n- Pickup arranged straight from your delivery pin code.\n- Return checking is completed upon pickup.\n- Refund initiated instantly to original payment method."
                  )
                }
                className="hover:text-white transition text-left cursor-pointer p-0 bg-transparent border-0 font-semibold"
              >
                🛡️ Easy Returns
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer: Legal Copy */}
      <div className="bg-gray-950/80 py-6 border-t border-gray-850">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold">
          <p>© 2026 ShopSphere E-Commerce Hub. All rights reserved.</p>
          <div className="flex gap-6 text-gray-500">
            <span
              onClick={() => showPolicyAlert("Privacy Policy", "Your personal and billing data is fully encrypted and never shared with third parties.")}
              className="hover:text-white cursor-pointer transition"
            >
              Privacy Policy
            </span>
            <span
              onClick={() => showPolicyAlert("Terms of Use", "By accessing ShopSphere, you agree to our standard terms of service, customer policies, and catalog guidelines.")}
              className="hover:text-white cursor-pointer transition"
            >
              Terms of Use
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;