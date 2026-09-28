import { useEffect, useState } from "react";
import {
  AdminRoom,
  AdminStay,
  createAdminRoom,
  createAdminStay,
  CreateRoomRequest,
  CreateStayRequest,
  deleteAdminStayPermanent,
  getAdminRooms,
  getAdminStays,
  updateAdminRoom,
  updateAdminStay,
  getAdminStayImages,
  deleteAdminStayImage,
  deleteAdminRoom,
  uploadRoomImage,
  AdminStayImage,
} from "../../services/adminService";
import StayImageManager from "../../components/admin/StayImageManager";

const emptyStayForm: CreateStayRequest = {
  name: "",
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
    setSelectedStay(stay);
    void loadRooms(stay.id);
    setStayFormState({
      name: stay.name,
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

  const handleStatusToggle = async (stay: AdminStay) => {
    const nextStatus = stay.status === "active" ? "inactive" : "active";

    try {
      const updated = await updateAdminStay(stay.id, {
        status: nextStatus,
      });
      setStays((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    } catch {
      setError("Failed to update property status.");
    }
  };

  const closeStayEditor = () => {
    setShowStayForm(false);
    setEditingStay(null);
    setSelectedStay(null);
    setShowRoomForm(false);
    setEditingRoom(null);
    setStayFormState(emptyStayForm);
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

  const handleDeleteRoom = async (room: AdminRoom) => {
    const confirmed = window.confirm(
      `Delete the ${room.name} room type and its photos? Existing bookings for it will also be removed.`
    );

    if (!confirmed) return;

    try {
      await deleteAdminRoom(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      setRoomImages((current) =>
        current.filter((image) => image.room_id !== room.id)
      );
    } catch {
      setError("Failed to delete room type.");
    }
  };

  if (loading) {
    return <p>Loading properties...</p>;
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
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
            setSelectedStay(null);
            setStayFormState(emptyStayForm);
          }}
          className="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-800 w-full sm:w-auto"
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={editingStay ? handleEditStay : handleCreateStay}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >

          <div className="flex justify-between mb-6">

            <h2 className="text-xl font-semibold">
              {editingStay ? `Edit: ${editingStay.name}` : "Add Property"}
            </h2>

            <button
              type="button"
              onClick={closeStayEditor}
              className="text-gray-500 hover:text-gray-900"
              aria-label="Close property editor"
            >
              ✕
            </button>

          </div>

          {!editingStay && (
            <div className="grid gap-4">
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
              onClick={closeStayEditor}
              className="border px-6 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

          </form>
        </div>
      )}

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {stays.map((stay) => (
          <div
            key={stay.id}
            className="rounded-xl border bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{stay.name}</p>

              <button
                onClick={() => handleStatusToggle(stay)}
                role="switch"
                aria-checked={stay.status === "active"}
                className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition hover:opacity-80 ${
                  stay.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
                title={`Set ${stay.name} to ${stay.status === "active" ? "inactive" : "active"}`}
              >
                <span className="relative h-4 w-7 rounded-full bg-current/25">
                  <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-current transition-transform ${
                      stay.status === "active" ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
                {stay.status === "active" ? "On" : "Off"}
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              {stay.property_type}
              <span className="mx-1.5 text-gray-300">·</span>
              {stay.city}, {stay.state}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => startEditStay(stay)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteStay(stay)}
                className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">

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

                </td>

                <td className="px-6 py-4">
                  {stay.property_type}
                </td>

                <td className="px-6 py-4">
                  {stay.city}, {stay.state}
                </td>

                <td className="px-6 py-4">

                  <button
                    onClick={() => handleStatusToggle(stay)}
                    role="switch"
                    aria-checked={stay.status === "active"}
                    className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition hover:opacity-80 ${
                      stay.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    title={`Set ${stay.name} to ${stay.status === "active" ? "inactive" : "active"}`}
                  >
                    <span className="relative h-4 w-7 rounded-full bg-current/25">
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-full bg-current transition-transform ${
                          stay.status === "active" ? "translate-x-3.5" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                    {stay.status === "active" ? "On" : "Off"}
                  </button>

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
      {selectedStay && !showStayForm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative mx-auto my-6 w-full max-w-5xl rounded-lg bg-white p-6 shadow-xl">

          <button
            onClick={() => {
              setSelectedStay(null);
              setShowRoomForm(false);
              setEditingRoom(null);
            }}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close rooms and photos"
          >
            ✕
          </button>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pr-8">

            <div>
              <h2 className="text-xl font-semibold">
                {selectedStay.name} — Rooms & Photos
              </h2>

              <p className="text-gray-500 text-sm">
                Manage property photos and room types from one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
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

          </div>

          <StayImageManager stayId={selectedStay.id} />

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

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-500">
                    ₹
                  </span>

                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Price per night"
                    value={
                      roomForm.price_per_night || ""
                    }
                    onChange={(e) =>
                      setRoomFormState({
                        ...roomForm,
                        price_per_night: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="w-full border rounded-lg pl-8 pr-4 py-3 bg-white"
                  />
                </div>

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

              {editingRoom && (
                <label className="mt-4 inline-flex cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
                  Upload room photos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      handleRoomPhotoUpload(editingRoom.id, event)
                    }
                  />
                </label>
              )}

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

                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="px-3 py-1.5 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

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
        </div>
      )}

    </div>
  );
}
