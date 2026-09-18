import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import StatusDot from '../../components/common/StatusDot';
import ProfitBreakdownTable from '../../components/seller/ProfitBreakdownTable';
import { orderService } from '../../services/services';

export const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // new | accepted | ready | in_transit | delivered | rejected
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleSync = () => fetchOrders();
    window.addEventListener('nativerise:sync', handleSync);
    return () => window.removeEventListener('nativerise:sync', handleSync);
  }, []);

  const handleAccept = async (orderId) => {
    setActionLoading(true);
    try {
      await orderService.acceptOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert('Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please select / enter rejection reason (e.g. Out of stock / Cannot fulfill):', 'Out of stock');
    if (reason) {
      setActionLoading(true);
      try {
        await orderService.rejectOrder(orderId, reason);
        fetchOrders();
      } catch (err) {
        alert('Failed to reject order');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleMarkReady = async (orderId) => {
    setActionLoading(true);
    try {
      await orderService.markReadyForPickup(orderId);
      fetchOrders();
    } catch (err) {
      alert('Failed to mark ready for pickup');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'placed';
    if (activeTab === 'accepted') return o.status === 'accepted';
    if (activeTab === 'ready') return o.status === 'ready_for_pickup';
    if (activeTab === 'in_transit') return ['picked_up', 'in_transit'].includes(o.status);
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'rejected') return ['rejected', 'cancelled', 'refunded'].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Order Fulfillment & Dispatches
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Accept incoming dispatches, mark packages ready for hub agent, and inspect true profit
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-bg-tertiary p-1 rounded-xl border border-border overflow-x-auto">
          {[
            { key: 'new', label: 'New Orders' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'ready', label: 'Ready for Hub' },
            { key: 'in_transit', label: 'In Transit' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'rejected', label: 'Declined/Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-accent-dark shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">
            No Orders in "{activeTab.toUpperCase()}" Status
          </h3>
          <p className="text-xs text-text-secondary">
            Switch tabs or wait for customer checkout notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = order.items || [];
            const itemsSum = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

            return (
              <div
                key={order._id}
                className="card-base p-5 space-y-4 hover:border-accent/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm text-text-primary">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusDot status={order.status} />
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ₹{order.profitBreakdown?.actualProfit || 0} True Profit
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <p className="font-medium text-text-primary">
                      {items.map((it) => `${it.name} x ${it.quantity}`).join(', ')}
                    </p>
                    <p className="text-text-secondary text-[11px]">
                      Customer: {order.customerId?.name} ({order.customerId?.address?.city || 'Regional Hub Area'})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {order.status === 'placed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(order._id)}
                          disabled={actionLoading}
                          className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(order._id)}
                          disabled={actionLoading}
                          className="border border-rose-200 text-rose-700 hover:bg-rose-50 py-1.5 px-3 rounded-btn text-xs"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => handleMarkReady(order._id)}
                        disabled={actionLoading}
                        className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup (§7.6)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedOrderForDrawer(order)}
                      className="btn-outline py-1.5 px-3 text-xs"
                    >
                      Profit & Checkpoints
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail & True Profit Breakdown Drawer */}
      {selectedOrderForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-card shadow-elevated border border-border p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Order #{selectedOrderForDrawer._id.slice(-6).toUpperCase()} Ledger & Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderForDrawer(null)}
                className="text-text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <ProfitBreakdownTable
                breakdown={selectedOrderForDrawer.profitBreakdown}
                itemsTotal={selectedOrderForDrawer.items?.reduce((s, it) => s + it.price * it.quantity, 0)}
              />

              {/* Checkpoint history */}
              <div className="card-base p-4 space-y-2 text-xs bg-bg-tertiary border border-border">
                <span className="font-bold text-text-primary block">Checkpoint Transitions</span>
                <div className="space-y-1.5">
                  {selectedOrderForDrawer.checkpoints?.map((cp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-text-primary">{cp.status?.replace(/_/g, ' ')}</span>
                      <span className="text-text-secondary">{cp.location} ({new Date(cp.timestamp).toLocaleTimeString()})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
