import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Store,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { adminService } from '../../services/services';

export const AdminOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getAnalytics()
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Platform Administrator Dashboard (§7.18)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          High-level oversight of seller moderation, gross merchandise volume (GMV), order ledger, and dispute redressal
        </p>
      </div>

      {/* 4 Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5 space-y-1 bg-accent-light/40 border border-accent/20">
          <span className="text-xs font-semibold text-accent-dark uppercase tracking-wider block">
            Approved Sellers
          </span>
          <span className="font-serif text-3xl font-bold text-accent-dark block">
            {analytics?.totalSellers || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Rural craft producers live on marketplace
          </span>
        </div>

        <div className="card-base p-5 space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
            Total Orders Logged
          </span>
          <span className="font-serif text-3xl font-bold text-text-primary block">
            {analytics?.totalOrders || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Platform dispatches fulfilled & in transit
          </span>
        </div>

        <div className="card-base p-5 space-y-1 bg-secondary-light/40 border border-secondary/20">
          <span className="text-xs font-semibold text-secondary-dark uppercase tracking-wider block">
            Gross Merch. Value (GMV)
          </span>
          <span className="font-serif text-3xl font-bold text-secondary-dark block">
            ₹{analytics?.gmv?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Total rural economic volume transacted
          </span>
        </div>

        <div className="card-base p-5 space-y-1 bg-rose-50 border border-rose-200">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
            Open Inquiries & Disputes
          </span>
          <span className="font-serif text-3xl font-bold text-rose-800 block">
            {analytics?.openDisputes || 0}
          </span>
          <span className="text-[11px] text-text-secondary">
            Pending Community Trust / Admin review
          </span>
        </div>
      </div>

      {/* Action Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 space-y-4 hover:border-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Seller Approval Queue</h3>
              <p className="text-[11px] text-text-secondary">{analytics?.pendingSellersCount || 0} pending review</p>
            </div>
          </div>
          <Link to="/admin/sellers" className="btn-primary py-2 px-4 text-xs flex items-center justify-between w-full shadow-xs">
            <span>Review Applications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card-base p-6 space-y-4 hover:border-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Dispute Redressal</h3>
              <p className="text-[11px] text-text-secondary">{analytics?.openDisputes || 0} active cases</p>
            </div>
          </div>
          <Link to="/admin/disputes" className="btn-secondary py-2 px-4 text-xs flex items-center justify-between w-full shadow-xs">
            <span>Mediate Grievances</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card-base p-6 space-y-4 hover:border-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Payment & Float Audits</h3>
              <p className="text-[11px] text-text-secondary">COD ledger & reconciliations</p>
            </div>
          </div>
          <Link to="/admin/payments" className="btn-outline py-2 px-4 text-xs flex items-center justify-between w-full">
            <span>Audit Ledgers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
