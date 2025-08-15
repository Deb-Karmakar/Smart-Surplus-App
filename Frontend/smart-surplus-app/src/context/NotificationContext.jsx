import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
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
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // --- NEW: Function to mark notifications as read ---
  const markAllAsRead = async () => {
    // Only run if there are unread notifications
    if (notifications.some(n => !n.isRead)) {
        try {
            // Update the local state immediately for a fast UI response
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            // Then, tell the backend to update the database
            await api.post('/notifications/mark-read');
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
            // If the API call fails, we could revert the local state change here
        }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    loading,
    unreadCount,
    refreshNotifications: fetchNotifications,
    markAllAsRead, // <-- Expose the new function
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
