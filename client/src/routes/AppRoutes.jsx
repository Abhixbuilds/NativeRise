import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import RouteGuard from './RouteGuard';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginRegisterPage from '../pages/public/LoginRegisterPage';
import BrowseMarketplace from '../pages/customer/BrowseMarketplace';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import PublicSellerProfile from '../pages/public/PublicSellerProfile';
import SupportPage from '../pages/customer/SupportPage';

// Customer Pages
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import MyOrdersPage from '../pages/customer/MyOrdersPage';
import OrderTrackingPage from '../pages/customer/OrderTrackingPage';
import WishlistPage from '../pages/customer/WishlistPage';
import NotificationsPage from '../pages/customer/NotificationsPage';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage';

// Seller Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerProducts from '../pages/seller/SellerProducts';
import SellerOrders from '../pages/seller/SellerOrders';
import SellerAnalytics from '../pages/seller/SellerAnalytics';
import SellerVault from '../pages/seller/SellerVault';
import SellerProfileEditor from '../pages/seller/SellerProfileEditor';
import SellerDisputes from '../pages/seller/SellerDisputes';

// Delivery Partner Pages
import DeliveryDashboard from '../pages/delivery/DeliveryDashboard';
import DeliveryProfile from '../pages/delivery/DeliveryProfile';

// Admin Pages
import AdminOverview from '../pages/admin/AdminOverview';
import AdminSellerApprovals from '../pages/admin/AdminSellerApprovals';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminDisputes from '../pages/admin/AdminDisputes';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/register" element={<LoginRegisterPage />} />
        <Route path="/products" element={<BrowseMarketplace />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/sellers/:id" element={<PublicSellerProfile />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Customer Protected Routes */}
        <Route path="/cart" element={<RouteGuard allowedRoles={['customer', 'seller', 'delivery', 'admin']}><CartPage /></RouteGuard>} />
        <Route path="/checkout" element={<RouteGuard allowedRoles={['customer', 'seller', 'delivery', 'admin']}><CheckoutPage /></RouteGuard>} />
        <Route path="/customer/orders" element={<RouteGuard><MyOrdersPage /></RouteGuard>} />
        <Route path="/customer/orders/:id" element={<RouteGuard><OrderTrackingPage /></RouteGuard>} />
        <Route path="/customer/wishlist" element={<RouteGuard><WishlistPage /></RouteGuard>} />
        <Route path="/customer/notifications" element={<RouteGuard><NotificationsPage /></RouteGuard>} />
        <Route path="/customer/profile" element={<RouteGuard><CustomerProfilePage /></RouteGuard>} />

        {/* Seller Protected Dashboard Routes */}
        <Route path="/seller" element={<RouteGuard allowedRoles={['seller', 'admin']}><DashboardLayout /></RouteGuard>}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="vault" element={<SellerVault />} />
          <Route path="profile" element={<SellerProfileEditor />} />
          <Route path="disputes" element={<SellerDisputes />} />
        </Route>

        {/* Delivery Partner Protected Dashboard Routes */}
        <Route path="/delivery" element={<RouteGuard allowedRoles={['delivery', 'admin']}><DashboardLayout /></RouteGuard>}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>

        {/* Admin Protected Dashboard Routes */}
        <Route path="/admin" element={<RouteGuard allowedRoles={['admin']}><DashboardLayout /></RouteGuard>}>
          <Route index element={<AdminOverview />} />
          <Route path="sellers" element={<AdminSellerApprovals />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="disputes" element={<AdminDisputes />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
