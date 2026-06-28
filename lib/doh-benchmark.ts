import type { ProviderSample } from '@/types';

/**
 * Domains used for rotating DoH queries.
 * Using well-known real domains (no random subdomains) to avoid DGA detection
 * and SERVFAIL responses. The HTTP-layer cache: 'no-store' prevents browser
 * caching of responses, while the DNS TTL at the provider level is acceptable.
 */
const TEST_DOMAINS = [
  'example.com',
  'cloudflare.com',
  'github.com',
  'wikipedia.org',
  'google.com',
];

function getTestDomains(): string[] {
  if (typeof window === 'undefined') return TEST_DOMAINS;
  try {
    const stored = window.localStorage.getItem('custom_dns_domains');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validDomains = parsed.filter(d => typeof d === 'string' && d.length > 0 && d.includes('.'));
        if (validDomains.length > 0) return validDomains;
      }
    }
  } catch {
    // fallback
  }
  return TEST_DOMAINS;
}

export const TIMEOUT_MS = 5000;
export const TIMEOUT_PENALTY_MS = 5000;

// ─── URL Builder ──────────────────────────────────────────────────────────────

/**
 * Build a DoH JSON query URL.
 * No random subdomains — we rotate through well-known domains to avoid
 * DGA (Domain Generation Algorithm) pattern detection which some providers
 * filter, causing artificial SERVFAIL → timeout results.
 */
export function buildDohUrl(dohEndpoint: string, domain: string): string {
  const params = new URLSearchParams({ name: domain, type: 'A' });
  return `${dohEndpoint}?${params.toString()}`;
}

// ─── Direct (Client-Side) Measurement ────────────────────────────────────────

/**
 * Attempt a direct browser fetch to a DoH endpoint.
 *
 * WHY THIS MAY FAIL:
 * The Accept: application/dns-json header is a "non-simple" CORS header that
 * triggers an OPTIONS preflight. Providers without proper CORS headers
 * (Access-Control-Allow-Origin, Access-Control-Allow-Headers) will cause the
 * browser to block the request — even though the DNS server itself is reachable.
 *
 * This is a browser security policy, not a server outage. The same providers
 * work perfectly in system-level DNS tools (dig, nslookup, etc.).
 *
 * Returns null if: CORS blocked, network error, timeout, or non-200 response.
 */
export async function measureDirect(
  dohEndpoint: string,
  domain: string
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const url = buildDohUrl(dohEndpoint, domain);
  const start = performance.now();

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/dns-json' },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    await res.json(); // consume body for accurate end-to-end timing
    return Math.round(performance.now() - start);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Proxy (Server-Side) Measurement ─────────────────────────────────────────

/**
 * Measure latency via the Next.js server-side proxy (/api/doh-proxy).
 *
 * Used automatically as a fallback when direct browser fetch fails due to CORS.
 * The measured latency is server→provider, not client→provider.
 * Results are clearly marked as "via proxy" in the UI.
 */
export async function measureViaProxy(
  dohEndpoint: string,
  domain: string
): Promise<number | null> {
  const params = new URLSearchParams({ endpoint: dohEndpoint, name: domain, type: 'A' });
  const proxyUrl = `/api/doh-proxy?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS + 1500);

  try {
    const res = await fetch(proxyUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.serverLatencyMs ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Connectivity Probe ───────────────────────────────────────────────────────

/**
 * Quick probe to determine if a DoH provider supports direct browser CORS.
 * Returns 'direct' if the provider works without proxy, 'proxy' if not, 'offline' if both fail.
 */
export async function probeConnectivity(
  dohEndpoint: string
): Promise<'direct' | 'proxy' | 'offline'> {
  // Race with a short timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const url = buildDohUrl(dohEndpoint, 'example.com');
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/dns-json' },
      cache: 'no-store',
    });
    if (res.ok) return 'direct';
  } catch {
    // Fall through to proxy check
  } finally {
    clearTimeout(timer);
  }

  // Try proxy
  const proxyMs = await measureViaProxy(dohEndpoint, 'example.com');
  if (proxyMs !== null) return 'proxy';

  return 'offline';
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute min/avg/max/median/reliability from a list of nullable latency samples.
 */
export function computeStats(samples: (number | null)[]): {
  minMs: number | null;
  avgMs: number | null;
  maxMs: number | null;
  medianMs: number | null;
  reliability: number;
} {
  const valid = samples.filter((s): s is number => s !== null);

  if (valid.length === 0) {
    return { minMs: null, avgMs: null, maxMs: null, medianMs: null, reliability: 0 };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const sum = valid.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(sorted.length / 2);
  const medianMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];

  return {
    minMs: sorted[0],
    avgMs: Math.round(sum / valid.length),
    maxMs: sorted[sorted.length - 1],
    medianMs,
    reliability: Math.round((valid.length / samples.length) * 100),
  };
}

// ─── Full Provider Benchmark ──────────────────────────────────────────────────

/**
 * Benchmark one provider with warm-up + N iterations.
 *
 * Strategy:
 * 1. Try one direct warm-up query. If it succeeds → use direct for all iterations.
 * 2. If warm-up fails → switch to proxy for all iterations.
 * 3. Calls onProgress(sample, viaProxy) after each recorded iteration.
 *
 * This ensures we always get latency data unless the provider is truly offline,
 * while being transparent about HOW the measurement was taken.
 */
export async function benchmarkProvider(
  dohEndpoint: string,
  iterations: number,
  onProgress: (sample: ProviderSample, viaProxy: boolean) => void
): Promise<{ samples: (number | null)[]; viaProxy: boolean }> {
  // ── Warm-up probe: determines which path to use ───────────────────────────
  let useProxy = false;

  const warmupController = new AbortController();
  const warmupTimer = setTimeout(() => warmupController.abort(), 3000);
  try {
    const warmupUrl = buildDohUrl(dohEndpoint, 'example.com');
    const res = await fetch(warmupUrl, {
      signal: warmupController.signal,
      headers: { Accept: 'application/dns-json' },
      cache: 'no-store',
    });
    if (!res.ok) useProxy = true;
    else await res.json(); // drain
  } catch {
    useProxy = true; // CORS blocked or network error → use proxy
  } finally {
    clearTimeout(warmupTimer);
  }

  // ── Iterations ─────────────────────────────────────────────────────────────
  const results: (number | null)[] = [];

  const domains = getTestDomains();

  for (let i = 0; i < iterations; i++) {
    const domain = domains[i % domains.length];
    let latencyMs: number | null;

    if (useProxy) {
      latencyMs = await measureViaProxy(dohEndpoint, domain);
    } else {
      latencyMs = await measureDirect(dohEndpoint, domain);
      // If a direct query fails mid-run, switch to proxy for remaining iterations
      if (latencyMs === null) {
        useProxy = true;
        latencyMs = await measureViaProxy(dohEndpoint, domain);
      }
    }

    results.push(latencyMs);
    onProgress({ iteration: i + 1, latencyMs }, useProxy);

    // Brief delay to avoid rate-limiting (shorter for proxy since it's server-side)
    if (i < iterations - 1) {
      await new Promise((r) => setTimeout(r, useProxy ? 30 : 60));
    }
  }

  return { samples: results, viaProxy: useProxy };
}
