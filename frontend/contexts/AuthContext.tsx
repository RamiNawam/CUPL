'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/api';

interface User {
  email: string;
  role: 'GUEST' | 'USER' | 'ADMIN' | 'CLUB';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClub: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        let errorMessage = 'Invalid email or password';
        try {
          const errorText = await response.text();
          if (errorText && errorText.trim()) {
            // Try to parse as JSON first
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorMessage;
            } catch {
              // If not JSON, use the text directly
              errorMessage = errorText;
            }
          }
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const userData: User = {
        email: data.email,
        role: data.role as 'GUEST' | 'USER' | 'ADMIN' | 'CLUB',
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      // Re-throw with a user-friendly message
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to connect to server. Please check if the backend is running.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = user !== null && user.role !== 'GUEST';
  const isAdmin = user?.role === 'ADMIN';
  const isClub = user?.role === 'CLUB';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, isClub }}>
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
