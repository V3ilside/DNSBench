'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { RATING_CATEGORIES } from '@/lib/community-ratings';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import type { UserRating, CategoryRatings, RatingCategory } from '@/types';

interface RatingModalProps {
  providerId: string | null;
  existingRating?: UserRating;
  onClose: () => void;
  onSave: (rating: UserRating) => void;
}

export function RatingModal({ providerId, existingRating, onClose, onSave }: RatingModalProps) {
  const [ratings, setRatings] = useState<Partial<CategoryRatings>>({});

  useEffect(() => {
    if (existingRating) {
      setRatings({ ...existingRating.categories });
    } else {
      setRatings({});
    }
  }, [existingRating, providerId]);

  if (!providerId) return null;
  const provider = DOH_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;

  const handleRate = (catKey: RatingCategory, score: number) => {
    setRatings((prev) => ({ ...prev, [catKey]: score }));
  };

  const handleSave = () => {
    const finalCategories: CategoryRatings = {
      privacy: ratings.privacy ?? 5,
      speed: ratings.speed ?? 5,
      security: ratings.security ?? 5,
      reliability: ratings.reliability ?? 5,
      transparency: ratings.transparency ?? 5,
      features: ratings.features ?? 5,
    };

    onSave({
      providerId,
      categories: finalCategories,
      timestamp: Date.now(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg"
        >
          <div className="p-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-secondary hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              Rate {provider.name}
            </h2>
            <p className="text-sm text-secondary mb-6">
              Share your experience to help the community.
            </p>

            <div className="space-y-6">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">{cat.description}</p>
                    </div>
                    <span className="text-sm font-mono text-violet-400">
                      {ratings[cat.key] ? `${ratings[cat.key]}/10` : '-/10'}
                    </span>
                  </div>

                  {/* 1-10 slider/buttons */}
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const score = i + 1;
                      const isSelected = ratings[cat.key] === score;
                      const isPast = (ratings[cat.key] || 0) >= score;
                      return (
                        <button
                          key={score}
                          onClick={() => handleRate(cat.key, score)}
                          className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-violet-600 text-white'
                              : isPast
                              ? 'bg-violet-500/30 text-violet-200'
                              : 'bg-surface-800 text-muted hover:bg-surface-700'
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted mt-1 px-1 uppercase tracking-wider">
                    <span>{cat.lowLabel}</span>
                    <span>{cat.highLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 justify-end">
              <button
                onClick={onClose}
                className="w-32 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-32 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
