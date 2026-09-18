import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Star,
  XCircle,
  Store,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { orderService } from '../../services/services';
import StatusDot from '../../components/common/StatusDot';
import CheckpointTimeline from '../../components/customer/CheckpointTimeline';
import DisputeModal from '../../components/customer/DisputeModal';
import ReviewModal from '../../components/customer/ReviewModal';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed mind');
  const [actionMsg, setActionMsg] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const handleSync = (e) => {
      if (e.detail?.data?.orderId === id || !e.detail?.data?.orderId) {
        fetchOrder();
      }
    };
    window.addEventListener('nativerise:sync', handleSync);
    return () => window.removeEventListener('nativerise:sync', handleSync);
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      const res = await orderService.cancelOrder(order._id, cancelReason);
      if (res.success) {
        setShowCancelConfirm(false);
        setActionMsg(
          order.status === 'placed' || order.status === 'accepted'
            ? 'Order cancelled and full refund processed automatically!'
            : 'Cancellation request submitted for administrative dispute review.'
        );
        fetchOrder();
      }
    } catch (err) {
      alert(err.error?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">Order Not Found</h2>
        <Link to="/customer/orders" className="btn-primary inline-flex text-xs">Return to My Orders</Link>
      </div>
    );
  }

  const items = order.items || [];
  const itemsSum = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const grandTotal = itemsSum + (order.deliveryCost || 0);

  const canCancel = ['placed', 'accepted', 'ready_for_pickup', 'picked_up', 'in_transit'].includes(order.status);
  const isDelivered = order.status === 'delivered';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/customer/orders" className="p-2 rounded-btn hover:bg-bg-tertiary text-text-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-accent-dark">
                Order #{order._id.slice(-6).toUpperCase()}
              </h1>
              <StatusDot status={order.status} />
              <StatusDot status={order.paymentId?.status || 'pending'} />
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} • Verified Rural Package
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs py-2 px-3.5 rounded-btn flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDisputeModalOpen(true)}
            className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Raise Issue / Voice Note</span>
          </button>

          {isDelivered && (
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-current text-amber-300" />
              <span>Rate & Review</span>
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-accent-light text-accent-dark text-xs font-bold border border-accent/20">
          {actionMsg}
        </div>
      )}

      {/* Main Tracking & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkpoints & Logistics Flow */}
        <div className="lg:col-span-8 space-y-6">
          <CheckpointTimeline
            checkpoints={order.checkpoints}
            status={order.status}
            weatherAdjustedDelay={order.weatherAdjustedDelay}
            etaEstimate={order.etaEstimate}
          />

          {/* Items Summary Table */}
          <div className="card-base p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-text-primary border-b border-border pb-3">
              Package Contents & Artisan Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-dark">
                <Store className="w-4 h-4" />
                <span>Craft Workshop: {order.sellerId?.businessName}</span>
              </div>

              <div className="divide-y divide-border">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">{item.name} x {item.quantity}</span>
                    <span className="font-bold text-text-primary">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Payment & Hub Route Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-base p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-text-primary border-b border-border pb-3">
              Payment & Logistics Ledger
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Items Total</span>
                <span className="font-semibold text-text-primary">₹{itemsSum}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Unified Delivery Fee</span>
                <span className="font-semibold text-text-primary">₹{order.deliveryCost}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Payment Mode</span>
                <span className="font-semibold text-text-primary uppercase">{order.paymentId?.paymentMode || 'Online'}</span>
              </div>
              <div className="pt-3 border-t border-border flex items-baseline justify-between text-sm">
                <span className="font-serif font-bold text-text-primary">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-accent-dark">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card-base p-6 space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-secondary" /> Drop Destination
            </h4>
            <p className="text-text-primary font-medium">{order.customerId?.name}</p>
            <p className="text-text-secondary leading-relaxed">
              {order.customerId?.address?.line1}, {order.customerId?.address?.city}, {order.customerId?.address?.state} ({order.customerId?.address?.pinCode})
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card shadow-elevated border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-serif text-base font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Cancel Order
              </h4>
              <button onClick={() => setShowCancelConfirm(false)} className="text-text-secondary">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-secondary">
                {['placed', 'accepted'].includes(order.status)
                  ? 'Since package is not yet packed for pickup, your payment will be refunded immediately.'
                  : 'Package is already prepared. Cancellation will initiate an administrative dispute review.'}
              </p>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-white"
                >
                  <option value="Changed mind">Changed mind</option>
                  <option value="Delivery duration too long">Delivery duration too long</option>
                  <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-outline py-1.5 px-3"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-1.5 px-4 rounded-btn text-xs flex items-center gap-1.5"
                >
                  {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        orderId={order._id}
        onDisputeCreated={() => {
          setActionMsg('Your grievance has been submitted for Community Trust Circle and Admin resolution.');
          fetchOrder();
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        orderId={order._id}
        targetType="product"
        targetId={items[0]?.productId}
        title={items[0]?.name}
        onReviewSubmitted={() => {
          setActionMsg('Thank you for rating this handcrafted creation!');
          fetchOrder();
        }}
      />
    </div>
  );
};

export default OrderTrackingPage;
