import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http, setAuthToken } from "../api/http";
import { endpoints } from "../api/endpoints";

export type Role = "Admin" | "Supervisor" | "Mecanico" | "Facturacion" | "Inventario";

export interface AuthUser {
  id: number;
  username: string;
  nombre_completo: string;
  email?: string;
  rol_id: number;
  rol?: Role;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasRole: (roles?: Role[]) => boolean;
}

const TOKEN_KEY = "autotrack_token";
const USER_KEY = "autotrack_user";

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async ({ username, password }: LoginPayload) => {
      const { data } = await http.post(endpoints.auth.login, { username, password });
      const authUser: AuthUser = { ...data.user, rol: data.role };
      setUser(authUser);
      setToken(data.access_token);
      setAuthToken(data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      setLoading(false);
      navigate("/");
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    navigate("/login", { replace: true });
  }, [navigate]);

  const hasRole = useCallback(
    (roles?: Role[]) => {
      if (!roles || roles.length === 0) {
        return true;
      }
      const userRole = user?.rol ?? (user ? (user as unknown as { rol: Role }).rol : undefined);
      return !!userRole && roles.includes(userRole);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      hasRole,
    }),
    [hasRole, loading, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
