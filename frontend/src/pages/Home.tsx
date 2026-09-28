import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SafariOptionCard from "../components/safari/SafariOptionCard";

import { useAuth } from "../context/AuthContext";
import { getSafaris, type SafariConfig } from "../services/safariService";
import { getStays, type Stay } from "../services/stayService";
import { getPackages, type TourPackage } from "../services/packageService";
import { createCustomPlan } from "../services/customPlanService";
import {
  savePendingRequest,
  consumePendingRequest,
} from "../utils/pendingRequest";

const WHATSAPP_NUMBER = "918741961756";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

const EXPERIENCES = [
  {
    
    image: "/wildlife.jpg",
    title: "Ranthambore Wildlife Safari",
    text: "Explore the famous Ranthambore landscape and experience Rajasthan's wildlife in its natural surroundings.",
    note: "Safari arrangements are subject to official forest rules, permits and availability.",
    tags: "Wildlife • Nature • Photography",
  },
  {
    
    image: "/fort.jpg",
    title: "Ranthambore Fort",
    text: "Discover one of Rajasthan's great historic forts, with massive walls, gateways, temples and panoramic views.",
    note: "The fort dates to the Chauhan period and is officially listed among Rajasthan's major heritage attractions.",
    tags: "History • Architecture • Photography",
  },
  {
    
    image: "/temple.jpg",
    title: "Trinetra Ganesh Temple",
    text: "Visit the famous Trinetra Ganesh Temple inside Ranthambore Fort and learn about its religious and local traditions.",
    note: "",
    tags: "Culture • Spirituality • Local Stories",
  },
  {
    
    image: "/village.jpg",
    title: "Authentic Village Experience",
    text: "Step away from the normal tourist route. Walk through a local village, meet people with permission, see traditional homes and understand everyday rural Rajasthan.",
    note: "",
    tags: "Village Life • Culture • People",
  },
  {
    
    image: "/food.jpg",
    title: "Taste Rajasthan",
    text: "Enjoy an authentic Rajasthani food experience with local dishes and traditional flavours.",
    note: "Food experiences can be arranged according to dietary preferences and availability.",
    tags: "Food • Culture • Local Family Experience",
  },
  {
    
    image: "/photo.jpg",
    title: "Rajasthan Photography Experience",
    text: "Sunrise, sunset, village streets, forts, wildlife landscapes and local life — perfect for travellers who want photographs beyond the usual tourist locations.",
    note: "",
    tags: "Photography • Sunrise & Sunset",
  },
];

interface Experience {
  image: string;
  title: string;
  text: string;
  note: string;
  tags: string;
}

