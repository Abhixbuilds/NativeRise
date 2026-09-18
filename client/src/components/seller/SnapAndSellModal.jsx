import React, { useState } from 'react';
import { Camera, Sparkles, Upload, Loader2, Check, ArrowRight } from 'lucide-react';
import { productService } from '../../services/services';

export const SnapAndSellModal = ({ isOpen, onClose, onSuggestionAccepted }) => {
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [category, setCategory] = useState('Handicrafts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(files);
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
    }
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      formData.append('category', category);

      const res = await productService.suggestFromImage(formData);
      if (res.success && res.data) {
        setSuggestion(res.data);
      }
    } catch (err) {
      alert('AI image suggestion failed. Falling back to manual entry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onSuggestionAccepted({
        name: suggestion.suggestedName,
        category: suggestion.suggestedCategory,
        descriptionOriginal: suggestion.suggestedDescription,
        price: suggestion.suggestedPriceRange?.min || 500,
        weightGrams: suggestion.suggestedWeightGrams || 500,
        images: suggestion.uploadedImages?.length > 0 ? suggestion.uploadedImages : previewUrls
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-card shadow-elevated border border-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-accent-dark">
            <Camera className="w-5 h-5 text-accent" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Snap & Sell — AI Listing Assistant (§7.15)
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>

        {!suggestion ? (
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Upload 1-3 photos of your craft, food produce, or fabric. Our visual AI assistant will instantly analyze the product and generate recommended titles, categories, descriptions, and price estimates.
            </p>

            <div>
              <label className="block font-semibold text-text-secondary mb-1">Broad Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
              >
                <option value="Handicrafts">Handicrafts & Decor</option>
                <option value="Food">Food Products & Honey</option>
                <option value="Agriculture">Spices & Agriculture</option>
                <option value="Clothing">Clothing & Handloom</option>
              </select>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-accent transition-colors bg-bg-tertiary/50">
              <input
                type="file"
                multiple
                accept="image/*"
                id="snap-images"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="snap-images" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent-light text-accent-dark mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-semibold text-accent-dark text-sm block">
                  Click to Upload Photos
                </span>
                <span className="text-[11px] text-text-secondary block">
                  JPEG, PNG or WebP up to 10MB
                </span>
              </label>
            </div>

            {/* Previews */}
            {previewUrls.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-outline py-2 px-4">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || images.length === 0}
                className="btn-primary py-2 px-5 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Craft Features...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Listing Suggestions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Suggestion Preview Card */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" /> AI Suggestions Ready
              </span>
              <p className="text-[11px] text-emerald-800">
                You can accept these generated details as-is or adjust price and stock before publishing.
              </p>
            </div>

            <div className="space-y-3 bg-bg-tertiary p-4 rounded-xl border border-border">
              <div>
                <span className="text-text-secondary font-semibold block text-[11px]">Recommended Title:</span>
                <span className="font-serif text-sm font-bold text-text-primary">
                  {suggestion.suggestedName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-secondary font-semibold block text-[11px]">Category:</span>
                  <span className="font-medium text-text-primary">{suggestion.suggestedCategory}</span>
                </div>
                <div>
                  <span className="text-text-secondary font-semibold block text-[11px]">Suggested Price Range:</span>
                  <span className="font-bold text-accent">
                    ₹{suggestion.suggestedPriceRange?.min} - ₹{suggestion.suggestedPriceRange?.max}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-text-secondary font-semibold block text-[11px]">Generated Description:</span>
                <p className="text-text-primary text-[12px] leading-relaxed">
                  {suggestion.suggestedDescription}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="btn-outline py-2 px-3 text-xs"
              >
                Upload Different Photos
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="btn-primary py-2 px-5 text-xs flex items-center gap-2"
              >
                <span>Accept & Fill Listing Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnapAndSellModal;
