import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Users,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  cancelBooking,
  getBooking,
  type BookingDetail as BookingDetailType,
} from "../services/bookingService";


export default function BookingDetails() {
  const { bookingId } = useParams();

  const navigate = useNavigate();

  const [booking, setBooking] =
    useState<BookingDetailType | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (!bookingId) return;

    loadBooking();
  }, [bookingId]);


  const loadBooking = async () => {
    try {
      setLoading(true);

      const data = await getBooking(
        Number(bookingId)
      );

      setBooking(data);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load booking."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = async () => {
  if (!booking) return;

  const confirmed =
    window.confirm(
      "Are you sure you want to cancel this booking?"
    );

  if (!confirmed) {
    return;
  }

  try {
    setCancelling(true);

    const result =
      await cancelBooking(
        booking.id
      );

    setBooking({
      ...booking,
      status: result.booking_status,
      payment_status:
        result.payment_status,
    });

    if (result.refund_amount > 0) {
      alert(
        `Booking cancelled. Refund of ₹${result.refund_amount.toLocaleString(
          "en-IN"
        )} has been initiated. (${result.refund_percentage}% refund)`
      );
    } else {
      alert(
        "Booking cancelled. This booking is not eligible for a refund."
      );
    }

  } catch (err: any) {
    alert(
      err?.response?.data?.detail ||
        "Unable to cancel booking."
    );

  } finally {
    setCancelling(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading booking...
      </div>
    );
  }


  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Booking not found
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                "/account/bookings"
              )
            }
            className="mt-5 underline"
          >
            Back to bookings
          </button>

        </div>

      </div>
    );
  }


  const isCancelled =
    booking.status === "cancelled";


  const isConfirmed =
    booking.status === "confirmed";


  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-10">

        <button
          onClick={() =>
            navigate(
              "/account/bookings"
            )
          }
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft size={18} />

          Back to bookings
        </button>


        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <p className="text-sm text-gray-500">
              Booking reference
            </p>

            <h1 className="text-3xl font-bold">
              {booking.booking_reference}
            </h1>

          </div>


          <div>
            {isConfirmed && (
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <CheckCircle size={17} />

                Confirmed
              </span>
            )}

            {isCancelled && (
              <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <XCircle size={17} />

                Cancelled
              </span>
            )}

            {booking.status === "pending" && (
              <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
                <Clock size={17} />

                Payment pending
              </span>
            )}
          </div>

        </div>


        <div className="grid md:grid-cols-3 gap-6">

          <div className="md:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm">

              <h2 className="text-xl font-semibold mb-5">
                Stay
              </h2>

              <h3 className="text-2xl font-bold">
                {booking.stay_name}
              </h3>

              <p className="text-gray-500 mt-1">
                {booking.room_name}
              </p>

              <button
                onClick={() =>
                  navigate(
                    `/stays/${booking.stay_slug}`
                  )
                }
                className="mt-4 underline text-sm"
              >
                View property
              </button>

            </div>


            <div className="bg-white rounded-2xl p-6 shadow-sm">

              <h2 className="text-xl font-semibold mb-5">
                Trip details
              </h2>

              <div className="grid sm:grid-cols-3 gap-5">

                <div className="flex gap-3">

                  <CalendarDays
                    size={20}
                    className="text-gray-500"
                  />

                  <div>

                    <p className="text-sm text-gray-500">
                      Check-in
                    </p>

                    <p className="font-medium">
                      {booking.check_in}
                    </p>

                  </div>

                </div>


                <div className="flex gap-3">

                  <CalendarDays
                    size={20}
                    className="text-gray-500"
                  />

                  <div>

                    <p className="text-sm text-gray-500">
                      Check-out
                    </p>

                    <p className="font-medium">
                      {booking.check_out}
                    </p>

                  </div>

                </div>


                <div className="flex gap-3">

                  <Users
                    size={20}
                    className="text-gray-500"
                  />

                  <div>

                    <p className="text-sm text-gray-500">
                      Guests
                    </p>

                    <p className="font-medium">
                      {booking.guests}
                    </p>

                  </div>

                </div>

              </div>

            </div>


          </div>


          <div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">

              <h2 className="text-xl font-semibold mb-5">
                Payment
              </h2>


              <div className="flex justify-between mb-3">

                <span className="text-gray-500">
                  Price / night
                </span>

                <span>
                  ₹{booking.price_per_night.toLocaleString("en-IN")}
                </span>

              </div>


              <div className="border-t pt-4 mt-4 flex justify-between">

                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  ₹{booking.total_amount.toLocaleString("en-IN")}
                </span>

              </div>


              <div className="mt-5 text-sm">

                <span className="text-gray-500">
                  Payment status
                </span>

                <p className="font-medium capitalize">
                  {booking.payment_status || "Not paid"}
                </p>

              </div>


              {isConfirmed &&
                !isCancelled && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full mt-6 border border-red-300 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel booking"}
                  </button>
                )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}