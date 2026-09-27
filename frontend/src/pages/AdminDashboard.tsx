import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getTravelPlans,
  createTravelPlan,
  getUserTravelPlans,
} from "../services/travelPlanService";

type Package = {
  id: number;
  title: string;
  duration: string;
  price: string;
  priceType: "perPerson" | "total";
  includes: string[];
  icon: string;
  color: string;
};

type Hotel = {
  id: number;
  name: string;
  location: string;
  rating: number;
  priceNight: number;
  image: string;
  rooms: number;
};

type SafariDetail = {
  id: number;
  name: string;
  type: "Jeep" | "Canter";
  price: number;
  availability: boolean;
  shift: "Morning" | "Afternoon";
  description: string;
};

interface AdminState {
  packages: Package[];
  hotels: Hotel[];
  safari: SafariDetail[];
  loading: boolean;
  error: string;
}

const INITIAL_PACKAGES: Package[] = [
  {
    id: 1,
    title: "Ranthambore Wildlife Escape",
    duration: "2N / 3D",
    price: "₹15,999",
    priceType: "perPerson",
    includes: [
      "2 nights hotel stay",
      "1 Jeep Safari",
      "Breakfast daily",
      "Ranthambore Fort visit",
      "Airport transfers",
    ],
    icon: "🐅",
    color: "orange",
  },
  {
    id: 2,
    title: "Royal Rajasthan Experience",
    duration: "3N / 4D",
    price: "₹22,999",
    priceType: "perPerson",
    includes: [
      "3 nights hotel stay",
      "2 Jeep Safaris",
      "All meals",
      "Ranthambore Fort & local temples",
      "Cultural performance",
      "Airport transfers",
    ],
    icon: "🦁",
    color: "red",
  },
];

const INITIAL_HOTELS: Hotel[] = [
  {
    id: 1,
    name: "The Palm Grove Resort",
    location: "Sawai Madhopur",
    rating: 4.8,
    priceNight: 4500,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    rooms: 20,
  },
  {
    id: 2,
    name: "Jungle View Resort",
    location: "Sawai Madhopur",
    rating: 4.5,
    priceNight: 3500,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
    rooms: 15,
  },
];

