import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (type: 'admin' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fyte_user') || localStorage.getItem('spendwise_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fyte_token') || localStorage.getItem('spendwise_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyExistingSession() {
      const storedToken = localStorage.getItem('fyte_token') || localStorage.getItem('spendwise_token');
      if (storedToken) {
        try {
          const verifiedUser = await api.getMe();
          setUser(verifiedUser);
          localStorage.setItem('fyte_user', JSON.stringify(verifiedUser));
        } catch (err) {
          console.warn("Session expired or invalid, resetting token.");
          logout();
        }
      }
      setIsLoading(false);
    }
    verifyExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('fyte_token', res.token);
    localStorage.setItem('fyte_user', JSON.stringify(res.user));
  };

  const register = async (name: string, email: string, password: string, role: string = "Financial Analyst") => {
    const res = await api.register({ name, email, password, role });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('fyte_token', res.token);
    localStorage.setItem('fyte_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fyte_token');
    localStorage.removeItem('fyte_user');
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
  };

  const quickDemoLogin = async (type: 'admin' | 'student') => {
    if (type === 'admin') {
      await login('admin@fyte.ai', 'admin123');
    } else {
      await login('student@college.edu', 'student123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
