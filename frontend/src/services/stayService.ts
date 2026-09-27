import api from "./api";


export interface StayImage {
  id: number;
  image_url: string;
  room_id: number | null;
  is_primary: boolean;
  display_order: number;
}


export interface Room {
  id: number;
  name: string;
  description: string | null;
  max_guests: number;
  price_per_night: number;
  total_rooms: number;
}


export interface Stay {
  id: number;
  name: string;
  slug: string;
  property_type: string;
  city: string;
  state: string | null;
  country: string;
  rating: number;
  review_count: number;
  status: string;
  primary_image: string | null;
}


export interface StayDetails extends Stay {
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: StayImage[];
  rooms: Room[];
}


export async function getStays(
  city?: string,
  propertyType?: string,
): Promise<Stay[]> {

  const response = await api.get<Stay[]>(
    "/api/stays",
    {
      params: {
        city: city || undefined,
        property_type:
          propertyType || undefined,
      },
    },
  );

  return response.data;
}


export async function getStayBySlug(
  slug: string,
): Promise<StayDetails> {

  const response =
    await api.get<StayDetails>(
      `/api/stays/${slug}`,
    );

  return response.data;
}
