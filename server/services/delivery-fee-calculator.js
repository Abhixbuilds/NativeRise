/**
 * Unified Rural Delivery Feasibility Estimator
 * Formula:
 * baseFee = 30
 * distanceFee = distanceKm * 4
 * weightFee = Math.ceil(weightGrams / 500) * 5
 * totalFee = baseFee + distanceFee + weightFee
 */
const calculateDeliveryFee = ({ distanceKm = 10, weightGrams = 500, dimensions = {} }) => {
  const baseFee = 30;
  const safeDistance = Math.max(1, Number(distanceKm) || 10);
  const distanceFee = Math.round(safeDistance * 4);
  const safeWeight = Math.max(1, Number(weightGrams) || 500);
  const weightFee = Math.ceil(safeWeight / 500) * 5;

  const totalFee = baseFee + distanceFee + weightFee;

  return {
    baseFee,
    distanceFee,
    weightFee,
    totalFee
  };
};

module.exports = { calculateDeliveryFee };
