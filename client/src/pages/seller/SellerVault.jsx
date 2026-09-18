import React, { useState, useEffect } from 'react';
import { Lock, Sliders, Unlock, ShieldCheck, Loader2 } from 'lucide-react';
import VaultCard from '../../components/seller/VaultCard';
import { sellerService } from '../../services/services';

export const SellerVault = () => {
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await sellerService.getVault();
      if (res.success && res.data) {
        setVaultData(res.data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  if (loading && !vaultData) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold text-text-primary">
          Auto Growth Savings Vault (§7.8)
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Automatic profit reinvestment reserve for bulk raw materials, tooling upgrades, and seasonal stock scale
        </p>
      </div>

      <VaultCard vaultData={vaultData || {}} onUpdate={fetchVault} />
    </div>
  );
};

export default SellerVault;
