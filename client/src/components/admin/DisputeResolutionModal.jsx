import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Volume2, Loader2, DollarSign } from 'lucide-react';
import { disputeService } from '../../services/services';

export const DisputeResolutionModal = ({ dispute, isOpen, onClose, onResolved }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [triggerRefund, setTriggerRefund] = useState(false);
  const [trustCircleOutcome, setTrustCircleOutcome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('admin_resolve');

  if (!isOpen || !dispute) return null;

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await disputeService.resolveDispute(dispute._id, {
        resolutionNote,
        triggerRefund
      });
      onResolved && onResolved();
      onClose();
    } catch (err) {
      alert('Failed to resolve dispute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTrustCircle = async () => {
    setSubmitting(true);
    try {
      await disputeService.updateTrustCircleReview(dispute._id, {
        outcomeNote: trustCircleOutcome,
        escalateToAdmin: true
      });
      onResolved && onResolved();
      onClose();
    } catch (err) {
      alert('Failed to update Trust Circle review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-card shadow-elevated border border-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Dispute Redressal & Mediation (§7.13, §7.14)
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Summary */}
        <div className="p-4 rounded-xl bg-bg-tertiary border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-secondary uppercase tracking-wider text-[10px]">
              Category: <strong className="text-text-primary uppercase">{dispute.category}</strong>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 capitalize">
              {dispute.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-text-primary font-medium">{dispute.description}</p>

          {/* Voice note audio player if attached (§7.14) */}
          {dispute.voiceNoteUrl && (
            <div className="pt-2 flex items-center gap-2 bg-white p-2 rounded-lg border border-border">
              <Volume2 className="w-4 h-4 text-secondary shrink-0" />
              <audio src={`http://localhost:5000${dispute.voiceNoteUrl}`} controls className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Community Trust Circle Banner if applicable (§7.13) */}
        {dispute.mediatedBy && (
          <div className="p-3.5 rounded-xl bg-accent-light/60 border border-accent/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-accent-dark font-bold">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Community Trust Circle Assigned: {dispute.mediatedBy}</span>
            </div>
            <p className="text-text-secondary text-[11px]">
              Local Gram Panchayat / Village elder contact on file. Admin can record verbal mediation outcome before issuing executive decision.
            </p>
          </div>
        )}

        {/* Resolution Tabs */}
        <form onSubmit={handleResolve} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-secondary mb-1">
              Admin Resolution Finding & Instructions
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Verified with regional sorting hub. Replacement dispatched / Refund approved."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
              required
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-bg-tertiary cursor-pointer">
            <input
              type="checkbox"
              checked={triggerRefund}
              onChange={(e) => setTriggerRefund(e.target.checked)}
              className="w-4 h-4 accent-accent rounded"
            />
            <div>
              <span className="font-bold text-text-primary block">
                Trigger Full Customer Refund & Restock Inventory
              </span>
              <span className="text-[11px] text-text-secondary">
                Updates payment to 'refunded' and returns quantities to artisan's active catalog.
              </span>
            </div>
          </label>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-outline py-2 px-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-2 px-5 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Execute & Close Dispute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeResolutionModal;
