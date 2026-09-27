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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview of your Ankit Tours platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border p-6"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <p className="text-3xl font-bold mt-2">
                  {card.value}
                </p>
              </div>

              <div className="text-3xl">
                {card.icon}
              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Revenue */}
      <div className="mt-6 bg-white rounded-xl border p-6">

        <p className="text-sm text-gray-500">
          Confirmed Booking Revenue
        </p>

        <p className="text-4xl font-bold mt-2">
          ₹{data.total_revenue.toLocaleString("en-IN")}
        </p>

      </div>

    </div>
  );
}