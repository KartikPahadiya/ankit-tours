import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import {
  getCurrentUser,
} from "../services/authService";

import type {
  LoginResponse,
  User,
} from "../types/auth";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: LoginResponse) => Promise<User>;
  logout: () => void;
}


const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization =
          `Bearer ${accessToken}`;

        const currentUser =
          await getCurrentUser();

        setUser(currentUser);

      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);


  const login = async (
    tokens: LoginResponse,
  ): Promise<User> => {
    localStorage.setItem(
      "access_token",
      tokens.access_token,
    );

    localStorage.setItem(
      "refresh_token",
      tokens.refresh_token,
    );

    api.defaults.headers.common.Authorization =
      `Bearer ${tokens.access_token}`;

    const currentUser =
      await getCurrentUser();

    setUser(currentUser);

    return currentUser;
  };


  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    delete api.defaults.headers.common.Authorization;

    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
