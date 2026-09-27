import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTravelPlan,
  updateTravelPlan,
  TravelPlan,
  ItineraryDay,
  ItineraryActivity,
} from "../services/travelPlanService";

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function createItinerary(
  startDate: string,
  endDate: string
): ItineraryDay[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const days: ItineraryDay[] = [];

  let current = new Date(start);
  let dayNumber = 1;

  while (current < end) {
    const date = current.toISOString().split("T")[0];

    days.push({
      day: dayNumber,
      date,
      title: `Day ${dayNumber}`,
      activities: [],
    });

    current.setDate(current.getDate() + 1);
    dayNumber++;
  }

  return days;
}

const emptyActivity: ItineraryActivity = {
  time: "09:00",
  title: "",
  description: "",
  location: "",
  estimated_cost: 0,
};

export default function TravelPlanDetails() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const [selectedDay, setSelectedDay] = useState(0);

  const [activity, setActivity] =
    useState<ItineraryActivity>(emptyActivity);

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) return;

    async function loadPlan() {
      try {
        setLoading(true);

        const data = await getTravelPlan(Number(planId));

        setPlan(data);

        if (data.itinerary?.length) {
          setItinerary(data.itinerary);
        } else {
          setItinerary(
            createItinerary(
              data.start_date,
              data.end_date
            )
          );
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            "Unable to load travel plan."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [planId]);

  const currentDay = itinerary[selectedDay];

  const totalActivities = useMemo(
    () =>
      itinerary.reduce(
        (total, day) => total + day.activities.length,
        0
      ),
    [itinerary]
  );

  const updateActivityField = (
    field: keyof ItineraryActivity,
    value: string | number
  ) => {
    setActivity((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveActivity = (event: FormEvent) => {
    event.preventDefault();

    if (!activity.title.trim()) {
      setError("Activity title is required.");
      return;
    }

    setError("");

    setItinerary((previous) =>
      previous.map((day, dayIndex) => {
        if (dayIndex !== selectedDay) {
          return day;
        }

        const activities = [...day.activities];

        if (editingIndex === null) {
          activities.push({
            ...activity,
            title: activity.title.trim(),
            description: activity.description.trim(),
            location: activity.location?.trim() || "",
          });
        } else {
          activities[editingIndex] = {
            ...activity,
            title: activity.title.trim(),
            description: activity.description.trim(),
            location: activity.location?.trim() || "",
          };
        }

        activities.sort((a, b) =>
          a.time.localeCompare(b.time)
        );

        return {
          ...day,
          activities,
        };
      })
    );

    setActivity(emptyActivity);
    setEditingIndex(null);
  };

  const editActivity = (index: number) => {
    const selected = currentDay.activities[index];

    setActivity({
      ...selected,
    });

    setEditingIndex(index);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const deleteActivity = (index: number) => {
    setItinerary((previous) =>
      previous.map((day, dayIndex) => {
        if (dayIndex !== selectedDay) {
          return day;
        }

        return {
          ...day,
          activities: day.activities.filter(
            (_, activityIndex) => activityIndex !== index
          ),
        };
      })
    );
  };

  const savePlan = async () => {
    if (!plan) return;

    try {
      setSaving(true);
      setError("");

      const updated = await updateTravelPlan(
        plan.id,
        {
          itinerary,
          status: "planned",
        }
      );

      setPlan(updated);
      setItinerary(updated.itinerary || itinerary);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save itinerary."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">
          Loading your travel plan...
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Travel plan not found
        </h1>

        <button
          onClick={() =>
            navigate("/account/travel-planner")
          }
          className="mt-5 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"
        >
          Create a new trip
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <button
                onClick={() =>
                  navigate("/account/travel-planner")
                }
                className="mb-3 text-sm font-medium text-orange-600"
              >
                ← Create another trip
              </button>

              <h1 className="text-3xl font-bold text-gray-900">
                {plan.title}
              </h1>

              <p className="mt-2 text-gray-600">
                📍 {plan.destination}
                {" · "}
                {formatDate(plan.start_date)}
                {" – "}
                {formatDate(plan.end_date)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  👥 {plan.travelers} traveler
                  {plan.travelers !== 1 ? "s" : ""}
                </span>

                {plan.budget > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    💰 ₹{plan.budget.toLocaleString("en-IN")}
                  </span>
                )}

                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">
                  {plan.travel_style}
                </span>
              </div>
            </div>

            <button
              onClick={savePlan}
              disabled={saving}
              className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Itinerary"}
            </button>
          </div>
        </div>

        {/* Interests */}
        {plan.interests.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {plan.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* Days */}
          <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">
                Your itinerary
              </h2>

              <p className="text-sm text-gray-500">
                {totalActivities} activit
                {totalActivities === 1 ? "y" : "ies"}
              </p>
            </div>

            <div className="space-y-2">
              {itinerary.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDay(index);
                    setEditingIndex(null);
                    setActivity(emptyActivity);
                  }}
                  className={`w-full rounded-xl p-4 text-left transition ${
                    selectedDay === index
                      ? "bg-orange-600 text-white"
                      : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold">
                    Day {day.day}
                  </div>

                  <div
                    className={`mt-1 text-sm ${
                      selectedDay === index
                        ? "text-orange-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatDate(day.date)}
                  </div>

                  <div
                    className={`mt-2 text-xs ${
                      selectedDay === index
                        ? "text-orange-100"
                        : "text-gray-400"
                    }`}
                  >
                    {day.activities.length} activit
                    {day.activities.length === 1
                      ? "y"
                      : "ies"}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main>
            {currentDay && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <div className="border-b border-gray-100 pb-5">
                  <p className="text-sm font-medium text-orange-600">
                    {formatDate(currentDay.date)}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {currentDay.title}
                  </h2>
                </div>

                {/* Activities */}
                <div className="mt-6 space-y-4">
                  {currentDay.activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                      <div className="text-3xl">🗺️</div>

                      <h3 className="mt-3 font-semibold text-gray-900">
                        Nothing planned yet
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Add your first activity below.
                      </p>
                    </div>
                  ) : (
                    currentDay.activities.map(
                      (item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className="rounded-xl border border-gray-200 p-5"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm font-semibold text-orange-700">
                              {item.time}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {item.title}
                                  </h3>

                                  {item.location && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      📍 {item.location}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-3 text-sm">
                                  <button
                                    onClick={() =>
                                      editActivity(index)
                                    }
                                    className="font-medium text-orange-600"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() =>
                                      deleteActivity(index)
                                    }
                                    className="font-medium text-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {item.description && (
                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                  {item.description}
                                </p>
                              )}

                              {item.estimated_cost &&
                                item.estimated_cost > 0 && (
                                  <p className="mt-2 text-sm font-medium text-gray-700">
                                    Estimated cost: ₹
                                    {item.estimated_cost.toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* Activity form */}
                <form
                  onSubmit={saveActivity}
                  className="mt-8 rounded-xl bg-gray-50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {editingIndex === null
                        ? "Add activity"
                        : "Edit activity"}
                    </h3>

                    {editingIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(null);
                          setActivity(emptyActivity);
                        }}
                        className="text-sm text-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Time
                      </label>

                      <input
                        type="time"
                        value={activity.time}
                        onChange={(e) =>
                          updateActivityField(
                            "time",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Activity
                      </label>

                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) =>
                          updateActivityField(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Visit Baga Beach"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Location
                      </label>

                      <input
                        type="text"
                        value={activity.location || ""}
                        onChange={(e) =>
                          updateActivityField(
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="North Goa"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Estimated cost
                      </label>

                      <input
                        type="number"
                        min={0}
                        value={
                          activity.estimated_cost || 0
                        }
                        onChange={(e) =>
                          updateActivityField(
                            "estimated_cost",
                            Number(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <textarea
                      rows={3}
                      value={activity.description}
                      onChange={(e) =>
                        updateActivityField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Things to do, places to visit, notes..."
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    {editingIndex === null
                      ? "Add Activity"
                      : "Update Activity"}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}