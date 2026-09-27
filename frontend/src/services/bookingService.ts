import api from "./api";


export interface AvailabilityRequest {
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}


export interface AvailabilityResponse {
  available: boolean;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  price_per_night: number;
  total_amount: number;
  available_rooms: number;
}


export interface CreateBookingRequest {
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}


export interface Booking {
  id: number;

  booking_reference: string;

  room_id: number;

  check_in: string;
  check_out: string;

  guests: number;

  total_amount: number;

  status: string;

  expires_at: string | null;

  created_at: string;

  payment_status: string | null;
}


export interface BookingDetail {
  id: number;

  booking_reference: string;

  room_id: number;
  room_name: string;

  stay_id: number;
  stay_name: string;
  stay_slug: string;

  check_in: string;
  check_out: string;

  guests: number;

  price_per_night: number;
  total_amount: number;

  status: string;

  expires_at: string | null;

  created_at: string;

  payment_status: string | null;
  razorpay_payment_id: string | null;
}


export interface CancellationResponse {
  booking_reference: string;

  booking_status: string;

  payment_status: string | null;

  original_amount: number;

  refund_percentage: number;

  refund_amount: number;

  refund_id: string | null;
}


export async function checkAvailability(
  data: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const response =
    await api.post<AvailabilityResponse>(
      "/api/bookings/availability",
      data
    );

  return response.data;
}


export async function createBooking(
  data: CreateBookingRequest
): Promise<Booking> {
  const response =
    await api.post<Booking>(
      "/api/bookings",
      data
    );

  return response.data;
}


export async function getMyBookings(): Promise<Booking[]> {
  const response =
    await api.get<Booking[]>(
      "/api/bookings/my"
    );

  return response.data;
}


export async function getBooking(
  bookingId: number
): Promise<BookingDetail> {
  const response =
    await api.get<BookingDetail>(
      `/api/bookings/${bookingId}`
    );

  return response.data;
}


export async function cancelBooking(
  bookingId: number
): Promise<CancellationResponse> {
  const response =
    await api.post<CancellationResponse>(
      `/api/bookings/${bookingId}/cancel`
    );

  return response.data;
}