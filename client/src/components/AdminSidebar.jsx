import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const links = [
    { name: "📊 Dashboard", path: "/admin/dashboard" },
    { name: "📦 Products", path: "/admin/products" },
    { name: "🛒 Customer Orders", path: "/admin/orders" },
    { name: "👥 Users Management", path: "/admin/users" },
    { name: "🎟️ Promo Coupons", path: "/admin/coupons" },
  ];

  return (
    <aside className="w-full md:w-64 bg-gray-50 dark:bg-[#1a1b23] border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#2e303a] p-6 flex flex-col gap-4 text-left">
      <div className="mb-2 md:mb-6">
        <h2 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">Admin Control Panel</h2>
        <p className="text-[10px] text-gray-500 mt-1">Manage store parameters</p>
      </div>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible no-scrollbar whitespace-nowrap gap-2 text-sm font-semibold pb-3 md:pb-0">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-shrink-0 md:flex-initial rounded-xl px-4 py-3 transition text-center md:text-left ${
                isActive
                  ? "bg-black dark:bg-[#f3f4f6] text-white dark:text-black shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:block mt-auto pt-6 border-t border-gray-200 dark:border-[#2e303a]">
        <Link
          to="/"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition block text-center"
        >
          ← Return to Main Storefront
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
