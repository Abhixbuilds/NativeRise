/**
 * True Profit Calculator (percentage-based)
 * Formula:
 * platformFeePercent = 5
 * paymentFeePercent = 2
 * actualProfit = sellingPrice - productCost - packagingCost - deliveryCost
 *                - (sellingPrice * platformFeePercent/100)
 *                - (sellingPrice * paymentFeePercent/100)
 * profitMarginPercent = (actualProfit / sellingPrice) * 100
 */
const calculateProfitBreakdown = ({
  sellingPrice = 0,
  productCost = 0,
  packagingCost = 0,
  deliveryCost = 0
}) => {
  const price = Number(sellingPrice) || 0;
  const prodCost = Number(productCost) || 0;
  const pkgCost = Number(packagingCost) || 0;
  const delCost = Number(deliveryCost) || 0;

  const platformFeePercent = 5;
  const paymentFeePercent = 2;

  const platformFee = (price * platformFeePercent) / 100;
  const paymentFee = (price * paymentFeePercent) / 100;

  const actualProfit = Number(
    (price - prodCost - pkgCost - delCost - platformFee - paymentFee).toFixed(2)
  );

  const profitMarginPercent = price > 0
    ? Number(((actualProfit / price) * 100).toFixed(2))
    : 0;

  return {
    productCost: prodCost,
    packagingCost: pkgCost,
    deliveryCost: delCost,
    platformFeePercent,
    paymentFeePercent,
    actualProfit,
    profitMarginPercent
  };
};

module.exports = { calculateProfitBreakdown };
