import { useEffect, useState } from "react";
import {
  CreateSafariRequest,
  SafariConfig,
  createSafari,
  deleteSafari,
  getAdminSafaris,
  updateSafari,
} from "../../services/safariService";

const VEHICLES = ["Gypsy", "Canter"];
const SHIFTS = ["Morning", "Afternoon"];

const emptyForm: CreateSafariRequest = {
  vehicle_type: "Gypsy",
  shift: "Morning",
  price_per_person: 0,
  seats_per_vehicle: 6,
  timing: "",
  note: "",
};

export default function AdminSafaris() {
  const [safaris, setSafaris] = useState<SafariConfig[]>([]);
  const [form, setForm] = useState<CreateSafariRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadSafaris() {
    try {
      setLoading(true);
      const data = await getAdminSafaris();
      setSafaris(data);
    } catch {
      setError("Failed to load safari options.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSafaris();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload: CreateSafariRequest = {
        ...form,
        price_per_person: Number(form.price_per_person),
        seats_per_vehicle: Number(form.seats_per_vehicle),
      };

      if (editingId) {
        const updated = await updateSafari(editingId, payload);
        setSafaris((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
      } else {
        const created = await createSafari(payload);
        setSafaris((current) => [...current, created]);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch {
      setError("Failed to save safari option.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (safari: SafariConfig) => {
    setEditingId(safari.id);
    setShowForm(true);
    setForm({
      vehicle_type: safari.vehicle_type,
      shift: safari.shift,
      price_per_person: Number(safari.price_per_person),
      seats_per_vehicle: safari.seats_per_vehicle,
      timing: safari.timing || "",
      note: safari.note || "",
    });
  };

  const handleDelete = async (safari: SafariConfig) => {
    const confirmed = window.confirm(
      `Delete the ${safari.vehicle_type} ${safari.shift} safari option?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSafari(safari.id);
      setSafaris((current) =>
        current.filter((item) => item.id !== safari.id)
      );
    } catch {
      setError("Failed to delete safari option.");
    }
  };

  const toggleActive = async (safari: SafariConfig) => {
    try {
      const updated = await updateSafari(safari.id, {
        is_active: !safari.is_active,
      });

      setSafaris((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch {
      setError("Failed to update safari option.");
    }
  };

  if (loading) {
    return <p>Loading safari options...</p>;
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Safaris
          </h1>

          <p className="text-gray-500 mt-1">
            Gypsy and Canter safari options with their prices — changes
            appear on the website immediately.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800 w-full sm:w-auto"
        >
          + Add Safari Option
        </button>

      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create / edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl p-6 mb-8"
        >

          <div className="flex justify-between mb-6">

            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Safari Option" : "Add Safari Option"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="text-gray-500"
            >
              ✕
            </button>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <select
              value={form.vehicle_type}
              onChange={(e) =>
                setForm({ ...form, vehicle_type: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            >
              {VEHICLES.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>

            <select
              value={form.shift}
              onChange={(e) =>
                setForm({ ...form, shift: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            >
              {SHIFTS.map((shift) => (
                <option key={shift} value={shift}>
                  {shift} Shift
                </option>
              ))}
            </select>

            <input
              required
              type="number"
              min="1"
              step="0.01"
              placeholder="Price per person (₹)"
              value={form.price_per_person || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  price_per_person: Number(e.target.value),
                })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              required
              type="number"
              min="1"
              placeholder="Seats per vehicle"
              value={form.seats_per_vehicle || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  seats_per_vehicle: Number(e.target.value),
                })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              placeholder="Timing (e.g. Around 6:00 AM)"
              value={form.timing}
              onChange={(e) =>
                setForm({ ...form, timing: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            />

          </div>

          <textarea
            placeholder="Note (e.g. permit/park charges information)"
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
            className="border rounded-lg px-4 py-3 w-full mt-4 min-h-20"
          />

          <div className="flex gap-3 mt-5">

            <button
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Safari Option"
                  : "Create Safari Option"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {safaris.length === 0 ? (
          <p className="text-gray-500">
            No safari options yet. Add your first one.
          </p>
        ) : (
          safaris.map((safari) => (
            <div
              key={safari.id}
              className="rounded-xl border bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  {safari.vehicle_type === "Gypsy" ? "🚙" : "🚌"}{" "}
                  {safari.vehicle_type} — {safari.shift} Shift
                </p>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                    safari.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {safari.is_active ? "active" : "hidden"}
                </span>
              </div>

              {safari.note && (
                <p className="mt-1 text-xs text-gray-400">
                  {safari.note}
                </p>
              )}

              <p className="mt-1 text-sm text-gray-600">
                ₹{Number(safari.price_per_person).toLocaleString("en-IN")}{" "}
                / person
                <span className="mx-1.5 text-gray-300">·</span>
                {safari.seats_per_vehicle} seats
                {safari.timing && (
                  <>
                    <span className="mx-1.5 text-gray-300">·</span>
                    {safari.timing}
                  </>
                )}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startEdit(safari)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleActive(safari)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  {safari.is_active ? "Hide" : "Show"}
                </button>

                <button
                  onClick={() => handleDelete(safari)}
                  className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">

            <tr>
              <th className="text-left px-6 py-4">
                Safari
              </th>

              <th className="text-left px-6 py-4">
                Price / person
              </th>

              <th className="text-left px-6 py-4">
                Seats
              </th>

              <th className="text-left px-6 py-4">
                Timing
              </th>

              <th className="text-left px-6 py-4">
                Status
              </th>

              <th className="text-right px-6 py-4">
                Actions
              </th>
            </tr>

          </thead>

          <tbody>

            {safaris.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No safari options yet. Add your first one.
                </td>
              </tr>
            ) : (
              safaris.map((safari) => (
                <tr
                  key={safari.id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-6 py-4">

                    <p className="font-medium">
                      {safari.vehicle_type === "Gypsy" ? "🚙" : "🚌"}{" "}
                      {safari.vehicle_type} — {safari.shift} Shift
                    </p>

                    {safari.note && (
                      <p className="text-xs text-gray-400 mt-1">
                        {safari.note}
                      </p>
                    )}

                  </td>

                  <td className="px-6 py-4 font-medium">
                    ₹
                    {Number(safari.price_per_person).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {safari.seats_per_vehicle}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {safari.timing || "—"}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        safari.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {safari.is_active ? "active" : "hidden"}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => startEdit(safari)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(safari)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        {safari.is_active ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => handleDelete(safari)}
                        className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

        </div>

      </div>

    </div>
  );
}
