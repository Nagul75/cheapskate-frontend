import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/api/auth";

interface User {
    id: string;
    email: string;
    name: string | null;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    logout: () => Promise<void>;
    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = await authApi.refreshSession();

        if (isAuth) {
          const data = await authApi.getMe();
          setUser(data.user);
        }

        setIsAuthenticated(isAuth);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

    return (
        <AuthContext.Provider value={{isAuthenticated, isLoading, user, logout: authApi.logout, setIsAuthenticated, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}