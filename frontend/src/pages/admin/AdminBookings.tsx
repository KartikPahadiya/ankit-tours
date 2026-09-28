import { useEffect, useState } from "react";
import {
  getAdminBookings,
  AdminBooking,
} from "../../services/adminService";
import {
  getAdminRequests,
  acceptRequest,
  rejectRequest,
  setRequestAmount,
  markRequestPaid,
  type AdminBookingRequest,
} from "../../services/requestService";
import {
  getAdminCustomPlans,
  type AdminCustomPlan,
} from "../../services/customPlanService";


const TYPE_LABELS: Record<string, string> = {
  stay: "Stay",
  safari: "Safari",
  package: "Package",
  custom: "Custom package",
};

const TYPE_COLORS: Record<string, string> = {
  stay: "bg-emerald-100 text-emerald-700",
  safari: "bg-amber-100 text-amber-700",
  package: "bg-sky-100 text-sky-700",
  custom: "bg-violet-100 text-violet-700",
};

function formatINR(amount: number | null) {
  if (amount === null) return null;

  return `₹${Number(amount).toLocaleString("en-IN")}`;
}


/* ------------------------------------------------------------------ */
/*  Booking requests — accept / reject / amount / mark paid            */
/* ------------------------------------------------------------------ */

function BookingRequestsSection() {
  const [requests, setRequests] = useState<
    AdminBookingRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-request editing state
  const [amountInputs, setAmountInputs] =
    useState<Record<number, string>>({});

  const [noteInputs, setNoteInputs] = useState<
    Record<number, string>
  >({});

  const [busyId, setBusyId] = useState<number | null>(
    null
  );

  // Only new (pending) requests live here — once accepted,
  // rejected or paid they move out to the Records section.
  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminRequests("requested");

      setRequests(data);
    } catch {
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amountFor = (id: number) =>
    Number(amountInputs[id] || 0);

  const noteFor = (id: number) =>
    noteInputs[id]?.trim() || undefined;

  const runAction = async (
    id: number,
    action: () => Promise<unknown>
  ) => {
    try {
      setBusyId(id);
      setError("");

      await action();

      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Action failed. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = async (
    request: AdminBookingRequest
  ) => {
    // The admin can override the price on any request type
    // (discounts, extras, random cases). When no amount was
    // typed, stays / safaris / packages fall back to the
    // listed price, which the backend recomputes itself.
    const amount = amountInputs[request.id]
      ? amountFor(request.id)
      : undefined;

    await runAction(request.id, () =>
      acceptRequest(request.id, {
        amount,
        note: noteFor(request.id),
      })
    );
  };

  const handleReject = async (
    request: AdminBookingRequest
  ) => {
    await runAction(request.id, () =>
      rejectRequest(request.id, noteFor(request.id))
    );
  };

  const handleSetAmount = async (
    request: AdminBookingRequest
  ) => {
    const amount = amountFor(request.id);

    if (!amount || amount <= 0) {
      setError("Enter a valid amount first.");
      return;
    }

    await runAction(request.id, () =>
      setRequestAmount(
        request.id,
        amount,
        noteFor(request.id)
      )
    );
  };

  const handleMarkPaid = async (
    request: AdminBookingRequest
  ) => {
    const amount =
      amountInputs[request.id] ||
      String(request.amount || "");

    const parsed = Number(amount);

    if (!parsed || parsed <= 0) {
      setError("Enter the amount the customer paid.");
      return;
    }

    await runAction(request.id, () =>
      markRequestPaid(
        request.id,
        parsed,
        noteFor(request.id)
      )
    );
  };

  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold">
          Booking requests
        </h2>

        {!loading && requests.length > 0 && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {requests.length} new
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">
          No new requests — everything is actioned.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const busy = busyId === request.id;
            const isCustom = request.type === "custom";
            const listedPrice = formatINR(request.amount);

            return (
              <div
                key={request.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      TYPE_COLORS[request.type] ||
                      "bg-slate-100"
                    }`}
                  >
                    {TYPE_LABELS[request.type] ||
                      request.type}
                  </span>

                  <span className="text-sm text-gray-400">
                    {request.request_reference}
                  </span>
                </div>

                <h3 className="mt-2 font-semibold text-gray-900">
                  {request.item_name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {request.check_in && request.check_out
                    ? `${request.check_in} → ${request.check_out}`
                    : "Dates to be decided on WhatsApp"}

                  {" · "}
                  {request.rooms} room
                  {request.rooms !== 1 ? "s" : ""}

                  {listedPrice && (
                    <>
                      {" · "}
                      {listedPrice}
                      {!isCustom && (
                        <span className="text-gray-400">
                          {" "}
                          (listed price)
                        </span>
                      )}
                    </>
                  )}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">
                    {request.user_name}
                  </span>

                  {request.user_phone && (
                    <>
                      {" · "}
                      <a
                        className="text-green-700 underline"
                        href={`https://wa.me/${request.user_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {request.user_phone}
                      </a>
                    </>
                  )}

                  {request.user_email && (
                    <>
                      {" · "}
                      {request.user_email}
                    </>
                  )}
                </p>

                {request.admin_note && (
                  <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                    Note: {request.admin_note}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Amount (₹)"
                      value={
                        amountInputs[request.id] ??
                        (!isCustom &&
                        request.amount != null
                          ? String(request.amount)
                          : "")
                      }
                      onChange={(e) =>
                        setAmountInputs((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    {!isCustom && listedPrice && (
                      <p className="mt-1 text-xs text-gray-400">
                        Listed price — you can adjust it
                      </p>
                    )}
                  </div>

                  <input
                    placeholder="Note to customer (optional)"
                    value={noteInputs[request.id] ?? ""}
                    onChange={(e) =>
                      setNoteInputs((prev) => ({
                        ...prev,
                        [request.id]: e.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  />

                  <div className="flex flex-wrap gap-2">
                    {(request.status === "requested" ||
                      request.status === "expired") && (
                      <button
                        onClick={() =>
                          handleAccept(request)
                        }
                        disabled={busy}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}

                    {request.status === "requested" && (
                      <button
                        onClick={() =>
                          handleReject(request)
                        }
                        disabled={busy}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}

                    {(request.status === "requested" ||
                      request.status === "accepted") && (
                      <button
                        onClick={() =>
                          handleMarkPaid(request)
                        }
                        disabled={busy}
                        title={
                          request.status === "requested"
                            ? "Customer already paid (e.g. over WhatsApp)"
                            : undefined
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                    )}

                    {request.status === "accepted" && (
                      <button
                        onClick={() =>
                          handleSetAmount(request)
                        }
                        disabled={busy}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Set amount
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Confirmed purchases                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Records — every completed transaction, expandable details          */
/* ------------------------------------------------------------------ */

interface TxRecord {
  key: string;
  reference: string;
  source: "booking" | "request";
  type: "stay" | "safari" | "package" | "custom";
  customerName: string;
  customerPhone: string | null;
  amount: number | null;
  status: string;
  createdAt: string;
  // stay bookings
  stayName?: string | null;
  roomName?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number | null;
  // requests
  requestId?: number;
  itemName?: string;
  rooms?: number;
  adminNote?: string | null;
  expiresAt?: string | null;
  plan?: AdminCustomPlan | null;
}

function recordStatusClass(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
      return "bg-green-100 text-green-700";
    case "pending":
    case "accepted":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function recordStatusLabel(status: string) {
  return status === "accepted" ? "awaiting payment" : status;
}

function RecordDetails({
  record,
  onChanged,
}: {
  record: TxRecord;
  onChanged: () => void;
}) {
  const [amountInput, setAmountInput] = useState(
    record.amount !== null ? String(record.amount) : ""
  );
  const [noteInput, setNoteInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const canAction =
    record.source === "request" &&
    record.status === "accepted" &&
    record.requestId !== undefined;

  const run = async (
    action: () => Promise<unknown>
  ) => {
    try {
      setBusy(true);
      setActionError("");
      await action();
      onChanged();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.detail ||
          "Action failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = () => {
    const amount = Number(amountInput);

    if (!amount || amount <= 0) {
      setActionError("Enter the amount the customer paid.");
      return;
    }

    run(() =>
      markRequestPaid(
        record.requestId!,
        amount,
        noteInput.trim() || undefined
      )
    );
  };

  const handleSetAmount = () => {
    const amount = Number(amountInput);

    if (!amount || amount <= 0) {
      setActionError("Enter a valid amount first.");
      return;
    }

    run(() =>
      setRequestAmount(
        record.requestId!,
        amount,
        noteInput.trim() || undefined
      )
    );
  };

  return (
    <div className="bg-gray-50 border-t px-4 py-4">
      <div className="grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">

        {record.type === "stay" && (
          <>
            <p>
              <span className="text-gray-500">Stay: </span>
              <span className="font-medium">
                {record.stayName || record.itemName}
              </span>
            </p>

            {record.roomName && (
              <p>
                <span className="text-gray-500">Room: </span>
                {record.roomName}
              </p>
            )}

            {record.checkIn && record.checkOut && (
              <p>
                <span className="text-gray-500">Dates: </span>
                {record.checkIn} → {record.checkOut}
              </p>
            )}

            <p>
              <span className="text-gray-500">
                {record.source === "booking" ? "Guests: " : "Rooms: "}
              </span>
              {record.source === "booking"
                ? record.guests
                : `${record.rooms} room${record.rooms !== 1 ? "s" : ""}`}
            </p>
          </>
        )}

        {record.type === "safari" && (
          <>
            <p>
              <span className="text-gray-500">Safari: </span>
              <span className="font-medium">{record.itemName}</span>
            </p>

            <p>
              <span className="text-gray-500">Seats: </span>
              {record.rooms}
            </p>

            {record.checkIn && (
              <p>
                <span className="text-gray-500">Date: </span>
                {record.checkIn}
              </p>
            )}
          </>
        )}

        {record.type === "package" && (
          <>
            <p>
              <span className="text-gray-500">Package: </span>
              <span className="font-medium">{record.itemName}</span>
            </p>

            <p>
              <span className="text-gray-500">Travellers: </span>
              {record.rooms}
            </p>

            {record.checkIn && record.checkOut && (
              <p>
                <span className="text-gray-500">Dates: </span>
                {record.checkIn} → {record.checkOut}
              </p>
            )}
          </>
        )}

        {record.type === "custom" && record.plan && (
          <>
            <p>
              <span className="text-gray-500">{record.itemName}</span>
            </p>

            <p>
              <span className="text-gray-500">Duration: </span>
              {record.plan.travel_days} day
              {record.plan.travel_days !== 1 ? "s" : ""}
            </p>

            <p>
              <span className="text-gray-500">Safari: </span>
              {record.plan.safari_type}
              {record.plan.safari_date
                ? ` on ${record.plan.safari_date}`
                : ""}
              {record.plan.safari_shift !== "Any"
                ? ` (${record.plan.safari_shift} shift)`
                : ""}
            </p>

            <p>
              <span className="text-gray-500">Hotel: </span>
              {record.plan.hotel_category}
            </p>

            <p>
              <span className="text-gray-500">Extras: </span>
              {[
                record.plan.pickup && "Pickup",
                record.plan.village && "Village walk",
                record.plan.photography && "Photography",
                record.plan.food && "Food",
              ]
                .filter(Boolean)
                .join(", ") || "None"}
            </p>
          </>
        )}

        {record.adminNote && (
          <p className="md:col-span-2">
            <span className="text-gray-500">Note: </span>
            {record.adminNote}
          </p>
        )}

        {record.source === "request" &&
          record.status === "accepted" &&
          record.expiresAt && (
            <p>
              <span className="text-gray-500">
                Pay by:{" "}
              </span>
              {new Date(record.expiresAt).toLocaleString()}
            </p>
          )}

      </div>

      {canAction && (
        <div className="mt-4 grid gap-3 border-t border-gray-200 pt-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Amount (₹)"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <input
            placeholder="Note to customer (optional)"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSetAmount}
              disabled={busy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Set amount
            </button>

            <button
              onClick={handleMarkPaid}
              disabled={busy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Mark paid
            </button>
          </div>

          {actionError && (
            <p className="text-sm text-red-600 md:col-span-3">
              {actionError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RecordsSection() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const load = async () => {
    try {
      const [bookings, accepted, paid, plans] =
        await Promise.all([
          getAdminBookings(),
          getAdminRequests("accepted"),
          getAdminRequests("paid"),
          getAdminCustomPlans(),
        ]);

      const planById = new Map(
        plans.map((p) => [p.id, p])
      );

      const toRecord = (
        r: AdminBookingRequest
      ): TxRecord => ({
        key: `request-${r.id}`,
        reference: r.request_reference,
        source: "request",
        type: r.type,
        customerName: r.user_name || "Customer",
        customerPhone: r.user_phone,
        amount: r.amount,
        status: r.status,
        createdAt: r.created_at,
        requestId: r.id,
        itemName: r.item_name,
        rooms: r.rooms,
        adminNote: r.admin_note,
        checkIn: r.check_in,
        checkOut: r.check_out,
        expiresAt: r.expires_at,
        plan:
          r.type === "custom"
            ? planById.get(r.item_id) ?? null
            : null,
      });

      const merged: TxRecord[] = [
        ...bookings.map((b: AdminBooking): TxRecord => ({
          key: `booking-${b.id}`,
          reference: b.booking_reference,
          source: "booking",
          type: "stay",
          customerName:
            b.customer_name || `User #${b.user_id}`,
          customerPhone: b.customer_phone,
          amount: b.total_amount,
          status: b.status,
          createdAt: b.created_at,
          stayName: b.stay_name,
          roomName: b.room_name,
          checkIn: b.check_in,
          checkOut: b.check_out,
          guests: b.guests,
        })),

        ...accepted.map(toRecord),
        ...paid.map(toRecord),
      ];

      merged.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setRecords(merged);
    } catch {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Records
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500">
            No records yet. Paid bookings and requests
            will appear here.
          </p>
        ) : (
          records.map((record) => (
            <RecordCard
              key={record.key}
              record={record}
              open={openKey === record.key}
              onToggle={() =>
                setOpenKey(
                  openKey === record.key
                    ? null
                    : record.key
                )
              }
              onChanged={load}
            />
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">
                  Reference
                </th>
                <th className="text-left px-4 py-3">
                  Customer
                </th>
                <th className="text-left px-4 py-3">
                  Amount
                </th>
                <th className="text-left px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No records yet. Paid bookings and
                    requests will appear here.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const open = openKey === record.key;

                  return (
                    <RecordRow
                      key={record.key}
                      record={record}
                      open={open}
                      onToggle={() =>
                        setOpenKey(open ? null : record.key)
                      }
                      onChanged={load}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecordCard({
  record,
  open,
  onToggle,
  onChanged,
}: {
  record: TxRecord;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                TYPE_COLORS[record.type] || "bg-slate-100"
              }`}
            >
              {TYPE_LABELS[record.type] || record.type}
            </span>
            <span className="text-sm font-medium">
              {record.reference}
            </span>
          </span>

          <span className="text-gray-400">
            {open ? "▲" : "▼"}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">
              {record.customerName}
            </p>
            {record.customerPhone && (
              <p className="text-xs text-gray-500">
                {record.customerPhone}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold">
              {record.amount !== null
                ? `₹${Number(record.amount).toLocaleString("en-IN")}`
                : "—"}
            </p>
            <span
              className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] ${recordStatusClass(record.status)}`}
            >
              {recordStatusLabel(record.status)}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <RecordDetails
          record={record}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function RecordRow({
  record,
  open,
  onToggle,
  onChanged,
}: {
  record: TxRecord;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b last:border-b-0 cursor-pointer transition ${
          open ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-4 py-3 font-medium">
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                TYPE_COLORS[record.type] || "bg-slate-100"
              }`}
            >
              {TYPE_LABELS[record.type] || record.type}
            </span>
            {record.reference}
          </span>
        </td>

        <td className="px-4 py-3">
          <p className="font-medium">
            {record.customerName}
          </p>
          {record.customerPhone && (
            <p className="text-sm text-gray-500">
              {record.customerPhone}
            </p>
          )}
        </td>

        <td className="px-4 py-3">
          {record.amount !== null
            ? `₹${Number(record.amount).toLocaleString("en-IN")}`
            : "—"}
        </td>

        <td className="px-4 py-3">
          <span
            className={`px-3 py-1 rounded-full text-xs ${recordStatusClass(record.status)}`}
          >
            {recordStatusLabel(record.status)}
          </span>
        </td>

        <td className="px-4 py-3 text-gray-400">
          {open ? "▲" : "▼"}
        </td>
      </tr>

      {open && (
        <tr className="border-b last:border-b-0">
          <td colSpan={5} className="p-0">
            <RecordDetails
              record={record}
              onChanged={onChanged}
            />
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminBookings() {
  return (
    <div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Bookings
        </h1>

        <p className="text-gray-500 mt-1">
          Booking requests to action, plus a record of
          every completed transaction.
        </p>
      </div>

      <BookingRequestsSection />

      <RecordsSection />

    </div>
  );
}
