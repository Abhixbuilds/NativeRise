import React, { useState } from 'react';
import { Sparkles, MapPin, Hammer, QrCode, ChevronDown, ChevronUp } from 'lucide-react';

export const ProvenanceCard = ({ provenance = {}, sellerName = '', region = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!provenance.artisanStory && !provenance.processNote && !region) {
    return null;
  }

  return (
    <div className="rounded-card bg-accent-light/40 border border-accent/20 p-5 space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-secondary-light" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-accent-dark">Artisan Provenance & Craft Story</h4>
            <p className="text-xs text-text-secondary">Authenticity verified from rural origin</p>
          </div>
        </div>
        <button type="button" className="p-1 rounded text-accent">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-2 border-t border-accent/10 space-y-3.5 text-xs text-text-primary">
          {provenance.region && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-accent-dark block">Region of Origin:</span>
                <span className="text-text-secondary">{provenance.region}</span>
              </div>
            </div>
          )}

          {provenance.artisanStory && (
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-accent-dark block">Maker's Heritage:</span>
                <p className="text-text-secondary leading-relaxed">{provenance.artisanStory}</p>
              </div>
            </div>
          )}

          {provenance.processNote && (
            <div className="flex items-start gap-2">
              <Hammer className="w-4 h-4 text-accent-dark shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-accent-dark block">Craft Technique:</span>
                <p className="text-text-secondary leading-relaxed">{provenance.processNote}</p>
              </div>
            </div>
          )}

          {provenance.qrCodeUrl && (
            <div className="pt-2 flex items-center gap-3 bg-white p-2.5 rounded-lg border border-accent/15">
              <img src={provenance.qrCodeUrl} alt="Artisan Verification QR" className="w-12 h-12 rounded" />
              <div className="text-[11px]">
                <p className="font-semibold text-text-primary flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-accent" /> Digital Provenance Passport
                </p>
                <p className="text-text-secondary">Scan to trace GI-region verification & maker co-op ledger.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvenanceCard;
