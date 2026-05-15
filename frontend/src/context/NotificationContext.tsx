import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppNotification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken } from '../api/axios';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const token = getAccessToken();
    const eventSource = new EventSource(`http://localhost:8080/api/v1/notifications/subscribe${token ? `?token=${token}` : ''}`);

    eventSource.addEventListener('notification', (event: any) => {
      const data = JSON.parse(event.data);
      const newNotification: AppNotification = {
        id: data.id,
        type: data.type,
        senderUsername: data.senderUsername,
        message: data.message,
        referenceId: data.referenceId,
        createdAt: data.createdAt,
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Simple Toast notification (could use a library like sonner)
      console.log("New Notification:", newNotification.message);
    });

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
