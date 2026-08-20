import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, LoginResponse } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ym_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users/me');
        setUser(data.data);
      } catch (error) {
        localStorage.removeItem('ym_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (data: LoginResponse) => {
    localStorage.setItem('ym_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('ym_token');
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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
