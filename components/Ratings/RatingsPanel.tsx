'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { COMMUNITY_RATINGS, COMMUNITY_RATINGS_MAP } from '@/lib/community-ratings';
import { useUserRatings } from '@/lib/use-user-ratings';
import { RadarComparison } from './RadarComparison';
import { RatingModal } from './RatingModal';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export function RatingsPanel() {
  const { ratings: userRatings, saveRating } = useUserRatings();
  const [selectedForRadar, setSelectedForRadar] = useState<string[]>(['cloudflare', 'quad9', 'google']);
  const [ratingModalProvider, setRatingModalProvider] = useState<string | null>(null);

  // Sort providers by overall community score
  const sortedProviders = [...DOH_PROVIDERS].sort((a, b) => {
    const scoreA = COMMUNITY_RATINGS_MAP[a.id]?.overallScore ?? 0;
    const scoreB = COMMUNITY_RATINGS_MAP[b.id]?.overallScore ?? 0;
    return scoreB - scoreA;
  });

  const toggleRadarSelection = (id: string) => {
    setSelectedForRadar((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 10) {
        return [...prev.slice(1), id]; // keep max 10
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      {/* Top section: Radar Chart & Top 3 Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-violet-400" />
            Performance Radar
          </h3>
          <p className="text-sm text-secondary mb-6">
            Compare up to 10 providers across key performance indicators.
          </p>
          <div className="flex-1 min-h-[350px]">
            <RadarComparison ratings={COMMUNITY_RATINGS} selectedProviders={selectedForRadar} />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Rated</h3>
          <div className="space-y-4">
            {sortedProviders.slice(0, 5).map((provider, idx) => {
              const rating = COMMUNITY_RATINGS_MAP[provider.id];
              return (
                <div key={provider.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-slate-500 font-mono text-sm">#{idx + 1}</div>
                    <div className="text-sm font-medium text-white">{provider.name}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                    {rating?.overallScore?.toFixed(1) ?? 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-6 pt-4 border-t border-surface-600">
            Ratings are compiled from independent audits, technical reviews, and community consensus.
          </p>
        </GlassCard>
      </div>

      {/* Grid of all providers */}
      <h3 className="text-xl font-bold text-white mt-10 mb-4 px-1">All Providers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedProviders.map((provider) => {
          const communityRating = COMMUNITY_RATINGS_MAP[provider.id];
          const userRating = userRatings.find((r) => r.providerId === provider.id);
          const isSelected = selectedForRadar.includes(provider.id);

          return (
            <GlassCard
              key={provider.id}
              className={cn(
                'p-5 transition-all duration-200 group',
                isSelected ? 'ring-1 ring-violet-500/50 bg-violet-500/5' : 'hover:bg-surface-800'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: provider.color }}
                  />
                  <h4 className="font-semibold text-white truncate pr-2">
                    {provider.name}
                  </h4>
                </div>
                <div className="text-lg font-mono font-bold text-amber-400">
                  {communityRating?.overallScore?.toFixed(1) ?? 'N/A'}
                </div>
              </div>

              <p className="text-xs text-secondary mb-4 line-clamp-2 h-8">
                {provider.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-600">
                <button
                  onClick={() => setRatingModalProvider(provider.id)}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
                >
                  {userRating ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> You Rated
                    </>
                  ) : (
                    'Submit Your Rating'
                  )}
                </button>

                <button
                  onClick={() => toggleRadarSelection(provider.id)}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-md transition-colors',
                    isSelected
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-surface-800 text-muted hover:bg-surface-700 hover:text-white'
                  )}
                >
                  {isSelected ? 'In Radar' : 'Compare'}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {ratingModalProvider && (
        <RatingModal
          providerId={ratingModalProvider}
          existingRating={userRatings.find((r) => r.providerId === ratingModalProvider)}
          onClose={() => setRatingModalProvider(null)}
          onSave={saveRating}
        />
      )}
    </div>
  );
}
