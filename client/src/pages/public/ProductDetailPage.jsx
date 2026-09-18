import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Star,
  Globe,
  Truck,
  RotateCcw,
  Store,
  ChevronRight,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';
import { productService, reviewService } from '../../services/services';
import ProvenanceCard from '../../components/customer/ProvenanceCard';
import { useCartStore, useWishlistStore } from '../../store/useStores';
import { useAuthStore } from '../../store/useAuthStore';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getProductById(id)
      .then((res) => {
        if (res.success && res.data?.product) {
          setProduct(res.data.product);
          setSelectedImage(res.data.product.images?.[0] || 'https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600');
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));

    reviewService.getReviews({ targetType: 'product', targetId: id })
      .then((res) => {
        if (res.success && res.data?.reviews) {
          setReviews(res.data.reviews);
        }
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await addItem(product._id, quantity);
    if (res.success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addItem(product._id, quantity);
    navigate('/cart');
  };

  const handleTranslateDescription = async () => {
    if (translatedText) {
      setTranslatedText('');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await productService.translateDescription(product._id, i18n.language || 'hi');
      if (res.success && res.data?.translatedText) {
        setTranslatedText(res.data.translatedText);
      }
    } catch (err) {
      alert('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text-primary">Product Not Found</h2>
        <Link to="/products" className="btn-primary inline-flex">Return to Marketplace</Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const seller = product.sellerId || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category}`} className="hover:text-accent">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text-primary font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-bg-tertiary border border-border shadow-soft relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                Low Stock: Only {product.stock} available
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-accent shadow-xs' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-accent-light text-accent-dark text-xs font-bold">
                {product.category}
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className={`p-2 rounded-full border border-border transition-colors ${
                  wishlisted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white hover:bg-bg-tertiary text-text-secondary'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary leading-snug">
              {product.name}
            </h1>

            {/* Rating & Orders */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating || 4.8} / 5</span>
              </div>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary">Weight: {product.weightGrams}g</span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-xl bg-bg-tertiary border border-border flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-text-primary">₹{product.price}</span>
            <span className="text-xs text-text-secondary">Inclusive of all local maker fees</span>
          </div>

          {/* Description & On-Demand Translation (§10) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-text-primary">About this Handcrafted Item</h3>
              <button
                type="button"
                onClick={handleTranslateDescription}
                disabled={isTranslating}
                className="text-xs text-accent hover:text-accent-dark font-medium flex items-center gap-1.5"
              >
                {isTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                <span>{translatedText ? 'Show Original' : 'Translate to ' + i18n.language.toUpperCase()}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-border">
              {translatedText || product.descriptionOriginal}
            </p>
          </div>

          {/* Provenance Card */}
          <ProvenanceCard
            provenance={product.provenanceCard}
            sellerName={seller.businessName}
            region={product.provenanceCard?.region}
          />

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-text-secondary">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-text-secondary hover:text-text-primary font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-text-primary">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-text-secondary hover:text-text-primary font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-text-secondary">
                {product.stock} units available in artisan workshop
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-outline py-3.5 text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="btn-primary py-3.5 text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>Buy Now with 1-Click</span>
              </button>
            </div>
          </div>

          {/* Maker Profile Snippet */}
          <div className="p-4 rounded-xl bg-white border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-light text-accent-dark flex items-center justify-center font-bold text-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <Link to={`/sellers/${seller._id}`} className="font-serif font-bold text-sm text-text-primary hover:text-accent">
                  {seller.businessName || 'Rural Artisan'}
                </Link>
                {seller.trustCircleVouchedBy && (
                  <span className="text-[11px] text-accent font-semibold flex items-center gap-1 block">
                    <ShieldCheck className="w-3.5 h-3.5" /> Locally Vouched Creator
                  </span>
                )}
              </div>
            </div>
            <Link to={`/sellers/${seller._id}`} className="btn-outline text-xs py-1.5 px-3">
              View Workshop
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="card-base p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary">Customer Testimonials & Reviews</h3>
            <p className="text-xs text-text-secondary">Verified purchases from buyers across India</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
            <Star className="w-5 h-5 fill-current" />
            <span>{product.rating || 4.8} / 5</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-secondary">
            No customer reviews posted for this batch yet. Delivered orders unlock review submissions.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl bg-bg-tertiary border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{rev.customerId?.name || 'Verified Buyer'}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-text-secondary block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
