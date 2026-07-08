import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from './apiService';
import { AuthContext } from './authContextValue';
import type { AuthContextType, User } from './authContextValue';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await apiService.verifyToken(savedToken);
          if (response.user) {
            setUser(response.user);
            setToken(savedToken);
          } else {
                        localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.error) {
        throw new Error(response.error);
      }
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.signup(username, email, password, fullName);
      if (response.error) {
        throw new Error(response.error);
      }
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (fullName: string, profilePicture?: string) => {
    if (!token) throw new Error('Not authenticated');

    const response = await apiService.updateProfile(token, fullName, profilePicture);
    if (response.user) {
      setUser(response.user);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};