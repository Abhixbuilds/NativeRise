import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  User,
  Truck,
  Sparkles,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginRegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated, user, error: authError } = useAuthStore();

  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState(searchParams.get('role') || 'customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');

  // Role-specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [category, setCategory] = useState('Handicrafts');
  const [trustCircleVouchedBy, setTrustCircleVouchedBy] = useState('');
  const [serviceZone, setServiceZone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle / Cargo Two-Wheeler');
  const [activeHubLocation, setActiveHubLocation] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'seller') navigate('/seller');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/products');
    }
  }, [isAuthenticated, user, navigate]);

  const handleQuickDemoFill = (type) => {
    setMode('login');
    if (type === 'customer') {
      setEmail('customer1@nativerise.test');
      setPassword('Pass@123');
    } else if (type === 'seller') {
      setEmail('ramesh@nativerise.test');
      setPassword('Pass@123');
    } else if (type === 'delivery') {
      setEmail('delivery1@nativerise.test');
      setPassword('Pass@123');
    } else if (type === 'admin') {
      setEmail('admin@nativerise.test');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setLocalError(res.error || 'Login failed');
      }
    } else {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        preferredLanguage,
        address: { line1, city, state, pinCode },
        businessName: role === 'seller' ? businessName : undefined,
        businessDescription: role === 'seller' ? businessDescription : undefined,
        category: role === 'seller' ? category : undefined,
        trustCircleVouchedBy: role === 'seller' ? trustCircleVouchedBy : undefined,
        serviceZone: role === 'delivery' ? serviceZone : undefined,
        vehicleType: role === 'delivery' ? vehicleType : undefined,
        activeHubLocation: role === 'delivery' ? activeHubLocation : undefined
      };

      const res = await register(payload);
      setLoading(false);
      if (!res.success) {
        setLocalError(res.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="card-base p-6 sm:p-10 shadow-elevated border border-border">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent text-white mx-auto flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-secondary-light" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
            {mode === 'login' ? 'Welcome Back to NativeRise' : 'Join the NativeRise Network'}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Rooted Locally. Growing Digitally.
          </p>
        </div>

        {/* Quick Demo Autofill Toolbar */}
        <div className="mb-6 p-3.5 rounded-xl bg-bg-tertiary border border-border space-y-2">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
            Demo Autofill Shortcut (Instant Test Login)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('customer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-border hover:border-accent text-left transition-all"
            >
              <span className="font-semibold block text-text-primary">👤 Customer</span>
              <span className="text-[10px] text-text-secondary">customer1@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('seller')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-border hover:border-accent text-left transition-all"
            >
              <span className="font-semibold block text-text-primary">🧺 Seller</span>
              <span className="text-[10px] text-text-secondary">ramesh@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('delivery')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-border hover:border-accent text-left transition-all"
            >
              <span className="font-semibold block text-text-primary">🚚 Hub Agent</span>
              <span className="text-[10px] text-text-secondary">delivery1@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-secondary hover:border-secondary-dark text-left transition-all bg-secondary/5"
            >
              <span className="font-semibold block text-secondary-dark">🛡️ Admin</span>
              <span className="text-[10px] text-text-secondary">admin@...</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              mode === 'login'
                ? 'border-accent text-accent-dark'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              mode === 'register'
                ? 'border-accent text-accent-dark'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium mb-6">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Registration Role Selector */}
          {mode === 'register' && (
            <div className="space-y-2 mb-4">
              <label className="block font-semibold text-text-secondary">
                Select Your Role on NativeRise:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1 transition-all ${
                    role === 'customer'
                      ? 'border-accent bg-accent-light text-accent-dark font-semibold shadow-xs'
                      : 'border-border hover:bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  <User className="w-5 h-5 text-accent" />
                  <span className="text-xs font-bold text-text-primary">Buyer / Customer</span>
                  <span className="text-[10px] text-text-secondary">Purchase artisanal products</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1 transition-all ${
                    role === 'seller'
                      ? 'border-accent bg-accent-light text-accent-dark font-semibold shadow-xs'
                      : 'border-border hover:bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  <Store className="w-5 h-5 text-secondary" />
                  <span className="text-xs font-bold text-text-primary">Rural Maker / Seller</span>
                  <span className="text-[10px] text-text-secondary">List crafts & track true profit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('delivery')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1 transition-all ${
                    role === 'delivery'
                      ? 'border-accent bg-accent-light text-accent-dark font-semibold shadow-xs'
                      : 'border-border hover:bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  <Truck className="w-5 h-5 text-accent-dark" />
                  <span className="text-xs font-bold text-text-primary">Hub Delivery Agent</span>
                  <span className="text-[10px] text-text-secondary">Manage pickups & logistics</span>
                </button>
              </div>
            </div>
          )}

          {/* Base Fields */}
          {mode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
              <label className="block font-semibold text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                />
              </div>
            </div>

            <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
              <label className="block font-semibold text-text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Seller Extra Fields (§5, §6) */}
          {mode === 'register' && role === 'seller' && (
            <div className="p-4 rounded-xl bg-accent-light/40 border border-accent/20 space-y-3 mt-4">
              <span className="font-serif font-bold text-sm text-accent-dark block">
                Artisan Business Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Ramesh Bamboo Crafts Co-op"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Primary Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                  >
                    <option value="Handicrafts">Handicrafts & Decor</option>
                    <option value="Food">Pure Food Products & Honey</option>
                    <option value="Agriculture">Single-Origin Spices & Agri</option>
                    <option value="Clothing">Handloom & Khadi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Community Trust Circle Vouching Contact (Optional, §7.13)
                </label>
                <input
                  type="text"
                  value={trustCircleVouchedBy}
                  onChange={(e) => setTrustCircleVouchedBy(e.target.value)}
                  placeholder="e.g. Sarpanch Anandrao Patil (Gram Panchayat Nashik Rural)"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                />
                <span className="text-[10px] text-text-secondary mt-1 block">
                  Enables the "Locally Vouched" trust badge and priority village-elder mediation.
                </span>
              </div>
            </div>
          )}

          {/* Delivery Partner Extra Fields */}
          {mode === 'register' && role === 'delivery' && (
            <div className="p-4 rounded-xl bg-secondary-light/40 border border-secondary/20 space-y-3 mt-4">
              <span className="font-serif font-bold text-sm text-secondary-dark block">
                Hub Logistics Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Service Zone</label>
                  <input
                    type="text"
                    required
                    value={serviceZone}
                    onChange={(e) => setServiceZone(e.target.value)}
                    placeholder="e.g. Nashik Valley Hub"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Cargo 3-Wheeler / Electric 2W"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Fields for Registration */}
          {mode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">City / Village</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nashik"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="422001"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Complete Registration'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegisterPage;
