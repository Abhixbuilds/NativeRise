import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Award, Truck, ArrowUpRight } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export const Footer = () => {
  return (
    <footer className="bg-bg-tertiary border-t border-border mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5 text-secondary-light" />
              </div>
              <span className="font-serif text-2xl font-bold text-accent-dark tracking-tight">
                Native<span className="text-secondary">Rise</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Unified digital commerce, payments, logistics, and growth infrastructure empowering grassroots Indian artisans & rural entrepreneurs.
            </p>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Marketplace Categories */}
          <div>
            <h4 className="font-serif text-base font-bold text-text-primary mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><Link to="/products?category=Handicrafts" className="hover:text-accent transition-colors">Handicrafts & Decor</Link></li>
              <li><Link to="/products?category=Food" className="hover:text-accent transition-colors">Pure Food & Wild Honey</Link></li>
              <li><Link to="/products?category=Agriculture" className="hover:text-accent transition-colors">Single-Origin Spices</Link></li>
              <li><Link to="/products?category=Clothing" className="hover:text-accent transition-colors">Handloom & Khadi</Link></li>
              <li><Link to="/products" className="hover:text-accent transition-colors flex items-center gap-1 font-medium text-accent">All Artisanal Works <ArrowUpRight className="w-3.5 h-3.5" /></Link></li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="font-serif text-base font-bold text-text-primary mb-4">Platform Features</h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><Link to="/register?role=seller" className="hover:text-accent transition-colors">Rural Entrepreneur Portal</Link></li>
              <li><Link to="/register?role=delivery" className="hover:text-accent transition-colors">Hub Logistics Fleet</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-accent transition-colors">Reinvestment Vault</Link></li>
              <li><Link to="/support" className="hover:text-accent transition-colors">Voice Grievance Support</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-accent transition-colors">Community Trust Circles</Link></li>
            </ul>
          </div>

          {/* Trust Guarantees */}
          <div>
            <h4 className="font-serif text-base font-bold text-text-primary mb-4">Guarantees</h4>
            <div className="space-y-3 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5 p-3 rounded-card bg-white border border-border">
                <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>100% Genuine Provenance verified directly from producer cooperatives.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-card bg-white border border-border">
                <Award className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>True Profit Transparency: 93% of selling revenue goes directly to rural makers.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-card bg-white border border-border">
                <Truck className="w-4 h-4 text-accent-dark shrink-0 mt-0.5" />
                <span>Local Hub Coordination ensuring safe handling for fragile handicrafts.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary gap-4">
          <p>© 2026 NativeRise Platform. Built for Indian Rural Scale on MERN Stack.</p>
          <div className="flex items-center gap-6">
            <span>Crafted with pride in India</span>
            <span className="inline-flex items-center gap-1 text-accent font-medium">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" /> Grassroots to Global
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
