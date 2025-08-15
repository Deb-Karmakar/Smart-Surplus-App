import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // 1. Imported useCallback
import api from '../services/api';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 2. Wrapped fetchNotifications in useCallback
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
    setLoading(false);
  }, [user]); // It depends on 'user', so 'user' is a dependency

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // 3. The effect now correctly depends on the memoized function

  // 4. Wrapped markAllAsRead in useCallback
  const markAllAsRead = useCallback(async () => {
    if (notifications.some(n => !n.isRead)) {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await api.post('/notifications/mark-read');
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    }
  }, [notifications]); // It depends on 'notifications', so 'notifications' is a dependency

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    loading,
    unreadCount,
    refreshNotifications: fetchNotifications,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};