'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { benchmarkProvider, computeStats } from '@/lib/doh-benchmark';
import type { DoHProvider, ProviderResult, BenchmarkStatus, ProviderSample } from '@/types';

/** How many providers to benchmark in parallel (too high = rate limiting) */
const CONCURRENT_PROVIDERS = 3;

function initResults(providers: DoHProvider[]): ProviderResult[] {
  return providers.map((provider) => ({
    provider,
    samples: [],
    minMs: null,
    avgMs: null,
    maxMs: null,
    medianMs: null,
    reliability: 0,
    status: 'pending',
    viaProxy: undefined,
  }));
}

export function useDohBenchmark(providers: DoHProvider[], iterations: number = 5) {
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [status, setStatus] = useState<BenchmarkStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const abortRef = useRef(false);

  /** Patch a single provider's result in state */
  const updateProvider = useCallback(
    (providerId: string, patch: Partial<ProviderResult>) => {
      setResults((prev) =>
        prev.map((r) =>
          r.provider.id === providerId ? { ...r, ...patch } : r
        )
      );
    },
    []
  );

  const runTest = useCallback(async () => {
    abortRef.current = false;
    setStatus('warmup');
    setProgress(0);
    setCompletedCount(0);
    setResults(initResults(providers));

    const total = providers.length;
    let done = 0;

    setStatus('testing');

    for (let i = 0; i < providers.length; i += CONCURRENT_PROVIDERS) {
      if (abortRef.current) break;

      const batch = providers.slice(i, i + CONCURRENT_PROVIDERS);

      await Promise.all(
        batch.map(async (provider) => {
          if (abortRef.current) return;

          updateProvider(provider.id, { status: 'warmup' });
          await new Promise((r) => setTimeout(r, 10)); // yield to React
          updateProvider(provider.id, { status: 'testing', samples: [] });

          const collectedSamples: ProviderSample[] = [];

          try {
            const { samples: rawSamples, viaProxy } = await benchmarkProvider(
              provider.dohUrl,
              iterations,
              (sample, proxyUsed) => {
                if (abortRef.current) return;
                collectedSamples.push(sample);
                const stats = computeStats(collectedSamples.map((s) => s.latencyMs));
                updateProvider(provider.id, {
                  samples: [...collectedSamples],
                  viaProxy: proxyUsed,
                  ...stats,
                });
              }
            );

            if (abortRef.current) return;

            const stats = computeStats(rawSamples);
            const allNull = rawSamples.every((s) => s === null);

            updateProvider(provider.id, {
              samples: collectedSamples,
              ...stats,
              viaProxy,
              status: allNull ? 'timeout' : 'done',
            });
          } catch {
            updateProvider(provider.id, { status: 'error' });
          }

          done++;
          setCompletedCount(done);
          setProgress(Math.round((done / total) * 100));
        })
      );
    }

    if (!abortRef.current) {
      // Assign ranks (only among directly measured first, then proxy)
      setResults((prev) => {
        const sortable = prev
          .filter((r) => r.avgMs !== null)
          .sort((a, b) => {
            // Direct measurements rank above proxy measurements of the same speed
            if (a.viaProxy !== b.viaProxy) return a.viaProxy ? 1 : -1;
            return (a.avgMs ?? Infinity) - (b.avgMs ?? Infinity);
          });

        return prev.map((r) => {
          const rankIdx = sortable.findIndex((s) => s.provider.id === r.provider.id);
          return { ...r, rank: rankIdx >= 0 ? rankIdx + 1 : undefined };
        });
      });

      setStatus('done');
      setProgress(100);
    }
  }, [updateProvider, providers, iterations]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setProgress(0);
    setCompletedCount(0);
    setResults(initResults(providers));
  }, [providers]);

  // Sync results if providers change while idle
  useEffect(() => {
    if (status === 'idle') {
      setResults(initResults(providers));
    }
  }, [providers, status]);

  /** Sort: direct-measured first by avg latency, then proxy-measured */
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.avgMs === null && b.avgMs === null) return 0;
      if (a.avgMs === null) return 1;
      if (b.avgMs === null) return -1;
      // During testing: no proxy ordering yet, just sort by latency
      if (status !== 'done') return a.avgMs - b.avgMs;
      // Done: direct < proxy for same latency band
      if (a.viaProxy !== b.viaProxy) return a.viaProxy ? 1 : -1;
      return a.avgMs - b.avgMs;
    });
  }, [results, status]);

  return {
    sortedResults,
    status,
    progress,
    completedCount,
    total: providers.length,
    runTest,
    reset,
    isRunning: status === 'testing' || status === 'warmup',
  };
}
