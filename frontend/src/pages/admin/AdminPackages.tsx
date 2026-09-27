import { useEffect, useState } from "react";
import {
  CreatePackageRequest,
  TourPackage,
  createPackage,
  deletePackage,
  getAdminPackages,
  updatePackage,
} from "../../services/packageService";

const emptyForm: CreatePackageRequest = {
  title: "",
  duration: "",
  description: "",
  price: 0,
  price_type: "perPerson",
  includes: [],
  icon: "🐅",
  color: "orange",
};

const COLORS = [
  "orange",
  "red",
  "amber",
  "emerald",
  "blue",
  "purple",
];

export default function AdminPackages() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [form, setForm] = useState<CreatePackageRequest>(emptyForm);
  const [includesText, setIncludesText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPackages() {
    try {
      setLoading(true);
      const data = await getAdminPackages();
      setPackages(data);
    } catch {
      setError("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload: CreatePackageRequest = {
        ...form,
        price: Number(form.price),
        includes: includesText
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      };

      if (editingId) {
        const updated = await updatePackage(editingId, payload);
        setPackages((current) =>
          current.map((pkg) =>
            pkg.id === updated.id ? updated : pkg
          )
        );
      } else {
        const created = await createPackage(payload);
        setPackages((current) => [...current, created]);
      }

      setForm(emptyForm);
      setIncludesText("");
      setEditingId(null);
      setShowForm(false);
    } catch {
      setError("Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (pkg: TourPackage) => {
    setEditingId(pkg.id);
    setShowForm(true);
    setForm({
      title: pkg.title,
      duration: pkg.duration,
      description: pkg.description || "",
      price: Number(pkg.price),
      price_type: pkg.price_type,
      includes: pkg.includes,
      icon: pkg.icon,
      color: pkg.color,
    });
    setIncludesText(pkg.includes.join(", "));
  };

  const handleDelete = async (pkg: TourPackage) => {
    const confirmed = window.confirm(
      `Delete "${pkg.title}"? This removes it from the website.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePackage(pkg.id);
      setPackages((current) =>
        current.filter((item) => item.id !== pkg.id)
      );
    } catch {
      setError("Failed to delete package.");
    }
  };

  const toggleActive = async (pkg: TourPackage) => {
    try {
      const updated = await updatePackage(pkg.id, {
        is_active: !pkg.is_active,
      });

      setPackages((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch {
      setError("Failed to update package.");
    }
  };

  if (loading) {
    return <p>Loading packages...</p>;
  }

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between gap-6 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Tour Packages
          </h1>

          <p className="text-gray-500 mt-1">
            Manage the tour packages shown on the website.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
            setIncludesText("");
          }}
          className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800"
        >
          + Add Package
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
              {editingId ? "Edit Package" : "Add Package"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
                setIncludesText("");
              }}
              className="text-gray-500"
            >
              ✕
            </button>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              required
              placeholder="Package title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              required
              placeholder="Duration (e.g. 2N / 3D)"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              required
              type="number"
              min="1"
              step="0.01"
              placeholder="Price (₹)"
              value={form.price || ""}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="border rounded-lg px-4 py-3"
            />

            <select
              value={form.price_type}
              onChange={(e) =>
                setForm({ ...form, price_type: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            >
              <option value="perPerson">Per person</option>
              <option value="total">Total</option>
            </select>

            <input
              placeholder="Emoji icon (e.g. 🐅)"
              value={form.icon}
              onChange={(e) =>
                setForm({ ...form, icon: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            />

            <select
              value={form.color}
              onChange={(e) =>
                setForm({ ...form, color: e.target.value })
              }
              className="border rounded-lg px-4 py-3"
            >
              {COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

          </div>

          <input
            placeholder="Includes, comma-separated (e.g. 1 Jeep Safari, Breakfast daily)"
            value={includesText}
            onChange={(e) => setIncludesText(e.target.value)}
            className="border rounded-lg px-4 py-3 w-full mt-4"
          />

          <textarea
            placeholder="Package description (shown on the website)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border rounded-lg px-4 py-3 w-full mt-4 min-h-28"
          />

          <div className="flex gap-3 mt-5">

            <button
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Package"
                  : "Create Package"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
                setIncludesText("");
              }}
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* Package list */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">

            <tr>
              <th className="text-left px-6 py-4">
                Package
              </th>

              <th className="text-left px-6 py-4">
                Duration
              </th>

              <th className="text-left px-6 py-4">
                Price
              </th>

              <th className="text-left px-6 py-4">
                Includes
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

            {packages.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No packages yet. Add your first safari package.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-6 py-4">

                    <p className="font-medium">
                      {pkg.icon} {pkg.title}
                    </p>

                  </td>

                  <td className="px-6 py-4">
                    {pkg.duration}
                  </td>

                  <td className="px-6 py-4">
                    ₹{Number(pkg.price).toLocaleString("en-IN")}
                    {pkg.price_type === "perPerson"
                      ? " / person"
                      : ""}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {pkg.includes.length} item(s)
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        pkg.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pkg.is_active ? "active" : "hidden"}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => startEdit(pkg)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(pkg)}
                        className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        {pkg.is_active ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => handleDelete(pkg)}
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
