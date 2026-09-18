import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, ArrowRight, Store, ShieldCheck, Loader2 } from 'lucide-react';
import { deliveryService, orderService } from '../../services/services';

export const NearbyPickupPanel = ({ onAssignmentAdded }) => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const res = await deliveryService.getNearbyPickups();
      if (res.success && res.data) {
        setPickups(res.data.nearbyPickups || []);
      }
    } catch (err) {
      console.warn('Failed to load nearby pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, []);

  const handleAddToRoute = async (orderId) => {
    setAddingId(orderId);
    try {
      await orderService.assignDelivery(orderId);
      await fetchNearby();
      onAssignmentAdded && onAssignmentAdded();
    } catch (err) {
      alert('Failed to add order to route');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-serif text-base font-bold text-text-primary">
              Backhaul / Return-Trip Load Opportunities (§7.12)
            </h3>
            <p className="text-xs text-text-secondary">
              Orders ready for pickup in your active transit zone to maximize vehicle utilization
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchNearby}
          disabled={loading}
          className="p-2 rounded-btn hover:bg-bg-tertiary text-text-secondary hover:text-accent"
          title="Refresh nearby opportunities"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-secondary bg-bg-tertiary rounded-xl p-4">
          No additional return-trip pickups currently waiting in this zone. All regional hub allocations are optimized.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pickups.map((order) => (
            <div
              key={order._id}
              className="p-3.5 rounded-xl border border-border bg-bg-tertiary flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-accent-dark">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-border">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-accent" />
                  <span>{order.sellerId?.businessName}</span>
                </p>
                <p className="text-[11px] text-text-secondary">
                  Deliver to: {order.customerId?.name} ({order.customerId?.address?.city || 'Regional Zone'})
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddToRoute(order._id)}
                disabled={addingId === order._id}
                className="btn-primary py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 w-full shadow-xs"
              >
                {addingId === order._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Add to Return Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyPickupPanel;
