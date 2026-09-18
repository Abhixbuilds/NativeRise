import React from 'react';
import { CheckCircle2, Clock, Truck, CloudRain, MapPin, Store, Home } from 'lucide-react';

export const CheckpointTimeline = ({
  checkpoints = [],
  status = 'placed',
  weatherAdjustedDelay = false,
  etaEstimate = null
}) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', icon: Store },
    { key: 'accepted', label: 'Accepted by Artisan', icon: Store },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: MapPin },
    { key: 'picked_up', label: 'Picked Up by Hub Agent', icon: Truck },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'placed': return 0;
      case 'accepted': return 1;
      case 'ready_for_pickup': return 2;
      case 'picked_up': return 3;
      case 'in_transit': return 4;
      case 'delivered': return 5;
      case 'cancelled':
      case 'rejected':
      case 'refunded': return -1;
      default: return 0;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="card-base p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-text-primary">Delivery Checkpoints</h3>
          <p className="text-xs text-text-secondary">Hub-Agent logistics tracking</p>
        </div>

        {etaEstimate && (
          <div className="text-right">
            <span className="text-[11px] text-text-secondary block">Estimated Delivery</span>
            <span className="text-sm font-semibold text-accent-dark">
              {new Date(etaEstimate).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Weather delay banner (§7.11) */}
      {weatherAdjustedDelay && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <CloudRain className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <span className="font-bold block">Seasonal Weather & Road Condition Adjustment</span>
            <span className="text-amber-800">
              Delivery may take extra transit time due to regional seasonal road conditions in this route.
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar Timeline */}
      <div className="relative py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {steps.map((step, idx) => {
            const isDone = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-700 border-amber-500 animate-pulse'
                      : 'bg-bg-tertiary text-gray-400 border-border'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <span
                  className={`text-xs mt-2 font-medium ${
                    isDone ? 'text-accent-dark font-semibold' : isCurrent ? 'text-amber-700 font-bold' : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Checkpoint Log */}
      {checkpoints.length > 0 && (
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Checkpoint Activity Log
          </h4>
          <div className="space-y-2.5">
            {checkpoints.map((cp, i) => (
              <div key={i} className="flex items-start justify-between text-xs p-2.5 rounded-lg bg-bg-tertiary">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-text-primary capitalize">{cp.status?.replace(/_/g, ' ')}</span>
                    <span className="text-text-secondary block">{cp.location}</span>
                  </div>
                </div>
                <span className="text-text-secondary text-[11px] shrink-0">
                  {new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckpointTimeline;
