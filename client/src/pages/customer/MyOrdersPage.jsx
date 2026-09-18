import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import StatusDot from '../../components/common/StatusDot';
import { orderService } from '../../services/services';

export const MyOrdersPage = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | active | delivered | cancelled

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

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') {
      return ['placed', 'accepted', 'ready_for_pickup', 'picked_up', 'in_transit'].includes(o.status);
    }
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'cancelled') return ['cancelled', 'rejected', 'refunded'].includes(o.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Notification Banner on recent checkout */}
      {location.state?.orderSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm block">Checkout Completed Successfully!</span>
              <span className="text-[11px] text-emerald-800">
                Your payment was processed and split into {location.state?.orderCount || 1} independent artisan order(s).
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase bg-emerald-200 px-2 py-0.5 rounded text-emerald-900">
            Split Captured
          </span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
            My Orders & Dispatches
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Track multi-stage hub checkpoints, manage cancellations, and review delivered crafts
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-bg-tertiary p-1 rounded-xl border border-border">
          {['all', 'active', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-accent-dark shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card-base p-16 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-text-primary">No Orders in this View</h3>
          <p className="text-xs text-text-secondary">
            Explore authentic GI-tagged rural products and place your first order.
          </p>
          <Link to="/products" className="btn-primary text-xs inline-flex">Explore Marketplace</Link>
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
                    <span className="text-text-secondary text-xs">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusDot status={order.status} />
                    <StatusDot status={order.paymentId?.status || 'pending'} showLabel={false} />
                  </div>
                </div>

                {/* Items & Seller Preview */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-accent-dark block">
                      Artisan: {order.sellerId?.businessName || 'Rural Workshop'}
                    </span>
                    <p className="text-xs text-text-primary">
                      {items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                    </p>
                    <span className="text-[11px] text-text-secondary">
                      Delivery fee: ₹{order.deliveryCost} • Total: <strong>₹{itemsSum + (order.deliveryCost || 0)}</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/customer/orders/${order._id}`}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Journey</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
