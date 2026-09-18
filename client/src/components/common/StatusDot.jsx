import React from 'react';

/**
 * Color-Coded Payment & Order Status Indicator (§4.1, §7.10)
 * 🔴 Red for pending/failed
 * 🟡 Yellow for processing
 * 🟢 Green for received/refunded/delivered
 * 🔵 Blue for in_transit/picked_up/ready_for_pickup
 */
export const StatusDot = ({ status = 'pending', showLabel = true, className = '' }) => {
  const normalized = (status || '').toLowerCase();

  let colorClass = 'bg-status-warning';
  let pulseClass = '';
  let labelText = status;

  switch (normalized) {
    case 'received':
    case 'delivered':
    case 'approved':
      colorClass = 'bg-status-success text-emerald-800 bg-emerald-50 border-emerald-200';
      labelText = normalized === 'received' ? 'Paid / Received' : (normalized === 'delivered' ? 'Delivered' : 'Approved');
      break;
    case 'refunded':
      colorClass = 'bg-emerald-600 text-emerald-900 bg-emerald-50 border-emerald-300';
      labelText = 'Refunded';
      break;
    case 'processing':
    case 'in_transit':
    case 'picked_up':
    case 'ready_for_pickup':
    case 'accepted':
    case 'under_trust_circle_review':
    case 'under_admin_review':
      colorClass = 'bg-status-warning text-amber-900 bg-amber-50 border-amber-200';
      pulseClass = 'animate-pulse';
      labelText = normalized.replace(/_/g, ' ');
      break;
    case 'pending':
    case 'placed':
    case 'open':
      colorClass = 'bg-amber-500 text-amber-800 bg-amber-50 border-amber-200';
      labelText = normalized === 'placed' ? 'Order Placed' : 'Pending';
      break;
    case 'failed':
    case 'rejected':
    case 'cancelled':
    case 'suspended':
      colorClass = 'bg-status-danger text-rose-800 bg-rose-50 border-rose-200';
      labelText = normalized.replace(/_/g, ' ');
      break;
    default:
      colorClass = 'bg-gray-400 text-gray-700 bg-gray-50 border-gray-200';
      labelText = status;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} capitalize ${className}`}>
      <span className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]} ${pulseClass}`} />
      {showLabel && <span>{labelText}</span>}
    </div>
  );
};

export default StatusDot;
