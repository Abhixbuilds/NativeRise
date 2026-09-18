import React, { useState, useEffect } from 'react';
import { Truck, Package, Banknote, Navigation, Loader2 } from 'lucide-react';
import { deliveryService } from '../../services/services';
import AssignmentCard from '../../components/delivery/AssignmentCard';
import NearbyPickupPanel from '../../components/delivery/NearbyPickupPanel';

export const DeliveryDashboard = () => {
  const [assignments, setAssignments] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // new | active | completed

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await deliveryService.getAssignments();
      if (res.success && res.data) {
        setAssignments(res.data.assignments);
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleSync = () => fetchData();
    window.addEventListener('nativerise:sync', handleSync);
    return () => window.removeEventListener('nativerise:sync', handleSync);
  }, []);

  if (loading && !assignments) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const currentList = assignments?.[activeTab] || [];

  return (
    <div className="space-y-8">
      {/* Hub Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Hub Agent Logistics Dashboard (§7.3)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Service Zone: <strong>{profile?.serviceZone}</strong> • Active Hub: <strong>{profile?.activeHubLocation}</strong>
          </p>
        </div>

        {/* COD Float Balance Tracker (§7.9) */}
        <div className="card-base p-3 bg-secondary-light/40 border border-secondary/20 flex items-center gap-3">
          <Banknote className="w-5 h-5 text-secondary-dark" />
          <div className="text-xs">
            <span className="text-text-secondary block text-[10px] uppercase font-semibold">COD Float Balance</span>
            <span className="font-serif text-lg font-bold text-secondary-dark">₹{profile?.codFloatBalance || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {[
          { key: 'new', label: `New Pickups (${assignments?.new?.length || 0})` },
          { key: 'active', label: `In Transit (${assignments?.active?.length || 0})` },
          { key: 'completed', label: `Completed (${assignments?.completed?.length || 0})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-btn text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-accent text-white shadow-xs'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignment Cards List */}
      {currentList.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">
            No Deliveries in "{activeTab.toUpperCase()}" Category
          </h3>
          <p className="text-xs text-text-secondary">
            Check the Return-Trip Load Optimization panel below for available batch pickups.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((order) => (
            <AssignmentCard
              key={order._id}
              order={order}
              onUpdated={fetchData}
            />
          ))}
        </div>
      )}

      {/* Backhaul / Return-Trip Load Optimization Panel (§7.12) */}
      <div id="backhaul" className="pt-4">
        <NearbyPickupPanel onAssignmentAdded={fetchData} />
      </div>
    </div>
  );
};

export default DeliveryDashboard;
