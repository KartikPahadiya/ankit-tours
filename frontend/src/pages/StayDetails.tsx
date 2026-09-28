import {
  ArrowLeft,
  MapPin,
  Users,
  BedDouble,
  Loader2,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useRef,
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

import { useAuth } from "../context/AuthContext";
import {
  createRequest,
} from "../services/requestService";
import {
  savePendingRequest,
  consumePendingRequest,
} from "../utils/pendingRequest";


const WHATSAPP_NUMBER = "918741961756";


function StayDetails() {

  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();

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

  const [requestSent, setRequestSent] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [bookingError, setBookingError] =
    useState("");

  const galleryRef = useRef<HTMLDivElement>(null);


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

    // Coming back from the login redirect? Restore the
    // room and dates they had picked.
    const pending = consumePendingRequest();

    if (
      pending &&
      pending.type === "stay"
    ) {
      if (
        pending.roomId !== null
      ) {
        setSelectedRoom(
          pending.roomId,
        );
      }

      setCheckIn(pending.checkIn);
      setCheckOut(pending.checkOut);

      if (pending.rooms >= 1) {
        setGuests(pending.rooms);
      }
    }
  }, [slug]);

  useEffect(() => {
    if (!stay || stay.images.length < 2 || !galleryRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const gallery = galleryRef.current;
      if (gallery) {
        gallery.scrollLeft = gallery.scrollWidth / 3;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [stay]);


  const handleAskAvailability = async (
    event: FormEvent,
  ) => {

    event.preventDefault();

    setBookingError("");

    if (!user) {
      // Keep the chosen room and dates for after login.
      savePendingRequest({
        type: "stay",
        roomId: selectedRoom,
        checkIn,
        checkOut,
        rooms: guests,
      });

      navigate("/login", {
        state: { from: `/stays/${slug}` },
      });
      return;
    }

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

      setSending(true);

      await createRequest({
        type: "stay",
        item_id: selectedRoom,
        check_in: checkIn,
        check_out: checkOut,
        rooms: guests,
      });

      setRequestSent(true);

      const room = stay?.rooms.find(
        (r) => r.id === selectedRoom,
      );

      const message =
        `Hi Ankit! I'd like to stay at ` +
        `${stay?.name} (${room?.name}) from ` +
        `${checkIn} to ${checkOut} — ${guests} room(s). ` +
        `I've sent a request on the website. ` +
        `Please confirm availability.`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          message,
        )}`,
        "_blank",
      );

    } catch (error: any) {

      if (error?.response?.status === 401) {
        savePendingRequest({
          type: "stay",
          roomId: selectedRoom,
          checkIn,
          checkOut,
          rooms: guests,
        });

        navigate("/login", {
          state: { from: `/stays/${slug}` },
        });
        return;
      }

      setBookingError(
        error?.response?.data?.detail ||
        "Unable to send your request. Please try again.",
      );

    } finally {

      setSending(false);

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


  const galleryImages =
    stay.images.length > 1
      ? [...stay.images, ...stay.images, ...stay.images]
      : stay.images;


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


        {/* Repeated images make the gallery continuously scrollable in either direction. */}
        {stay.images.length > 0 && (
          <div
            ref={galleryRef}
            onScroll={(event) => {
              if (stay.images.length < 2) return;

              const gallery = event.currentTarget;
              const segmentWidth = gallery.scrollWidth / 3;

              if (gallery.scrollLeft <= 1) {
                gallery.scrollLeft += segmentWidth;
              } else if (gallery.scrollLeft >= segmentWidth * 2 - 1) {
                gallery.scrollLeft -= segmentWidth;
              }
            }}
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex w-max">
              {galleryImages.map((image, index) => {
                // Find the room name for room-specific photos
                const roomForImage = image.room_id
                  ? stay.rooms.find((r) => r.id === image.room_id)
                  : null;

                return (
                  <div
                    key={`${image.id}-${index}`}
                    className="relative h-[260px] shrink-0 overflow-hidden sm:h-[420px]"
                  >
                    <img
                      src={image.image_url}
                      alt={roomForImage ? roomForImage.name : stay.name}
                      className="h-full w-auto max-w-none object-contain"
                    />

                    {roomForImage && (
                      <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                        {roomForImage.name}
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
                            setRequestSent(false);
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
                onSubmit={handleAskAvailability}
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

                      setRequestSent(false);
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
                        setRequestSent(false);
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
                        setRequestSent(false);
                      }}
                      className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
                      required
                    />


                  </div>


                </div>


                {/* Rooms */}

                <div className="mt-5">


                  <label className="text-xs font-semibold uppercase text-neutral-400">
                    Rooms
                  </label>

                  <div className="relative">


                    <BedDouble
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

                        setRequestSent(false);
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


                {/* Request sent confirmation */}


                {requestSent && (


                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">


                    <p className="text-sm font-semibold text-green-800">
                      Request sent to Ankit!
                    </p>


                    <p className="mt-2 text-xs text-green-700">
                      Ankit will confirm availability with you on
                      WhatsApp. Once he accepts, you can pay from
                      My Requests on the website.
                    </p>


                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi Ankit, I just sent a stay request on the website for ${stay.name} (${checkIn} to ${checkOut}). Looking forward to your confirmation!`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Open WhatsApp chat
                    </a>


                  </div>


                )}


                    <div>
                      <button
                        type="submit"
                        disabled={sending}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"


                      >
                        {sending
                          ? "Sending..."
                          : "Ask availability on WhatsApp"}


                      </button>
                    </div>


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
