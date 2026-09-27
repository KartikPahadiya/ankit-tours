import api from "./api";

export interface SafariConfig {
  id: number;
  vehicle_type: string;
  shift: string;
  price_per_person: number;
  seats_per_vehicle: number;
  timing: string | null;
  note: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface CreateSafariRequest {
  vehicle_type: string;
  shift: string;
  price_per_person: number;
  seats_per_vehicle: number;
  timing?: string;
  note?: string;
}

export interface UpdateSafariRequest {
  vehicle_type?: string;
  shift?: string;
  price_per_person?: number;
  seats_per_vehicle?: number;
  timing?: string;
  note?: string;
  is_active?: boolean;
  display_order?: number;
}

/** Public: safari options shown on the website (no auth). */
export async function getSafaris(): Promise<SafariConfig[]> {
  const response = await api.get<SafariConfig[]>("/api/safaris");

  return response.data;
}

/** Admin: every safari option, including hidden ones. */
export async function getAdminSafaris(): Promise<SafariConfig[]> {
  const response = await api.get<SafariConfig[]>(
    "/api/admin/safaris"
  );

  return response.data;
}

export async function createSafari(
  data: CreateSafariRequest
): Promise<SafariConfig> {
  const response = await api.post<SafariConfig>(
    "/api/admin/safaris",
    data
  );

  return response.data;
}

export async function updateSafari(
  safariId: number,
  data: UpdateSafariRequest
): Promise<SafariConfig> {
  const response = await api.patch<SafariConfig>(
    `/api/admin/safaris/${safariId}`,
    data
  );

  return response.data;
}

export async function deleteSafari(
  safariId: number
): Promise<void> {
  await api.delete(`/api/admin/safaris/${safariId}`);
}
