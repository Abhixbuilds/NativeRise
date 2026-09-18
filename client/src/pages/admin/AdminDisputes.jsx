import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Volume2, CheckCircle2, User, Loader2 } from 'lucide-react';
import StatusDot from '../../components/common/StatusDot';
import DisputeResolutionModal from '../../components/admin/DisputeResolutionModal';
import { disputeService } from '../../services/services';

export const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDisputeForResolve, setSelectedDisputeForResolve] = useState(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await disputeService.getDisputes({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success && res.data) {
        setDisputes(res.data.disputes || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Dispute Redressal & Mediation Center (§7.13, §7.14)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Mediate grievances with Community Trust Circles and execute verified refunds
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-white"
        >
          <option value="all">All Inquiries</option>
          <option value="open">Open</option>
          <option value="under_trust_circle_review">Under Trust Circle Review</option>
          <option value="under_admin_review">Under Admin Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">
            No Active Inquiries
          </h3>
          <p className="text-xs text-text-secondary">
            All customer and seller issues are currently resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="card-base p-5 space-y-4 hover:border-accent/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-serif font-bold text-sm text-accent-dark">
                    Dispute #{dispute._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-text-secondary">• Category: <strong>{dispute.category}</strong></span>
                </div>

                <StatusDot status={dispute.status} />
              </div>

              {/* Inquiry details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-text-secondary text-[11px]">
                  <span>Raised By: <strong>{dispute.raisedBy?.name}</strong> ({dispute.raisedBy?.role})</span>
                  <span>• Order: <strong>#{dispute.orderId?._id?.slice(-6) || 'N/A'}</strong></span>
                </div>

                <p className="text-text-primary bg-bg-tertiary p-3 rounded-lg border border-border leading-relaxed">
                  {dispute.description}
                </p>

                {/* Voice Note Player (§7.14) */}
                {dispute.voiceNoteUrl && (
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-border">
                    <Volume2 className="w-4 h-4 text-secondary shrink-0" />
                    <span className="text-[11px] font-semibold text-text-secondary shrink-0">Voice Grievance:</span>
                    <audio src={`http://localhost:5000${dispute.voiceNoteUrl}`} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              {/* Community Trust Circle Endorsement (§7.13) */}
              {dispute.mediatedBy && (
                <div className="p-3 rounded-lg bg-accent-light/50 border border-accent/20 text-xs flex items-center justify-between text-accent-dark">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Locally Vouched Seller • Trust Circle: <strong>{dispute.mediatedBy}</strong></span>
                  </div>
                </div>
              )}

              {/* Resolution Action */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                {dispute.resolutionNote ? (
                  <span className="text-xs text-emerald-800 font-medium">
                    Resolved: {dispute.resolutionNote}
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary">
                    Pending administrative adjudication
                  </span>
                )}

                {dispute.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDisputeForResolve(dispute)}
                    className="btn-primary text-xs py-1.5 px-4 shadow-xs"
                  >
                    Resolve & Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <DisputeResolutionModal
        dispute={selectedDisputeForResolve}
        isOpen={!!selectedDisputeForResolve}
        onClose={() => setSelectedDisputeForResolve(null)}
        onResolved={fetchDisputes}
      />
    </div>
  );
};

export default AdminDisputes;
