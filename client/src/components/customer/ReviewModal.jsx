import React, { useState } from 'react';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { reviewService } from '../../services/services';

export const ReviewModal = ({ isOpen, onClose, orderId, targetType, targetId, title, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await reviewService.createReview({
        orderId,
        targetType,
        targetId,
        rating,
        comment
      });

      if (res.success) {
        onReviewSubmitted && onReviewSubmitted(res.data.review);
        onClose();
      }
    } catch (err) {
      setError(err.error?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-card shadow-elevated border border-border p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-serif text-lg font-bold text-text-primary">Leave a Rating & Review</h3>
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
          <p className="text-xs text-text-secondary">
            Reviewing: <span className="font-semibold text-text-primary">{title || targetType}</span>
          </p>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-text-primary ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Your Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other rural buyers and makers about the quality, finish, or delivery speed..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-accent bg-white"
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
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
