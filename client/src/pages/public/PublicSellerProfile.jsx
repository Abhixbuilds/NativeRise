import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, ShieldCheck, MapPin, Star, Package, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { sellerService } from '../../services/services';
import ProductCard from '../../components/customer/ProductCard';

export const PublicSellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    sellerService.getPublicProfile(id)
      .then((res) => {
        if (res.success && res.data) {
          setSeller(res.data.seller);
          setProducts(res.data.products || []);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">Artisan Workshop Not Found</h2>
        <Link to="/products" className="btn-primary inline-flex">Explore All Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Seller Hero Header */}
      <div className="card-base p-8 relative overflow-hidden bg-radial from-white via-bg-tertiary/40 to-bg-primary">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-2xl shadow-elevated">
              <Store className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                  {seller.businessName}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-accent-light text-accent-dark">
                  {seller.category}
                </span>
                {seller.trustCircleVouchedBy && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Locally Vouched
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                {seller.businessDescription || 'Grassroots producer dedicated to preserving traditional Indian heritage crafts.'}
              </p>

              {seller.trustCircleVouchedBy && (
                <p className="text-xs text-accent-dark font-medium">
                  Verified by: {seller.trustCircleVouchedBy}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 text-xs w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-base">
              <Star className="w-5 h-5 fill-current" />
              <span>{seller.rating || 4.8} / 5</span>
            </div>
            <span className="text-text-secondary">{seller.totalOrders || 0} Successful Dispatches</span>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-serif text-xl font-bold text-text-primary">
            Artisan Catalog ({products.length} Products)
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="card-base p-12 text-center text-xs text-text-secondary">
            No active listings currently available from this workshop.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={{ ...product, sellerId: seller }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSellerProfile;
