import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  getStays,
  type Stay,
} from "../services/stayService";


function Stays() {

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


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


  const [
    search,
    setSearch,
  ] = useState(
    searchParams.get("city") || "",
  );


  const [
    propertyType,
    setPropertyType,
  ] = useState("");


  const fetchStays = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getStays(
        search || undefined,
        propertyType || undefined,
      );

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

  }, [propertyType]);


  const handleSearch = (
    event: React.FormEvent,
  ) => {

    event.preventDefault();

    if (search) {

      setSearchParams({
        city: search,
      });

    } else {

      setSearchParams({});

    }

    fetchStays();
  };


  return (
    <div className="min-h-screen bg-white">

      <Navbar />


      {/* Header */}

      <section className="border-b border-neutral-200 bg-neutral-50">

        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">

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


          {/* Search */}

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row"
          >

            <div className="flex flex-1 items-center gap-3 px-3">

              <Search
                size={19}
                className="text-neutral-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search destination..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />

            </div>


            <select
              value={propertyType}
              onChange={(event) =>
                setPropertyType(
                  event.target.value,
                )
              }
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
            >

              <option value="">
                All property types
              </option>

              <option value="Villa">
                Villas
              </option>

              <option value="Resort">
                Resorts
              </option>

              <option value="Hotel">
                Hotels
              </option>

              <option value="Homestay">
                Homestays
              </option>

            </select>


            <button
              type="submit"
              className="rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Search
            </button>

          </form>

        </div>

      </section>


      {/* Results */}

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              {search
                ? `Stays in ${search}`
                : "All stays"}
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


          <button className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
            <SlidersHorizontal size={16} />
            Filters
          </button>

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


                      <div className="flex shrink-0 items-center gap-1 text-sm font-medium">

                        <Star
                          size={15}
                          className="fill-black"
                        />

                        {stay.rating}

                      </div>

                    </div>


                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">

                      <span className="text-xs text-neutral-500">
                        {stay.review_count} reviews
                      </span>

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
