import api from "./api";

export type RequestType =
  | "stay"
  | "safari"
  | "package"
  | "custom";

export interface BookingRequest {
  id: number;
  request_reference: string;
  type: RequestType;
  item_id: number;
  item_name: string;
  check_in: string | null;
  check_out: string | null;
  rooms: number;
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "expired"
    | "paid";
  amount: number | null;
  admin_note: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AdminBookingRequest
  extends BookingRequest {
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
}

export interface CreateRequestData {
  type: RequestType;
  item_id: number;
  check_in?: string;
  check_out?: string;
  rooms?: number;
}

/** Create a booking request (retries reuse the live one). */
export async function createRequest(
  data: CreateRequestData
): Promise<BookingRequest> {
  const response = await api.post<BookingRequest>(
    "/api/requests",
    data
  );

  return response.data;
}

export async function getMyRequests(): Promise<
  BookingRequest[]
> {
  const response = await api.get<BookingRequest[]>(
    "/api/requests/my"
  );

  return response.data;
}

export async function getRequest(
  requestId: number
): Promise<BookingRequest> {
  const response = await api.get<BookingRequest>(
    `/api/requests/${requestId}`
  );

  return response.data;
}

export async function getAdminRequests(
  status?: string
): Promise<AdminBookingRequest[]> {
  const response = await api.get<AdminBookingRequest[]>(
    "/api/admin/requests",
    { params: status ? { status } : {} }
  );

  return response.data;
}

export async function acceptRequest(
  requestId: number,
  data: { amount?: number; note?: string }
): Promise<AdminBookingRequest> {
  const response = await api.post<AdminBookingRequest>(
    `/api/admin/requests/${requestId}/accept`,
    data
  );

  return response.data;
}

export async function rejectRequest(
  requestId: number,
  note?: string
): Promise<AdminBookingRequest> {
  const response = await api.post<AdminBookingRequest>(
    `/api/admin/requests/${requestId}/reject`,
    { note }
  );

  return response.data;
}

export async function setRequestAmount(
  requestId: number,
  amount: number,
  note?: string
): Promise<AdminBookingRequest> {
  const response = await api.post<AdminBookingRequest>(
    `/api/admin/requests/${requestId}/amount`,
    { amount, note }
  );

  return response.data;
}

export async function markRequestPaid(
  requestId: number,
  amount: number,
  note?: string
): Promise<AdminBookingRequest> {
  const response = await api.post<AdminBookingRequest>(
    `/api/admin/requests/${requestId}/mark-paid`,
    { amount, note }
  );

  return response.data;
}
