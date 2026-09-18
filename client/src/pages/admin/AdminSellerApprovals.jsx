import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { adminService } from '../../services/services';
import SellerApprovalCard from '../../components/admin/SellerApprovalCard';

export const AdminSellerApprovals = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingSellers();
      if (res.success && res.data) {
        setSellers(res.data.sellers || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Seller Approval Queue (§5, §7.18)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Review new rural entrepreneur registrations, verify Community Trust Circle contacts, and publish artisan catalogs live
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">
            No Pending Approvals
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            All registered artisan businesses have been verified and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <SellerApprovalCard
              key={seller._id}
              seller={seller}
              onActionCompleted={fetchPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellerApprovals;
