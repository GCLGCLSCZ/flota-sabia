
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
      permissions: {
        canEditVehicles: true,
        canEditPayments: true,
        canEditDrivers: true,
        canEditInvestors: true
      }
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    
    // Comprobar los permisos basados en el recurso
    switch (resource) {
      case "vehicles":
        return user.permissions.canEditVehicles;
      case "payments":
        return user.permissions.canEditPayments;
      case "drivers":
        return user.permissions.canEditDrivers;
      case "investors":
        return user.permissions.canEditInvestors;
      default:
        return false;
    }
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
