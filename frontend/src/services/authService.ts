import api from "./api";

import type {
  LoginResponse,
  User,
} from "../types/auth";


interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}


interface LoginData {
  email: string;
  password: string;
}


export async function registerUser(
  data: RegisterData,
): Promise<User> {
  const response = await api.post<User>(
    "/api/auth/register",
    data,
  );

  return response.data;
}


export async function loginUser(
  data: LoginData,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/api/auth/login",
    data,
  );

  return response.data;
}


export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>(
    "/api/auth/me",
  );

  return response.data;
}
