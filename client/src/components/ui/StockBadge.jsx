import React, { useEffect, useState } from 'react';
import { useCartStore } from '../../store/useStores';
import { formatDuration } from '../../utils/time';

/**
 * StockBadge – displays a countdown timer for a cart item's reserved stock.
 * Props:
 *   productId – Mongo ObjectId string of the product.
 *   initialExpiry – timestamp (ms) when reservation expires.
 */
export default function StockBadge({ productId, initialExpiry }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, initialExpiry - Date.now()));
  const { updateReservation } = useCartStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newRemaining = Math.max(0, initialExpiry - now);
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        // Reservation expired – inform store to remove it
        updateReservation(productId, null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [productId, initialExpiry, updateReservation]);

  if (remaining <= 0) return null;

  return (
    <div className="text-xs text-accent font-medium mt-1">
      Reserved – expires in {formatDuration(remaining)}
    </div>
  );
}
