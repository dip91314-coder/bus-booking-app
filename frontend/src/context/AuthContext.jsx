import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('yatra_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Validate session against backend on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('yatrabus_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('yatra_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err?.message);
        localStorage.removeItem('yatrabus_token');
        localStorage.removeItem('yatra_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data?.user) {
      const loggedUser = res.data.user;
      setUser(loggedUser);
      localStorage.setItem('yatra_user', JSON.stringify(loggedUser));
      toast.success(`Welcome back, ${loggedUser.name}!`);
      return loggedUser;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data?.user) {
      const newUser = res.data.user;
      setUser(newUser);
      localStorage.setItem('yatra_user', JSON.stringify(newUser));
      toast.success('Account created successfully! Welcome to YatraBus.');
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed even if network fails
    } finally {
      localStorage.removeItem('yatrabus_token');
      localStorage.removeItem('yatra_user');
      setUser(null);
      toast.success('You have been logged out.');
    }
  };

  const updateProfile = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('yatra_user', JSON.stringify(updated));
      toast.success('Profile updated successfully.');
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
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
