import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Camera,
  Share2,
  Copy,
  Edit,
  Trash2,
  Sparkles,
  MessageCircle,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { productService } from '../../services/services';
import { useAuthStore } from '../../store/useAuthStore';
import SnapAndSellModal from '../../components/seller/SnapAndSellModal';
import WhatsAppShareModal from '../../components/seller/WhatsAppShareModal';

export const SellerProducts = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [descriptionOriginal, setDescriptionOriginal] = useState('');
  const [originalLanguage, setOriginalLanguage] = useState('en');
  const [category, setCategory] = useState('Handicrafts');
  const [price, setPrice] = useState('');
  const [productCost, setProductCost] = useState('');
  const [packagingCost, setPackagingCost] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState(['https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600']);
  const [weightGrams, setWeightGrams] = useState(500);
  const [artisanStory, setArtisanStory] = useState('');
  const [region, setRegion] = useState('');
  const [processNote, setProcessNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const sellerId = user?.profile?._id;
      const res = await productService.getProducts({ sellerId, limit: 50 });
      if (res.success && res.data) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const resetForm = () => {
    setName('');
    setDescriptionOriginal('');
    setOriginalLanguage('en');
    setCategory('Handicrafts');
    setPrice('');
    setProductCost('');
    setPackagingCost('');
    setStock('');
    setImages(['https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600']);
    setWeightGrams(500);
    setArtisanStory('');
    setRegion('');
    setProcessNote('');
    setEditingProduct(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSnapSuggestion = (suggestion) => {
    setName(suggestion.name || '');
    setCategory(suggestion.category || 'Handicrafts');
    setDescriptionOriginal(suggestion.descriptionOriginal || '');
    setPrice(suggestion.price || 500);
    setWeightGrams(suggestion.weightGrams || 500);
    if (suggestion.images?.length > 0) {
      setImages(suggestion.images);
    }
    setIsAddModalOpen(true);
  };

  const handleRepeatListing = async (productId) => {
    try {
      const res = await productService.repeatListing(productId);
      if (res.success && res.data?.template) {
        const t = res.data.template;
        setName(t.name);
        setDescriptionOriginal(t.descriptionOriginal);
        setOriginalLanguage(t.originalLanguage || 'en');
        setCategory(t.category);
        setPrice(''); // left blank per §7.17
        setStock(''); // left blank per §7.17
        setProductCost(t.productCost || '');
        setPackagingCost(t.packagingCost || '');
        setWeightGrams(t.weightGrams || 500);
        setImages(t.images || []);
        setArtisanStory(t.provenanceCard?.artisanStory || '');
        setRegion(t.provenanceCard?.region || '');
        setProcessNote(t.provenanceCard?.processNote || '');
        setIsAddModalOpen(true);
      }
    } catch (err) {
      alert('Failed to clone listing');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const payload = {
      name,
      descriptionOriginal,
      originalLanguage,
      category,
      price: Number(price),
      productCost: Number(productCost) || 0,
      packagingCost: Number(packagingCost) || 0,
      stock: Number(stock),
      images,
      weightGrams: Number(weightGrams) || 500,
      provenanceCard: {
        artisanStory,
        region,
        processNote,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NativeRise-${encodeURIComponent(name)}`
      }
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        setMsg('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        setMsg('New craft published to marketplace!');
      }
      setIsAddModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.error?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Deactivate this product listing?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Artisan Catalog & Listings
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your rural inventory, Snap & Sell AI suggestions, and WhatsApp exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3.5 rounded-btn flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share to WhatsApp (§7.16)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSnapModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Snap & Sell AI (§7.15)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Craft Listing</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-accent-light text-accent-dark text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-text-primary">No Active Product Listings</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Use "Snap & Sell AI" to upload photos and create your first artisanal listing.
          </p>
        </div>
      ) : (
        <div className="card-base p-0 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Raw Cost</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-bg-tertiary/40 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1595079672139-545c600f56e9?w=600'}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div>
                        <span className="font-serif font-bold text-text-primary text-xs line-clamp-1">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          {p.weightGrams}g • {p.provenanceCard?.region || 'Rural Origin'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-text-secondary">
                      {p.category}
                    </td>

                    <td className="px-4 py-4 font-bold text-text-primary">
                      ₹{p.price}
                    </td>

                    <td className="px-4 py-4 text-text-secondary">
                      ₹{p.productCost || 0}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRepeatListing(p._id)}
                          className="p-1.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-accent hover:bg-border transition-colors"
                          title="Repeat Last Listing (§7.17)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setName(p.name);
                            setDescriptionOriginal(p.descriptionOriginal);
                            setCategory(p.category);
                            setPrice(p.price);
                            setProductCost(p.productCost || '');
                            setPackagingCost(p.packagingCost || '');
                            setStock(p.stock);
                            setWeightGrams(p.weightGrams || 500);
                            setArtisanStory(p.provenanceCard?.artisanStory || '');
                            setRegion(p.provenanceCard?.region || '');
                            setProcessNote(p.provenanceCard?.processNote || '');
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
                          title="Edit Listing"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-status-danger hover:bg-rose-50 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-card shadow-elevated border border-border p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                {editingProduct ? 'Edit Craft Listing' : 'Publish New Artisan Craft'}
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-text-secondary mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Handmade Bamboo Storage Basket"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  >
                    <option value="Handicrafts">Handicrafts & Decor</option>
                    <option value="Food">Pure Food & Wild Honey</option>
                    <option value="Agriculture">Single-Origin Spices & Agri</option>
                    <option value="Clothing">Handloom & Khadi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Original Language</label>
                  <select
                    value={originalLanguage}
                    onChange={(e) => setOriginalLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="540"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">Available Stock Units</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  />
                </div>

                {/* True Profit tracking inputs (§7.7) */}
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Raw Material Cost (₹ per unit)
                  </label>
                  <input
                    type="number"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                    placeholder="e.g. 210 (for True Profit tracking)"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Packaging / Crate Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">Craft Description</label>
                <textarea
                  rows={3}
                  required
                  value={descriptionOriginal}
                  onChange={(e) => setDescriptionOriginal(e.target.value)}
                  placeholder="Describe the materials, utility, and handmade feel..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                />
              </div>

              {/* Provenance Passport Card Info */}
              <div className="p-4 rounded-xl bg-bg-tertiary border border-border space-y-3">
                <span className="font-serif font-bold text-xs text-accent-dark block">
                  Artisan Provenance Card Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Region of Origin</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. Nashik Valley, Maharashtra"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Package Weight (Grams)</label>
                    <input
                      type="number"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(e.target.value)}
                      placeholder="500"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-text-secondary mb-1">Heritage Story & Technique</label>
                    <textarea
                      rows={2}
                      value={artisanStory}
                      onChange={(e) => setArtisanStory(e.target.value)}
                      placeholder="e.g. Handwoven with seasoned bamboo fibers harvested by tribal artisans..."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-outline py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary py-2 px-6 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{editingProduct ? 'Save Changes' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snap & Sell AI Modal */}
      <SnapAndSellModal
        isOpen={isSnapModalOpen}
        onClose={() => setIsSnapModalOpen(false)}
        onSuggestionAccepted={handleSnapSuggestion}
      />

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
};

export default SellerProducts;
