import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore, useCartStore } from '../../store/useStores';

export const WishlistPage = () => {
  const { items, fetchWishlist, toggleWishlist, loading } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (productId) => {
    await addItem(productId, 1);
    await toggleWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
          Saved Artisan Wishlist ({items.length})
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Handcrafted treasures saved for future purchase
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card-base p-16 text-center space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-rose-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-text-primary">Your Wishlist is Empty</h3>
          <p className="text-xs text-text-secondary">
            Save unique handcrafted items to keep track of seasonal availability and artisan batches.
          </p>
          <Link to="/products" className="btn-primary inline-flex text-xs">Explore Marketplace</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((prod) => {
            if (!prod || !prod.name) return null;
            return (
              <div key={prod._id} className="card-base p-0 overflow-hidden flex flex-col justify-between">
                <Link to={`/products/${prod._id}`} className="aspect-4/3 w-full bg-bg-tertiary overflow-hidden block">
                  <img
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600'}
                    alt={prod.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-accent block">
                      {prod.sellerId?.businessName || 'Artisan Workshop'}
                    </span>
                    <Link to={`/products/${prod._id}`} className="font-serif font-bold text-sm text-text-primary hover:text-accent line-clamp-1">
                      {prod.name}
                    </Link>
                    <span className="text-sm font-bold text-text-primary block mt-1">₹{prod.price}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(prod._id)}
                      className="btn-primary py-1.5 px-3 text-xs flex-1 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod._id)}
                      className="p-2 rounded-btn text-text-secondary hover:text-status-danger transition-colors border border-border"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
