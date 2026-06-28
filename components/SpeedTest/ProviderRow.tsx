'use client';

import { motion } from 'framer-motion';
import { Crown, AlertTriangle, Clock, Server } from 'lucide-react';
import type { ProviderResult } from '@/types';
import {
  cn,
  formatLatency,
  getLatencyStyle,
  getLatencyBarColor,
  getReliabilityColor,
  countryCodeToFlag,
} from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProviderRowProps {
  result: ProviderResult;
  index: number;
  isIdle: boolean;
  maxAvg: number;
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  warmup: 'Probing…',
  testing: 'Testing…',
  done: '',
  timeout: 'Offline',
  error: 'Error',
};

export function ProviderRow({ result, index, isIdle, maxAvg }: ProviderRowProps) {
  const { provider, status, avgMs, minMs, maxMs, medianMs, reliability, rank, viaProxy } = result;
  const isFirst = rank === 1 && !viaProxy;
  const isDone = status === 'done';
  const isFailed = status === 'timeout' || status === 'error';
  const isActive = status === 'testing' || status === 'warmup';

  const barWidth =
    isDone && avgMs !== null && maxAvg > 0
      ? Math.max(4, Math.round((avgMs / maxAvg) * 100))
      : 0;

  const barColor = getLatencyBarColor(avgMs);

  return (
    <motion.div
      layout
      initial={isIdle ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.015 }}
      className={cn(
        'group relative grid items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200',
        // Responsive grid: stack on small screens
        'grid-cols-[1fr_auto] sm:grid-cols-[1fr_72px_72px_72px_72px_52px]',
        isFirst && isDone
          ? 'bg-surface-800 border-amber-500/20 hover:bg-surface-700'
          : viaProxy && isDone
          ? 'bg-surface-800 border-purple-500/10 hover:bg-surface-700'
          : 'bg-surface-800 border-surface-600 hover:bg-surface-700 hover:border-surface-500'
      )}
    >
      {/* ── Provider Name Column ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Color dot */}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: provider.color }}
        />

        <div className="min-w-0 flex-1">
          {/* Name row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-white truncate">
              {provider.name}
            </span>

            {/* Country flag */}
            {provider.country && (
              <span className="text-sm leading-none" title={provider.country}>
                {countryCodeToFlag(provider.country)}
              </span>
            )}

            {/* Winner crown */}
            {isFirst && isDone && (
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}

            {/* Via-proxy badge */}
            {isDone && viaProxy && (
              <span
                title="Latency measured server-side (CORS not supported by this provider). Reflects server→provider latency, not your browser→provider latency."
                className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-help"
              >
                <Server className="w-2.5 h-2.5" />
                PROXY
              </span>
            )}
          </div>

          {/* Latency bar */}
          {isDone && avgMs !== null && (
            <div className="mt-1 h-0.5 bg-surface-800 rounded-full overflow-hidden w-full max-w-[180px]">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: '0%' }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          )}
        </div>

        {/* Active / failed status chip */}
        {(isActive || isFailed) && (
          <span
            className={cn(
              'ml-auto shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full',
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-surface-800 text-muted border border-surface-600'
            )}
          >
            {isActive && (
              <motion.span
                className="inline-block mr-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ●
              </motion.span>
            )}
            {statusLabel[status]}
          </span>
        )}
      </div>

      {/* ── Stats Columns (hidden on mobile, shown sm+) ──────────────────── */}

      {/* Min */}
      <div className="hidden sm:block text-right font-mono text-xs">
        {renderCell(isIdle, isDone, isActive, isFailed, minMs, false)}
      </div>

      {/* Avg */}
      <div className="hidden sm:block text-right font-mono text-xs">
        {renderCell(isIdle, isDone, isActive, isFailed, avgMs, true, index === 0)}
      </div>

      {/* Max */}
      <div className="hidden sm:block text-right font-mono text-xs">
        {renderCell(isIdle, isDone, isActive, isFailed, maxMs, false)}
      </div>

      {/* Median */}
      <div className="hidden sm:block text-right font-mono text-xs">
        {renderCell(isIdle, isDone, isActive, isFailed, medianMs, false)}
      </div>

      {/* Reliability */}
      <div className="hidden sm:block text-right font-mono text-xs">
        {isIdle ? (
          <span className="text-muted">—</span>
        ) : isDone ? (
          <span className={cn('font-medium', getReliabilityColor(reliability))}>
            {reliability}%
          </span>
        ) : isActive ? (
          <Skeleton className="h-3 w-8 ml-auto" />
        ) : isFailed ? (
          <AlertTriangle className="w-3.5 h-3.5 text-muted ml-auto" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-muted ml-auto" />
        )}
      </div>

      {/* Mobile: just show avg prominently */}
      <div className="sm:hidden text-right font-mono text-xs">
        {isDone && avgMs !== null ? (
          <span className="font-bold font-mono" style={getLatencyStyle(avgMs, index === 0)}>
            {formatLatency(avgMs)}
          </span>
        ) : isActive ? (
          <Skeleton className="h-3 w-12" />
        ) : isFailed ? (
          <span className="text-muted text-[10px]">offline</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </div>
    </motion.div>
  );
}

// ── Helper to render a latency cell ────────────────────────────────────────────

function renderCell(
  isIdle: boolean,
  isDone: boolean,
  isActive: boolean,
  isFailed: boolean,
  value: number | null,
  bold: boolean,
  isBest: boolean = false
): React.ReactNode {
  if (isIdle) return <span className="text-muted">—</span>;
  if (isDone) {
    return (
      <span 
        className="font-bold font-mono"
        style={getLatencyStyle(value, isBest)}
      >
        {formatLatency(value)}
      </span>
    );
  }
  if (isActive) return <Skeleton className="h-3 w-10 ml-auto" />;
  return <span className="text-muted">—</span>;
}
