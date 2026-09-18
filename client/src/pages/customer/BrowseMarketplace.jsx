import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Loader2, Sparkles } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { productService } from '../../services/services';

export const BrowseMarketplace = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const categories = ['All', 'Handicrafts', 'Food', 'Agriculture', 'Clothing'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        category: category !== 'All' ? category : undefined,
        search: search || undefined,
        sortBy,
        page,
        limit: 12
      });

      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.totalResults || 0);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
          Grassroots Digital Marketplace
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-accent-dark">
          Explore Authentic Indian Rural Crafts
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
          Direct from verified artisan cooperatives with guaranteed origin provenance and transparent fair pricing.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-base p-4 space-y-4 shadow-soft">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by craft, region, material (e.g. bamboo, honey, khadi, brass)..."
              className="w-full pl-10 pr-24 py-2.5 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-bg-tertiary/40"
            />
            <button
              type="submit"
              className="btn-primary absolute right-1.5 top-1.5 py-1.5 px-3 text-xs"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-lg border border-border bg-white text-text-primary focus:ring-2 focus:ring-accent"
            >
              <option value="createdAt">Latest Creations</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Top Rated by Customers</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-btn text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-border/60'
              }`}
            >
              {cat === 'All' ? 'All Craft Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <div className="card-base p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent-light text-accent-dark mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-text-primary">No Matching Crafts Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Try adjusting your search terms or choose a different craft category.
          </p>
          <button
            type="button"
            onClick={() => { setSearch(''); setCategory('All'); }}
            className="btn-outline text-xs inline-flex"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Showing <strong>{products.length}</strong> of <strong>{totalResults}</strong> handcrafted items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-outline py-1.5 px-3 text-xs"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-text-primary px-3">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-outline py-1.5 px-3 text-xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseMarketplace;
