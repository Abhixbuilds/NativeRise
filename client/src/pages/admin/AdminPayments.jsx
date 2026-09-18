import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, ShieldCheck, Sliders, CheckCircle, Loader2 } from 'lucide-react';
import StatusDot from '../../components/common/StatusDot';
import { adminService } from '../../services/services';

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // COD float adjust modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success && res.data) {
        setPayments(res.data.payments || []);
        setDeliveryPartners(res.data.deliveryPartners || []);
        if (res.data.deliveryPartners?.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(res.data.deliveryPartners[0]._id);
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleAdjustFloat = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId || !adjustmentAmount) return;

    setSubmitting(true);
    setMsg('');
    try {
      const res = await adminService.adjustCodFloat({
        partnerId: selectedPartnerId,
        adjustmentAmount: Number(adjustmentAmount),
        note: 'Admin hub cash settlement'
      });
      if (res.success) {
        setMsg('COD Float ledger adjusted successfully!');
        setAdjustModalOpen(false);
        setAdjustmentAmount('');
        fetchPayments();
      }
    } catch (err) {
      alert('Float adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Payment & COD Float Audits (§7.9, §7.10)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit gateway captures, refunds, and reconcile physical COD cash balances collected by Hub Agents
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdjustModalOpen(true)}
          className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Adjust Hub COD Float</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-accent-light text-accent-dark text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Delivery Partner Float Balances Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliveryPartners.map((dp) => (
          <div key={dp._id} className="card-base p-4 space-y-1 bg-secondary-light/30 border border-secondary/20 text-xs">
            <span className="font-bold text-text-primary block">{dp.userId?.name || 'Hub Agent'}</span>
            <span className="text-[11px] text-text-secondary block">Zone: {dp.serviceZone}</span>
            <div className="pt-2 flex items-baseline justify-between border-t border-secondary/15">
              <span className="text-text-secondary">Float Balance:</span>
              <span className="font-serif text-base font-bold text-secondary-dark">₹{dp.codFloatBalance || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card-base p-16 text-center text-xs text-text-secondary">
          No payments recorded under this filter.
        </div>
      ) : (
        <div className="card-base p-0 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Payment ID</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Reconciled By</th>
                  <th className="px-4 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-bg-tertiary/40">
                    <td className="px-5 py-4 font-mono font-bold text-accent-dark">
                      {p.razorpayPaymentId || `#${p._id.slice(-6)}`}
                    </td>

                    <td className="px-4 py-4 uppercase font-bold text-[11px] text-text-secondary">
                      {p.paymentMode}
                    </td>

                    <td className="px-4 py-4 font-bold text-text-primary">
                      ₹{p.amount}
                    </td>

                    <td className="px-4 py-4">
                      <StatusDot status={p.status} />
                    </td>

                    <td className="px-4 py-4 text-text-secondary">
                      {p.reconciledBy ? (
                        <span className="text-emerald-800 font-medium">
                          Agent #{p.reconciledBy._id?.slice(-4) || 'HUB'}
                        </span>
                      ) : (
                        'Gateway Verified'
                      )}
                    </td>

                    <td className="px-4 py-4 text-[11px] text-text-secondary">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Float Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card shadow-elevated border border-border p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-text-primary border-b border-border pb-3">
              Adjust Hub Agent COD Float Balance
            </h3>

            <form onSubmit={handleAdjustFloat} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">Select Delivery Hub Partner</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white"
                >
                  {deliveryPartners.map((dp) => (
                    <option key={dp._id} value={dp._id}>
                      {dp.userId?.name} ({dp.serviceZone}) - Current: ₹{dp.codFloatBalance || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Adjustment Amount (Use negative value for cash deposited/settled)
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="e.g. -1500 (for deposit)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="btn-outline py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-1.5 px-4"
                >
                  {submitting ? 'Saving...' : 'Apply Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
