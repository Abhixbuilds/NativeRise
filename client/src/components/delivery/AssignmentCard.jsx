import React, { useState } from 'react';
import { Truck, MapPin, Store, User, Banknote, CheckCircle, Navigation, Loader2 } from 'lucide-react';
import StatusDot from '../common/StatusDot';
import { orderService } from '../../services/services';

export const AssignmentCard = ({ order, onUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('REACHED_REGIONAL_HUB');
  const [confirmingCod, setConfirmingCod] = useState(false);

  const isCod = order.paymentId?.paymentMode === 'cod';
  const isCodPaid = order.paymentId?.status === 'received';

  const handleUpdateCheckpoint = async () => {
    setUpdating(true);
    try {
      await orderService.updateCheckpoint(order._id, 'Transit Hub Station', selectedCheckpoint);
      onUpdated && onUpdated();
    } catch (err) {
      alert('Checkpoint update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmCod = async () => {
    setConfirmingCod(true);
    try {
      await orderService.confirmCodPayment(order._id);
      onUpdated && onUpdated();
    } catch (err) {
      alert('COD reconciliation failed');
    } finally {
      setConfirmingCod(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (isCod && !isCodPaid) {
      alert('You must confirm Cash Collected before marking the order delivered.');
      return;
    }
    setUpdating(true);
    try {
      await orderService.markDelivered(order._id);
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.error?.message || 'Failed to mark delivered');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptAssignment = async () => {
    setUpdating(true);
    try {
      await orderService.assignDelivery(order._id);
      onUpdated && onUpdated();
    } catch (err) {
      alert('Failed to accept pickup assignment');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card-base p-5 space-y-4 hover:border-accent/50 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-sm text-text-primary">
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[11px] text-text-secondary block">
              {order.items?.length || 0} Package Item(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusDot status={order.status} />
          {isCod && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isCodPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}>
              {isCodPaid ? 'COD Collected' : 'COD Pending (₹' + (order.paymentId?.amount || 0) + ')'}
            </span>
          )}
        </div>
      </div>

      {/* Origin -> Destination Route Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Pickup Origin */}
        <div className="p-3 rounded-xl bg-bg-tertiary space-y-1">
          <div className="flex items-center gap-1.5 text-accent font-semibold">
            <Store className="w-3.5 h-3.5" />
            <span>Pickup From Artisan:</span>
          </div>
          <p className="font-medium text-text-primary">{order.sellerId?.businessName || 'Artisan Workshop'}</p>
          <p className="text-text-secondary text-[11px]">
            {order.sellerId?.userId?.address?.city || 'Regional Hub District'}
          </p>
        </div>

        {/* Drop Destination */}
        <div className="p-3 rounded-xl bg-bg-tertiary space-y-1">
          <div className="flex items-center gap-1.5 text-secondary font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>Customer Drop-off:</span>
          </div>
          <p className="font-medium text-text-primary">{order.customerId?.name || 'Customer'}</p>
          <p className="text-text-secondary text-[11px]">
            {order.customerId?.address?.line1}, {order.customerId?.address?.city} ({order.customerId?.address?.pinCode})
          </p>
        </div>
      </div>

      {/* Hub Actions */}
      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3">
        {order.status === 'ready_for_pickup' && (
          <button
            type="button"
            onClick={handleAcceptAssignment}
            disabled={updating}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>Accept Pickup & Start Route</span>
          </button>
        )}

        {(order.status === 'picked_up' || order.status === 'in_transit') && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Checkpoint selector (§7.3) */}
            <select
              value={selectedCheckpoint}
              onChange={(e) => setSelectedCheckpoint(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-border bg-white"
            >
              <option value="REACHED_REGIONAL_HUB">Reached Regional Sorting Hub</option>
              <option value="DEPARTED_FOR_LAST_MILE">Departed for Last-Mile Delivery</option>
              <option value="OUT_FOR_DOORSTEP_DELIVERY">Out for Doorstep Delivery</option>
            </select>

            <button
              type="button"
              onClick={handleUpdateCheckpoint}
              disabled={updating}
              className="btn-outline text-xs py-2 px-3"
            >
              Update Checkpoint
            </button>
          </div>
        )}

        {/* COD cash confirm button (§7.9) */}
        {isCod && !isCodPaid && order.status !== 'ready_for_pickup' && (
          <button
            type="button"
            onClick={handleConfirmCod}
            disabled={confirmingCod}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            {confirmingCod ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
            <span>Confirm Cash Collected (₹{order.paymentId?.amount})</span>
          </button>
        )}

        {/* Mark delivered button */}
        {['picked_up', 'in_transit'].includes(order.status) && (
          <button
            type="button"
            onClick={handleMarkDelivered}
            disabled={updating || (isCod && !isCodPaid)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 ml-auto"
            title={isCod && !isCodPaid ? 'Confirm COD cash collection first' : 'Complete Delivery'}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark Delivered</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
