import React from 'react';
import { DollarSign, Percent, TrendingUp, Info } from 'lucide-react';

export const ProfitBreakdownTable = ({ breakdown = {}, itemsTotal = 0 }) => {
  const {
    productCost = 0,
    packagingCost = 0,
    deliveryCost = 0,
    platformFeePercent = 5,
    paymentFeePercent = 2,
    actualProfit = 0,
    profitMarginPercent = 0
  } = breakdown;

  const platformFeeAmount = Number(((itemsTotal * platformFeePercent) / 100).toFixed(2));
  const paymentFeeAmount = Number(((itemsTotal * paymentFeePercent) / 100).toFixed(2));

  return (
    <div className="rounded-card bg-white border border-border p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h4 className="font-serif text-base font-bold text-text-primary">
            True Profit Breakdown (§7.7)
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-accent-light text-accent-dark text-xs font-bold">
          {profitMarginPercent}% Margin
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Selling Revenue</span>
          <span className="text-sm font-bold text-text-primary">₹{itemsTotal}</span>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Raw Material Cost</span>
          <span className="text-sm font-semibold text-rose-700">-₹{productCost}</span>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Packaging Cost</span>
          <span className="text-sm font-semibold text-rose-700">-₹{packagingCost}</span>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Delivery Subsidy</span>
          <span className="text-sm font-semibold text-rose-700">-₹{deliveryCost}</span>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Platform Fee (5%)</span>
          <span className="text-sm font-semibold text-rose-700">-₹{platformFeeAmount}</span>
        </div>

        <div className="p-3 rounded-lg bg-bg-tertiary">
          <span className="text-text-secondary block">Payment Fee (2%)</span>
          <span className="text-sm font-semibold text-rose-700">-₹{paymentFeeAmount}</span>
        </div>
      </div>

      {/* Net Actual Profit Total Callout */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-emerald-900 block">Actual True Net Profit</span>
          <p className="text-[11px] text-emerald-700">Credited to seller wallet & reinvestment vault</p>
        </div>
        <span className="font-serif text-2xl font-bold text-emerald-800">
          ₹{actualProfit}
        </span>
      </div>
    </div>
  );
};

export default ProfitBreakdownTable;
