import api from "./api";

export interface TourPackage {
  id: number;
  title: string;
  duration: string;
  description: string | null;
  price: number;
  price_type: string;
  includes: string[];
  icon: string;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface CreatePackageRequest {
  title: string;
  duration: string;
  description?: string;
  price: number;
  price_type: string;
  includes: string[];
  icon: string;
  color: string;
}

export interface UpdatePackageRequest {
  title?: string;
  duration?: string;
  description?: string;
  price?: number;
  price_type?: string;
  includes?: string[];
  icon?: string;
  color?: string;
  is_active?: boolean;
  display_order?: number;
}

/** Public: packages shown on the Tours page (no auth). */
export async function getPackages(): Promise<TourPackage[]> {
  const response = await api.get<TourPackage[]>("/api/packages");

  return response.data;
}

/** Admin: every package, including inactive ones. */
export async function getAdminPackages(): Promise<TourPackage[]> {
  const response = await api.get<TourPackage[]>(
    "/api/admin/packages"
  );

  return response.data;
}

export async function createPackage(
  data: CreatePackageRequest
): Promise<TourPackage> {
  const response = await api.post<TourPackage>(
    "/api/admin/packages",
    data
  );

  return response.data;
}

export async function updatePackage(
  packageId: number,
  data: UpdatePackageRequest
): Promise<TourPackage> {
  const response = await api.patch<TourPackage>(
    `/api/admin/packages/${packageId}`,
    data
  );

  return response.data;
}

export async function deletePackage(
  packageId: number
): Promise<void> {
  await api.delete(`/api/admin/packages/${packageId}`);
}
