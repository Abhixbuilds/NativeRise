import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Loader2, ArrowUpDown } from 'lucide-react';
import StatusDot from '../../components/common/StatusDot';
import { adminService } from '../../services/services';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 20
      });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.totalResults || 0);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Platform Orders & Dispatch Ledger
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Read-only platform-wide fulfillment audit across all rural makers and hubs
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-border bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="accepted">Accepted</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card-base p-16 text-center text-xs text-text-secondary">
          No orders logged under this filter.
        </div>
      ) : (
        <div className="card-base p-0 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Seller Workshop</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Order Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => {
                  const itemsSum = o.items?.reduce((sum, it) => sum + it.price * it.quantity, 0) || 0;
                  const total = itemsSum + (o.deliveryCost || 0);

                  return (
                    <tr key={o._id} className="hover:bg-bg-tertiary/40">
                      <td className="px-5 py-4 font-mono font-bold text-accent-dark">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-text-primary block">{o.customerId?.name}</span>
                        <span className="text-[11px] text-text-secondary">{o.customerId?.email}</span>
                      </td>

                      <td className="px-4 py-4 font-medium text-text-secondary">
                        {o.sellerId?.businessName}
                      </td>

                      <td className="px-4 py-4 font-bold text-text-primary">
                        ₹{total}
                      </td>

                      <td className="px-4 py-4">
                        <StatusDot status={o.status} />
                      </td>

                      <td className="px-4 py-4">
                        <StatusDot status={o.paymentId?.status || 'pending'} />
                      </td>

                      <td className="px-4 py-4 text-[11px] text-text-secondary">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
