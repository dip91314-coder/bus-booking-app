import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notificationApi } from '../services/api';

const STORAGE_KEY = 'yatrabus_notifications_v1';
const READ_SET_KEY = 'yatrabus_read_notifications_v1';
const NotificationContext = createContext(null);

const sortNewestFirst = (items) =>
  [...items].sort(
    (left, right) => new Date(right.created_at || right.createdAt).getTime() - new Date(left.created_at || left.createdAt).getTime()
  );

const getLocalReadIds = () => {
  if (typeof window === 'undefined' || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(READ_SET_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveLocalReadIds = (readSet) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(READ_SET_KEY, JSON.stringify([...readSet]));
  } catch {
    // ignore
  }
};

const loadSavedNotifications = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const readIds = getLocalReadIds();
    return sortNewestFirst(
      parsed
        .filter((n) => n?.id && n?.title)
        .map((n) => ({
          ...n,
          is_read: n.is_read || readIds.has(n.id),
        }))
    );
  } catch (error) {
    console.warn('Could not load notifications from storage:', error?.message);
    return [];
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadSavedNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Fetch real notifications from backend API
  const fetchBackendNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverNotifs = await notificationApi.getNotifications();
      if (Array.isArray(serverNotifs)) {
        const readIds = getLocalReadIds();
        const normalized = serverNotifs.map((n) => ({
          id: String(n.id || n._id),
          title: n.title,
          message: n.message,
          type: n.type || n.category || 'info',
          category: n.category || 'alert',
          is_read: Boolean(n.is_read || n.isRead || n.read || readIds.has(String(n.id || n._id))),
          created_at: n.created_at || n.createdAt || new Date().toISOString(),
          source: n.source || 'backend',
        }));

        setNotifications((current) => {
          // Merge local client notifications with server notifications
          const serverMap = new Map(normalized.map((item) => [item.id, item]));
          const localOnly = current.filter((c) => c.source === 'client' && !serverMap.has(c.id));
          const allMerged = sortNewestFirst([...serverMap.values(), ...localOnly]);

          // Prevent duplicate notifications with identical title & message
          const seenFingerprints = new Set();
          const uniqueList = [];
          for (const item of allMerged) {
            const fingerprint = `${(item.title || '').trim().toLowerCase()}::${(item.message || '').trim().toLowerCase()}`;
            if (!seenFingerprints.has(fingerprint)) {
              seenFingerprints.add(fingerprint);
              uniqueList.push(item);
            }
          }
          return uniqueList.slice(0, 100);
        });
      }
      setError(null);
    } catch (err) {
      console.warn('Could not fetch notifications from backend API:', err?.message);
      setError(err?.message || 'Failed to sync notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and interval poll (every 25 seconds)
  useEffect(() => {
    fetchBackendNotifications();

    const interval = setInterval(() => {
      fetchBackendNotifications();
    }, 25000);

    const handleFocus = () => {
      fetchBackendNotifications();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBackendNotifications]);

  const addNotification = useCallback((notification) => {
    const title = (notification.title || '').trim();
    const message = (notification.message || '').trim();

    const created = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      message,
      type: notification.type || notification.category || 'info',
      category: notification.category || 'alert',
      is_read: false,
      created_at: new Date().toISOString(),
      source: 'client',
    };

    setNotifications((current) => {
      // Prevent immediate duplicate if exact same notification exists in top items
      const isDuplicate = current.slice(0, 5).some(
        (n) => (n.title || '').trim().toLowerCase() === title.toLowerCase() &&
               (n.message || '').trim().toLowerCase() === message.toLowerCase()
      );
      if (isDuplicate) return current;
      return sortNewestFirst([created, ...current]).slice(0, 100);
    });

    return created;
  }, []);

  const markAsRead = useCallback(async (id) => {
    const strId = String(id);
    // Optimistically mark as read in local state
    setNotifications((current) =>
      current.map((n) => (n.id === strId ? { ...n, is_read: true } : n))
    );

    const readIds = getLocalReadIds();
    readIds.add(strId);
    saveLocalReadIds(readIds);

    // Call backend API
    try {
      await notificationApi.markAsRead(strId);
    } catch (err) {
      console.warn('Could not sync markAsRead to backend:', err?.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));

    const readIds = getLocalReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveLocalReadIds(readIds);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn('Could not sync markAllAsRead to backend:', err?.message);
    }
  }, [notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      refetch: fetchBackendNotifications,
      addNotification,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, isLoading, error, fetchBackendNotifications, addNotification, markAsRead, markAllAsRead]
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
