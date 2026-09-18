import React, { useState, useEffect } from 'react';
import { Share2, MessageCircle, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { sellerService } from '../../services/services';

export const WhatsAppShareModal = ({ isOpen, onClose }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      sellerService.getCatalogShare()
        .then((res) => {
          if (res.success) {
            setShareData(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareData?.shareText) {
      navigator.clipboard.writeText(shareData.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (shareData?.whatsappUrl) {
      window.open(shareData.whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-card shadow-elevated border border-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              WhatsApp Catalog Export (§7.16)
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Share your verified artisanal catalog directly with village customers, wholesale bulk buyers, and WhatsApp groups with 1-click checkout links.
            </p>

            <div className="bg-bg-tertiary p-4 rounded-xl border border-border">
              <span className="font-semibold text-text-secondary uppercase tracking-wider text-[10px] block mb-1">
                Generated Share Message
              </span>
              <pre className="font-sans whitespace-pre-wrap text-text-primary text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                {shareData?.shareText}
              </pre>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-outline w-full sm:w-auto py-2.5 px-4 text-xs flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-btn text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Launch WhatsApp Share</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppShareModal;
