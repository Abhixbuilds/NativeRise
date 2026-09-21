/**
 * Split Order Engine Service
 * Takes a single checkout payload and creates maker‑specific order documents.
 * Returns an array of maker order objects to be persisted.
 */
module.exports = {
  splitOrder: async function (checkout) {
    // checkout: { items: [{productId, quantity, price, sellerId}], customerId, paymentId }
    const makerMap = {};
    checkout.items.forEach(item => {
      const sellerId = item.sellerId.toString();
      if (!makerMap[sellerId]) {
        makerMap[sellerId] = [];
      }
      makerMap[sellerId].push(item);
    });
    const makerOrders = [];
    for (const [sellerId, items] of Object.entries(makerMap)) {
      makerOrders.push({
        sellerId,
        items,
        // profitBreakdown to be computed later by profitCalculator service
        profitBreakdown: {},
        status: 'placed',
        deliveryCost: 0 // placeholder; will be calculated by deliveryFeeCalculator
      });
    }
    return makerOrders;
  }
};
