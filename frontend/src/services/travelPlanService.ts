import api from "./api";

export interface TravelPlan {
  id: number;
  user_id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: number;
  travel_style: string;
  interests: string[];
  itinerary: ItineraryDay[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  estimated_cost?: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: ItineraryActivity[];
}

export interface CreateTravelPlanRequest {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: number;
  travel_style: string;
  interests: string[];
}

export interface UpdateTravelPlanRequest {
  title?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: number;
  travel_style?: string;
  interests?: string[];
  itinerary?: ItineraryDay[];
  status?: string;
}

export async function createTravelPlan(
  data: CreateTravelPlanRequest
): Promise<TravelPlan> {
  const response = await api.post<TravelPlan>(
    "/api/travel-plans",
    data
  );

  return response.data;
}

export async function getTravelPlans(): Promise<TravelPlan[]> {
  const response = await api.get<TravelPlan[]>(
    "/api/travel-plans"
  );

  return response.data;
}

export async function getTravelPlan(
  planId: number
): Promise<TravelPlan> {
  const response = await api.get<TravelPlan>(
    `/api/travel-plans/${planId}`
  );

  return response.data;
}

export async function updateTravelPlan(
  planId: number,
  data: UpdateTravelPlanRequest
): Promise<TravelPlan> {
  const response = await api.patch<TravelPlan>(
    `/api/travel-plans/${planId}`,
    data
  );

  return response.data;
}

export async function deleteTravelPlan(
  planId: number
): Promise<void> {
  await api.delete(`/api/travel-plans/${planId}`);
}