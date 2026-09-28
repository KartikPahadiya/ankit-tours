import api from "./api";

export interface AdminDashboard {
  total_users: number;
  total_stays: number;
  total_rooms: number;
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
}

export interface AdminStay {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  property_type: string;
  city: string;
  state: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  review_count: number;
  status: string;
}

export interface AdminRoom {
  id: number;
  stay_id: number;
  name: string;
  description: string | null;
  max_guests: number;
  price_per_night: number;
  total_rooms: number;
}

export interface AdminBooking {
  id: number;
  booking_reference: string;
  user_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  room_name: string | null;
  stay_name: string | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>(
    "/api/admin/dashboard"
  );

  return response.data;
}

export async function getAdminStays(): Promise<AdminStay[]> {
  const response = await api.get<AdminStay[]>(
    "/api/admin/stays"
  );

  return response.data;
}

export async function getAdminRooms(
  stayId: number
): Promise<AdminRoom[]> {
  const response = await api.get<AdminRoom[]>(
    `/api/admin/stays/${stayId}/rooms`
  );

  return response.data;
}

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const response = await api.get<AdminBooking[]>(
    "/api/admin/bookings"
  );

  return response.data;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>(
    "/api/admin/users"
  );

  return response.data;
}

export interface CreateStayRequest {
  name: string;
  description?: string;
  property_type: string;
  city: string;
  state: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateStayRequest {
  name?: string;
  description?: string;
  property_type?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  max_guests: number;
  price_per_night: number;
  total_rooms: number;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  max_guests?: number;
  price_per_night?: number;
  total_rooms?: number;
}

export async function createAdminStay(
  data: CreateStayRequest
): Promise<AdminStay> {
  const response = await api.post<AdminStay>(
    "/api/admin/stays",
    data
  );

  return response.data;
}

export async function updateAdminStay(
  stayId: number,
  data: UpdateStayRequest
): Promise<AdminStay> {
  const response = await api.patch<AdminStay>(
    `/api/admin/stays/${stayId}`,
    data
  );

  return response.data;
}

export async function createAdminRoom(
  stayId: number,
  data: CreateRoomRequest
): Promise<AdminRoom> {
  const response = await api.post<AdminRoom>(
    `/api/admin/stays/${stayId}/rooms`,
    data
  );

  return response.data;
}

export async function updateAdminRoom(
  roomId: number,
  data: UpdateRoomRequest
): Promise<AdminRoom> {
  const response = await api.patch<AdminRoom>(
    `/api/admin/rooms/${roomId}`,
    data
  );

  return response.data;
}

export async function deleteAdminRoom(
  roomId: number
): Promise<void> {
  await api.delete(`/api/admin/rooms/${roomId}`);
}

export interface AdminStayImage {
  id: number;
  stay_id: number;
  room_id: number | null;
  image_url: string;
  public_id: string | null;
  is_primary: boolean;
  display_order: number;
}

export async function getAdminStayImages(
  stayId: number
): Promise<AdminStayImage[]> {
  const response = await api.get<AdminStayImage[]>(
    `/api/admin/stays/${stayId}/images`
  );

  return response.data;
}

/** Upload a photo file — stored on the backend server, no external service. */
export async function uploadAdminStayImage(
  stayId: number,
  file: File
): Promise<AdminStayImage> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<AdminStayImage>(
    `/api/admin/stays/${stayId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

/** Permanently delete a property and all its data. */
export async function deleteAdminStayPermanent(
  stayId: number
): Promise<void> {
  await api.delete(`/api/admin/stays/${stayId}/permanent`);
}

/** Upload a photo for a specific room type. */
export async function uploadRoomImage(
  roomId: number,
  file: File
): Promise<AdminStayImage> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<AdminStayImage>(
    `/api/admin/rooms/${roomId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function deleteAdminStayImage(
  stayId: number,
  imageId: number
): Promise<void> {
  await api.delete(
    `/api/admin/stays/${stayId}/images/${imageId}`
  );
}
