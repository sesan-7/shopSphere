import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Statistics State
  const [stats, setStats] = useState({
    wishlistCount: 0,
    ordersCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");

      // Fetch wishlist and orders count
      const [wishlistRes, ordersRes] = await Promise.all([
        api.get("/auth/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/orders/myorders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        wishlistCount: wishlistRes.data.wishlist?.length || 0,
        ordersCount: ordersRes.data.orders?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch profile stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      fetchStats();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required fields");
      return;
    }

    if (password && password.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await api.put(
        "/auth/profile",
        {
          name,
          email,
          password: password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUser({
          ...user,
          name: response.data.user.name,
          email: response.data.user.email,
        });
        setSuccess("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 text-left space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 m-0">My Account</h1>
        <p className="text-xs text-gray-400 mt-1">Manage your profiles, track orders, and view wishlist metrics.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form Details (8-span) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-450 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">
            Profile Credentials
          </h2>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-green-50 p-4 text-xs font-bold text-green-700 border border-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <hr className="border-gray-100 my-6" />

            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Update Password</h3>
              <p className="text-[10px] text-gray-400 mb-4">Leave fields blank if you wish to retain your current password.</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black hover:bg-gray-800 text-white font-bold py-4 uppercase tracking-widest text-xs shadow transition active:scale-98 disabled:bg-gray-400"
            >
              {loading ? "Saving Credentials..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Right Column: Account Stats (4-span) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-bold text-gray-450 uppercase tracking-widest border-b border-gray-100 pb-3">
              Account Overview
            </h2>

            {statsLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Wishlist count card */}
                <Link
                  to="/wishlist"
                  className="rounded-2xl border border-gray-150 p-4 text-center hover:border-blue-500 hover:bg-blue-50/10 transition block"
                >
                  <span className="text-2xl block mb-1">❤️</span>
                  <span className="text-xl font-black text-gray-900 block">{stats.wishlistCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Wishlist</span>
                </Link>

                {/* Orders count card */}
                <Link
                  to="/orders"
                  className="rounded-2xl border border-gray-150 p-4 text-center hover:border-blue-500 hover:bg-blue-50/10 transition block"
                >
                  <span className="text-2xl block mb-1">📦</span>
                  <span className="text-xl font-black text-gray-900 block">{stats.ordersCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Orders</span>
                </Link>
              </div>
            )}

            <div className="text-xs space-y-2 text-gray-500 font-semibold border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Account Role:</span>
                <span className="font-bold text-gray-800 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Status:</span>
                <span className="font-bold text-green-600">Active Account</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="font-bold text-gray-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
