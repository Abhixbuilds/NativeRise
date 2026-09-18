import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Heart,
  Bell,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  Store,
  Truck,
  ShieldCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore, useWishlistStore, useNotificationStore } from '../../store/useStores';
import LanguageSwitcher from './LanguageSwitcher';

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { unreadCount } = useNotificationStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'seller': return '/seller';
      case 'delivery': return '/delivery';
      case 'admin': return '/admin';
      default: return '/customer/orders';
    }
  };

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.explore'), path: '/products' },
    { label: t('nav.howItWorks'), path: '/#how-it-works' },
    { label: t('nav.forSellers'), path: '/register?role=seller' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md group-hover:bg-accent-dark transition-all">
              <Sparkles className="w-5 h-5 text-secondary-light" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-accent-dark tracking-tight leading-tight">
                Native<span className="text-secondary">Rise</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-secondary">
                Rooted Locally • Growing Digitally
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.path ? 'text-accent font-semibold' : 'text-text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons & Controls */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Wishlist Link (Customer) */}
                {user?.role === 'customer' && (
                  <Link
                    to="/customer/wishlist"
                    className="p-2 rounded-btn hover:bg-bg-tertiary relative text-text-secondary hover:text-accent transition-colors"
                    title={t('nav.wishlist')}
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart Link (Customer) */}
                {user?.role === 'customer' && (
                  <Link
                    to="/cart"
                    className="p-2 rounded-btn hover:bg-bg-tertiary relative text-text-secondary hover:text-accent transition-colors"
                    title={t('nav.cart')}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Notifications Link */}
                <Link
                  to="/customer/notifications"
                  className="p-2 rounded-btn hover:bg-bg-tertiary relative text-text-secondary hover:text-accent transition-colors"
                  title={t('nav.notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-status-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-border hover:border-accent transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent-light text-accent-dark flex items-center justify-center font-bold text-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-text-primary leading-none max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-accent font-medium capitalize mt-0.5">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-card bg-white shadow-elevated border border-border py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
                        <p className="text-[11px] text-text-secondary truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-light text-accent-dark capitalize">
                          {user?.role} Account
                        </span>
                      </div>

                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                      >
                        {user?.role === 'seller' && <Store className="w-4 h-4 text-accent" />}
                        {user?.role === 'delivery' && <Truck className="w-4 h-4 text-secondary" />}
                        {user?.role === 'admin' && <ShieldCheck className="w-4 h-4 text-accent" />}
                        {user?.role === 'customer' && <ShoppingBag className="w-4 h-4 text-accent" />}
                        <span>{user?.role === 'customer' ? 'My Orders' : 'Go to Dashboard'}</span>
                      </Link>

                      {user?.role === 'customer' && (
                        <>
                          <Link
                            to="/customer/wishlist"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                          >
                            <Heart className="w-4 h-4 text-secondary" />
                            <span>My Wishlist</span>
                          </Link>
                          <Link
                            to="/customer/profile"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                          >
                            <UserIcon className="w-4 h-4 text-text-secondary" />
                            <span>Account Settings</span>
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-status-danger hover:bg-rose-50 transition-colors border-t border-border mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs sm:text-sm py-2 px-4"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden rounded-btn text-text-primary hover:bg-bg-tertiary"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-text-primary hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-accent"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
