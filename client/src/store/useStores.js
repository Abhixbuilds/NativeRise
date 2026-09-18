import { create } from 'zustand';
import { cartService, wishlistService, notificationService } from '../services/services';

export const useCartStore = create((set, get) => ({
  cart: null,
  itemCount: 0,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await cartService.getCart();
      if (res.success && res.data?.cart) {
        const count = res.data.cart.items.reduce((sum, it) => sum + it.quantity, 0);
        set({ cart: res.data.cart, itemCount: count, loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const res = await cartService.addToCart(productId, quantity);
      if (res.success && res.data?.cart) {
        const count = res.data.cart.items.reduce((sum, it) => sum + it.quantity, 0);
        set({ cart: res.data.cart, itemCount: count, loading: false });
        return { success: true };
      }
      return { success: false, error: 'Failed to add item' };
    } catch (err) {
      const msg = err.error?.message || err.message || 'Out of stock or unavailable';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  updateQty: async (productId, quantity) => {
    try {
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.success && res.data?.cart) {
        const count = res.data.cart.items.reduce((sum, it) => sum + it.quantity, 0);
        set({ cart: res.data.cart, itemCount: count });
        return { success: true };
      }
    } catch (err) {
      const msg = err.error?.message || 'Update failed';
      return { success: false, error: msg };
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await cartService.removeItem(productId);
      if (res.success && res.data?.cart) {
        const count = res.data.cart.items.reduce((sum, it) => sum + it.quantity, 0);
        set({ cart: res.data.cart, itemCount: count });
      }
    } catch (err) {
      console.warn('Remove item failed', err);
    }
  },

  clearCart: () => {
    set({ cart: null, itemCount: 0 });
  }
}));

export const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await wishlistService.getWishlist();
      if (res.success && res.data?.wishlist) {
        set({ items: res.data.wishlist.products || [], loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const res = await wishlistService.toggleWishlist(productId);
      if (res.success && res.data?.wishlist) {
        set({ items: res.data.wishlist.products || [] });
        return { success: true, action: res.data.action };
      }
    } catch (err) {
      return { success: false };
    }
  },

  isWishlisted: (productId) => {
    const { items } = get();
    return items.some(p => (p._id || p) === productId);
  }
}));

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        set({
          notifications: res.data.notifications || [],
          unreadCount: res.data.unreadCount || 0,
          loading: false
        });
      }
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      const updated = get().notifications.map(n => n._id === id ? { ...n, read: true } : n);
      const unread = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadCount: unread });
    } catch (e) {
      console.warn(e);
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const updated = get().notifications.map(n => ({ ...n, read: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (e) {
      console.warn(e);
    }
  },

  addLiveNotification: (notif) => {
    const current = get().notifications;
    set({
      notifications: [{ ...notif, _id: Date.now().toString(), read: false, createdAt: new Date() }, ...current],
      unreadCount: get().unreadCount + 1
    });
  }
}));
