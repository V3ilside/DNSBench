'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, RefreshCw, ChevronDown, Globe, Server } from 'lucide-react';
import { useDohBenchmark } from './useDohBenchmark';
import { ProviderRow } from './ProviderRow';
import { LatencyChart } from './LatencyChart';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProviderFilterDropdown } from './ProviderFilterDropdown';
import { DOH_PROVIDERS } from '@/lib/doh-providers';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function SpeedTestPanel() {
  const [activeProviders, setActiveProviders] = useState(DOH_PROVIDERS);
  const [iterations, setIterations] = useState(5);

  useEffect(() => {
    try {
      const storedIters = localStorage.getItem('custom_dns_iterations');
      if (storedIters) {
        const parsed = parseInt(storedIters, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
          setIterations(parsed);
        }
      }
    } catch {
      // ignore
    }

    const readIterations = () => {
      try {
        const storedIters = localStorage.getItem('custom_dns_iterations');
        if (storedIters) {
          const parsed = parseInt(storedIters, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
            setIterations(parsed);
          }
        } else {
          setIterations(5);
        }
      } catch {}
    };

    // Cross-tab sync
    window.addEventListener('storage', readIterations);
    // Same-window sync via custom event from SettingsModal
    window.addEventListener('settings-changed', readIterations);

    return () => {
      window.removeEventListener('storage', readIterations);
      window.removeEventListener('settings-changed', readIterations);
    };
  }, []);

  const {
    sortedResults,
    status,
    progress,
    completedCount,
    total,
    runTest,
    reset,
    isRunning,
  } = useDohBenchmark(activeProviders, iterations);

  const [showChart, setShowChart] = useState(false);

  const isDone = status === 'done';
  const isIdle = status === 'idle';
  // Winner = fastest direct-measured result; fall back to proxy if all are proxy
  const winner = isDone
    ? (sortedResults.find((r) => r.avgMs !== null && !r.viaProxy) ??
       sortedResults.find((r) => r.avgMs !== null))
    : null;
  const proxyCount = isDone ? sortedResults.filter((r) => r.viaProxy && r.avgMs !== null).length : 0;
  const directCount = isDone ? sortedResults.filter((r) => !r.viaProxy && r.avgMs !== null).length : 0;

  return (
    <section id="speed-test" className="w-full">
      <GlassCard className="overflow-hidden">
        {/* ── Panel Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                DoH Speed Benchmark
                <ProviderFilterDropdown
                  activeProviders={activeProviders}
                  onChange={setActiveProviders}
                  disabled={isRunning}
                />
              </h2>
              <p className="text-xs text-muted mt-1">
                {iterations} iterations per provider · auto CORS detection
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isDone && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowChart((v) => !v)}
                className="btn-ghost flex items-center gap-1.5"
              >
                Chart
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 transition-transform',
                    showChart && 'rotate-180'
                  )}
                />
              </motion.button>
            )}

            {!isIdle && !isRunning && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={reset}
                className="btn-ghost flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: isRunning ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={isRunning ? undefined : runTest}
              disabled={isRunning}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg',
                isRunning
                  ? 'bg-surface-800 text-muted cursor-not-allowed border border-surface-600'
                  : 'btn-ghost text-white border-white hover:bg-white hover:text-black shadow-glow-violet-sm'
              )}
            >
              {isRunning ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    <Zap className="w-4 h-4" />
                  </motion.span>
                  Testing…
                </>
              ) : isDone ? (
                <>
                  <Zap className="w-4 h-4" />
                  Re-run Test
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Speed Test
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ── Winner Banner ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {isDone && winner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-3 p-4 rounded-xl bg-surface-800 border border-amber-500/20 flex items-center gap-3"
            >
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-400/80 font-medium uppercase tracking-wider">
                  Fastest for your location{winner.viaProxy ? ' (server-side)' : ''}
                </p>
                <p className="text-white font-bold text-base truncate">
                  {winner.provider.name}
                  <span className="ml-2 text-amber-400 font-mono text-sm">
                    {winner.avgMs}ms avg
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Measurement Mode Legend ────────────────────────────────────── */}
        <AnimatePresence>
          {isDone && (directCount > 0 || proxyCount > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-wrap gap-2 text-[11px]"
            >
              {directCount > 0 && (
                <span className="flex items-center gap-1.5 badge-success px-2.5 py-1">
                  <Globe className="w-3 h-3" />
                  <strong>{directCount}</strong> browser-direct — your real latency
                </span>
              )}
              {proxyCount > 0 && (
                <span
                  className="flex items-center gap-1.5 badge-active px-2.5 py-1 cursor-help"
                  title="These providers block browser CORS requests. Latency was measured server-side and reflects network from the server, not your device."
                >
                  <Server className="w-3 h-3" />
                  <strong>{proxyCount}</strong> via proxy — server-side latency (CORS blocked)
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress Bar ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5"
            >
              <div className="flex justify-between text-xs text-muted mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  {status === 'warmup' ? 'Warming up connections…' : 'Testing resolvers…'}
                </span>
                <span className="font-mono">
                  {completedCount}/{total}
                </span>
              </div>
              <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full shadow-glow-violet-sm"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chart (collapsible) ───────────────────────────────────────── */}
        <AnimatePresence>
          {isDone && showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <LatencyChart results={sortedResults} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Column Headers ────────────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_80px_80px_80px_80px_60px] gap-2 px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <span>Provider</span>
          <span className="text-right">Min</span>
          <span className="text-right">Avg</span>
          <span className="text-right">Max</span>
          <span className="text-right">Median</span>
          <span className="text-right">Rel.</span>
        </div>

        {/* ── Provider Rows ─────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          {sortedResults.map(
            (result, idx) => (
              <ProviderRow
                key={result.provider.id}
                result={result}
                index={idx}
                isIdle={isIdle}
                maxAvg={
                  Math.max(
                    ...sortedResults
                      .map((r) => r.avgMs ?? 0)
                      .filter(Boolean)
                  ) || 1
                }
              />
            )
          )}
        </div>

        {/* ── Footer Note ───────────────────────────────────────────────── */}
        <p className="mt-4 text-xs text-center text-secondary">
          Measurements include HTTP/TLS overhead · Times in milliseconds
        </p>
      </GlassCard>
    </section>
  );
}
