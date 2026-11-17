import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationApi } from '../services/api';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'yatrabus_notifications_v1';
const READ_SET_KEY = 'yatrabus_read_notifications_v1';
const NotificationContext = createContext(null);

const getLocalStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage || null : null;
  } catch (error) {
    console.warn('Could not access local storage for notifications:', error?.message);
    return null;
  }
};

const getAccessToken = () => {
  try {
    return getLocalStorage()?.getItem('yatrabus_token') || null;
  } catch (error) {
    console.warn('Could not read the authentication token for notifications:', error?.message);
    return null;
  }
};

const sortNewestFirst = (notifications) =>
  [...notifications].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );

const loadNotifications = (key) => {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const saved = storage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return sortNewestFirst(
      parsed.filter((notification) => notification?.id && notification?.title && notification.source !== 'server')
    );
  } catch (error) {
    console.warn('Could not load notifications from storage:', error?.message);
    return [];
  }
};

const normalizeServerNotification = (notification) => {
  const type = notification.category && notification.category !== 'alert'
    ? notification.category
    : notification.type === 'CANCELLATION'
      ? 'cancellation'
      : ['DELAY', 'SCHEDULE_CHANGE'].includes(notification.type)
        ? 'schedule'
        : 'info';
  return {
    id: `server-${notification._id}`,
    serverId: notification._id,
    source: 'server',
    title: notification.title,
    message: notification.message,
    type,
    is_read: Boolean(notification.isRead),
    created_at: notification.createdAt || notification.updatedAt,
  };
};

const normalizeBroadcastNotification = (notification) => ({
  id: `broadcast-${notification._id}`,
  source: 'broadcast',
  title: notification.title,
  message: notification.message,
  type: notification.category === 'alert' ? 'info' : notification.category,
  is_read: false,
  created_at: notification.createdAt || notification.updatedAt,
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user?.id || user?._id || user?.email || 'guest';
  const isAdmin = user?.role === 'admin';
  const isCustomer = Boolean(user && !isAdmin);
  const storageKey = `${STORAGE_KEY}:${userKey}`;
  const token = getAccessToken();
  const currentStorageKey = useRef(storageKey);
  currentStorageKey.current = storageKey;
  const [notificationState, setNotificationState] = useState({ key: '', items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const notifications = notificationState.key === storageKey ? notificationState.items : [];

  useEffect(() => {
    setNotificationState({ key: storageKey, items: loadNotifications(storageKey) });
  }, [storageKey]);

  // Sync state to localStorage
  useEffect(() => {
    const storage = getLocalStorage();
    if (notificationState.key !== storageKey || !storage) return;
    try {
      const localNotifications = notificationState.items.filter((notification) => notification.source !== 'server');
      storage.setItem(storageKey, JSON.stringify(localNotifications));
    } catch (storageError) {
      console.warn('Could not save notifications to local storage:', storageError?.message);
    }
  }, [notificationState, storageKey]);

  const refreshNotifications = useCallback(async () => {
    if (isAdmin) {
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [broadcastRecords, customerRecords] = await Promise.all([
        notificationApi.getBroadcasts(),
        token && isCustomer ? notificationApi.getMyNotifications() : Promise.resolve([]),
      ]);
      if (currentStorageKey.current !== storageKey) return;
      const broadcasts = broadcastRecords.map(normalizeBroadcastNotification);
      const broadcastContent = new Set(broadcasts.map(
        (notification) => `${notification.title}\u0000${notification.message}`
      ));
      const customerNotifications = customerRecords
        .map(normalizeServerNotification)
        .filter((notification) =>
          !broadcastContent.has(`${notification.title}\u0000${notification.message}`)
        );
      setNotificationState((current) => {
        const currentItems = current.key === storageKey
          ? current.items
          : loadNotifications(storageKey);
        const previousBroadcasts = new Map(
          currentItems
            .filter((notification) => notification.source === 'broadcast')
            .map((notification) => [notification.id, notification])
        );
        const refreshedBroadcasts = broadcasts.map((broadcast) => ({
          ...broadcast,
          is_read: Boolean(previousBroadcasts.get(broadcast.id)?.is_read),
        }));
        const localNotifications = currentItems.filter((notification) =>
          notification.source !== 'server' && notification.source !== 'broadcast'
        );
        return {
          key: storageKey,
          items: sortNewestFirst([
            ...localNotifications,
            ...refreshedBroadcasts,
            ...customerNotifications,
          ]).slice(0, 100),
        };
      });
    } catch (requestError) {
      if (currentStorageKey.current === storageKey) {
        setError(requestError?.response?.data?.message || requestError?.message || 'Could not load notifications.');
      }
    } finally {
      if (currentStorageKey.current === storageKey) setIsLoading(false);
    }
  }, [storageKey, token, isCustomer, isAdmin]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!active) return;
      await refreshNotifications();
    };

    refresh();
    const intervalId = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshNotifications]);

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
    setNotificationState((current) => {
      const currentItems = current.key === storageKey ? current.items : loadNotifications(storageKey);
      return {
        key: storageKey,
        items: sortNewestFirst([created, ...currentItems]).slice(0, 100),
      };
    });
    return created;
  }, [storageKey]);

  const markAsRead = useCallback(async (id) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification || notification.is_read) return;

    try {
      if (notification.source === 'server') {
        await notificationApi.markAsRead(notification.serverId);
      }
      setNotificationState((current) => ({
        key: storageKey,
        items: (current.key === storageKey ? current.items : []).map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        ),
      }));
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || 'Could not mark notification as read.');
    }
  }, [notifications, storageKey]);

  const markAllAsRead = useCallback(async () => {
    const hasServerUnread = notifications.some((item) => item.source === 'server' && !item.is_read);
    try {
      if (hasServerUnread) await notificationApi.markAllAsRead();
      setNotificationState((current) => ({
        key: storageKey,
        items: (current.key === storageKey ? current.items : []).map((item) => ({ ...item, is_read: true })),
      }));
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || 'Could not mark notifications as read.');
      await refreshNotifications();
    }
  }, [notifications, refreshNotifications, storageKey]);

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
      addNotification,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    }),
    [notifications, unreadCount, isLoading, error, addNotification, markAsRead, markAllAsRead, refreshNotifications]
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