function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <div className="group relative h-[340px] overflow-hidden rounded-2xl bg-neutral-900">
      <img
        src={exp.image}
        alt={exp.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold">
          {exp.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/80">
          {exp.text}
        </p>

        {exp.note && (
          <p className="mt-2 text-xs italic text-white/60">
            {exp.note}
          </p>
        )}

        <p className="mt-3 text-xs font-medium text-orange-300">
          Experience: {exp.tags}
        </p>
      </div>
    </div>
  );
}

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [safaris, setSafaris] = useState<SafariConfig[]>([]);
  const [safarisLoading, setSafarisLoading] = useState(true);

  const [stays, setStays] = useState<Stay[]>([]);
  const [staysLoading, setStaysLoading] = useState(true);

  const [packages, setPackages] = useState<TourPackage[]>([]);

  // Custom plan form state
  const [travelDays, setTravelDays] = useState(3);
  const [safariType, setSafariType] = useState("Gypsy");
  const [safariDate, setSafariDate] = useState("");
  const [safariShift, setSafariShift] = useState("Any");
  const [hotelCategory, setHotelCategory] = useState("Standard");
  const [wantPickup, setWantPickup] = useState(true);
  const [wantVillage, setWantVillage] = useState(true);
  const [wantPhotography, setWantPhotography] = useState(false);
  const [wantFood, setWantFood] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");

      const target = document.getElementById(id);

      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    getSafaris()
      .then((data) => setSafaris(data))
      .catch(() => {
        // Safari options are optional content; ignore failures.
      })
      .finally(() => setSafarisLoading(false));
  }, []);

  useEffect(() => {
    getStays()
      .then((data) => setStays(data))
      .catch(() => {
        // Stays are optional content; ignore failures.
      })
      .finally(() => setStaysLoading(false));
  }, []);

  useEffect(() => {
    getPackages()
      .then((data) => setPackages(data))
      .catch(() => {
        // Package count is optional; ignore failures.
      });
  }, []);

  const handleCustomRequest = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!user) {
      // Remember what they typed so it is still here after login.
      savePendingRequest({
        type: "custom-plan",
        travelDays,
        safariType,
        safariDate,
        safariShift,
        hotelCategory,
        pickup: wantPickup,
        village: wantVillage,
        photography: wantPhotography,
        food: wantFood,
      });

      navigate("/login", { state: { from: "/" } });
      return;
    }

    try {
      setSendingRequest(true);
      setRequestError("");
      setRequestSent(false);

      await createCustomPlan({
        travel_days: travelDays,
        safari_type: safariType,
        safari_date: safariDate || undefined,
        safari_shift: safariShift,
        hotel_category: hotelCategory,
        pickup: wantPickup,
        village: wantVillage,
        photography: wantPhotography,
        food: wantFood,
      });

      const lines = [
        `Hello Ankit!${user.name ? ` This is ${user.name.split(" ")[0]}.` : ""} I'd like to request a custom package plan:`,
        `• Travel days: ${travelDays}`,
        `• Safari: ${safariType}${safariDate ? ` on ${safariDate}` : ""}${safariShift !== "Any" ? ` (${safariShift} shift)` : ""}`,
        `• Hotel category: ${hotelCategory}`,
        `• Railway pickup: ${wantPickup ? "Yes" : "No"}`,
        `• Village experience: ${wantVillage ? "Yes" : "No"}`,
        `• Photography: ${wantPhotography ? "Yes" : "No"}`,
        `• Food experience: ${wantFood ? "Yes" : "No"}`,
      ];

      window.open(whatsappLink(lines.join("\n")), "_blank");

      setRequestSent(true);
    } catch {
      setRequestError(
        "Unable to send your request right now. Please try again."
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const [openPackage, setOpenPackage] = useState<
    "3day" | "5day" | null
  >(null);

  // Mobile experiences carousel: advance one card every 4s,
  // looping back to the start. Paused while the user touches it.
  const experienceScrollRef = useRef<HTMLDivElement | null>(null);
  const experienceTimerRef = useRef<number | null>(null);

  const stepExperienceCarousel = () => {
    const el = experienceScrollRef.current;
    if (!el) return;

    const cardWidth = el.scrollWidth / EXPERIENCES.length;
    const next = el.scrollLeft + cardWidth;

    el.scrollTo({
      left: next >= el.scrollWidth - cardWidth / 2 ? 0 : next,
      behavior: "smooth",
    });
  };

  const startExperienceAutoScroll = () => {
    if (experienceTimerRef.current) return;
    experienceTimerRef.current = window.setInterval(
      stepExperienceCarousel,
      4000
    );
  };

  const stopExperienceAutoScroll = () => {
    if (experienceTimerRef.current) {
      window.clearInterval(experienceTimerRef.current);
      experienceTimerRef.current = null;
    }
  };

  useEffect(() => {
    startExperienceAutoScroll();
    return stopExperienceAutoScroll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const threeDayDetails = (
    <>
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
      3-Day Experience
      </p>

      <h3 className="mt-2 text-2xl font-bold text-gray-900">
      3-Day Ranthambore & Local Rajasthan
      </h3>

      <p className="mt-1 text-sm text-gray-500">3 Days / 2 Nights</p>

      <div className="mt-6 space-y-5">
      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 1 — Arrival & Local Sawai Madhopur
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Pick-up from Sawai Madhopur Railway Station</li>
      <li>• Hotel check-in</li>
      <li>• Local market experience</li>
      <li>• Introduction to Sawai Madhopur</li>
      <li>• Traditional Rajasthani dinner option</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 2 — Wildlife & Heritage
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Early morning Ranthambore safari</li>
      <li>• Breakfast, rest at hotel</li>
      <li>• Ranthambore Fort visit</li>
      <li>• Trinetra Ganesh Temple</li>
      <li>• Sunset photography • Dinner</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 3 — Village & Local Life
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Traditional breakfast</li>
      <li>• Local village walk & rural experience</li>
      <li>• Local food / tea experience</li>
      <li>• Handicrafts & culture</li>
      <li>• Departure assistance</li>
      </ul>
      </div>
      </div>

      <div className="mt-8 border-t pt-6">
      <p className="text-sm text-gray-500">Package from</p>
      <p className="text-3xl font-bold text-gray-900">
      ₹25,000{" "}
      <span className="text-base font-medium text-gray-500">
      per couple*
      </span>
      </p>

      <p className="mt-2 text-xs text-gray-400">
      Final price depends on hotel category, transport, safari
      permits/availability, season and activities. Safari
      permits and government/park charges are quoted
      separately where applicable.
      </p>

      <a
      href={whatsappLink(
      `Hello Ankit!${user ? ` This is ${user.name.split(" ")[0]}.` : ""} I'd like to book the 3-Day Ranthambore & Local Rajasthan experience (from ₹25,000 per couple). Please share availability and the next steps.`
      )}
      target="_blank"
      rel="noreferrer"
      className="mt-5 block rounded-xl bg-orange-600 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-orange-700"
      >
      Request 3-Day Experience
      </a>
      </div>

    </>
  );

  const fiveDayDetails = (
    <>
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
      5-Day Experience
      </p>

      <h3 className="mt-2 text-2xl font-bold text-gray-900">
      5-Day Ranthambore & Real Rajasthan
      </h3>

      <p className="mt-1 text-sm text-gray-500">5 Days / 4 Nights</p>

      <div className="mt-6 space-y-5">
      <div>
      <h4 className="text-sm font-semibold text-gray-900">Day 1 — Arrival</h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Sawai Madhopur arrival</li>
      <li>• Private transfer to hotel</li>
      <li>• Local orientation</li>
      <li>• Evening market visit</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 2 — Ranthambore Wildlife
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Early morning safari</li>
      <li>• Breakfast and rest</li>
      <li>• Nature / photography experience</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 3 — Fort & Temple
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Ranthambore Fort visit</li>
      <li>• Trinetra Ganesh Temple</li>
      <li>• Heritage storytelling</li>
      <li>• Sunset photography</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 4 — Village & Culture
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Village walk</li>
      <li>• Local lifestyle experience</li>
      <li>• Traditional food</li>
      <li>• Crafts & photography</li>
      <li>• Rural Rajasthan experience</li>
      </ul>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-gray-900">
      Day 5 — Slow Rajasthan
      </h4>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
      <li>• Relaxed breakfast</li>
      <li>• Optional local sightseeing</li>
      <li>• Shopping</li>
      <li>• Railway station transfer</li>
      </ul>
      </div>
      </div>

      <div className="mt-8 border-t pt-6">
      <p className="text-sm text-gray-500">Package from</p>
      <p className="text-3xl font-bold text-gray-900">
      ₹45,000{" "}
      <span className="text-base font-medium text-gray-500">
      per couple*
      </span>
      </p>

      <p className="mt-2 text-xs text-gray-400">
      Final quotation depends on accommodation, transport, safari
      permits/availability, season and selected activities.
      </p>

      <a
      href={whatsappLink(
      `Hello Ankit!${user ? ` This is ${user.name.split(" ")[0]}.` : ""} I'd like a quote for the 5-Day Ranthambore & Real Rajasthan experience (from ₹45,000 per couple). Please send me the details.`
      )}
      target="_blank"
      rel="noreferrer"
      className="mt-5 block rounded-xl bg-orange-600 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-orange-700"
      >
      Request 5-Day Quote
      </a>
      </div>
    </>
  );

  const [showCustomPlan, setShowCustomPlan] = useState(false);

  // Coming back from the login redirect? Restore the half-filled
  // form and reopen the mobile popup.
  useEffect(() => {
    const pending = consumePendingRequest();

    if (!pending || pending.type !== "custom-plan") return;

    setTravelDays(pending.travelDays);
    setSafariType(pending.safariType);
    setSafariDate(pending.safariDate);
    setSafariShift(pending.safariShift);
    setHotelCategory(pending.hotelCategory);
    setWantPickup(pending.pickup);
    setWantVillage(pending.village);
    setWantPhotography(pending.photography);
    setWantFood(pending.food);
    setShowCustomPlan(true);
  }, []);

  const customPlanHeading = (
    <>
      <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
      Custom Package
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Make Your Own Custom Package Plan
      </h2>

      <p className="mt-3 text-gray-600">
      Choose what you want — Ankit will confirm the plan with
      you on WhatsApp.
      </p>
      </div>
    </>
  );

  const customPlanFormDetails = (
    <>
      {requestSent && (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      Request sent! Ankit will confirm on WhatsApp — you can
      track this request in your My Bookings page.
      </div>
      )}

      {requestError && (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {requestError}
      </div>
      )}

      <form
      className="mt-8 space-y-5"
      onSubmit={handleCustomRequest}
      >
      {/* Travel days */}
      <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
      Travel days
      </label>

      <input
      required
      type="number"
      min={1}
      max={30}
      value={travelDays}
      onChange={(e) =>
      setTravelDays(Number(e.target.value))
      }
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      </div>

      {/* Safari preferences */}
      <div className="grid gap-4 sm:grid-cols-3">
      <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
      Safari type
      </label>

      <select
      value={safariType}
      onChange={(e) => setSafariType(e.target.value)}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      >
      <option>Gypsy</option>
      <option>Canter</option>
      <option>Not required</option>
      </select>
      </div>

      <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
      Safari date
      </label>

      <input
      type="date"
      value={safariDate}
      onChange={(e) => setSafariDate(e.target.value)}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      </div>

      <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
      Shift
      </label>

      <select
      value={safariShift}
      onChange={(e) => setSafariShift(e.target.value)}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      >
      <option>Any</option>
      <option>Morning</option>
      <option>Afternoon</option>
      </select>
      </div>
      </div>

      {/* Hotel category */}
      <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
      Hotel category
      </label>

      <select
      value={hotelCategory}
      onChange={(e) => setHotelCategory(e.target.value)}
      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      >
      <option>Budget</option>
      <option>Standard</option>
      <option>Premium</option>
      </select>
      </div>

      {/* Extras */}
      <div>
      <p className="mb-2 text-sm font-medium text-gray-700">
      What else would you like?
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
      {[
      {
      label: "Railway pickup",
      value: wantPickup,
      set: setWantPickup,
      },
      {
      label: "Village experience",
      value: wantVillage,
      set: setWantVillage,
      },
      {
      label: "Photography",
      value: wantPhotography,
      set: setWantPhotography,
      },
      {
      label: "Food experience",
      value: wantFood,
      set: setWantFood,
      },
      ].map((item) => (
      <button
      key={item.label}
      type="button"
      onClick={() => item.set(!item.value)}
      className={`flex items-center justify-between rounded-xl border px-5 py-3 text-sm font-medium transition ${
      item.value
      ? "border-orange-600 bg-orange-50 text-orange-700"
      : "border-gray-300 text-gray-500 hover:bg-neutral-50"
      }`}
      >
      {item.label}

      <span>{item.value ? "Yes" : "No"}</span>
      </button>
      ))}
      </div>
      </div>

      <button
      type="submit"
      disabled={sendingRequest}
      className="w-full rounded-xl bg-orange-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
      >
      {sendingRequest
      ? "Sending..."
      : "Request This From Admin"}
      </button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0">
          {/*
            ==============================================
            HERO BACKGROUND IMAGE — SET YOUR PHOTO HERE
            1. Put your image file in: frontend/public/
               (for example: frontend/public/hero.jpg)
            2. It appears here automatically. If your file has
               a different name/extension (e.g. my-photo.png),
               change the src below to: src="/my-photo.png"
            ==============================================
          */}
          <img
            src="/hero.jpg"
            alt="Ranthambore landscape"
            className="h-full w-full object-cover object-[58%_center] md:object-center"
          />
        </div>

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-5 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <MapPin size={15} />
              Sawai Madhopur • Ranthambore • Rajasthan
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover the Real
              <span className="block text-white/70">Rajasthan.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Wildlife, ancient forts, sacred temples and authentic village
              life — experience Sawai Madhopur with a local host.
            </p>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Welcome to Sawai Madhopur
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            More Than a Safari. Experience the Soul of Rajasthan.
          </h2>

          <p className="mt-6 text-[17px] leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Welcome to Sawai Madhopur, the gateway to Ranthambore. I'm
            Ankit, your local host from Sawai Madhopur. I help
            international travellers discover the places, stories and
            everyday life that you may miss on a normal tourist trip.
          </p>
        </div>
      </section>

      {/* Safari Options (from admin panel) */}
      <section id="safari" className="scroll-mt-24 bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Safaris
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Safari Options & Prices
              </h2>
            </div>

          </div>

          {safarisLoading ? (
            <p className="mt-10 text-center text-gray-500">
              Loading safari options...
            </p>
          ) : safaris.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">
              Safari options will be announced soon — message us on
              WhatsApp for today's quotation.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {safaris.slice(0, 2).map((safari) => (
                <SafariOptionCard
                  key={safari.id}
                  safari={safari}
                />
              ))}
            </div>
          )}

          {safaris.length > 2 && (
            <div className="mt-6 text-center">
              <Link
                to="/safari"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                View all safari options
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            Safari permits and government/park charges are subject to
            forest department rules and availability.
          </p>
        </div>
      </section>

      {/* Stays */}
      <section id="stays" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Stays
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Where to Stay
              </h2>

              <p className="mt-3 text-neutral-500">
                Comfortable hotels, resorts and homestays around
                Ranthambore
              </p>
            </div>

          </div>

          {staysLoading ? (
            <p className="mt-10 text-center text-gray-500">
              Loading stays...
            </p>
          ) : stays.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">
              Stays will be listed soon — message us on WhatsApp for
              recommendations.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {stays.slice(0, 2).map((stay) => (
                <Link
                  key={stay.id}
                  to={`/stays/${stay.slug}`}
                  className="group relative h-72 overflow-hidden rounded-2xl bg-neutral-900"
                >
                  {stay.primary_image && (
                    <img
                      src={stay.primary_image}
                      alt={stay.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                      {stay.property_type}
                    </span>

                    <h3 className="mt-2 text-xl font-bold">
                      {stay.name}
                    </h3>

                    <p className="mt-1 text-sm text-white/75">
                      {stay.city}
                      {stay.state ? `, ${stay.state}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {stays.length > 2 && (
            <div className="mt-6 text-center">
              <Link
                to="/stays"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                View all stays
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="scroll-mt-24 bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Featured Packages
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ranthambore & Local Rajasthan
              </h2>
            </div>

            {packages.length > 2 && (
              <Link
                to="/tour-packages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <div className="mt-12 hidden gap-8 lg:grid lg:grid-cols-2">
            {/* 3-Day Package */}
            <div className="flex flex-col rounded-2xl border-2 border-orange-600 bg-white p-8 shadow-sm">
              {threeDayDetails}
            </div>

            {/* 5-Day Package */}
            <div className="flex flex-col rounded-2xl bg-white p-8 shadow-sm">
              {fiveDayDetails}
            </div>
          </div>

          {/* Mobile: compact cards — tap to see full details in a popup */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:hidden">
            <button
              onClick={() => setOpenPackage("3day")}
              className="rounded-2xl border-2 border-orange-600 bg-white p-4 text-left shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                3-Day Experience
              </p>

              <p className="mt-2 text-sm text-gray-500">
                3 Days / 2 Nights
              </p>

              <p className="mt-3 text-xl font-bold text-gray-900">
                ₹25,000
              </p>

              <p className="text-xs text-gray-500">
                per couple*
              </p>

              <p className="mt-3 text-xs font-semibold text-orange-600">
                Tap to view details
              </p>
            </button>

            <button
              onClick={() => setOpenPackage("5day")}
              className="rounded-2xl bg-white p-4 text-left shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                5-Day Experience
              </p>

              <p className="mt-2 text-sm text-gray-500">
                5 Days / 4 Nights
              </p>

              <p className="mt-3 text-xl font-bold text-gray-900">
                ₹45,000
              </p>

              <p className="text-xs text-gray-500">
                per couple*
              </p>

              <p className="mt-3 text-xs font-semibold text-orange-600">
                Tap to view details
              </p>
            </button>
          </div>

          {/* Package detail popup (mobile) */}
          {openPackage && (
            <div
              className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center"
              onClick={() => setOpenPackage(null)}
            >
              <div
                className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:m-4 sm:max-w-xl sm:rounded-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {openPackage === "3day"
                      ? "3-Day Ranthambore & Local Rajasthan"
                      : "5-Day Ranthambore & Real Rajasthan"}
                  </h3>

                  <button
                    onClick={() => setOpenPackage(null)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    aria-label="Close package details"
                  >
                    ✕
                  </button>
                </div>

                {openPackage === "3day"
                  ? threeDayDetails
                  : fiveDayDetails}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Experiences */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Our Experiences
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Explore Ranthambore With a Local
              </h2>
            </div>
          </div>

          {/*
            EXPERIENCE CARD IMAGES — SET YOUR PHOTOS HERE
            Put these files in frontend/public/ and they appear
            on the cards automatically:
            wildlife.jpg, fort.jpg, temple.jpg,
            village.jpg, food.jpg, photo.jpg
          */}
          {/* Desktop: full grid */}
          <div className="mt-12 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map((exp) => (
              <ExperienceCard key={exp.title} exp={exp} />
            ))}
          </div>

          {/* Mobile: one card at a time, auto-scrolling horizontally */}
          <div className="mt-8 md:hidden">
            <div
              ref={experienceScrollRef}
              onTouchStart={stopExperienceAutoScroll}
              onTouchEnd={startExperienceAutoScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {EXPERIENCES.map((exp, index) => (
                <div
                  key={exp.title}
                  className="w-full shrink-0 snap-center"
                >
                  <ExperienceCard exp={exp} />

                  <p className="mt-3 text-center text-xs text-gray-400">
                    {index + 1} of {EXPERIENCES.length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Make Your Own Custom Package Plan */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">

          {/* Desktop: full form inline */}
          <div className="hidden rounded-2xl bg-white p-8 shadow-sm sm:p-10 md:block">
            {customPlanHeading}

            {customPlanFormDetails}
          </div>

          {/* Mobile: button that opens the form in a popup */}
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm md:hidden">
            {customPlanHeading}

            <button
              onClick={() => setShowCustomPlan(true)}
              className="mt-8 w-full rounded-xl bg-orange-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-orange-700"
            >
              Make Your Own Custom Package Plan
            </button>

            <p className="mt-3 text-xs text-gray-400">
              Takes less than a minute — Ankit confirms the plan
              with you on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Custom plan popup (mobile) */}
      {showCustomPlan && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setShowCustomPlan(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:m-4 sm:max-w-xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Make Your Own Custom Package Plan
              </h3>

              <button
                onClick={() => setShowCustomPlan(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close custom plan form"
              >
                ✕
              </button>
            </div>

            {customPlanFormDetails}
          </div>
        </div>
      )}


      {/* Closing */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
          <p className="text-[17px] leading-7 text-gray-600 sm:text-lg sm:leading-8">
            From a Ranthambore safari and the historic Ranthambore Fort
            to Trinetra Ganesh Temple, local villages, traditional food
            and Rajasthan's rural culture — every experience here is
            personal, real and memorable.
          </p>

          <p className="mt-6 text-2xl font-bold text-gray-900">
            Come as a traveller. Leave with memories of Rajasthan.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
