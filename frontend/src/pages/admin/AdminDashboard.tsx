import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  AdminDashboard as DashboardData,
} from "../../services/adminService";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getAdminDashboard();
        setData(result);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error || "Unable to load dashboard."}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: data.total_users,
      icon: "👥",
    },
    {
      title: "Properties",
      value: data.total_stays,
      icon: "🏨",
    },
    {
      title: "Rooms",
      value: data.total_rooms,
      icon: "🛏️",
    },
    {
      title: "Bookings",
      value: data.total_bookings,
      icon: "📅",
    },
    {
      title: "Confirmed",
      value: data.confirmed_bookings,
      icon: "✅",
    },
    {
      title: "Pending",
      value: data.pending_bookings,
      icon: "⏳",
    },
  ];

  return (
    <div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview of your Ankit Tours platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">

        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border p-4 sm:p-6"
          >
            <p className="text-sm text-gray-500">
              {card.icon} {card.title}
            </p>

            <p className="text-2xl font-bold mt-1 sm:text-3xl">
              {card.value}
            </p>
          </div>
        ))}

      </div>

      {/* Revenue */}
      <div className="mt-4 sm:mt-6 bg-white rounded-xl border p-4 sm:p-6">

        <p className="text-sm text-gray-500">
          Confirmed Booking Revenue
        </p>

        <p className="text-2xl font-bold mt-1 sm:text-4xl">
          ₹{data.total_revenue.toLocaleString("en-IN")}
        </p>

      </div>

    </div>
  );
}