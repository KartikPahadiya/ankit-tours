import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      label: "Properties",
      path: "/admin/stays",
      icon: "🏨",
    },
    {
      label: "Safaris",
      path: "/admin/safaris",
      icon: "🚙",
    },
    {
      label: "Tours",
      path: "/admin/packages",
      icon: "🐅",
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: "📅",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="px-6 py-6 border-b border-slate-700 flex items-start justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Ankit Tours
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Admin Panel
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:bg-slate-800"}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">

          <div className="mb-4">
            <p className="font-medium">
              {user?.name}
            </p>

            <p className="text-xs text-slate-400">
              Administrator
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen min-w-0 md:ml-64">

        <header className="bg-white border-b px-4 sm:px-8 py-5 flex items-center gap-3">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <h2 className="text-xl font-semibold">
            Admin Panel
          </h2>
        </header>

        <div className="p-4 sm:p-8">
          <Outlet />
        </div>

      </main>

    </div>
  );
}
