import React, { useState } from 'react';
import { Lock, Unlock, TrendingUp, Sliders, ShieldCheck, Loader2 } from 'lucide-react';
import { sellerService } from '../../services/services';

export const VaultCard = ({ vaultData = {}, onUpdate }) => {
  const {
    lockedAmount = 0,
    balancePercentSetting = 10,
    unlockHistory = [],
    walletBalance = 0
  } = vaultData;

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockAmount, setUnlockAmount] = useState('');
  const [unlockReason, setUnlockReason] = useState('Raw Material');
  const [isEditingSetting, setIsEditingSetting] = useState(false);
  const [newPercent, setNewPercent] = useState(balancePercentSetting);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!unlockAmount || Number(unlockAmount) <= 0) return;

    setSubmitting(true);
    setMsg('');
    try {
      const res = await sellerService.unlockVaultFunds(Number(unlockAmount), unlockReason);
      if (res.success) {
        setMsg(`Unlocked ₹${unlockAmount} for ${unlockReason}!`);
        setIsUnlocking(false);
        setUnlockAmount('');
        onUpdate && onUpdate();
      }
    } catch (err) {
      setMsg(err.error?.message || 'Failed to unlock vault funds');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSetting = async () => {
    setSubmitting(true);
    try {
      const res = await sellerService.updateVaultSettings(newPercent);
      if (res.success) {
        setIsEditingSetting(false);
        onUpdate && onUpdate();
      }
    } catch (err) {
      alert('Failed to update vault setting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-base p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Auto Growth Savings Vault (§7.8)
            </h3>
            <p className="text-xs text-text-secondary">
              Automated reinvestment deduction on every delivered order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingSetting(!isEditingSetting)}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Vault Setting ({balancePercentSetting}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsUnlocking(true)}
            className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlock Funds</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-accent-light text-accent-dark text-xs font-medium">
          {msg}
        </div>
      )}

      {/* Settings Slider Panel */}
      {isEditingSetting && (
        <div className="p-4 rounded-xl bg-bg-tertiary border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary">
              Auto-Lock Percentage per Delivered Order: {newPercent}%
            </label>
            <span className="text-[11px] text-text-secondary">Allowed: 0% - 30%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={newPercent}
            onChange={(e) => setNewPercent(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingSetting(false)}
              className="btn-outline text-xs py-1 px-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSetting}
              disabled={submitting}
              className="btn-primary text-xs py-1 px-3"
            >
              Save Setting
            </button>
          </div>
        </div>
      )}

      {/* Balances Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-accent-light/50 border border-accent/20 space-y-1">
          <span className="text-xs font-semibold text-accent-dark uppercase tracking-wider block">
            Locked Growth Vault
          </span>
          <span className="font-serif text-3xl font-bold text-accent-dark block">
            ₹{lockedAmount}
          </span>
          <p className="text-[11px] text-text-secondary">
            Reserved for raw materials, machinery & seasonal scale
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
            Available Wallet Balance
          </span>
          <span className="font-serif text-3xl font-bold text-text-primary block">
            ₹{walletBalance}
          </span>
          <p className="text-[11px] text-text-secondary">
            Instantly withdrawable or spent on hub fulfillment
          </p>
        </div>
      </div>

      {/* Unlock Funds Modal */}
      {isUnlocking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card shadow-elevated border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-serif text-base font-bold text-text-primary">
                Unlock Vault for Business Expense
              </h4>
              <button
                type="button"
                onClick={() => setIsUnlocking(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Amount to Unlock (Max ₹{lockedAmount})
                </label>
                <input
                  type="number"
                  max={lockedAmount}
                  min="1"
                  value={unlockAmount}
                  onChange={(e) => setUnlockAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Purpose / Business Expense Reason
                </label>
                <select
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                >
                  <option value="Raw Material">Raw Material Procurement</option>
                  <option value="Packaging">Packaging & Crating Supplies</option>
                  <option value="Equipment">Handloom / Potter Wheel / Tool Repair</option>
                  <option value="Other">Other Operational Expansion</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnlocking(false)}
                  className="btn-outline py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !unlockAmount || Number(unlockAmount) > lockedAmount}
                  className="btn-primary py-1.5 px-4 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Confirm Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock History */}
      {unlockHistory.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2.5">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Recent Vault Unlocks
          </h4>
          <div className="space-y-2">
            {unlockHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-bg-tertiary">
                <div>
                  <span className="font-semibold text-text-primary">₹{item.amount}</span>
                  <span className="text-text-secondary ml-2">({item.reason})</span>
                </div>
                <span className="text-[11px] text-text-secondary">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultCard;
