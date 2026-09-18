import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../store/useStores';
import { useAuthStore } from '../../store/useAuthStore';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addItem(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product._id);
  };

  const wishlisted = isWishlisted(product._id);
  const seller = product.sellerId || {};
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600';

  return (
    <div className="group card-base p-0 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-elevated transition-all duration-300">
      {/* Image Wrap */}
      <Link to={`/products/${product._id}`} className="relative aspect-4/3 w-full overflow-hidden bg-bg-tertiary block">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-accent-dark shadow-xs">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs shadow-xs transition-colors ${
            wishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 hover:bg-white text-text-secondary hover:text-rose-600'
          }`}
          title="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
            Only {product.stock} left!
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Seller / Origin */}
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
            <span className="truncate max-w-[150px] font-medium hover:text-accent">
              {seller.businessName || 'Artisan Collective'}
            </span>
            {seller.trustCircleVouchedBy && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent font-semibold bg-accent-light px-1.5 py-0.5 rounded" title={`Vouched by: ${seller.trustCircleVouchedBy}`}>
                <ShieldCheck className="w-3 h-3" /> Vouched
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-serif text-base font-semibold text-text-primary group-hover:text-accent line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-text-secondary block">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-text-primary">₹{product.price}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
