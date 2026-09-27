export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
