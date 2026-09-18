import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Volume2, Loader2, MessageSquare } from 'lucide-react';
import { disputeService } from '../../services/services';

export const SellerDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await disputeService.getDisputes();
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Customer Disputes & Community Mediation (§7.13)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Inquiries and grievances reviewed via your Community Trust Circle and platform administrators
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">Clean Record — Zero Active Inquiries</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            All your package deliveries and dispatches are verified in good standing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="card-base p-5 space-y-3 border hover:border-accent/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-accent-dark">
                    Order #{dispute.orderId?._id ? dispute.orderId._id.slice(-6).toUpperCase() : 'N/A'}
                  </span>
                  <span className="text-text-secondary">• Category: <strong>{dispute.category}</strong></span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 capitalize">
                  {dispute.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-text-primary leading-relaxed">{dispute.description}</p>

              {dispute.voiceNoteUrl && (
                <div className="flex items-center gap-2 bg-bg-tertiary p-2 rounded-lg border border-border">
                  <Volume2 className="w-4 h-4 text-secondary shrink-0" />
                  <audio src={`http://localhost:5000${dispute.voiceNoteUrl}`} controls className="w-full h-8" />
                </div>
              )}

              {dispute.resolutionNote && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold block">Resolution Finding:</span>
                  <p>{dispute.resolutionNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDisputes;
