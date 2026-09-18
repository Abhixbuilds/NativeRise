import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Save, CheckCircle, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { sellerService } from '../../services/services';

export const SellerProfileEditor = () => {
  const { user } = useAuthStore();
  const [businessName, setBusinessName] = useState(user?.profile?.businessName || '');
  const [businessDescription, setBusinessDescription] = useState(user?.profile?.businessDescription || '');
  const [category, setCategory] = useState(user?.profile?.category || 'Handicrafts');
  const [trustCircleVouchedBy, setTrustCircleVouchedBy] = useState(user?.profile?.trustCircleVouchedBy || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setBusinessName(user.profile.businessName || '');
      setBusinessDescription(user.profile.businessDescription || '');
      setCategory(user.profile.category || 'Handicrafts');
      setTrustCircleVouchedBy(user.profile.trustCircleVouchedBy || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await sellerService.updateProfile({
        businessName,
        businessDescription,
        category,
        trustCircleVouchedBy
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to update seller profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Artisan Profile & Trust Circle Vouching (§7.13)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure your workshop story, craft specialty, and local Gram Panchayat endorsements
          </p>
        </div>

        {user?.profile?._id && (
          <Link
            to={`/sellers/${user.profile._id}`}
            className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Public Page</span>
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="card-base p-6 sm:p-8 space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Artisan workshop profile saved and updated live!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-text-secondary mb-1">Business / Workshop Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-secondary mb-1">Primary Craft Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            >
              <option value="Handicrafts">Handicrafts & Decor</option>
              <option value="Food">Pure Food Products & Honey</option>
              <option value="Agriculture">Single-Origin Spices & Agri</option>
              <option value="Clothing">Handloom & Khadi</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-text-secondary mb-1">
              Community Trust Circle Endorsement (§7.13)
            </label>
            <input
              type="text"
              value={trustCircleVouchedBy}
              onChange={(e) => setTrustCircleVouchedBy(e.target.value)}
              placeholder="e.g. Sarpanch Anandrao Patil (Gram Panchayat Nashik Rural)"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            />
            <span className="text-[11px] text-text-secondary mt-1 block">
              Displays the verified "Locally Vouched" badge on your marketplace items and directs customer inquiries through community mediation.
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-text-secondary mb-1">Workshop Story & Craft Heritage</label>
            <textarea
              rows={4}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Tell buyers about your family traditions, sustainable sourcing, and handmade methods..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerProfileEditor;
