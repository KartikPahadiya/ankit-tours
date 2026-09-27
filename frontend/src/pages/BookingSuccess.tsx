import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";


export default function BookingSuccess() {
  const navigate = useNavigate();

  const [params] =
    useSearchParams();

  const reference =
    params.get("reference");


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-lg w-full text-center">

        <CheckCircle
          size={64}
          className="mx-auto text-green-600 mb-6"
        />

        <h1 className="text-3xl font-bold mb-3">
          Booking confirmed!
        </h1>

        <p className="text-gray-600">
          Your payment was successfully verified
          and your stay has been confirmed.
        </p>


        {reference && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4">

            <p className="text-sm text-gray-500">
              Booking reference
            </p>

            <p className="text-xl font-bold mt-1">
              {reference}
            </p>

          </div>
        )}


        <button
          onClick={() =>
            navigate("/account/bookings")
          }
          className="mt-8 w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          View my bookings

          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
}
