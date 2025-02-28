
import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, UserPermissions } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  hasPermission: (action: string, resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Aquí implementarías la lógica real de autenticación
    const mockUser: User = {
      id: "1",
      name: "Administrador",
      email: email,
      role: "admin",
      permissions: [
        "read:vehicles",
        "write:vehicles",
        "read:payments",
        "write:payments",
        "read:investors",
        "write:investors",
        "read:drivers",
        "write:drivers",
        "read:settings",
        "write:settings"
      ]
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    const permission = `${action}:${resource}` as UserPermissions;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
