import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTravelPlan } from "../services/travelPlanService";

const INTERESTS = [
  "Beaches",
  "Mountains",
  "Adventure",
  "Food",
  "Culture",
  "History",
  "Nature",
  "Nightlife",
  "Shopping",
  "Photography",
];

const TRAVEL_STYLES = [
  "Budget",
  "Balanced",
  "Luxury",
  "Adventure",
  "Relaxed",
];

export default function TravelPlanner() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    travelers: 1,
    budget: 0,
    travel_style: "Balanced",
    interests: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((previous) => {
      const exists = previous.interests.includes(interest);
      return {
        ...previous,
        interests: exists
          ? previous.interests.filter((item) => item !== interest)
          : [...previous.interests, interest],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (!form.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError("Please select your travel dates.");
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError("End date must be after the start date.");
      return;
    }

    try {
      setLoading(true);
      const plan = await createTravelPlan({
        ...form,
        title: form.title.trim(),
        destination: form.destination.trim(),
      });
      navigate(`/account/travel-plans/${plan.id}`);
    } catch (err) {
      setError("Unable to create your travel plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            Travel Planner
          </p>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Plan your perfect trip
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Tell us about your trip and build a personalized itinerary.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Trip details
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Trip name
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="My Goa Trip"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Destination
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  placeholder="Goa"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start date
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End date
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  min={
                    form.start_date || new Date().toISOString().split("T")[0]
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.travelers}
                  onChange={(e) => updateField("travelers", Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) => updateField("budget", Number(e.target.value))}
                  placeholder="50000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Travel style
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {TRAVEL_STYLES.map((style) => {
                const selected = form.travel_style === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => updateField("travel_style", style)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                      selected ? "border-orange-600 bg-orange-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-orange-400"
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              What are you interested in?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select everything you'd like to include.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {INTERESTS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      selected ? "border-orange-600 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {selected ? "✓ " : ""}{interest}
                  </button>
                );
              })}
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating your trip..." : "Create Travel Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}