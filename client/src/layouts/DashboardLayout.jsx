import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Lock,
  User,
  AlertCircle,
  Truck,
  ShieldCheck,
  CreditCard,
  Settings,
  Store
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'seller':
        return [
          { label: 'Overview', path: '/seller', icon: LayoutDashboard },
          { label: 'Products & Snap-Sell', path: '/seller/products', icon: Package },
          { label: 'Order Fulfillment', path: '/seller/orders', icon: ShoppingBag },
          { label: 'Profit Analytics', path: '/seller/analytics', icon: TrendingUp },
          { label: 'Growth Vault', path: '/seller/vault', icon: Lock },
          { label: 'Disputes & Feedback', path: '/seller/disputes', icon: AlertCircle },
          { label: 'Artisan Profile & Trust', path: '/seller/profile', icon: User }
        ];
      case 'delivery':
        return [
          { label: 'Hub Assignments', path: '/delivery', icon: Truck },
          { label: 'Return Pickups', path: '/delivery#backhaul', icon: Package },
          { label: 'Hub Profile', path: '/delivery/profile', icon: User }
        ];
      case 'admin':
        return [
          { label: 'Platform Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'Seller Approvals', path: '/admin/sellers', icon: Store },
          { label: 'Platform Orders', path: '/admin/orders', icon: ShoppingBag },
          { label: 'Payment & Float Audits', path: '/admin/payments', icon: CreditCard },
          { label: 'Dispute Redressal', path: '/admin/disputes', icon: ShieldCheck }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1">
          <div className="card-base p-4 space-y-4 sticky top-28">
            <div className="p-3 rounded-xl bg-accent-light text-accent-dark flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-serif font-bold text-sm text-text-primary truncate">{user?.name}</p>
                <span className="text-[11px] font-semibold text-accent-dark capitalize block">
                  {user?.role} Portal
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-xs font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Dashboard Main Content */}
        <main className="lg:col-span-3 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
