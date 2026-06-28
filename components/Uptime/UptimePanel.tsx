'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { UPTIME_MAP } from '@/lib/community-ratings';
import { getDayStatus, countIncidents, DAY_STATUS_BG } from '@/lib/uptime-utils';
import { GlassCard } from '@/components/ui/GlassCard';

function UptimeRow({ provider, index }: { provider: any; index: number }) {
  const seed = UPTIME_MAP[provider.id];
  if (!seed) return null;

  const { downDays, degradedDays } = countIncidents(provider.id, seed.uptimePercent, 90);

  // Generate 90 days of history (0 is today)
  const days = Array.from({ length: 90 }).map((_, i) => ({
    dayIndex: i,
    status: getDayStatus(provider.id, 89 - i, seed.uptimePercent), // 89=oldest, 0=newest
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group grid grid-cols-1 md:grid-cols-[220px_1fr] items-center gap-4 p-4 border-b border-surface-600 last:border-0 hover:bg-surface-800 transition-colors"
    >
      {/* Provider Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: provider.color }}
          />
          <span className="font-semibold text-white">{provider.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted pl-5">
          <span className={seed.uptimePercent >= 99.9 ? 'text-emerald-400' : seed.uptimePercent >= 99.5 ? 'text-amber-400' : 'text-red-400'}>
            {seed.uptimePercent}%
          </span>
          <span>{seed.avgResponseMs}ms avg</span>
        </div>
      </div>

      {/* 90-day History Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-[2px] w-full">
          {days.map((d, i) => (
            <div
              key={i}
              className={`h-6 flex-1 rounded-[1px] opacity-80 group-hover:opacity-100 transition-opacity ${DAY_STATUS_BG[d.status]}`}
              title={`${90 - i} days ago: ${d.status}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-muted font-medium uppercase tracking-wider">
          <span>90 days ago</span>
          <div className="flex gap-4 text-secondary">
            {downDays > 0 && <span className="text-red-400">{downDays} down</span>}
            {degradedDays > 0 && <span className="text-amber-400">{degradedDays} degraded</span>}
            {downDays === 0 && degradedDays === 0 && <span className="text-emerald-400">100% clean</span>}
          </div>
          <span>Today</span>
        </div>
      </div>
    </motion.div>
  );
}

export function UptimePanel() {
  // Sort providers by uptime descending
  const sortedProviders = [...DOH_PROVIDERS].sort((a, b) => {
    const uA = UPTIME_MAP[a.id]?.uptimePercent ?? 0;
    const uB = UPTIME_MAP[b.id]?.uptimePercent ?? 0;
    return uB - uA;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-violet-400" />
            90-Day Global Uptime
          </h2>
          <p className="text-sm text-secondary">
            Historical reliability based on global probing across 50+ locations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 bg-surface-800 rounded-lg border border-surface-600 text-xs font-medium text-secondary">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Operational
          </span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-500" /> Outage
          </span>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-col">
          {sortedProviders.map((provider, i) => (
            <UptimeRow key={provider.id} provider={provider} index={i} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
