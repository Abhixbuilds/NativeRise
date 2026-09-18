import { create } from 'zustand';
import { authService } from '../services/authService';
import i18n from '../i18n';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('nativerise_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('nativerise_access_token') || null,
  isAuthenticated: !!localStorage.getItem('nativerise_access_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { user, accessToken } = res.data;
        localStorage.setItem('nativerise_access_token', accessToken);
        localStorage.setItem('nativerise_user', JSON.stringify(user));
        if (user.preferredLanguage) {
          localStorage.setItem('nativerise_preferred_language', user.preferredLanguage);
          i18n.changeLanguage(user.preferredLanguage);
        }
        set({ user, token: accessToken, isAuthenticated: true, loading: false });
        return { success: true, user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const message = err.error?.message || err.message || 'Invalid credentials';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        const { user, accessToken } = res.data;
        localStorage.setItem('nativerise_access_token', accessToken);
        localStorage.setItem('nativerise_user', JSON.stringify(user));
        if (user.preferredLanguage) {
          localStorage.setItem('nativerise_preferred_language', user.preferredLanguage);
          i18n.changeLanguage(user.preferredLanguage);
        }
        set({ user, token: accessToken, isAuthenticated: true, loading: false });
        return { success: true, user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const message = err.error?.message || err.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout error ignored', e);
    }
    localStorage.removeItem('nativerise_access_token');
    localStorage.removeItem('nativerise_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updatePreferredLanguage: async (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('nativerise_preferred_language', code);
    const { user } = get();
    if (user) {
      try {
        await authService.updateLanguage(code);
        const updated = { ...user, preferredLanguage: code };
        localStorage.setItem('nativerise_user', JSON.stringify(updated));
        set({ user: updated });
      } catch (e) {
        console.warn('Failed to persist language to backend:', e);
      }
    }
  },

  fetchUserProfile: async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        localStorage.setItem('nativerise_user', JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch (e) {
      console.warn('Failed to fetch user profile:', e);
    }
  }
}));
