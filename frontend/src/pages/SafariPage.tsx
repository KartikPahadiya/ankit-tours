import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SafariOptionCard from "../components/safari/SafariOptionCard";
import {
  getSafaris,
  type SafariConfig,
} from "../services/safariService";

function SafariPage() {
  const navigate = useNavigate();
  const [safaris, setSafaris] = useState<SafariConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSafaris()
      .then((data) => setSafaris(data))
      .catch(() => setError("Unable to load safari options."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Go back
        </button>

        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            Safaris
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Safari Options & Prices
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-gray-500">
            Loading safari options...
          </p>
        ) : safaris.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            Safari options will be announced soon.
          </p>
        ) : (
          <div className="space-y-6">
            {safaris.map((safari) => (
              <SafariOptionCard
                key={safari.id}
                safari={safari}
              />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Safari permits and government/park charges are subject to
          forest department rules and availability.
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SafariPage;
