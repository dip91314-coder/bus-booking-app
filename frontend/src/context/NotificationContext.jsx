import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'yatrabus_notifications_v1';
const NotificationContext = createContext(null);

const sortNewestFirst = (notifications) =>
  [...notifications].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );

const loadNotifications = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return sortNewestFirst(parsed.filter((notification) => notification?.id && notification?.title));
  } catch (error) {
    console.warn('Could not load notifications from local storage:', error?.message);
    return [];
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadNotifications);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.warn('Could not save notifications to local storage:', error?.message);
    }
  }, [notifications]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setNotifications(loadNotifications());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addNotification = useCallback((notification) => {
    const created = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((current) => sortNewestFirst([created, ...current]).slice(0, 100));
    return created;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true }))
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
