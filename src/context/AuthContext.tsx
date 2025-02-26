
import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, UserPermissions } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  hasPermission: (action: string, resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    payments: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
    vehicles: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
    drivers: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
    investors: {
      create: true,
      edit: true,
      delete: true,
      view: true,
    },
    settings: {
      view: true,
      edit: true,
    },
  },
  assistant: {
    payments: {
      create: true,
      edit: true,
      delete: false, // Asistente no puede eliminar pagos
      view: true,
    },
    vehicles: {
      create: false,
      edit: true,
      delete: false,
      view: true,
    },
    drivers: {
      create: true,
      edit: true,
      delete: false,
      view: true,
    },
    investors: {
      create: false,
      edit: false,
      delete: false,
      view: true,
    },
    settings: {
      view: true,
      edit: false,
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Aquí implementarías la lógica real de autenticación
    // Por ahora, simulamos un usuario administrador
    const mockUser: User = {
      id: "1",
      name: "Administrador",
      email: email,
      role: "admin",
      status: "active",
      company: "Mi Empresa",
      lastLogin: new Date().toISOString(),
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) return false;

    const permissions = DEFAULT_PERMISSIONS[user.role];
    const resourcePermissions = permissions[resource as keyof UserPermissions];

    if (!resourcePermissions) return false;

    return resourcePermissions[action as keyof typeof resourcePermissions] || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
