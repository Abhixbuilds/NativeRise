import React, { useState } from 'react';
import { Check, XCircle, ShieldCheck, Store, MapPin, User, Loader2 } from 'lucide-react';
import { adminService } from '../../services/services';

export const SellerApprovalCard = ({ seller, onActionCompleted }) => {
  const [loading, setLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendInput, setShowSuspendInput] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await adminService.approveSeller(seller._id);
      onActionCompleted && onActionCompleted();
    } catch (err) {
      alert('Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    setLoading(true);
    try {
      await adminService.suspendSeller(seller._id, suspendReason || 'Administrative verification failed');
      onActionCompleted && onActionCompleted();
    } catch (err) {
      alert('Suspension failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base p-5 space-y-4 hover:border-accent/40 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h4 className="font-serif text-base font-bold text-text-primary">
            {seller.businessName}
          </h4>
          <span className="text-xs text-text-secondary">
            Category: <strong className="text-accent-dark">{seller.category}</strong>
          </span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
          seller.verificationStatus === 'pending'
            ? 'bg-amber-100 text-amber-800'
            : seller.verificationStatus === 'approved'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-rose-100 text-rose-800'
        }`}>
          {seller.verificationStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-bg-tertiary space-y-1">
          <span className="font-semibold text-text-primary flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" /> Entrepreneur Details:
          </span>
          <p className="text-text-primary">{seller.userId?.name || 'Seller'} ({seller.userId?.phone})</p>
          <p className="text-text-secondary">{seller.userId?.email}</p>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary space-y-1">
          <span className="font-semibold text-text-primary flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-secondary" /> Workshop Location:
          </span>
          <p className="text-text-secondary">
            {seller.userId?.address?.line1}, {seller.userId?.address?.city}, {seller.userId?.address?.state} ({seller.userId?.address?.pinCode})
          </p>
        </div>
      </div>

      {seller.trustCircleVouchedBy && (
        <div className="p-3 rounded-lg bg-accent-light/50 border border-accent/20 text-xs flex items-center gap-2 text-accent-dark">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>Locally Vouched By: <strong>{seller.trustCircleVouchedBy}</strong></span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-2">
        {showSuspendInput ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="Enter suspension reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border flex-1"
            />
            <button
              type="button"
              onClick={handleSuspend}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-btn"
            >
              Confirm Suspend
            </button>
            <button
              type="button"
              onClick={() => setShowSuspendInput(false)}
              className="btn-outline text-xs py-1.5 px-3"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowSuspendInput(true)}
              className="border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs py-1.5 px-3.5 rounded-btn flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Suspend</span>
            </button>

            {seller.verificationStatus !== 'approved' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Approve & Publish Catalog</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerApprovalCard;
