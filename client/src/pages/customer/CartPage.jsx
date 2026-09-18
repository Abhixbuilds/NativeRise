import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  CloudRain,
  Store,
  Loader2
} from 'lucide-react';
import { useCartStore } from '../../store/useStores';
import { checkoutService } from '../../services/services';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, fetchCart, updateQty, removeItem } = useCartStore();
  const [estimates, setEstimates] = useState(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart && cart.items?.length > 0) {
      setEstimating(true);
      checkoutService.estimateDelivery({})
        .then((res) => {
          if (res.success && res.data) {
            setEstimates(res.data);
          }
        })
        .catch((e) => console.warn(e))
        .finally(() => setEstimating(false));
    }
  }, [cart]);

  if (loading && !cart) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, it) => sum + (it.productId?.price || 0) * it.quantity, 0);
  const deliveryFee = estimates?.totalDeliveryCost || (items.length > 0 ? 90 : 0);
  const grandTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-accent-light text-accent mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text-primary">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
          Explore handmade pottery, woven baskets, wild honey, and natural spices crafted by Indian rural entrepreneurs.
        </p>
        <Link to="/products" className="btn-primary inline-flex py-3 px-6 text-sm">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
            Shopping Cart ({items.length} Distinct Items)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Multi-seller split checkout supported with unified delivery calculation
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-accent font-semibold bg-accent-light px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          <span>10-Minute Stock Lock Active (§7.2)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const p = item.productId;
            if (!p) return null;

            return (
              <div
                key={p._id}
                className="card-base p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600'}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover border border-border bg-bg-tertiary shrink-0"
                  />

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-accent block">
                      {p.sellerId?.businessName || 'Artisan Workshop'}
                    </span>
                    <Link
                      to={`/products/${p._id}`}
                      className="font-serif font-semibold text-sm sm:text-base text-text-primary hover:text-accent line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs font-bold text-text-primary">
                      ₹{p.price} <span className="text-[11px] text-text-secondary font-normal">/ unit</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <div className="flex items-center border border-border rounded-lg bg-bg-tertiary">
                    <button
                      type="button"
                      onClick={() => updateQty(p._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-text-secondary hover:text-text-primary font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-bold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(p._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-text-secondary hover:text-text-primary font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-text-primary block">
                      ₹{p.price * item.quantity}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(p._id)}
                    className="p-1.5 text-text-secondary hover:text-status-danger rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-base p-6 space-y-5 shadow-elevated">
            <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Items Subtotal</span>
                <span className="font-semibold text-text-primary">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-secondary" />
                  <span>Unified Rural Delivery Fee (§7.4)</span>
                </span>
                <span className="font-semibold text-text-primary">
                  {estimating ? 'Calculating...' : `₹${deliveryFee}`}
                </span>
              </div>

              {estimates?.weatherAdjustedDelay && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-amber-700" /> Seasonal Transit Notice
                  </span>
                  <p>{estimates.seasonalNote || 'Regional monsoon/road delays factored into delivery window.'}</p>
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-baseline justify-between text-sm">
                <span className="font-serif font-bold text-text-primary">Total Payable</span>
                <span className="font-serif text-2xl font-bold text-accent-dark">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-text-secondary flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Direct-to-Artisan Guaranteed Payout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
