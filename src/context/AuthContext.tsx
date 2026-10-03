import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; remember_me?: boolean }) => Promise<void>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    country: string;
    state: string;
    terms_accepted: boolean;
  }) => Promise<{ verificationCode?: string }>;
  verifyEmail: (code: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  demoSwitch: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isClient: boolean;
  isStaff: boolean;
  isLegalOfficer: boolean;
  isTransactionOfficer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    try {
      const data = await api.auth.me();
      setUser(data.user);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string; remember_me?: boolean }) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    country: string;
    state: string;
    terms_accepted: boolean;
  }) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(payload);
      setUser(data.user);
      return { verificationCode: data.verificationCode };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (code: string, email?: string) => {
    await api.auth.verifyEmail({ code, email });
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const demoSwitch = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.auth.demoSwitchRole(role);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const isClient = user?.role === 'CLIENT';
  const isLegalOfficer = user?.role === 'LEGAL_OFFICER';
  const isTransactionOfficer = user?.role === 'TRANSACTION_OFFICER';
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = isLegalOfficer || isTransactionOfficer || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verifyEmail,
        logout,
        demoSwitch,
        refreshProfile,
        isClient,
        isStaff,
        isLegalOfficer,
        isTransactionOfficer,
        isAdmin,
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
