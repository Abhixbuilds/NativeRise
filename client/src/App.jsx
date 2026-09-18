import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { SocketProvider } from './context/SocketContext';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore, useWishlistStore, useNotificationStore } from './store/useStores';

export const App = () => {
  const { isAuthenticated, fetchUserProfile } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
      fetchCart();
      fetchWishlist();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
