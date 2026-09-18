import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Lock,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import StatCard from '../../components/seller/StatCard';
import StatusDot from '../../components/common/StatusDot';
import { sellerService, orderService } from '../../services/services';

export const SellerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        sellerService.getAnalytics(),
        orderService.getOrders({ limit: 5 })
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data?.orders || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleSync = () => fetchData();
    window.addEventListener('nativerise:sync', handleSync);
    return () => window.removeEventListener('nativerise:sync', handleSync);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      await orderService.acceptOrder(orderId);
      fetchData();
    } catch (err) {
      alert('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Please enter decline reason:', 'Out of stock');
    if (reason) {
      try {
        await orderService.rejectOrder(orderId, reason);
        fetchData();
      } catch (err) {
        alert('Failed to reject order');
      }
    }
  };

  if (loading && !analytics) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  const salesData = analytics?.salesOverTime || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Artisan Business Overview
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time sales, true profit margin, and hub dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/seller/products" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs">
            <Package className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link to="/seller/vault" className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>Growth Vault</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${analytics?.todaySales || 0}`}
          subtitle="Orders received today"
          icon={TrendingUp}
          color="accent"
        />
        <StatCard
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          subtitle="Lifetime dispatches"
          icon={ShoppingBag}
          color="secondary"
        />
        <StatCard
          title="Pending Orders"
          value={analytics?.pendingOrders || 0}
          subtitle="Awaiting fulfillment"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="True Net Profit"
          value={`₹${analytics?.actualProfit || 0}`}
          subtitle="After materials & fees"
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Sales & Profit Trend Graph (Recharts) */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-text-primary">
              Sales & True Profit Trend
            </h3>
            <p className="text-xs text-text-secondary">Revenue vs True Net Profit credited</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F6F4E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2F6F4E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C97B3C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C97B3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#5C6156" />
              <YAxis tick={{ fontSize: 11 }} stroke="#5C6156" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E1D8', fontSize: '12px' }}
                formatter={(val, name) => [`₹${val}`, name === 'sales' ? 'Revenue' : 'Net Profit']}
              />
              <Area type="monotone" dataKey="sales" stroke="#2F6F4E" strokeWidth={2} fillOpacity={1} fill="url(#salesColor)" />
              <Area type="monotone" dataKey="profit" stroke="#C97B3C" strokeWidth={2} fillOpacity={1} fill="url(#profitColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-serif text-base font-bold text-text-primary">
            Recent Orders & Dispatch Requests
          </h3>
          <Link to="/seller/orders" className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center py-8 text-xs text-text-secondary">No recent incoming orders.</p>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <StatusDot status={order.status} />
                  </div>
                  <p className="text-text-secondary">
                    {order.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                  </p>
                  <span className="text-[11px] text-accent font-semibold">
                    Net Profit on Order: ₹{order.profitBreakdown?.actualProfit || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'placed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptOrder(order._id)}
                        className="btn-primary py-1 px-3 text-xs flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectOrder(order._id)}
                        className="border border-rose-200 text-rose-700 hover:bg-rose-50 py-1 px-3 rounded-btn text-xs"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <Link
                    to="/seller/orders"
                    className="btn-outline py-1 px-3 text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
