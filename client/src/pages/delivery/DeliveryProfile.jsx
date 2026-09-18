import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { deliveryService } from '../../services/services';

export const DeliveryProfile = () => {
  const { user } = useAuthStore();
  const [serviceZone, setServiceZone] = useState(user?.profile?.serviceZone || '');
  const [vehicleType, setVehicleType] = useState(user?.profile?.vehicleType || 'Cargo Two-Wheeler');
  const [activeHubLocation, setActiveHubLocation] = useState(user?.profile?.activeHubLocation || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setServiceZone(user.profile.serviceZone || '');
      setVehicleType(user.profile.vehicleType || 'Cargo Two-Wheeler');
      setActiveHubLocation(user.profile.activeHubLocation || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await deliveryService.updateProfile({
        serviceZone,
        vehicleType,
        activeHubLocation
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update hub agent profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Hub Logistics Profile & Fleet Settings (§7.3)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure active service zone coverage, cargo vehicle specifications, and sorting hub station
        </p>
      </div>

      <form onSubmit={handleSave} className="card-base p-6 sm:p-8 space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Hub logistics settings updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-text-secondary mb-1">Assigned Service Zone</label>
            <input
              type="text"
              required
              value={serviceZone}
              onChange={(e) => setServiceZone(e.target.value)}
              placeholder="e.g. Western Maharashtra Hub"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-secondary mb-1">Active Sorting Hub Station</label>
            <input
              type="text"
              required
              value={activeHubLocation}
              onChange={(e) => setActiveHubLocation(e.target.value)}
              placeholder="e.g. Nashik Central Hub"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-text-secondary mb-1">Vehicle Specification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            >
              <option value="Mahindra Bolero Pickup Cargo">Mahindra Bolero Pickup Cargo (Heavy Rural Transit)</option>
              <option value="Piaggio Ape Cargo 3-Wheeler">Piaggio Ape Cargo 3-Wheeler (Village Cluster Dispatch)</option>
              <option value="Electric 2-Wheeler Cargo">Electric 2-Wheeler Cargo (Last-Mile Agile Delivery)</option>
              <option value="Motorcycle with Pannier Bags">Motorcycle with Pannier Bags (Hill/Highland Transit)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Hub Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryProfile;
