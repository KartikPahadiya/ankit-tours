import { useState } from "react";
import type { SafariConfig } from "../../services/safariService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createRequest } from "../../services/requestService";

const WHATSAPP_NUMBER = "918741961756";

interface Props {
  safari: SafariConfig;
}

export default function SafariOptionCard({ safari }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);

  const handleBook = async () => {
    if (!user) {
      navigate("/login", {
        state: { from: window.location.pathname },
      });
      return;
    }

    try {
      setSending(true);

      await createRequest({
        type: "safari",
        item_id: safari.id,
      });

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          message,
        )}`,
        "_blank",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", {
          state: { from: window.location.pathname },
        });
        return;
      }

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          message,
        )}`,
        "_blank",
      );
    } finally {
      setSending(false);
    }
  };

  const image =
    safari.vehicle_type === "Gypsy"
      ? "/gypsy.jpg"
      : "/canter.jpg";

  const userName = user?.name
    ? user.name.split(" ")[0]
    : "";

  const message =
    `Hello Ankit!${userName ? ` This is ${userName}.` : ""} ` +
    `I'd like to book the ${safari.vehicle_type} safari in the ` +
    `${safari.shift} shift. Please share availability and the ` +
    `next steps.`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:flex-row">
      {/* Left: vehicle photo with text over it, fading into the card */}
      <div className="relative min-h-44 flex-1 overflow-hidden">
        <img
          src={image}
          alt={`${safari.vehicle_type} safari`}
          className="absolute inset-0 h-full w-full object-cover [object-position:50%_70%]"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-white" />

        <div className="relative flex h-full flex-col justify-center p-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow">
            {safari.vehicle_type} Safari —{" "}
            {safari.shift} Shift
          </h3>

          <p className="mt-1 text-sm text-white/90 drop-shadow">
            {safari.seats_per_vehicle} seats per vehicle
          </p>

          {safari.timing && (
            <p className="mt-1 text-xs text-white/80 drop-shadow">
              {safari.timing}
            </p>
          )}
        </div>
      </div>

      {/* Right: price + booking */}
      <div className="flex flex-col justify-center p-4 sm:w-44">
        <p className="text-2xl font-bold text-gray-900">
          ₹
          {Number(safari.price_per_person).toLocaleString(
            "en-IN"
          )}
        </p>

        <p className="text-xs text-gray-500">per person</p>

        <button
          onClick={handleBook}
          disabled={sending}
          className="mt-3 inline-block rounded-xl bg-orange-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Book This Safari"}
        </button>
      </div>
    </div>
  );
}
