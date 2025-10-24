import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // No mantener sesión entre aperturas: no leemos AsyncStorage al iniciar
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      // Guardamos por si se necesita para llamadas, pero no se restaura al iniciar
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      console.log('Usuario autenticado (context):', userData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      console.log('Sesión cerrada correctamente (context)');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
