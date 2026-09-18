import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Store,
  Lock,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useCartStore } from '../../store/useStores';
import { useAuthStore } from '../../store/useAuthStore';
import { checkoutService } from '../../services/services';
import RazorpayPaymentModal from '../../components/common/RazorpayPaymentModal';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [paymentMode, setPaymentMode] = useState('online');
  const [addressLine, setAddressLine] = useState(user?.address?.line1 || '402 Sunrise Heights, Bandra West');
  const [city, setCity] = useState(user?.address?.city || 'Mumbai');
  const [state, setState] = useState(user?.address?.state || 'Maharashtra');
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '400050');

  const [deliveryEstimates, setDeliveryEstimates] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart && cart.items?.length > 0) {
      setLoadingEstimate(true);
      checkoutService.estimateDelivery({ state, city, pinCode })
        .then((res) => {
          if (res.success && res.data) {
            setDeliveryEstimates(res.data);
          }
        })
        .finally(() => setLoadingEstimate(false));
    }
  }, [cart, state, pinCode]);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, it) => sum + (it.productId?.price || 0) * it.quantity, 0);
  const deliveryFee = deliveryEstimates?.totalDeliveryCost || (items.length > 0 ? 90 : 0);
  const grandTotal = subtotal + deliveryFee;

  // Group items by seller for split order review
  const sellerGroups = {};
  items.forEach((item) => {
    const p = item.productId;
    if (!p) return;
    const sId = p.sellerId?._id || 'unknown';
    if (!sellerGroups[sId]) {
      sellerGroups[sId] = {
        sellerName: p.sellerId?.businessName || 'Artisan Workshop',
        items: []
      };
    }
    sellerGroups[sId].items.push(item);
  });

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const res = await checkoutService.createOrder({
        paymentMode,
        customerAddress: { line1: addressLine, city, state, pinCode }
      });

      if (res.success && res.data) {
        setRazorpayOrderData({
          ...res.data,
          grandTotalINR: grandTotal
        });
        setRazorpayModalOpen(true);
      }
    } catch (err) {
      setErrorMsg(err.error?.message || 'Failed to initialize checkout. Please verify item stock.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentPayload) => {
    setIsProcessing(true);
    try {
      const res = await checkoutService.verifyPayment({
        ...paymentPayload,
        shippingAddress: { line1: addressLine, city, state, pinCode }
      });

      if (res.success) {
        clearCart();
        setRazorpayModalOpen(false);
        navigate('/customer/orders', {
          state: {
            orderSuccess: true,
            orderCount: res.data.orders?.length || 1,
            paymentId: res.data.payment?.id
          }
        });
      }
    } catch (err) {
      setErrorMsg(err.error?.message || 'Verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">No Items to Checkout</h2>
        <Link to="/products" className="btn-primary inline-flex text-xs">Return to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/cart" className="p-2 rounded-btn hover:bg-bg-tertiary text-text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
            Split-Order Checkout (§7.1)
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            1 Payment • Auto-split into {Object.keys(sellerGroups).length} independent artisan order(s)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Address & Seller Splits */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address */}
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="font-serif text-base font-bold text-text-primary">
                1. Delivery Address & Destination Hub
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-text-secondary mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Grouped Seller Allocations */}
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Store className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-base font-bold text-text-primary">
                2. Artisan Packages Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(sellerGroups).map(([sId, grp]) => (
                <div key={sId} className="p-4 rounded-xl bg-bg-tertiary border border-border space-y-3">
                  <span className="font-serif font-bold text-xs text-accent-dark block">
                    Workshop: {grp.sellerName}
                  </span>
                  <div className="space-y-2">
                    {grp.items.map((item) => (
                      <div key={item.productId?._id} className="flex items-center justify-between text-xs">
                        <span className="text-text-primary">{item.productId?.name} x {item.quantity}</span>
                        <span className="font-bold text-text-primary">
                          ₹{(item.productId?.price || 0) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-5 h-5 text-accent" />
              <h3 className="font-serif text-base font-bold text-text-primary">
                3. Choose Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('online')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMode === 'online'
                    ? 'border-accent bg-accent-light text-accent-dark font-semibold shadow-xs'
                    : 'border-border bg-white hover:bg-bg-tertiary text-text-secondary'
                }`}
              >
                <CreditCard className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-text-primary block">
                    Online (UPI / Cards / Netbanking)
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Instant checkout via Razorpay Sandbox modal
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('cod')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMode === 'cod'
                    ? 'border-accent bg-accent-light text-accent-dark font-semibold shadow-xs'
                    : 'border-border bg-white hover:bg-bg-tertiary text-text-secondary'
                }`}
              >
                <Banknote className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-text-primary block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Pay upon package delivery to Hub Agent
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Pay Button & Order Lock */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-base p-6 space-y-5 shadow-elevated">
            <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-3">
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Items Subtotal</span>
                <span className="font-semibold text-text-primary">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Combined Rural Delivery</span>
                <span className="font-semibold text-text-primary">₹{deliveryFee}</span>
              </div>
              <div className="pt-3 border-t border-border flex items-baseline justify-between text-sm">
                <span className="font-serif font-bold text-text-primary">Amount Payable</span>
                <span className="font-serif text-2xl font-bold text-accent-dark">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{paymentMode === 'online' ? `Pay ₹${grandTotal}` : `Place COD Order`}</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-text-secondary space-y-1">
              <span className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Guaranteed Refund Policy Before Dispatch
              </span>
              <p className="text-[10px] text-gray-400">Razorpay Test Mode Simulation Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Razorpay Modal */}
      <RazorpayPaymentModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        orderData={razorpayOrderData}
        onSuccess={handlePaymentSuccess}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default CheckoutPage;
