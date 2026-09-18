import React, { useState } from 'react';
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { disputeService } from '../../services/services';
import VoiceRecorder from '../common/VoiceRecorder';

export const DisputeModal = ({ isOpen, onClose, orderId, onDisputeCreated }) => {
  const [category, setCategory] = useState('order');
  const [description, setDescription] = useState('');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTranscription = ({ voiceNoteUrl: url, transcribedText }) => {
    setVoiceNoteUrl(url);
    if (transcribedText) {
      setDescription((prev) => (prev ? `${prev}\n\n[Voice Note Transcript]: ${transcribedText}` : `[Voice Note Transcript]: ${transcribedText}`));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your grievance or record a voice note.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await disputeService.createDispute({
        orderId,
        category,
        description,
        voiceNoteUrl
      });

      if (res.success) {
        onDisputeCreated && onDisputeCreated(res.data.dispute);
        onClose();
      }
    } catch (err) {
      setError(err.error?.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-card shadow-elevated border border-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-text-primary">Raise an Issue / Grievance</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
            >
              <option value="order">Order Fulfillment Issue</option>
              <option value="delivery">Delivery Delay or Damage</option>
              <option value="product">Product Quality or Discrepancy</option>
              <option value="payment">Payment / Overcharge</option>
              <option value="refund">Cancellation & Refund Request</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Voice Note Grievance Redressal (§7.14)
            </label>
            <VoiceRecorder onTranscriptionReceived={handleTranscription} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Written Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about your issue for Community Trust Circle & Admin review..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
              required
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit for Redressal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
