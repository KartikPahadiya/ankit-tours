import api from "./api";

export interface CustomPlan {
  id: number;
  user_id: number;
  travel_days: number;
  safari_type: string;
  safari_date: string | null;
  safari_shift: string;
  hotel_category: string;
  pickup: boolean;
  village: boolean;
  photography: boolean;
  food: boolean;
  status: string;
  created_at: string;
}

export interface AdminCustomPlan extends CustomPlan {
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
}

export interface CreateCustomPlanRequest {
  travel_days: number;
  safari_type: string;
  safari_date?: string;
  safari_shift: string;
  hotel_category: string;
  pickup: boolean;
  village: boolean;
  photography: boolean;
  food: boolean;
}

/** User submits a custom package request (also sent to admin on WhatsApp). */
export async function createCustomPlan(
  data: CreateCustomPlanRequest
): Promise<CustomPlan> {
  const response = await api.post<CustomPlan>(
    "/api/custom-plans",
    data
  );

  return response.data;
}

export async function getMyCustomPlans(): Promise<CustomPlan[]> {
  const response = await api.get<CustomPlan[]>(
    "/api/custom-plans/my"
  );

  return response.data;
}

export async function getAdminCustomPlans(): Promise<AdminCustomPlan[]> {
  const response = await api.get<AdminCustomPlan[]>(
    "/api/admin/custom-plans"
  );

  return response.data;
}

export async function updateCustomPlanStatus(
  planId: number,
  status: "accepted" | "rejected" | "requested"
): Promise<AdminCustomPlan> {
  const response = await api.patch<AdminCustomPlan>(
    `/api/admin/custom-plans/${planId}`,
    { status }
  );

  return response.data;
}
