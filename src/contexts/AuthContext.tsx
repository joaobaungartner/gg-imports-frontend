import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginResponse } from "@/lib/api";
import {
  clearAuth,
  getToken,
  getUser,
  saveToken,
  saveUser,
  type AuthUser,
} from "@/lib/auth";
import { setUnauthorizedHandler } from "@/lib/authSession";
import { isTokenExpired } from "@/utils/authToken";

type LogoutOptions = {
  sessionExpired?: boolean;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
  login: (response: LoginResponse) => void;
  logout: (options?: LogoutOptions) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuthState(): { user: AuthUser | null; isAuthenticated: boolean } {
  const token = getToken();

  if (!token) {
    return { user: null, isAuthenticated: false };
  }

  if (isTokenExpired(token)) {
    clearAuth();
    return { user: null, isAuthenticated: false };
  }

  const user = getUser();
  if (!user) {
    clearAuth();
    return { user: null, isAuthenticated: false };
  }

  return { user, isAuthenticated: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(readAuthState);

  const logout = useCallback(
    (options?: LogoutOptions) => {
      clearAuth();
      setAuthState({ user: null, isAuthenticated: false });

      if (options?.sessionExpired) {
        navigate({ to: "/login", search: { session: "expired" } });
        return;
      }

      navigate({ to: "/" });
    },
    [navigate],
  );

  const login = useCallback((response: LoginResponse) => {
    saveToken(response.access_token);
    saveUser(response.user);
    setAuthState({ user: response.user, isAuthenticated: true });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout({ sessionExpired: true }));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      isAdmin: authState.user?.role === "ADMIN",
      user: authState.user,
      login,
      logout,
    }),
    [authState.isAuthenticated, authState.user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
