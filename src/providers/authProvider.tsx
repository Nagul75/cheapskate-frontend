import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/api/auth";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    setIsAuthenticated: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        authApi.refreshSession()
            .then(setIsAuthenticated)
            .finally(() => setIsLoading(false))
    }, []);

    return (
        <AuthContext.Provider value={{isAuthenticated, isLoading, logout: authApi.logout, setIsAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}