import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  XCircle,
  ArrowLeft,
  Package,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getMyBookings,
  type Booking,
} from "../services/bookingService";
import {
  getMyCustomPlans,
  type CustomPlan,
} from "../services/customPlanService";


export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [plans, setPlans] = useState<CustomPlan[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    loadBookings();
    loadPlans();
  }, []);


  const loadBookings = async () => {
    try {
      const data =
        await getMyBookings();

      setBookings(data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const loadPlans = async () => {
    try {
      const data =
        await getMyCustomPlans();

      setPlans(data);

    } catch (error) {
      // Custom plans are optional; ignore failures.
      console.error(error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your bookings...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">
          My bookings
        </h1>


        {bookings.length === 0 && plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center">

            <CalendarDays
              size={48}
              className="mx-auto text-gray-400 mb-4"
            />

            <h2 className="text-xl font-semibold">
              No bookings yet
            </h2>

            <p className="text-gray-500 mt-2">
              Your confirmed stays and custom plan requests will
              appear here.
            </p>

            <button
              onClick={() =>
                navigate("/stays")
              }
              className="mt-6 bg-black text-white px-6 py-3 rounded-xl"
            >
              Explore stays
            </button>

          </div>
        ) : (
          <div className="space-y-6">

            {/* Stay bookings */}
            {bookings.length > 0 && (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const confirmed =
                    booking.status === "confirmed";
                  const cancelled =
                    booking.status === "cancelled";
                  const paid =
                    booking.payment_status === "captured";

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/account/bookings/${booking.id}`
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="font-bold text-lg">
                                {booking.booking_reference}
                              </h2>

                              {confirmed && (
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                  Confirmed
                                </span>
                              )}

                              {cancelled && (
                                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                  Cancelled
                                </span>
                              )}

                              {booking.status === "pending" && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1">
                                  <Clock size={12} />
                                  Pending
                                </span>
                              )}

                              {/* Payment status */}
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${
                                  paid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-neutral-100 text-neutral-600"
                                }`}
                              >
                                {paid
                                  ? "Paid"
                                  : "Payment pending"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
                              <span className="flex items-center gap-2">
                                <CalendarDays size={16} />
                                {booking.check_in}
                                {" → "}
                                {booking.check_out}
                              </span>

                              <span>
                                {booking.guests} guest
                                {booking.guests !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-5">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Total
                              </p>
                              <p className="text-xl font-bold">
                                ₹{booking.total_amount.toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <ChevronRight
                              size={22}
                              className="text-gray-400"
                            />
                          </div>
                        </div>
                      </button>

                      {/* Pay button for unpaid, non-cancelled bookings */}
                      {!paid && !cancelled && (
                        <div className="mt-4 border-t pt-4">
                          <button
                            onClick={() =>
                              navigate(
                                `/checkout?room_id=${booking.room_id}&check_in=${booking.check_in}&check_out=${booking.check_out}&guests=${booking.guests}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
                          >
                            <CreditCard size={16} />
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom plan requests */}
            {plans.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Your custom plan requests
                </h2>

                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-gray-900">
                          <Package size={18} />
                          Custom Package Plan
                          #{plan.id}
                        </p>

                        <div className="mt-3 grid gap-1 text-sm text-gray-600">
                          <p>
                            • {plan.travel_days} travel day
                            {plan.travel_days !== 1 ? "s" : ""}
                          </p>

                          <p>
                            • Safari: {plan.safari_type}
                            {plan.safari_date
                              ? ` on ${plan.safari_date}`
                              : ""}
                            {plan.safari_shift !== "Any"
                              ? ` (${plan.safari_shift} shift)`
                              : ""}
                          </p>

                          <p>• Hotel: {plan.hotel_category}</p>

                          <p className="text-xs text-gray-400">
                            Requested{" "}
                            {new Date(
                              plan.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          plan.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : plan.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {plan.status === "accepted"
                          ? "Accepted by Ankit"
                          : plan.status === "rejected"
                            ? "Not available"
                            : "Waiting for Ankit"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
