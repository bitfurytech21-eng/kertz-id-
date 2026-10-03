import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { Notification } from '../types';
import { api } from '../services/api';

interface NotificationDropdownProps {
  onNavigate?: (url: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifs = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data.notifications || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: string, url?: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      if (url && onNavigate) {
        setIsOpen(false);
        onNavigate(url);
      }
    } catch {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 overflow-hidden text-slate-900">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Legal Updates & Alerts
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications at this time.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 ${
                    !notif.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      {notif.title}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {notif.link_url && (
                    <button
                      onClick={() => handleMarkRead(notif.id, notif.link_url)}
                      className="text-xs text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 shrink-0"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
