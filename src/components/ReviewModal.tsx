import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { Star, X, Check, Award } from 'lucide-react';

interface ReviewModalProps {
  job: Job;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ job, onClose }) => {
  const { submitReview } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual Arrival', 'High Quality Work']);

  const complimentTags = [
    'Punctual Arrival',
    'Fair & Transparent Pricing',
    'Clean Jobsite',
    'High Quality Work',
    'Great Communication',
    'Expert Diagnostics',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const fullComment = selectedTags.length > 0
      ? `${comment.trim()} (${selectedTags.join(', ')})`
      : comment.trim();

    submitReview({
      jobId: job.id,
      providerId: job.hiredProviderId || 'user_prov_1',
      rating,
      comment: fullComment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-900">Review {job.hiredProviderName}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Star selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
              Overall Experience Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-neutral-700 mt-1 block">
              {rating === 5 && 'Outstanding Work (5.0)'}
              {rating === 4 && 'Great Service (4.0)'}
              {rating === 3 && 'Average (3.0)'}
              {rating <= 2 && 'Needs Improvement'}
            </span>
          </div>

          {/* Compliment Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Highlight Special Qualities:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {complimentTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      active
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {active ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Written Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the trade specialist's punctuality, work quality, and communication..."
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Publish Verified Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
