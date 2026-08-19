import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please complete all registration fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await api.post("/auth/register", formData);

      setMessage(`${response.data.message}! Redirecting to login...`);
      setFormData({ name: "", email: "", password: "" });

      setTimeout(() => {
        navigate(`/login${redirect ? `?redirect=${redirect}` : ""}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-100 px-4 py-12 text-left">
      <div className="w-full max-w-3xl flex flex-col md:flex-row rounded-3xl bg-white shadow-lg overflow-hidden min-h-[480px]">
        {/* Left Column: Brand Info Sidebar (40% width) */}
        <div className="md:w-5/12 bg-gradient-to-b from-blue-600 to-indigo-750 p-10 text-white flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight m-0">
              Looks like you're new here!
            </h1>
            <p className="text-sm font-semibold opacity-90 leading-relaxed">
              Sign up with your email address to get started tracking orders and wishlisting items.
            </p>
          </div>
          <div className="text-sm font-bold text-yellow-300">
            ShopSphere Premium Hub
          </div>
        </div>

        {/* Right Column: Registration Form (60% width) */}
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
              {/* Full Name */}
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  className="w-full border-b border-gray-300 py-3 text-xs outline-none focus:border-blue-600 transition peer bg-transparent"
                />
                <label className="absolute left-0 top-3 text-xs font-bold text-gray-400 pointer-events-none transition-all duration-300 origin-[0] -translate-y-4 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 uppercase tracking-wider">
                  Enter Full Name
                </label>
              </div>

              {/* Email Address */}
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
                  Create Password
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest py-4 shadow transition active:scale-98 disabled:bg-gray-400"
                >
                  {loading ? "Registering account..." : "Continue"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-xs font-semibold text-gray-500 pt-6 border-t border-gray-100">
            Already have an account?{" "}
            <Link to={`/login${redirect ? `?redirect=${redirect}` : ""}`} className="font-bold text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;