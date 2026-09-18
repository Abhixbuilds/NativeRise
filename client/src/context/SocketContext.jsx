import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useStores';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { addLiveNotification } = useNotificationStore();
  const [socket, setSocket] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isAuthenticated && user) {
      socket.emit('join', {
        userId: user.id || user._id,
        role: user.role
      });

      const handleOrderEvent = (eventName, data) => {
        setLiveEvents((prev) => [{ event: eventName, data, timestamp: new Date() }, ...prev.slice(0, 20)]);
        addLiveNotification({
          title: `Real-Time Update: ${eventName.replace(':', ' ')}`,
          message: data.message || `Order #${(data.orderId || '').toString().slice(-6)} update received.`
        });
        window.dispatchEvent(new CustomEvent('nativerise:sync', { detail: { event: eventName, data } }));
      };

      const events = [
        'order:created',
        'order:accepted',
        'order:rejected',
        'order:ready-for-pickup',
        'order:assigned',
        'order:checkpoint-updated',
        'order:delivered',
        'payment:status-changed',
        'dispute:created',
        'dispute:resolved',
        'seller:approved'
      ];

      events.forEach((evt) => {
        socket.on(evt, (data) => handleOrderEvent(evt, data));
      });

      return () => {
        events.forEach((evt) => {
          socket.off(evt);
        });
        socket.emit('leave', {
          userId: user.id || user._id,
          role: user.role
        });
      };
    }
  }, [socket, isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, liveEvents }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
