'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, CheckCircle2, XCircle, Shield, Zap, Lock } from 'lucide-react';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { PROVIDER_REVIEWS } from '@/lib/provider-reviews';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export function ReviewsPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort providers by editorial score descending
  const sortedProviders = [...DOH_PROVIDERS].sort((a, b) => {
    const sA = PROVIDER_REVIEWS[a.id]?.editorialScore ?? 0;
    const sB = PROVIDER_REVIEWS[b.id]?.editorialScore ?? 0;
    return sB - sA;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-violet-400" />
          Editorial Reviews
        </h2>
        <p className="text-sm text-secondary max-w-3xl">
          Unbiased, research-based reviews of each DNS provider. We evaluate their privacy policies, 
          jurisdiction, performance, and security features to help you make an informed choice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedProviders.map((provider) => {
          const review = PROVIDER_REVIEWS[provider.id];
          if (!review) return null;

          const isExpanded = expandedId === provider.id;

          return (
            <GlassCard
              key={provider.id}
              className={cn(
                'transition-all duration-300',
                isExpanded ? 'ring-1 ring-violet-500/30' : 'hover:bg-surface-800'
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                className="w-full p-5 flex items-start sm:items-center justify-between text-left gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: provider.color }}
                      />
                      <h3 className="text-lg font-bold text-white">{review.reviewTitle || provider.name}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-surface-800 text-xs font-medium text-muted">
                      Score: <span className="text-amber-400 font-bold">{review.editorialScore.toFixed(1)}</span>/10
                    </span>
                  </div>
                  <p className="text-sm text-secondary font-medium">{review.tagline}</p>
                </div>
                <div className="shrink-0 p-2 bg-surface-800 rounded-full text-secondary">
                  <ChevronDown
                    className={cn('w-5 h-5 transition-transform duration-300', isExpanded && 'rotate-180')}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-surface-600 mt-2 space-y-6">
                      {/* Summary */}
                      <div>
                        <p className="text-sm text-secondary leading-relaxed">
                          {review.summary}
                        </p>
                      </div>

                      {/* Tiers Dropdown */}
                      {review.tiers && review.tiers.length > 0 && (
                        <details className="group bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
                          <summary className="p-4 cursor-pointer text-sm font-bold text-white flex items-center justify-between hover:bg-surface-700 transition-colors">
                            <span className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-violet-400" />
                              Available Tiers ({review.tiers.length})
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-4 pt-0 space-y-4 border-t border-white/[0.02] mt-2">
                            {review.tiers.map((tier, i) => (
                              <div key={i} className="pl-6 border-l-2 border-indigo-500/20">
                                <div className="text-sm font-semibold text-indigo-300">{tier.name}</div>
                                <div className="text-xs text-slate-400 mt-1 leading-relaxed">{tier.description}</div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Privacy */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-emerald-400" /> Privacy & Jurisdiction
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {review.privacyDetail}
                          </p>
                        </div>
                        {/* Performance */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-400" /> Performance
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {review.performanceDetail}
                          </p>
                        </div>
                        {/* Security */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-indigo-400" /> Security & Filtering
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {review.securityDetail}
                          </p>
                        </div>
                      </div>

                      {/* Pros/Cons/Best For */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Pros</h4>
                          <ul className="space-y-2">
                            {review.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Cons</h4>
                          <ul className="space-y-2">
                            {review.cons.map((con, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Verdict */}
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Final Verdict</h4>
                        <p className="text-sm text-slate-200 font-medium leading-relaxed">
                          {review.verdict}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Last Updated: {review.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
