'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthMessage, TokenResponse, UserProfile } from './types';
import { getCurrentUser, loginUser, registerUser, resendVerification, verifyEmail } from './api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, fullName: string) => Promise<AuthMessage>;
  verify: (email: string, code: string) => Promise<UserProfile>;
  resendCode: (email: string) => Promise<AuthMessage>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on initial render
  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('synapse_auth_token') : null;
    if (savedToken) {
      setToken(savedToken);
      getCurrentUser(savedToken)
        .then((profile) => {
          setUser(profile);
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('synapse_auth_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res: TokenResponse = await loginUser(email, password);
    setToken(res.access_token);
    setUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('synapse_auth_token', res.access_token);
    }
    return res.user;
  };

  const register = async (email: string, password: string, fullName: string): Promise<AuthMessage> => {
    return await registerUser(email, password, fullName);
  };

  const verify = async (email: string, code: string): Promise<UserProfile> => {
    const res: TokenResponse = await verifyEmail(email, code);
    setToken(res.access_token);
    setUser(res.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('synapse_auth_token', res.access_token);
    }
    return res.user;
  };

  const resendCode = async (email: string): Promise<AuthMessage> => {
    return await resendVerification(email);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('synapse_auth_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        verify,
        resendCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
