import {
  MapPin,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  getStays,
  type Stay,
} from "../services/stayService";


function Stays() {

  const navigate = useNavigate();

  const [
    stays,
    setStays,
  ] = useState<Stay[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const fetchStays = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getStays();

      setStays(data);

    } catch {

      setError(
        "Unable to load stays right now.",
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchStays();

  }, []);


  return (
    <div className="min-h-screen bg-white">

      <Navbar />


      {/* Header */}

      <section className="border-b border-neutral-200 bg-neutral-50">

        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">

          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Discover
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Find your perfect stay
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-500">
            Explore handpicked hotels, villas, resorts and
            unique stays across India.
          </p>

        </div>

      </section>


      {/* Results */}

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              All stays
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-neutral-500">
                {stays.length}{" "}
                {stays.length === 1
                  ? "property"
                  : "properties"}{" "}
                found
              </p>
            )}

          </div>

        </div>


        {/* Loading */}

        {loading && (

          <div className="flex min-h-[300px] items-center justify-center">

            <Loader2
              size={30}
              className="animate-spin text-neutral-400"
            />

          </div>

        )}


        {/* Error */}

        {!loading && error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>

        )}


        {/* Empty */}

        {!loading &&
          !error &&
          stays.length === 0 && (

            <div className="rounded-2xl border border-neutral-200 py-20 text-center">

              <h3 className="text-lg font-semibold">
                No stays found
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Try searching for another destination.
              </p>

            </div>
          )}


        {/* Cards */}

        {!loading &&
          !error &&
          stays.length > 0 && (

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {stays.map((stay) => (

                <Link
                  key={stay.id}
                  to={`/stays/${stay.slug}`}
                  className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Image */}

                  <div className="relative h-64 overflow-hidden bg-neutral-100">

                    {stay.primary_image ? (

                      <img
                        src={stay.primary_image}
                        alt={stay.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        No image
                      </div>

                    )}


                    <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                      {stay.property_type}
                    </div>

                  </div>


                  {/* Details */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold">
                          {stay.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">

                          <MapPin size={14} />

                          {stay.city}
                          {stay.state &&
                            `, ${stay.state}`}

                        </div>

                      </div>


                    </div>


                    <div className="mt-5 flex justify-end border-t border-neutral-100 pt-4">
                      <span className="text-sm font-semibold">
                        View stay →
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

      </main>


      <Footer />

    </div>
  );
}


export default Stays;
