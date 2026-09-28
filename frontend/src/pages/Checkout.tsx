import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  createPaymentOrder,
  verifyPayment,
  type CreateOrderResponse,
} from "../services/paymentService";


function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}


export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const params = new URLSearchParams(
    location.search
  );

  const roomId = Number(
    params.get("room_id")
  );

  const checkIn = params.get(
    "check_in"
  );

  const checkOut = params.get(
    "check_out"
  );

  const guests = Number(
    params.get("guests")
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [order, setOrder] =
    useState<CreateOrderResponse | null>(
      null
    );

  useEffect(() => {
    if (
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guests
    ) {
      setError(
        "Invalid booking information."
      );
    }
  }, [
    roomId,
    checkIn,
    checkOut,
    guests,
  ]);


  const startPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay."
        );
      }

      // Reuse the order created on the first click. Without this,
      // a double-click or retry after a network error would create
      // a brand-new booking (and a second inventory hold) every
      // time the button is pressed.
      let paymentOrder = order;

      if (!paymentOrder) {
        paymentOrder =
          await createPaymentOrder({
            room_id: roomId,
            check_in: checkIn!,
            check_out: checkOut!,
            guests,
          });

        setOrder(paymentOrder);
      }

      const options = {
        key: paymentOrder.razorpay_key_id,

        amount: Math.round(
          paymentOrder.amount * 100
        ),

        currency:
          paymentOrder.currency,

        name: "Ankit Tours",

        description:
          `Booking ${paymentOrder.booking_reference}`,

        order_id:
          paymentOrder.razorpay_order_id,

        prefill: {
          name: user?.name,
          email: user?.email,
          contact:
            user?.phone ?? undefined,
        },

        notes: {
          booking_reference:
            paymentOrder.booking_reference,
        },

        theme: {
          color: "#111827",
        },

        handler: async (
          response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }
        ) => {
          try {
            setLoading(true);

            const result =
              await verifyPayment({
                booking_id:
                  paymentOrder.booking_id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              });

            if (result.success) {
              navigate(
                `/booking-success?reference=${encodeURIComponent(
                  result.booking_reference
                )}`
              );
            }
          } catch (err) {
            console.error(err);

            setError(
              "Payment was received, but verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();

    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to start payment.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  if (
    !roomId ||
    !checkIn ||
    !checkOut ||
    !guests
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Invalid booking
          </h1>

          <button
            onClick={() => navigate("/stays")}
            className="mt-4 underline"
          >
            Browse stays
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <h1 className="text-3xl font-bold mb-8">
          Complete your booking
        </h1>


        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold mb-6">
              Booking details
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-500">
                  Check-in
                </p>

                <p className="font-medium">
                  {checkIn}
                </p>
              </div>


              <div>
                <p className="text-sm text-gray-500">
                  Check-out
                </p>

                <p className="font-medium">
                  {checkOut}
                </p>
              </div>


              <div>
                <p className="text-sm text-gray-500">
                  Guests
                </p>

                <p className="font-medium">
                  {guests}
                </p>
              </div>

            </div>

          </div>


          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold mb-6">
              Payment
            </h2>

            <p className="text-gray-600 mb-6">
              Your room will be held for{" "}
              <strong>10 minutes</strong>{" "}
              while you complete payment.
            </p>


            {error && (
              <div className="mb-5 rounded-lg bg-red-50 text-red-700 p-4 text-sm">
                {error}
              </div>
            )}


            {order && (
              <div className="mb-5 p-4 bg-gray-50 rounded-lg">

                <p className="text-sm text-gray-500">
                  Booking reference
                </p>

                <p className="font-semibold">
                  {order.booking_reference}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Amount
                </p>

                <p className="text-2xl font-bold">
                  ₹{order.amount.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>
            )}


            <button
              onClick={startPayment}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />

                  Continue to payment
                </>
              )}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
