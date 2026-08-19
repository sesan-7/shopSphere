import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setMessage("Login successful! Redirecting...");

      setTimeout(() => {
        if (redirect) {
          navigate(`/${redirect}`);
        } else {
          // If admin, go to admin dashboard, else go home
          if (response.data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-100 px-4 py-12 text-left">
      {/* Flipkart-inspired split panel login card */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row rounded-3xl bg-white shadow-lg overflow-hidden min-h-[480px]">
        {/* Left Column: Brand Info Sidebar (40% width) */}
        <div className="md:w-5/12 bg-gradient-to-b from-blue-600 to-indigo-750 p-10 text-white flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tight leading-tight m-0">Login</h1>
            <p className="text-sm font-semibold opacity-90 leading-relaxed">
              Get access to your Orders, Wishlist, Recommendations, and more.
            </p>
          </div>
          <div className="text-sm font-bold text-yellow-300">
            ShopSphere Premium Hub
          </div>
        </div>

        {/* Right Column: Interactive Login Form (60% width) */}
        <div className="md:w-7/12 p-10 flex flex-col justify-between">
          <div className="space-y-6">
            {message && (
              <div className="rounded-lg bg-green-50 p-4 text-xs font-semibold text-green-700 border border-green-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="w-full border-b border-gray-300 py-3 text-xs outline-none focus:border-blue-600 transition peer bg-transparent"
                />
                <label className="absolute left-0 top-3 text-xs font-bold text-gray-400 pointer-events-none transition-all duration-300 origin-[0] -translate-y-4 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 uppercase tracking-wider">
                  Enter Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=" "
                  className="w-full border-b border-gray-300 py-3 text-xs outline-none focus:border-blue-600 transition peer bg-transparent"
                />
                <label className="absolute left-0 top-3 text-xs font-bold text-gray-400 pointer-events-none transition-all duration-300 origin-[0] -translate-y-4 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 uppercase tracking-wider">
                  Enter Password
                </label>
              </div>

              <div className="flex justify-between items-center text-xs">
                <Link to="/forgot-password" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest py-4 shadow transition active:scale-98 disabled:bg-gray-400"
                >
                  {loading ? "Authenticating..." : "Login"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-xs font-semibold text-gray-500 pt-6 border-t border-gray-100">
            New to ShopSphere?{" "}
            <Link to={`/register${redirect ? `?redirect=${redirect}` : ""}`} className="font-bold text-blue-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;