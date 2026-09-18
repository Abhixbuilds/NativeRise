import React, { useState } from 'react';
import { User, MapPin, Globe, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export const CustomerProfilePage = () => {
  const { user, fetchUserProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [line1, setLine1] = useState(user?.address?.line1 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await authService.updateMe({
        name,
        phone,
        address: { line1, city, state, pinCode }
      });
      if (res.success) {
        setSaved(true);
        await fetchUserProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
          Account Settings & Saved Address
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your personal details and default delivery coordinates
        </p>
      </div>

      <form onSubmit={handleSave} className="card-base p-6 sm:p-8 space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-text-primary flex items-center gap-2">
            <User className="w-4 h-4 text-accent" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-bg-tertiary text-text-secondary cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">Language Preference</label>
              <div className="pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Default Shipping Address */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-serif text-base font-bold text-text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" /> Default Delivery Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="block font-semibold text-text-secondary mb-1">Street Address</label>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Apartment, Street, Locality"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">City / District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">PIN Code</label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfilePage;