const INITIAL_SAFARI: SafariDetail[] = [
  {
    id: 1,
    name: "Jeep Safari",
    type: "Jeep",
    price: 2500,
    availability: true,
    shift: "Morning",
    description: "4-hour morning safari in Ranthambore National Park",
  },
  {
    id: 2,
    name: "Canter Safari",
    type: "Canter",
    price: 1500,
    availability: true,
    shift: "Afternoon",
    description: "6-hour afternoon safari in Ranthambore National Park",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    user,
    logout,
  } = useAuth();

  const [state, setState] = useState<AdminState>({
    packages: INITIAL_PACKAGES,
    hotels: INITIAL_HOTELS,
    safari: INITIAL_SAFARI,
    loading: false,
    error: "",
  });

  useEffect(() => {
    // In a real app, fetch from backend
    // For now, use initial state
    setState({
      packages: INITIAL_PACKAGES,
      hotels: INITIAL_HOTELS,
      safari: INITIAL_SAFARI,
      loading: false,
      error: "",
    });
  }, []);

  const [modal, setModal] = useState<{
    open: boolean;
    type: "package" | "hotel" | "safari";
    id?: number;
    data: any;
  }>({
    open: false,
    type: "package",
    data: {},
  });

  const openModal = (type: "package" | "hotel" | "safari", id?: number, data?: any) => {
    setModal({
      open: true,
      type,
      id,
      data: data || {},
    });
  };

  const closeModal = () => setModal({ open: false, type: "package", data: {} });

  const saveItem = async (type: "package" | "hotel" | "safari", data: any) => {
    setState((prev) => {
      switch (type) {
        case "package":
          const index = prev.packages.findIndex((p) => p.id === data.id);
          if (index !== -1) {
            prev.packages[index] = { ...prev.packages[index], ...data };
          } else {
            prev.packages.push({ ...data, id: Date.now() });
          }
          break;
        case "hotel":
          const hIndex = prev.hotels.findIndex((h) => h.id === data.id);
          if (hIndex !== -1) {
            prev.hotels[hIndex] = { ...prev.hotels[hIndex], ...data };
          } else {
            prev.hotels.push({ ...data, id: Date.now() });
          }
          break;
        case "safari":
          const sIndex = prev.safari.findIndex((s) => s.id === data.id);
          if (sIndex !== -1) {
            prev.safari[sIndex] = { ...prev.safari[sIndex], ...data };
          } else {
            prev.safari.push({ ...data, id: Date.now() });
          }
          break;
      }
      return { ...prev, open: false };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar navigate={navigate} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            Admin Dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your Ranthambore tour offerings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Packages Card */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold orange-500">🐅</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tour Packages</h3>
                <p className="text-sm text-gray-500">
                  {state.packages.length} packages
                </p>
              </div>
            </div>

            <button
              onClick={() => openModal("package")}
              className="mt-4 w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
            >
              Add Package
            </button>
          </div>

          {/* Hotels Card */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold orange-500">🏨</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hotels & Resorts</h3>
                <p className="text-sm text-gray-500">
                  {state.hotels.length} properties
                </p>
              </div>
            </div>

            <button
              onClick={() => openModal("hotel")}
              className="mt-4 w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
            >
              Add Hotel
            </button>
          </div>

          {/* Safari Card */}
          <div
            className="rounded-2xl bg-white p-6 shadow-sm hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold orange-500">🐅</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Safari Details</h3>
                <p className="text-sm text-gray-500">
                  {state.safari.length} configurations
                </p>
              </div>
            </div>

            <button
              onClick={() => openModal("safari")}
              className="mt-4 w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
            >
              Add Safari Config
            </button>
          </div>
        </div>

        {/* Modal for adding/editing */}
        {modal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modal.type === "package"
                    ? "Add Tour Package"
                    : modal.type === "hotel"
                      ? "Add Hotel"
                      : "Add Safari Config"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="xl">X</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Package Form */}
                {modal.type === "package" && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Package Details</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          value={modal.data.title || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, title: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={modal.data.duration || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, duration: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="text"
                          value={modal.data.price || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, price: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price Type
                        </label>
                        <select
                          value={modal.data.priceType || "perPerson"}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, priceType: e.target.value as "perPerson" | "total" },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="perPerson">Per Person</option>
                          <option value="total">Total</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Includes (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={modal.data.includes?.join(", ") || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                includes: e.target.value
                                  .split(",")
                                  .map((s: string) => s.trim())
                                  .filter((s: string) => s.length > 0),
                              },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        <p className="text-xs text-gray-500">
                          Enter each include on a new line or comma-separated
                        </p>
                      </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Icon
                        </label>
                        <input
                          type="text"
                          value={modal.data.icon || "🐅"}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, icon: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        <p className="text-xs text-gray-500">
                          Emoji icon for the package
                        </p>
                      </div>
                  </div>
                )}

                {/* Hotel Form */}
                {modal.type === "hotel" && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Hotel Details</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={modal.data.name || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, name: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          value={modal.data.location || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, location: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rating
                        </label>
                        <input
                          type="number"
                          value={modal.data.rating || 0}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, rating: Number(e.target.value) },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        <p className="text-xs text-gray-500">1-5 scale</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price/Night (₹)
                        </label>
                        <input
                          type="number"
                          value={modal.data.priceNight || 0}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, priceNight: Number(e.target.value) },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rooms Available
                        </label>
                        <input
                          type="number"
                          value={modal.data.rooms || 0}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, rooms: Number(e.target.value) },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={modal.data.image || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, image: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        <p className="text-xs text-gray-500">
                          Direct image link (unsplash or your CDN)
                        </p>
                      </div>
                  </div>
                )}

                {/* Safari Form */}
                {modal.type === "safari" && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Safari Details</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={modal.data.name || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, name: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          value={modal.data.type || "Jeep"}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, type: e.target.value as "Jeep" | "Canter" },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="Jeep">Jeep Safari</option>
                          <option value="Canter">Canter Safari</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={modal.data.price || 0}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, price: Number(e.target.value) },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                      Availability
                      </label>
                      <select
                        value={modal.data.available ? "true" : "false"}
                        onChange={(e) =>
                          setModal((prev) => ({
                            ...prev,
                            data: { ...prev.data, availability: e.target.value === "true" },
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Shift
                        </label>
                        <select
                          value={modal.data.shift || "Morning"}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, shift: e.target.value as "Morning" | "Afternoon" },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={modal.data.description || ""}
                          onChange={(e) =>
                            setModal((prev) => ({
                              ...prev,
                              data: { ...prev.data, description: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save/Cancel buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      saveItem(modal.type, modal.data);
                      closeModal();
                      showToast("Saved successfully");
                    }}
                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
                  >
                    {modal.data.id ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}

function showToast(message: string) {
  // Simple toast implementation
  alert(message);
}