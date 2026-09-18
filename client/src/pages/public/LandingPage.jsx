import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Store,
  CreditCard,
  Truck,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageSquare,
  Users,
  Compass
} from 'lucide-react';
import Hero3DScene from '../../components/three/Hero3DScene';
import ProductCard from '../../components/customer/ProductCard';
import { productService, sellerService } from '../../services/services';
import { useAuthStore } from '../../store/useAuthStore';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    productService.getProducts({ limit: 4, sortBy: 'rating' })
      .then((res) => {
        if (res.success && res.data) {
          setFeaturedProducts(res.data.products || []);
        }
      })
      .catch((e) => console.warn('Featured fetch error', e));
  }, []);

  const handleDemoLogin = async (email, password) => {
    setLoadingDemo(true);
    const res = await login(email, password);
    setLoadingDemo(false);
    if (res.success) {
      if (res.user.role === 'seller') navigate('/seller');
      else if (res.user.role === 'delivery') navigate('/delivery');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/products');
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Quick Demo Switcher Banner */}
      <section className="bg-accent-dark text-white py-3 px-4 shadow-sm border-b border-accent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-bold bg-amber-400 text-slate-950 text-[10px] uppercase">
              Demo Sandbox
            </span>
            <span className="text-slate-200">
              1-Click instant test login across all 4 production roles:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDemoLogin('customer1@nativerise.test', 'Pass@123')}
              disabled={loadingDemo}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-btn text-[11px] font-medium transition-colors border border-white/15"
            >
              👤 Customer Demo
            </button>
            <button
              onClick={() => handleDemoLogin('ramesh@nativerise.test', 'Pass@123')}
              disabled={loadingDemo}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-btn text-[11px] font-medium transition-colors border border-white/15"
            >
              🧺 Seller Demo (Ramesh)
            </button>
            <button
              onClick={() => handleDemoLogin('delivery1@nativerise.test', 'Pass@123')}
              disabled={loadingDemo}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-btn text-[11px] font-medium transition-colors border border-white/15"
            >
              🚚 Delivery Agent Demo
            </button>
            <button
              onClick={() => handleDemoLogin('admin@nativerise.test', 'Admin@123')}
              disabled={loadingDemo}
              className="bg-secondary hover:bg-secondary-dark text-white px-2.5 py-1 rounded-btn text-[11px] font-semibold transition-colors shadow-xs"
            >
              🛡️ Admin Console Demo
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hero Section with 3D Artisan Motif */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-light text-accent-dark text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.tagline')}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-accent-dark tracking-tight leading-[1.15]">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/products"
                className="btn-primary w-full sm:w-auto text-base py-3.5 px-8 flex items-center justify-center gap-2.5 shadow-elevated"
              >
                <Compass className="w-5 h-5" />
                <span>{t('hero.exploreBtn')}</span>
              </Link>
              <Link
                to="/register?role=seller"
                className="btn-outline w-full sm:w-auto text-base py-3.5 px-7 flex items-center justify-center gap-2"
              >
                <Store className="w-5 h-5 text-secondary" />
                <span>{t('hero.sellBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-border text-xs text-text-secondary">
              <div>
                <span className="font-serif text-2xl font-bold text-accent-dark block">20+</span>
                <span>GI-Region Crafts</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-secondary block">93%</span>
                <span>Maker Revenue Retained</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-accent-dark block">12</span>
                <span>Regional Languages</span>
              </div>
            </div>
          </motion.div>

          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl bg-radial from-white via-bg-tertiary to-bg-primary p-2 border border-border shadow-soft">
              <Hero3DScene />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Four Core Pillars Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Unified Ecosystem
          </span>
          <h2 className="font-serif text-3xl font-bold text-text-primary">
            The Four Pillars of Rural Entrepreneurship
          </h2>
          <p className="text-sm text-text-secondary">
            Everything rural artisans need to scale their livelihood in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Sales */}
          <div className="card-base p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-accent-light text-accent-dark flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text-primary">1. Digital Sales</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Snap & Sell visual AI listing generator, multi-seller split orders, and 1-tap WhatsApp catalog exports.
            </p>
          </div>

          {/* Card 2: Payments */}
          <div className="card-base p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-secondary-light text-secondary-dark flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text-primary">2. Instant Payments</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Transparent color-coded payment statuses, UPI/Cards test checkout, and COD cash reconciliation bridge.
            </p>
          </div>

          {/* Card 3: Logistics */}
          <div className="card-base p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text-primary">3. Local Hub Logistics</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Unified transparent delivery fee calculator, weather-adjusted ETAs, and backhaul return load optimization.
            </p>
          </div>

          {/* Card 4: Growth Vault */}
          <div className="card-base p-6 space-y-3 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text-primary">4. Growth Savings Vault</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Percentage-based true profit analytics with automated reinvestment lock for raw materials & tool upgrades.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How It Works Animated Flow */}
      <section id="how-it-works" className="bg-bg-tertiary/70 py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Seamless Lifecycle
            </span>
            <h2 className="font-serif text-3xl font-bold text-text-primary">
              How NativeRise Works End-to-End
            </h2>
            <p className="text-sm text-text-secondary">
              Connecting rural craft creators, local hub agents, and conscious buyers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-card border border-border space-y-3 text-center shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-accent text-white mx-auto flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-serif text-base font-bold text-text-primary">Artisan Lists Craft</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Seller uploads craft images via Snap & Sell AI with verified provenance and GI region stories.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white p-6 rounded-card border border-border space-y-3 text-center shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-white mx-auto flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-serif text-base font-bold text-text-primary">Split Checkout</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Customer places a multi-seller cart order. Payment captures once and auto-splits per maker.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-card border border-border space-y-3 text-center shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-accent-dark text-white mx-auto flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-serif text-base font-bold text-text-primary">Hub Agent Movement</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Local delivery partner collects packages, logs checkpoint transitions, and reconciles COD cash.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              className="bg-white p-6 rounded-card border border-border space-y-3 text-center shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-serif text-base font-bold text-text-primary">Delivered & Reinvested</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Delivery marks completed, true profit is credited to wallet, and growth savings vault auto-locks funds.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Featured Verified Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Curated Artisan Creations
            </span>
            <h2 className="font-serif text-3xl font-bold text-text-primary mt-1">
              Featured Handcrafted Works
            </h2>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1.5"
          >
            <span>Explore All 20+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Community Trust & Voice Redressal Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-radial from-accent-dark via-[#1E4530] to-[#143223] text-white p-8 sm:p-12 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-secondary-light text-xs font-semibold">
                Grassroots Trust & Multilingual Accessibility
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Community Trust Circles & Voice-First Support
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                We bridge the digital divide for rural entrepreneurs. Every maker can record audio grievance notes in their mother tongue, access local Panchayat vouching, and navigate in 12 Indian regional scripts.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/register?role=seller"
                className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-3.5 px-6 rounded-btn text-center text-sm shadow-md transition-all"
              >
                Register as Rural Seller
              </Link>
              <Link
                to="/products"
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 px-6 rounded-btn text-center text-sm border border-white/20 transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
