import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch registered users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/auth/users/${userId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to modify user status");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && users.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Users Management</h1>
          <p className="text-xs text-gray-505 dark:text-gray-400">View registered client accounts and toggle active or banned states</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-[#1f2028] border border-gray-150 dark:border-[#2e303a] rounded-2xl shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2e303a] bg-gray-50/50 dark:bg-[#16171d]/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2e303a] font-medium text-gray-700 dark:text-gray-350">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/35 transition">
                      <td className="py-4 px-6 font-mono text-xs text-gray-400 dark:text-gray-500 select-all">{item._id}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{item.email}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          item.role === "admin"
                            ? "bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30"
                            : "bg-gray-100 dark:bg-gray-800/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          item.isActive ? "bg-green-500" : "bg-red-500"
                        }`} title={item.isActive ? "Active" : "Banned"}></span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {item.role !== "admin" ? (
                          <button
                            onClick={() => handleToggleStatus(item._id)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                              item.isActive
                                ? "border-red-200 dark:border-red-905/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25"
                                : "border-green-200 dark:border-green-905/30 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/25"
                            }`}
                          >
                            {item.isActive ? "🚫 Ban User" : "✅ Activate"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-650 italic font-bold">No actions</span>
                        )}
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

export default AdminUsers;
