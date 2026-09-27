import { useEffect, useState } from "react";
import {
  getAdminBookings,
  AdminBooking,
} from "../../services/adminService";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getAdminBookings();
        setBookings(data);
      } catch {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Bookings
        </h1>

        <p className="text-gray-500 mt-1">
          Every customer purchase, with contact details.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b">
            <tr>

              <th className="text-left px-4 py-3">
                Reference
              </th>

              <th className="text-left px-4 py-3">
                Customer
              </th>

              <th className="text-left px-4 py-3">
                Property
              </th>

              <th className="text-left px-4 py-3">
                Dates
              </th>

              <th className="text-left px-4 py-3">
                Guests
              </th>

              <th className="text-left px-4 py-3">
                Amount
              </th>

              <th className="text-left px-4 py-3">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No bookings yet. Customer purchases will appear here.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-3 font-medium">
                    {booking.booking_reference}
                  </td>

                  <td className="px-4 py-3">

                    <p className="font-medium">
                      {booking.customer_name || `User #${booking.user_id}`}
                    </p>

                    <p className="text-sm text-gray-500">
                      {booking.customer_email}
                    </p>

                    {booking.customer_phone && (
                      <p className="text-sm text-gray-500">
                        {booking.customer_phone}
                      </p>
                    )}

                  </td>

                  <td className="px-4 py-3">

                    <p className="font-medium">
                      {booking.stay_name || "—"}
                    </p>

                    {booking.room_name && (
                      <p className="text-sm text-gray-500">
                        {booking.room_name}
                      </p>
                    )}

                  </td>

                  <td className="px-4 py-3">
                    <span className="block">
                      {booking.check_in}
                    </span>
                    <span className="block text-gray-500">
                      → {booking.check_out}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {booking.guests}
                  </td>

                  <td className="px-4 py-3">
                    ₹{Number(booking.total_amount).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {booking.status}
                    </span>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

        </div>

      </div>

    </div>
  );
}
