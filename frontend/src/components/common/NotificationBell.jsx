import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Ticket, CreditCard, AlertTriangle, Bus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const iconForType = (type) => {
    if (type === 'booking' || type === 'ticket') return Ticket;
    if (type === 'payment') return CreditCard;
    if (type === 'cancellation') return AlertTriangle;
    if (type === 'schedule') return Bus;
    return Info;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-[60] mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#111622]"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.slice(0, 20).map((notification) => {
                const TypeIcon = iconForType(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      notification.is_read ? '' : 'bg-blue-50/60 dark:bg-blue-950/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="flex w-full items-start gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <TypeIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </span>
                          {!notification.is_read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-300">
                          {notification.message}
                        </span>
                        <time
                          className="mt-1 block text-[10px] text-slate-400"
                          dateTime={notification.created_at}
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </time>
                      </span>
                    </button>
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="ml-11 mt-2 min-h-7 rounded-md px-2 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="border-t border-slate-100 px-4 py-2 text-right dark:border-slate-800">
              <Link
                to="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                Open notification center
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
