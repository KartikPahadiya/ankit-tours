import {
  ArrowLeft,
  Check,
  MapPin,
  MessageCircle,
  Star,
  Users,
  Loader2,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  getStayBySlug,
  type StayDetails as StayDetailsType,
} from "../services/stayService";

import {
  checkAvailability,
  type AvailabilityResponse,
} from "../services/bookingService";


function StayDetails() {

  const navigate = useNavigate();
  const { slug } = useParams();

  const [
    stay,
    setStay,
  ] = useState<StayDetailsType | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [selectedRoom, setSelectedRoom] =
    useState<number | null>(null);

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [guests, setGuests] =
    useState(2);

  const [availability, setAvailability] =
    useState<AvailabilityResponse | null>(null);

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [bookingError, setBookingError] =
    useState("");


  useEffect(() => {

    if (!slug) {
      return;
    }

    const fetchStay = async () => {

      try {
        setLoading(true);

        const data =
          await getStayBySlug(slug);

        setStay(data);

        if (data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0].id);
        }

      } catch {

        setError(
          "Unable to find this stay.",
        );

      } finally {

        setLoading(false);

      }
    };


    fetchStay();

  }, [slug]);


  const handleCheckAvailability = async (
    event: FormEvent,
  ) => {

    event.preventDefault();

    setBookingError("");

    if (!selectedRoom) {
      setBookingError(
        "Please select a room.",
      );
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError(
        "Please select check-in and check-out dates.",
      );
      return;
    }

    try {

      setCheckingAvailability(true);

      const result =
        await checkAvailability({
          room_id: selectedRoom,
          check_in: checkIn,
          check_out: checkOut,
          guests,
        });

      setAvailability(result);

    } catch (error: any) {

      setBookingError(
        error?.response?.data?.detail ||
        "Unable to check availability.",
      );

    } finally {

      setCheckingAvailability(false);

    }
  };


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        <Loader2
          size={32}
          className="animate-spin"
        />

      </div>

    );
  }


  if (error || !stay) {

    return (

      <div className="min-h-screen">

        <Navbar />

        <div className="flex min-h-[60vh] items-center justify-center px-5">

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Stay not found
            </h1>

            <p className="mt-2 text-neutral-500">
              The property you're looking for doesn't
              exist.
            </p>

            <Link
              to="/stays"
              className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Browse stays
            </Link>

          </div>

        </div>

        <Footer />

      </div>

    );
  }


  const primaryImage =
    stay.images.find(
      (image) => image.is_primary,
    )?.image_url ||
    stay.images[0]?.image_url;


  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in ${stay.name} in ${stay.city}. I'd like to know more about availability and pricing.`,
  );


  return (

    <div className="min-h-screen bg-white">

      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* Back */}

        <Link
          to="/stays"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to stays
        </Link>


        {/* Gallery — horizontal scroll (1 full image + a peek of the next) */}
        {stay.images.length > 0 && (
          <div className="overflow-x-auto rounded-3xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex w-max gap-3 p-1">
              {stay.images.map((image) => {
                // Find the room name for room-specific photos
                const roomForImage = image.room_id
                  ? stay.rooms.find((r) => r.id === image.room_id)
                  : null;

                return (
                  <div
                    key={image.id}
                    className="relative h-[420px] w-[80%] shrink-0 overflow-hidden rounded-3xl sm:w-[45%] lg:w-[32%]"
                  >
                    <img
                      src={image.image_url}
                      alt={roomForImage ? roomForImage.name : stay.name}
                      className="h-full w-full object-cover"
                    />

                    {roomForImage && (
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                        {roomForImage.name}
                      </span>
                    )}

                    {image.is_primary && !roomForImage && (
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                        {stay.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Main content */}

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* Left */}

          <div>


            <div className="flex flex-wrap items-center gap-3">


              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold">
                {stay.property_type}
              </span>

              <span className="flex items-center gap-1 text-sm font-medium">


                <Star
                  size={15}
                  className="fill-black"
                />


                {stay.rating}


              </span>

              <span className="text-sm text-neutral-500">
                {stay.review_count} reviews
              </span>

            </div>


            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {stay.name}
            </h1>


            <div className="mt-4 flex items-center gap-2 text-neutral-500">


              <MapPin size={18} />


              <span>
                {stay.address ||
                  `${stay.city}, ${stay.state}`}
              </span>

            </div>


            {/* Description */}

            <div className="mt-10 border-t border-neutral-200 pt-10">


              <h2 className="text-xl font-semibold">
                About this stay
              </h2>

              <p className="mt-4 leading-7 text-neutral-600">
                {stay.description}
              </p>

            </div>


            {/* Rooms */}

            <div className="mt-10 border-t border-neutral-200 pt-10">


              <h2 className="text-xl font-semibold">
                Available rooms
              </h2>


              <div className="mt-6 space-y-4">


                {stay.rooms.map((room) => (


                  <div
                    key={room.id}
                    className={`rounded-2xl border p-5 transition ${
                      selectedRoom === room.id
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200"
                    }`}
                  >


                    <div className="flex flex-col justify-between gap-5 sm:flex-row">


                      <div>


                        <h3 className="font-semibold">
                          {room.name}
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                          {room.description}
                        </p>


                        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">


                          <span className="flex items-center gap-1.5">
                            <Users size={15} />
                            Up to{" "}
                            {room.max_guests}
                            guests
                          </span>

                        </div>


                      </div>


                      <div className="shrink-0 sm:text-right">


                        <p className="text-xl font-bold">
                          ₹
                        {room.price_per_night.toLocaleString(
                          "en-IN",
                        )}
                        </p>

                        <p className="text-xs text-neutral-500">
                          per night
                        </p>


                        <button
                          onClick={() => {
                            setSelectedRoom(room.id);
                            setAvailability(null);
                          }}
                          className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                            selectedRoom === room.id
                              ? "bg-black text-white"
                              : "border border-neutral-300 bg-white text-black hover:bg-neutral-100"
                          }`}
                        >
                          {selectedRoom === room.id
                            ? "Selected"
                            : "Select room"}
                        </button>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>


          {/* Booking card */}

          <aside>


            <div className="sticky top-28 rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg">


              <h2 className="text-xl font-semibold">
                Plan your stay
              </h2>


              <form
                onSubmit={handleCheckAvailability}
                className="mt-6"
              >


                {/* Room */}

                <div>


                  <label className="text-xs font-semibold uppercase text-neutral-400">
                    Room
                  </label>

                  <select
                    value={selectedRoom ?? ""}
                    onChange={(event) => {
                      setSelectedRoom(
                        Number(event.target.value),
                      );

                      setAvailability(null);
                    }}
                    className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
                  >


                    {stay.rooms.map((room) => (


                      <option
                        key={room.id}
                        value={room.id}
                      >


                        {room.name} — ₹
                      {room.price_per_night.toLocaleString(
                        "en-IN",
                      )}
                      /night
                      </option>

                    ))}

                  </select>


                </div>


                {/* Dates */}

                <div className="mt-5 grid grid-cols-2 gap-2">


                  <div>


                    <label className="text-xs font-semibold uppercase text-neutral-400">
                      Check-in
                    </label>

                    <input
                      type="date"
                      value={checkIn}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) => {
                        setCheckIn(event.target.value);
                        setAvailability(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
                      required
                    />


                  </div>


                  <div>


                    <label className="text-xs font-semibold uppercase text-neutral-400">
                      Check-out
                    </label>

                    <input
                      type="date"
                      value={checkOut}
                      min={
                        checkIn ||
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) => {
                        setCheckOut(event.target.value);
                        setAvailability(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
                      required
                    />


                  </div>


                </div>


                {/* Guests */}

                <div className="mt-5">


                  <label className="text-xs font-semibold uppercase text-neutral-400">
                    Guests
                  </label>

                  <div className="relative">


                    <Users
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />


                    <input
                      type="number"
                      min={1}
                      max={
                        stay.rooms.find(
                          (room) =>
                            room.id === selectedRoom,
                        )?.max_guests || 20
                      }
                      value={guests}
                      onChange={(event) => {
                        setGuests(
                          Number(event.target.value),
                        );

                        setAvailability(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-black"
                    />


                  </div>


                </div>


                {/* Error */}


                {bookingError && (


                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {bookingError}


                  </div>


                )}


                {/* Availability result */}


                {availability && (


                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      availability.available
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >


                    <p className="text-sm font-semibold">


                      {availability.available
                        ? "Room available"
                        : "Room unavailable"}


                      </p>


                    {availability.available && (


                      <div className="mt-3 space-y-3 text-sm">


                        <div className="flex justify-between">


                          <span>
                            ₹
                          {availability.price_per_night.toLocaleString(
                            "en-IN",
                          )}{" "}
                          × {availability.nights} nights
                          </span>


                          <span className="font-semibold">
                            ₹
                          {availability.total_amount.toLocaleString(
                            "en-IN",
                          )}</span>


                        </div>


                        <div className="text-xs text-neutral-500">
                          {availability.available_rooms} room(s)
                          remaining
                        </div>


                        <div className="mt-3 space-y-3 text-sm">


                          {/* Online Booking Path */}


                          <div>


                            <h3 className="text-sm font-medium text-gray-700">
                              Book Online
                            </h3>

                            <p className="text-xs text-gray-500">
                              Secure online payment with Razorpay
                            </p>


                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedRoom || !availability) {
                                  return;
                                }

                                navigate(
                                  `/checkout?room_id=${selectedRoom}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`


                                );
                              }}
                              className="mt-2 rounded-xl bg-black py-2.5 text-sm font-semibold text-white w-full transition hover:bg-neutral-800"


                            >
                              Proceed to payment (₹{availability.total_amount.toLocaleString(
                                "en-IN",
                              )})
                            </button>
                          </div>


                          {/* WhatsApp Enquiry Path - PRIMARY */}


                          <div>


                            <h3 className="text-sm font-medium text-gray-700">
                              Enquire on WhatsApp
                            </h3>


                            <p className="text-xs text-gray-500">
                              Get expert advice on room suitability, safari packages,
                              and ask about availability confirmation
                            </p>


                            <a
                              href={`https://wa.me/918741961756?text=${encodeURIComponent(
                                `Hi, I'm interested in ${stay.name} in ${stay.city}. I'd like to check availability for ${checkIn} to ${checkOut} for ${guests} guests. Also interested in safari packages and tour options.`


                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex p-2 transition hover:scale-110"
                              aria-label="Chat on WhatsApp"


                            >
                              <img
                                src="/whatsapp-color-svgrepo-com.svg"
                                alt="Chat on WhatsApp"
                                className="h-14 w-14 drop-shadow-lg"
                              />
                            </a>


                          </div>




                      </div>


                      </div>


                    )}


                  </div>


                )}


                    {(!availability && !checkingAvailability) || (!availability && checkingAvailability) ? (
                      <div>
                        <button
                          type="submit"
                          disabled={checkingAvailability}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"


                        >
                          {checkingAvailability
                            ? "Checking..."
                            : "Check availability"}


                        </button>
                      </div>


                    ) : (


                      ""


                    )}


              </form>


            </div>


          </aside>


        </div>


      </main>


      <Footer />


    </div>


  );
}


export default StayDetails;