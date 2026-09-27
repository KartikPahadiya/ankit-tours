import { useEffect, useState } from "react";
import {
  AdminCustomPlan,
  getAdminCustomPlans,
  updateCustomPlanStatus,
} from "../../services/customPlanService";

function AdminCustomPlans() {
  const [plans, setPlans] = useState<AdminCustomPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function loadPlans() {
    try {
      setLoading(true);
      const data = await getAdminCustomPlans();
      setPlans(data);
    } catch {
      setError("Failed to load custom plan requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const handleStatus = async (
    plan: AdminCustomPlan,
    status: "accepted" | "rejected"
  ) => {
    try {
      setBusyId(plan.id);
      setError("");

      const updated = await updateCustomPlanStatus(
        plan.id,
        status
      );

      setPlans((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch {
      setError("Failed to update the request.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p>Loading custom plan requests...</p>;
  }

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Custom Plan Requests
        </h1>

        <p className="mt-1 text-gray-500">
          Requests travellers sent from the website form (they also
          arrive on WhatsApp). Accept or reject — the traveller sees
          the status in their My Bookings page.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-gray-500">
          No custom plan requests yet.
        </div>
      ) : (
        <div className="space-y-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                  <p className="font-semibold text-gray-900">
                    {plan.user_name || `User #${plan.user_id}`}
                  </p>

                  <p className="text-sm text-gray-500">
                    {plan.user_email}
                    {plan.user_phone ? ` · ${plan.user_phone}` : ""}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    plan.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : plan.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {plan.status}
                </span>

              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p>• Travel days: {plan.travel_days}</p>
                <p>
                  • Safari: {plan.safari_type}
                  {plan.safari_date ? ` on ${plan.safari_date}` : ""}
                  {plan.safari_shift !== "Any"
                    ? ` (${plan.safari_shift} shift)`
                    : ""}
                </p>
                <p>• Hotel: {plan.hotel_category}</p>
                <p>
                  • Pickup: {plan.pickup ? "Yes" : "No"} · Village:{" "}
                  {plan.village ? "Yes" : "No"}
                </p>
                <p>
                  • Photography: {plan.photography ? "Yes" : "No"} ·
                  Food: {plan.food ? "Yes" : "No"}
                </p>
                <p className="text-xs text-gray-400">
                  Requested{" "}
                  {new Date(plan.created_at).toLocaleDateString()}
                </p>
              </div>

              {plan.status === "requested" && (
                <div className="mt-5 flex gap-3">

                  <button
                    disabled={busyId === plan.id}
                    onClick={() => handleStatus(plan, "accepted")}
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>

                  <button
                    disabled={busyId === plan.id}
                    onClick={() => handleStatus(plan, "rejected")}
                    className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AdminCustomPlans;
