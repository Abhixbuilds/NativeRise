import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RazorpayPaymentModal = ({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  isProcessing = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('782');
  const [cardHolder, setCardHolder] = useState('Priya Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [paymentStage, setPaymentStage] = useState('idle'); // idle | authorizing | verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !orderData) return null;

  const totalAmountINR = orderData.grandTotalINR || (orderData.amount ? orderData.amount / 100 : 0);

  const handlePayNow = async () => {
    setPaymentStage('authorizing');
    setErrorMessage('');

    try {
      // Simulate bank authorization delay
      await new Promise((r) => setTimeout(r, 1200));
      setPaymentStage('verifying');

      await new Promise((r) => setTimeout(r, 1000));

      // Trigger confetti celebration on test success
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setPaymentStage('success');

      await new Promise((r) => setTimeout(r, 900));

      // Call onSuccess callback with mock Razorpay payload
      const mockPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
      onSuccess({
        razorpay_order_id: orderData.razorpayOrderId || `order_${Date.now()}`,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'demo_sig_' + Math.random().toString(36).substring(2, 15),
        paymentMode: selectedMethod === 'cod' ? 'cod' : 'online'
      });
    } catch (err) {
      setPaymentStage('error');
      setErrorMessage('Payment simulation interrupted. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-border"
        >
          {/* Razorpay Sandbox Header */}
          <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-sm">
                NR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">NativeRise Payments</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                    Test Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300">Order #{orderData.razorpayOrderId?.slice(-8) || 'CHECKOUT'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-300 block">Amount to Pay</span>
              <span className="text-lg font-bold text-white">₹{totalAmountINR.toFixed(2)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {paymentStage === 'idle' ? (
              <>
                {/* Method Tabs */}
                <div className="grid grid-cols-4 gap-2 border-b border-border pb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'upi'
                        ? 'border-accent bg-accent-light text-accent-dark shadow-xs'
                        : 'border-border hover:bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-accent" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('cards')}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'cards'
                        ? 'border-accent bg-accent-light text-accent-dark shadow-xs'
                        : 'border-border hover:bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-secondary" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'netbanking'
                        ? 'border-accent bg-accent-light text-accent-dark shadow-xs'
                        : 'border-border hover:bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-text-primary" />
                    <span>Netbanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('cod')}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'cod'
                        ? 'border-accent bg-accent-light text-accent-dark shadow-xs'
                        : 'border-border hover:bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span>COD</span>
                  </button>
                </div>

                {/* Tab Contents */}
                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary border border-border">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Instant UPI Apps</p>
                          <p className="text-[11px] text-text-secondary">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Fastest
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Enter UPI VPA / ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent focus:border-accent bg-white"
                        placeholder="yourname@upi"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'cards' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          maxLength={3}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-text-secondary">Select Popular Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 text-xs text-left rounded-lg border transition-all ${
                            selectedBank === b
                              ? 'border-accent bg-accent-light text-accent-dark font-semibold'
                              : 'border-border hover:bg-bg-tertiary text-text-primary'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethod === 'cod' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-amber-700" /> Cash on Delivery (COD)
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      You can pay ₹{totalAmountINR.toFixed(2)} in cash to the NativeRise Hub Agent upon package inspection at your doorstep.
                    </p>
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 shadow-md"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalAmountINR.toFixed(2)}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary mt-3">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" /> 256-Bit SSL Encryption
                    </span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-text-secondary hover:text-status-danger transition-colors underline"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Processing Animation Stages */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                {paymentStage === 'authorizing' && (
                  <>
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-text-primary">Contacting Payment Gateway...</h4>
                      <p className="text-xs text-text-secondary mt-1">Securing communication with bank sandbox</p>
                    </div>
                  </>
                )}

                {paymentStage === 'verifying' && (
                  <>
                    <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-text-primary">Verifying Digital Signature...</h4>
                      <p className="text-xs text-text-secondary mt-1">Splitting multi-seller allocations & stock deduction</p>
                    </div>
                  </>
                )}

                {paymentStage === 'success' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold text-emerald-800">Payment Authorized!</h4>
                      <p className="text-xs text-text-secondary mt-1">Generating order tracking and seller checkpoints...</p>
                    </div>
                  </>
                )}

                {paymentStage === 'error' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-rose-800">Payment Failed</h4>
                      <p className="text-xs text-text-secondary mt-1">{errorMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentStage('idle')}
                      className="btn-outline text-xs mt-4"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RazorpayPaymentModal;
