import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, ShoppingBag, DollarSign, Calendar, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { sellerService } from '../../services/services';

export const SellerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    sellerService.getAnalytics()
      .then((res) => {
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !analytics) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const salesData = analytics?.salesOverTime || [];
  const topProducts = analytics?.topProducts || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Artisan Profit & Growth Analytics (§7.7)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Audited sales performance, net margin retention, and best-selling village crafts
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base p-5 space-y-1 bg-accent-light/40 border border-accent/20">
          <span className="text-xs font-semibold text-accent-dark uppercase tracking-wider block">
            Cumulative True Net Profit
          </span>
          <span className="font-serif text-3xl font-bold text-accent-dark block">
            ₹{analytics?.actualProfit || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Net earnings retained by maker after 5% platform & 2% payment fee
          </span>
        </div>

        <div className="card-base p-5 space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
            Lifetime Sales Dispatches
          </span>
          <span className="font-serif text-3xl font-bold text-text-primary block">
            {analytics?.totalOrders || 0} Orders
          </span>
          <span className="text-[11px] text-text-secondary">
            Fulfillments across regional state hubs
          </span>
        </div>

        <div className="card-base p-5 space-y-1 bg-secondary-light/40 border border-secondary/20">
          <span className="text-xs font-semibold text-secondary-dark uppercase tracking-wider block">
            Growth Vault Locked
          </span>
          <span className="font-serif text-3xl font-bold text-secondary-dark block">
            ₹{analytics?.lockedVaultBalance || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Reserved for bulk raw material & equipment scale
          </span>
        </div>
      </div>

      {/* Sales & Profit Chart */}
      <div className="card-base p-6 space-y-4 shadow-soft">
        <h3 className="font-serif text-base font-bold text-text-primary">
          Revenue vs Net Profit Retention
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#5C6156" />
              <YAxis tick={{ fontSize: 11 }} stroke="#5C6156" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E1D8', fontSize: '12px' }}
                formatter={(val, name) => [`₹${val}`, name === 'sales' ? 'Gross Revenue' : 'True Net Profit']}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" name="Gross Revenue" stroke="#2F6F4E" strokeWidth={2} fill="#2F6F4E" fillOpacity={0.2} />
              <Area type="monotone" dataKey="profit" name="True Net Profit" stroke="#C97B3C" strokeWidth={2} fill="#C97B3C" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Best-Selling Craft Creations */}
      <div className="card-base p-6 space-y-4 shadow-soft">
        <h3 className="font-serif text-base font-bold text-text-primary">
          Top Performing Craft Products
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#5C6156" />
              <YAxis tick={{ fontSize: 11 }} stroke="#5C6156" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E1D8', fontSize: '12px' }}
                formatter={(val, name) => [val, name === 'unitsSold' ? 'Units Sold' : 'Total Revenue (₹)']}
              />
              <Bar dataKey="unitsSold" name="Units Sold" fill="#2F6F4E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
