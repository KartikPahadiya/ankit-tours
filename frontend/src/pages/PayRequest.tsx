import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getRequest,
  type BookingRequest,
} from "../services/requestService";
import {
  createRequestPaymentOrder,
  verifyRequestPayment,
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


export default function PayRequest() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] =
    useState<BookingRequest | null>(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRequest(
          Number(requestId)
        );

        setRequest(data);
      } catch {
        setError("Unable to load this request.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [requestId]);


  const startPayment = async () => {
    if (!request) return;

    try {
      setPaying(true);
      setError("");

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay."
        );
      }

      const order =
        await createRequestPaymentOrder(
          request.id
        );

      const options = {
        key: order.razorpay_key_id,

        amount: Math.round(
          order.amount * 100
        ),

        currency: order.currency,

        name: "Ankit Tours",

        description: `Request ${order.request_reference}`,

        order_id: order.razorpay_order_id,

        prefill: {
          name: user?.name,
          email: user?.email,
          contact:
            user?.phone ?? undefined,
        },

        theme: {
          color: "#111827",
        },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setPaying(true);

            const result =
              await verifyRequestPayment({
                request_id: request.id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              });

            if (result.success) {
              navigate("/my-bookings");
            }
          } catch (err) {
            console.error(err);

            setError(
              "Payment was received, but verification failed. Please contact support."
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to start payment."
      );
    } finally {
      setPaying(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <h1 className="text-3xl font-bold mb-8">
          Complete your payment
        </h1>


        {error && (
          <div className="mb-5 rounded-lg bg-red-50 text-red-700 p-4 text-sm">
            {error}
          </div>
        )}


        {request && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-500">
                  Request reference
                </p>
                <p className="font-medium">
                  {request.request_reference}
                </p>
              </div>


              <div>
                <p className="text-sm text-gray-500">
                  Booking
                </p>
                <p className="font-medium">
                  {request.item_name}
                </p>
              </div>


              {request.check_in &&
                request.check_out && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Dates
                    </p>
                    <p className="font-medium">
                      {request.check_in} →{" "}
                      {request.check_out}
                    </p>
                  </div>
                )}


              <div>
                <p className="text-sm text-gray-500">
                  Amount
                </p>
                <p className="text-2xl font-bold">
                  ₹
                  {request.amount?.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

            </div>


            {request.status === "accepted" ? (
              <button
                onClick={startPayment}
                disabled={paying}
                className="mt-6 w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paying ? (
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
                    Pay ₹
                    {request.amount?.toLocaleString(
                      "en-IN"
                    )}
                  </>
                )}
              </button>
            ) : (
              <div className="mt-6 rounded-lg bg-yellow-50 text-yellow-800 p-4 text-sm">
                {request.status === "paid"
                  ? "This request is already paid."
                  : request.status === "expired"
                    ? "The payment window for this request has expired. Please contact Ankit on WhatsApp."
                    : "This request is not awaiting payment."}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
