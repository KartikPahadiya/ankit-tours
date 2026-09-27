import { useEffect, useState } from "react";
import {
  AdminRoom,
  AdminStay,
  createAdminRoom,
  createAdminStay,
  CreateRoomRequest,
  CreateStayRequest,
  deactivateAdminStay,
  deleteAdminStayPermanent,
  getAdminRooms,
  getAdminStays,
  updateAdminRoom,
  updateAdminStay,
  uploadAdminStayImage,
  getAdminStayImages,
  deleteAdminStayImage,
  uploadRoomImage,
  AdminStayImage,
} from "../../services/adminService";

const emptyStayForm: CreateStayRequest = {
  name: "",
  slug: "",
  description: "",
  property_type: "Hotel",
  city: "",
  state: "",
  country: "India",
  address: "",
};

const emptyRoomForm: CreateRoomRequest = {
  name: "",
  description: "",
  max_guests: 2,
  price_per_night: 0,
  total_rooms: 1,
};

export default function AdminStays() {
  const [stays, setStays] = useState<AdminStay[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [roomImages, setRoomImages] = useState<AdminStayImage[]>([]);

  const [selectedStay, setSelectedStay] =
    useState<AdminStay | null>(null);

  const [showStayForm, setShowStayForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingStay, setEditingStay] = useState<AdminStay | null>(null);

  const [stayForm, setStayFormState] =
    useState<CreateStayRequest>(emptyStayForm);

  const [roomForm, setRoomFormState] =
    useState<CreateRoomRequest>(emptyRoomForm);

  const [editingRoom, setEditingRoom] =
    useState<AdminRoom | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadStays() {
    try {
      setLoading(true);
      const data = await getAdminStays();
      setStays(data);
    } catch {
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRooms(stayId: number) {
    try {
      const data = await getAdminRooms(stayId);
      setRooms(data);

      const images = await getAdminStayImages(stayId);
      setRoomImages(images.filter((img) => img.room_id !== null));
    } catch {
      setError("Failed to load rooms.");
    }
  }

  useEffect(() => {
    loadStays();
  }, []);

  const handleCreateStay = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const stay = await createAdminStay(stayForm);

      setStays((current) => [stay, ...current]);

      setStayFormState(emptyStayForm);
      setShowStayForm(false);
      setEditingStay(null);
    } catch {
      setError("Failed to create property.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStay = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingStay) return;

    try {
      setSaving(true);
      setError("");

      const updated = await updateAdminStay(editingStay.id, {
        name: stayForm.name,
        description: stayForm.description,
        property_type: stayForm.property_type,
        city: stayForm.city,
        state: stayForm.state,
        country: stayForm.country,
        address: stayForm.address,
      });

      setStays((current) =>
        current.map((s) =>
          s.id === updated.id ? updated : s
        )
      );

      setStayFormState(emptyStayForm);
      setShowStayForm(false);
      setEditingStay(null);
    } catch {
      setError("Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  const startEditStay = (stay: AdminStay) => {
    setEditingStay(stay);
    setShowStayForm(true);
    setSelectedStay(null);
    setStayFormState({
      name: stay.name,
      slug: stay.slug,
      description: stay.description || "",
      property_type: stay.property_type,
      city: stay.city,
      state: stay.state || "",
      country: stay.country,
      address: stay.address || "",
    });
  };

  const handleDeleteStay = async (stay: AdminStay) => {
    const confirmed = window.confirm(
      `Permanently delete "${stay.name}"? This removes all its rooms, photos and bookings.`
    );

    if (!confirmed) return;

    try {
      await deleteAdminStayPermanent(stay.id);
      setStays((current) =>
        current.filter((s) => s.id !== stay.id)
      );
      if (selectedStay?.id === stay.id) {
        setSelectedStay(null);
      }
    } catch {
      setError("Failed to delete property.");
    }
  };

  const handleDeactivate = async (stay: AdminStay) => {
    const confirmed = window.confirm(
      `Hide "${stay.name}" from the website?`
    );

    if (!confirmed) return;

    try {
      await deactivateAdminStay(stay.id);
      setStays((current) =>
        current.map((item) =>
          item.id === stay.id
            ? { ...item, status: "inactive" }
            : item
        )
      );
    } catch {
      setError("Failed to hide property.");
    }
  };

  const openRooms = async (stay: AdminStay) => {
    setSelectedStay(stay);
    setShowRoomForm(false);
    setEditingRoom(null);
    await loadRooms(stay.id);
  };

  const handleCreateRoom = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedStay) return;

    try {
      setSaving(true);
      setError("");

      const room = await createAdminRoom(
        selectedStay.id,
        roomForm
      );

      setRooms((current) => [...current, room]);
      setRoomFormState(emptyRoomForm);
      setShowRoomForm(false);
    } catch {
      setError("Failed to create room.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoom = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingRoom) return;

    try {
      setSaving(true);
      setError("");

      const updated = await updateAdminRoom(
        editingRoom.id,
        {
          name: roomForm.name,
          description: roomForm.description,
          max_guests: roomForm.max_guests,
          price_per_night: roomForm.price_per_night,
          total_rooms: roomForm.total_rooms,
        }
      );

      setRooms((current) =>
        current.map((room) =>
          room.id === updated.id ? updated : room
        )
      );

      setEditingRoom(null);
      setRoomFormState(emptyRoomForm);
    } catch {
      setError("Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  const startEditRoom = (room: AdminRoom) => {
    setEditingRoom(room);
    setShowRoomForm(false);

    setRoomFormState({
      name: room.name,
      description: room.description || "",
      max_guests: room.max_guests,
      price_per_night: Number(room.price_per_night),
      total_rooms: room.total_rooms,
    });
  };

  const handleRoomPhotoUpload = async (
    roomId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await uploadRoomImage(roomId, file);
      setRoomImages((current) => [...current, image]);
    } catch {
      setError("Failed to upload room photo.");
    } finally {
      event.target.value = "";
    }
  };

  if (loading) {
    return <p>Loading properties...</p>;
  }

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between gap-6 mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Properties
          </h1>

          <p className="text-gray-500 mt-1">
            Manage properties, rooms, pricing and photos.
          </p>
        </div>

        <button
          onClick={() => {
            setShowStayForm(true);
            setEditingStay(null);
            setStayFormState(emptyStayForm);
          }}
          className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800"
        >
          + Add Property
        </button>

      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create / edit property form */}
      {showStayForm && (
        <form
          onSubmit={editingStay ? handleEditStay : handleCreateStay}
          className="bg-white border rounded-xl p-6 mb-8"
        >

          <div className="flex justify-between mb-6">

            <h2 className="text-xl font-semibold">
              {editingStay ? `Edit: ${editingStay.name}` : "Add Property"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowStayForm(false);
                setEditingStay(null);
                setStayFormState(emptyStayForm);
              }}
              className="text-gray-500"
            >
              ✕
            </button>

          </div>

          {!editingStay && (
            <div className="grid md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Property name"
                value={stayForm.name}
                onChange={(e) =>
                  setStayFormState({
                    ...stayForm,
                    name: e.target.value,
                  })
                }
                className="border rounded-lg px-4 py-3"
              />

              <input
                required
                placeholder="URL slug (e.g. my-hotel)"
                value={stayForm.slug}
                onChange={(e) =>
                  setStayFormState({
                    ...stayForm,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  })
                }
                className="border rounded-lg px-4 py-3"
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <select
              value={stayForm.property_type}
              onChange={(e) =>
                setStayFormState({
                  ...stayForm,
                  property_type: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3"
            >
              <option>Hotel</option>
              <option>Resort</option>
              <option>Villa</option>
              <option>Homestay</option>
              <option>Hostel</option>
              <option>Guest House</option>
            </select>

            <input
              required
              placeholder="City"
              value={stayForm.city}
              onChange={(e) =>
                setStayFormState({
                  ...stayForm,
                  city: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              required
              placeholder="State"
              value={stayForm.state}
              onChange={(e) =>
                setStayFormState({
                  ...stayForm,
                  state: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              placeholder="Address"
              value={stayForm.address}
              onChange={(e) =>
                setStayFormState({
                  ...stayForm,
                  address: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3"
            />
          </div>

          <textarea
            placeholder="Property description"
            value={stayForm.description}
            onChange={(e) =>
              setStayFormState({
                ...stayForm,
                description: e.target.value,
              })
            }
            className="border rounded-lg px-4 py-3 w-full mt-4 min-h-24"
          />

          <div className="flex gap-3 mt-5">

            <button
              disabled={saving}
              className="bg-slate-900 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingStay
                  ? "Update Property"
                  : "Create Property"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStayForm(false);
                setEditingStay(null);
                setStayFormState(emptyStayForm);
              }}
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* Property list */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">

            <tr>
              <th className="text-left px-6 py-4">
                Property
              </th>

              <th className="text-left px-6 py-4">
                Type
              </th>

              <th className="text-left px-6 py-4">
                Location
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

            {stays.map((stay) => (
              <tr
                key={stay.id}
                className="border-b last:border-b-0"
              >

                <td className="px-6 py-4">

                  <p className="font-medium">
                    {stay.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    /{stay.slug}
                  </p>

                </td>

                <td className="px-6 py-4">
                  {stay.property_type}
                </td>

                <td className="px-6 py-4">
                  {stay.city}, {stay.state}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      stay.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stay.status}
                  </span>

                </td>

                <td className="px-6 py-4">

                  <div className="flex flex-wrap justify-end gap-2">

                    <button
                      onClick={() => startEditStay(stay)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openRooms(stay)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Rooms & Photos
                    </button>

                    {stay.status === "active" && (
                      <button
                        onClick={() => handleDeactivate(stay)}
                        className="px-3 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50"
                      >
                        Hide
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteStay(stay)}
                      className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

        </div>

      </div>

      {/* Room & photo manager for the selected property */}
      {selectedStay && (
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                {selectedStay.name} — Rooms & Photos
              </h2>

              <p className="text-gray-500 text-sm">
                Add room types, set prices, and upload photos.
              </p>
            </div>

            <button
              onClick={() => {
                setShowRoomForm(true);
                setEditingRoom(null);
                setRoomFormState(emptyRoomForm);
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg"
            >
              + Add Room
            </button>

          </div>

          {/* Room form */}
          {(showRoomForm || editingRoom) && (
            <form
              onSubmit={
                editingRoom
                  ? handleUpdateRoom
                  : handleCreateRoom
              }
              className="bg-gray-50 border rounded-xl p-5 mb-6"
            >

              <h3 className="font-semibold mb-4">
                {editingRoom ? "Edit Room" : "Add Room"}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  required
                  placeholder="Room name"
                  value={roomForm.name}
                  onChange={(e) =>
                    setRoomFormState({
                      ...roomForm,
                      name: e.target.value,
                    })
                  }
                  className="border rounded-lg px-4 py-3 bg-white"
                />

                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Maximum guests"
                  value={roomForm.max_guests}
                  onChange={(e) =>
                    setRoomFormState({
                      ...roomForm,
                      max_guests: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-4 py-3 bg-white"
                />

                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Price per night"
                  value={roomForm.price_per_night}
                  onChange={(e) =>
                    setRoomFormState({
                      ...roomForm,
                      price_per_night: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-4 py-3 bg-white"
                />

                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Total rooms"
                  value={roomForm.total_rooms}
                  onChange={(e) =>
                    setRoomFormState({
                      ...roomForm,
                      total_rooms: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-4 py-3 bg-white"
                />

              </div>

              <textarea
                placeholder="Room description"
                value={roomForm.description}
                onChange={(e) =>
                  setRoomFormState({
                    ...roomForm,
                    description: e.target.value,
                  })
                }
                className="border rounded-lg px-4 py-3 w-full mt-4 bg-white"
              />

              <div className="flex gap-3 mt-4">

                <button
                  disabled={saving}
                  className="bg-slate-900 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingRoom
                      ? "Update Room"
                      : "Create Room"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingRoom(null);
                    setShowRoomForm(false);
                    setRoomFormState(emptyRoomForm);
                  }}
                  className="border px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

          {/* Room list with photo upload */}
          <div className="space-y-6">

            {rooms.map((room) => {
              const photos = roomImages.filter(
                (img) => img.room_id === room.id
              );

              return (
                <div
                  key={room.id}
                  className="rounded-xl border p-5"
                >

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>
                      <p className="font-medium text-gray-900">
                        {room.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        ₹{Number(room.price_per_night).toLocaleString("en-IN")}/night
                        {" · "}
                        {room.max_guests} guests
                        {" · "}
                        {room.total_rooms} rooms
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditRoom(room)}
                        className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <label className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                        + Room Photo

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            handleRoomPhotoUpload(room.id, e)
                          }
                        />
                      </label>
                    </div>

                  </div>

                  {/* Room photos */}
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">

                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative overflow-hidden rounded-lg border"
                        >
                          <img
                            src={photo.image_url}
                            alt={room.name}
                            className="h-28 w-full object-cover"
                          />

                          <button
                            onClick={async () => {
                              try {
                                await deleteAdminStayImage(
                                  photo.stay_id,
                                  photo.id
                                );
                                setRoomImages((current) =>
                                  current.filter(
                                    (img) => img.id !== photo.id
                                  )
                                );
                              } catch {
                                setError("Failed to delete room photo.");
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>
      )}

    </div>
  );
}
