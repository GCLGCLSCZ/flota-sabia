
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, UserRole, UserPermissions } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carga inicial
  useEffect(() => {
    // Comprobar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    setLoading(false);
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real de autenticación
      // Por ahora, simularemos un inicio de sesión exitoso
      const userData: User = {
        id: '123',
        email,
        displayName: 'Usuario Demo',
        role: 'admin',
        permissions: {
          canCreateVehicles: true,
          canEditVehicles: true,
          canDeleteVehicles: true,
          canCreatePayments: true,
          canEditPayments: true,
          canDeletePayments: true,
          canViewReports: true,
          canManageUsers: true
        }
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real de cierre de sesión
      setUser(null);
      localStorage.removeItem('user');
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al cerrar sesión');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real de registro
      // Por ahora, simularemos un registro exitoso
      const userData: User = {
        id: '123',
        email,
        displayName,
        role: 'user',
        permissions: {
          canCreateVehicles: false,
          canEditVehicles: false,
          canDeleteVehicles: false,
          canCreatePayments: false,
          canEditPayments: false,
          canDeletePayments: false,
          canViewReports: false,
          canManageUsers: false
        }
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al registrarse');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real de restablecimiento de contraseña
      setError(null);
      // Simular proceso exitoso
    } catch (e: any) {
      setError(e.message || 'Error al restablecer contraseña');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    try {
      // Aquí se implementaría la lógica real de actualización de perfil
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al actualizar perfil');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
